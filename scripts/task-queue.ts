#!/usr/bin/env npx ts-node
/**
 * Task Queue - Priority-based task distribution
 * Manages and assigns tasks to appropriate agents
 */

import { promises as fs } from "fs";
import path from "path";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

const PROJECT_DIR = "/home/clark/classroom-sim";
const QUEUE_FILE = path.join(PROJECT_DIR, ".task-queue.json");
const MAILBOX_ROOT = path.join(
  process.env.HOME || "/home/clark",
  ".mcp_agent_mail_git_mailbox_repo",
  "projects",
  "home-clark-classroom-sim"
);

interface Task {
  id: string;
  title: string;
  description: string;
  priority: "urgent" | "high" | "normal" | "low";
  assignee: string | null;
  status: "pending" | "assigned" | "in_progress" | "completed" | "failed";
  createdAt: number;
  assignedAt?: number;
  completedAt?: number;
  tags: string[];
}

interface TaskQueue {
  tasks: Task[];
  lastUpdated: number;
}

const AGENT_SKILLS: Record<string, string[]> = {
  CobaltDeer: ["planning", "architecture", "coordination", "breakdown"],
  DarkRidge: ["react", "nextjs", "components", "shadcn", "building", "api"],
  FuchsiaGlen: ["css", "tailwind", "styling", "animation", "design", "ui"],
  SilentCompass: ["testing", "build", "verification", "qa", "debugging"],
};

async function loadQueue(): Promise<TaskQueue> {
  try {
    const data = await fs.readFile(QUEUE_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    return { tasks: [], lastUpdated: Date.now() };
  }
}

async function saveQueue(queue: TaskQueue): Promise<void> {
  queue.lastUpdated = Date.now();
  await fs.writeFile(QUEUE_FILE, JSON.stringify(queue, null, 2));
}

function findBestAgent(task: Task): string {
  const taskTags = task.tags.map((t) => t.toLowerCase());
  let bestAgent = "CobaltDeer"; // Default to planner
  let bestScore = 0;

  for (const [agent, skills] of Object.entries(AGENT_SKILLS)) {
    const score = skills.filter((skill) =>
      taskTags.some((tag) => tag.includes(skill) || skill.includes(tag))
    ).length;

    if (score > bestScore) {
      bestScore = score;
      bestAgent = agent;
    }
  }

  return bestAgent;
}

async function sendTaskToAgent(task: Task, agentName: string): Promise<void> {
  const priorityEmoji =
    task.priority === "urgent" ? "🚨" :
    task.priority === "high" ? "⚡" :
    task.priority === "normal" ? "📋" : "📝";

  const now = new Date();
  const timestamp = now.toISOString().replace(/[:.]/g, "-").slice(0, 19) + "Z";
  const messageId = Date.now();

  const messageDir = path.join(
    MAILBOX_ROOT,
    "messages",
    now.getFullYear().toString(),
    (now.getMonth() + 1).toString().padStart(2, "0")
  );

  await fs.mkdir(messageDir, { recursive: true });

  const slug = task.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 50);
  const filename = `${timestamp}__task-${slug}__${messageId}.md`;

  const meta = {
    id: messageId,
    from: "TaskQueue",
    to: [agentName],
    cc: ["CobaltDeer"],
    bcc: [],
    subject: `${priorityEmoji} Task: ${task.title}`,
    importance: task.priority === "urgent" || task.priority === "high" ? "high" : "normal",
    ack_required: true,
    created: now.toISOString(),
    thread_id: `task-${task.id}`,
    project: PROJECT_DIR,
    project_slug: "home-clark-classroom-sim",
    attachments: [],
  };

  const content = `---json
${JSON.stringify(meta, null, 2)}
---

# ${priorityEmoji} Task Assignment: ${task.title}

**Priority:** ${task.priority.toUpperCase()}
**Assigned To:** ${agentName}
**Task ID:** ${task.id}

## Description

${task.description}

## Tags
${task.tags.map((t) => `- ${t}`).join("\n")}

---

Please acknowledge receipt and begin working on this task.
When complete, send a message with subject "Task Complete: ${task.id}"
`;

  await fs.writeFile(path.join(messageDir, filename), content);

  // Also write to agent's inbox
  const inboxDir = path.join(
    MAILBOX_ROOT,
    "agents",
    agentName,
    "inbox",
    now.getFullYear().toString(),
    (now.getMonth() + 1).toString().padStart(2, "0")
  );
  await fs.mkdir(inboxDir, { recursive: true });
  await fs.writeFile(path.join(inboxDir, filename), content);

  console.log(`📨 Sent task "${task.title}" to ${agentName}`);

  // Notify via tmux
  const session = agentName.toLowerCase().replace(/[^a-z]/g, "").slice(0, 10);
  await execAsync(
    `tmux send-keys -t ${session === "cobaltdeer" ? "cobalt" : session === "darkridge" ? "darkridge" : session === "fuchsiaglen" ? "fuchsia" : "silent"} "# 📨 New task: ${task.title}" Enter`
  ).catch(() => {});
}

async function processQueue(): Promise<void> {
  const queue = await loadQueue();
  const pendingTasks = queue.tasks
    .filter((t) => t.status === "pending")
    .sort((a, b) => {
      const priorityOrder = { urgent: 0, high: 1, normal: 2, low: 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority] || a.createdAt - b.createdAt;
    });

  if (pendingTasks.length === 0) {
    return;
  }

  console.log(`\n📋 Processing ${pendingTasks.length} pending tasks...`);

  for (const task of pendingTasks.slice(0, 3)) {
    // Process up to 3 at a time
    const agent = task.assignee || findBestAgent(task);
    task.assignee = agent;
    task.status = "assigned";
    task.assignedAt = Date.now();

    await sendTaskToAgent(task, agent);
  }

  await saveQueue(queue);
}

async function addTask(
  title: string,
  description: string,
  priority: Task["priority"] = "normal",
  tags: string[] = []
): Promise<Task> {
  const queue = await loadQueue();
  const task: Task = {
    id: `T${Date.now().toString(36).toUpperCase()}`,
    title,
    description,
    priority,
    assignee: null,
    status: "pending",
    createdAt: Date.now(),
    tags,
  };

  queue.tasks.push(task);
  await saveQueue(queue);
  console.log(`✅ Added task: ${task.id} - ${title}`);
  return task;
}

async function main(): Promise<void> {
  console.log("📋 Task Queue Manager started");
  console.log("");

  // Check for command line args
  const args = process.argv.slice(2);
  if (args[0] === "add" && args[1]) {
    await addTask(
      args[1],
      args[2] || "No description",
      (args[3] as Task["priority"]) || "normal",
      args.slice(4)
    );
    return;
  }

  // Otherwise run as daemon
  await processQueue();
  setInterval(processQueue, 30000); // Check every 30 seconds
}

main().catch(console.error);
