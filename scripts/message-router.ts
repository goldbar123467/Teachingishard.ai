#!/usr/bin/env npx ts-node
/**
 * Message Router - Auto-routes messages between agents
 * Monitors inbox and triggers agent responses
 */

import { promises as fs } from "fs";
import path from "path";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

const PROJECT_KEY = "/home/clark/classroom-sim";
const MAILBOX_ROOT = path.join(
  process.env.HOME || "/home/clark",
  ".mcp_agent_mail_git_mailbox_repo",
  "projects",
  "home-clark-classroom-sim"
);

interface Agent {
  name: string;
  role: string;
  session: string;
}

const agents: Agent[] = [
  { name: "CobaltDeer", role: "Planner", session: "cobalt" },
  { name: "DarkRidge", role: "Builder", session: "darkridge" },
  { name: "FuchsiaGlen", role: "Styler", session: "fuchsia" },
  { name: "SilentCompass", role: "Tester", session: "silent" },
];

const processedMessages = new Set<string>();

async function getUnreadMessages(agentName: string): Promise<string[]> {
  const inboxPath = path.join(MAILBOX_ROOT, "agents", agentName, "inbox");
  const messages: string[] = [];

  try {
    const years = await fs.readdir(inboxPath);
    for (const year of years) {
      const months = await fs.readdir(path.join(inboxPath, year));
      for (const month of months) {
        const files = await fs.readdir(path.join(inboxPath, year, month));
        for (const file of files) {
          if (file.endsWith(".md")) {
            const fullPath = path.join(inboxPath, year, month, file);
            if (!processedMessages.has(fullPath)) {
              messages.push(fullPath);
            }
          }
        }
      }
    }
  } catch {
    // Inbox might not exist yet
  }

  return messages;
}

async function notifyAgent(agent: Agent, messageFile: string): Promise<void> {
  const content = await fs.readFile(messageFile, "utf-8");
  const subjectMatch = content.match(/"subject":\s*"([^"]+)"/);
  const subject = subjectMatch ? subjectMatch[1] : "New message";

  console.log(`📨 [${agent.name}] New message: ${subject}`);

  // Send a short, clean instruction - let agent fetch details from inbox
  const shortSubject = subject.slice(0, 60).replace(/"/g, "'");
  const instruction = `New task: ${shortSubject}. Fetch your inbox and work on it.`;

  const cmd = `tmux send-keys -t ${agent.session} '${instruction}' Enter`;

  try {
    await execAsync(cmd);
    console.log(`   ✓ Sent to ${agent.session}`);
  } catch (e) {
    console.error(`   ✗ Failed to notify ${agent.name}:`, e);
  }

  processedMessages.add(messageFile);
}

async function checkAllInboxes(): Promise<void> {
  for (const agent of agents) {
    const messages = await getUnreadMessages(agent.name);
    for (const msg of messages) {
      await notifyAgent(agent, msg);
    }
  }
}

async function main(): Promise<void> {
  console.log("🔄 Message Router started");
  console.log("   Monitoring inboxes for:", agents.map((a) => a.name).join(", "));
  console.log("   Waiting 30s for agents to initialize...");
  console.log("");

  // Wait for agents to finish their initial prompts
  await new Promise((r) => setTimeout(r, 30000));

  console.log("📡 Starting inbox monitoring...\n");

  // Initial check
  await checkAllInboxes();

  // Poll every 10 seconds (give agents time to respond)
  setInterval(checkAllInboxes, 10000);
}

main().catch(console.error);
