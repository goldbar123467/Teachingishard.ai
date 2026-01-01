#!/usr/bin/env npx ts-node
/**
 * Agent Health Check - Monitors if agents are responding
 * Restarts unresponsive agents automatically
 */

import { exec } from "child_process";
import { promisify } from "util";
import { promises as fs } from "fs";
import path from "path";

const execAsync = promisify(exec);

interface AgentStatus {
  name: string;
  session: string;
  port: number;
  lastActive: number;
  healthy: boolean;
  restartCount: number;
}

const agents: AgentStatus[] = [
  { name: "CobaltDeer", session: "cobalt", port: 7681, lastActive: 0, healthy: true, restartCount: 0 },
  { name: "DarkRidge", session: "darkridge", port: 7682, lastActive: 0, healthy: true, restartCount: 0 },
  { name: "FuchsiaGlen", session: "fuchsia", port: 7683, lastActive: 0, healthy: true, restartCount: 0 },
  { name: "SilentCompass", session: "silent", port: 7684, lastActive: 0, healthy: true, restartCount: 0 },
];

const HEALTH_CHECK_INTERVAL = 30000; // 30 seconds
const UNHEALTHY_THRESHOLD = 120000; // 2 minutes
const MAX_RESTARTS = 3;

async function checkTmuxSession(session: string): Promise<boolean> {
  try {
    await execAsync(`tmux has-session -t ${session} 2>/dev/null`);
    return true;
  } catch {
    return false;
  }
}

async function checkTtydPort(port: number): Promise<boolean> {
  try {
    const { stdout } = await execAsync(`curl -s -o /dev/null -w "%{http_code}" http://localhost:${port}`);
    return stdout.trim() === "200";
  } catch {
    return false;
  }
}

async function getAgentActivity(agentName: string): Promise<number> {
  const mailboxPath = path.join(
    process.env.HOME || "/home/clark",
    ".mcp_agent_mail_git_mailbox_repo",
    "projects",
    "home-clark-classroom-sim",
    "agents",
    agentName
  );

  try {
    const stat = await fs.stat(mailboxPath);
    return stat.mtimeMs;
  } catch {
    return 0;
  }
}

async function restartAgent(agent: AgentStatus): Promise<void> {
  if (agent.restartCount >= MAX_RESTARTS) {
    console.log(`⛔ [${agent.name}] Max restarts reached, manual intervention needed`);
    return;
  }

  console.log(`🔄 [${agent.name}] Restarting...`);
  agent.restartCount++;

  // Kill existing session
  await execAsync(`tmux kill-session -t ${agent.session} 2>/dev/null`).catch(() => {});

  // Create new session
  await execAsync(`tmux new-session -d -s ${agent.session} -c /home/clark/classroom-sim`);

  // Start agent
  const prompt = `I am ${agent.name}. Check my inbox and continue working.`;
  await execAsync(`tmux send-keys -t ${agent.session} 'claude "${prompt}"' Enter`);

  // Restart ttyd
  await execAsync(`pkill -f "ttyd.*${agent.port}" 2>/dev/null`).catch(() => {});
  await execAsync(`~/.local/bin/ttyd -p ${agent.port} tmux attach -t ${agent.session} &`);

  console.log(`✅ [${agent.name}] Restarted on port ${agent.port}`);
}

async function checkAgent(agent: AgentStatus): Promise<void> {
  const sessionOk = await checkTmuxSession(agent.session);
  const portOk = await checkTtydPort(agent.port);
  const lastActivity = await getAgentActivity(agent.name);

  const now = Date.now();
  const wasHealthy = agent.healthy;

  if (!sessionOk || !portOk) {
    agent.healthy = false;
    console.log(`❌ [${agent.name}] Session or port not responding`);
    await restartAgent(agent);
  } else if (lastActivity > agent.lastActive) {
    agent.lastActive = lastActivity;
    agent.healthy = true;
    agent.restartCount = 0; // Reset on activity
  } else if (now - agent.lastActive > UNHEALTHY_THRESHOLD && agent.lastActive > 0) {
    agent.healthy = false;
    console.log(`⚠️ [${agent.name}] No activity for ${Math.round((now - agent.lastActive) / 1000)}s`);
  }

  if (!wasHealthy && agent.healthy) {
    console.log(`✅ [${agent.name}] Recovered`);
  }
}

async function runHealthChecks(): Promise<void> {
  const now = new Date().toLocaleTimeString();
  console.log(`\n[${now}] Running health checks...`);

  for (const agent of agents) {
    await checkAgent(agent);
  }

  const healthy = agents.filter((a) => a.healthy).length;
  console.log(`Status: ${healthy}/${agents.length} agents healthy`);
}

async function main(): Promise<void> {
  console.log("🏥 Agent Health Monitor started");
  console.log("   Check interval:", HEALTH_CHECK_INTERVAL / 1000, "seconds");
  console.log("   Unhealthy threshold:", UNHEALTHY_THRESHOLD / 1000, "seconds");
  console.log("");

  // Initial check
  await runHealthChecks();

  // Periodic checks
  setInterval(runHealthChecks, HEALTH_CHECK_INTERVAL);
}

main().catch(console.error);
