import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const MAILBOX_ROOT = path.join(
  process.env.HOME || "/home/clark",
  ".mcp_agent_mail_git_mailbox_repo",
  "projects",
  "home-clark-classroom-sim"
);

export async function POST(request: Request) {
  try {
    const { command, agents } = await request.json();

    if (!command || !agents || agents.length === 0) {
      return NextResponse.json({ error: "Missing command or agents" }, { status: 400 });
    }

    // Create a broadcast message file that agents can pick up
    const now = new Date();
    const timestamp = now.toISOString().replace(/[:.]/g, "-").slice(0, 19) + "Z";
    const messageId = Date.now();

    const messageDir = path.join(MAILBOX_ROOT, "messages",
      now.getFullYear().toString(),
      (now.getMonth() + 1).toString().padStart(2, "0")
    );

    // Ensure directory exists
    await fs.mkdir(messageDir, { recursive: true });

    const slug = command.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 50);
    const filename = `${timestamp}__${slug}__${messageId}.md`;

    const meta = {
      id: messageId,
      from: "Commander",
      to: agents,
      cc: [],
      bcc: [],
      subject: `Command: ${command.slice(0, 60)}`,
      importance: "high",
      ack_required: false,
      created: now.toISOString(),
      thread_id: null,
      project: "/home/clark/classroom-sim",
      project_slug: "home-clark-classroom-sim",
      attachments: [],
    };

    const content = `---json
${JSON.stringify(meta, null, 2)}
---

# Command from Human Operator

${command}

---
*Please acknowledge receipt and begin working on this task.*
`;

    await fs.writeFile(path.join(messageDir, filename), content);

    // Also write to each agent's inbox
    for (const agentName of agents) {
      const inboxDir = path.join(MAILBOX_ROOT, "agents", agentName, "inbox",
        now.getFullYear().toString(),
        (now.getMonth() + 1).toString().padStart(2, "0")
      );
      await fs.mkdir(inboxDir, { recursive: true });
      await fs.writeFile(path.join(inboxDir, filename), content);
    }

    return NextResponse.json({
      success: true,
      messageId,
      sentTo: agents,
      command
    });
  } catch (error) {
    console.error("Broadcast error:", error);
    return NextResponse.json({ error: "Failed to broadcast" }, { status: 500 });
  }
}
