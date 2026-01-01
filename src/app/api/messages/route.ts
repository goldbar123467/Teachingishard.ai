import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const MAILBOX_ROOT = path.join(
  process.env.HOME || "/home/clark",
  ".mcp_agent_mail_git_mailbox_repo",
  "projects",
  "home-clark-classroom-sim",
  "messages"
);

interface Message {
  id: number;
  subject: string;
  from: string;
  to: string[];
  body_md: string;
  importance: string;
  created_ts: string;
  thread_id?: string;
}

async function parseMessageFile(filePath: string): Promise<Message | null> {
  try {
    const content = await fs.readFile(filePath, "utf-8");

    // Parse frontmatter JSON
    const match = content.match(/^---json\n([\s\S]*?)\n---\n([\s\S]*)$/);
    if (!match) return null;

    const meta = JSON.parse(match[1]);
    const body = match[2].trim();

    return {
      id: meta.id,
      subject: meta.subject,
      from: meta.from,
      to: meta.to || [],
      body_md: body,
      importance: meta.importance || "normal",
      created_ts: meta.created,
      thread_id: meta.thread_id,
    };
  } catch {
    return null;
  }
}

async function getAllMessages(): Promise<Message[]> {
  const messages: Message[] = [];

  try {
    // Read year directories
    const years = await fs.readdir(MAILBOX_ROOT).catch(() => []);

    for (const year of years) {
      const yearPath = path.join(MAILBOX_ROOT, year);
      const months = await fs.readdir(yearPath).catch(() => []);

      for (const month of months) {
        const monthPath = path.join(yearPath, month);
        const files = await fs.readdir(monthPath).catch(() => []);

        for (const file of files) {
          if (file.endsWith(".md")) {
            const msg = await parseMessageFile(path.join(monthPath, file));
            if (msg) messages.push(msg);
          }
        }
      }
    }
  } catch (e) {
    console.error("Error reading messages:", e);
  }

  // Sort by created time, newest first
  return messages.sort((a, b) =>
    new Date(b.created_ts).getTime() - new Date(a.created_ts).getTime()
  );
}

export async function GET() {
  const messages = await getAllMessages();
  return NextResponse.json({ messages });
}
