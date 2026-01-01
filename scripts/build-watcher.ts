#!/usr/bin/env npx ts-node
/**
 * Build Watcher - Auto-runs tests when files change
 * Notifies SilentCompass agent of build results
 */

import { watch } from "fs";
import { exec } from "child_process";
import { promisify } from "util";
import path from "path";

const execAsync = promisify(exec);

const PROJECT_DIR = "/home/clark/classroom-sim";
const WATCH_DIRS = ["src/app", "src/components", "src/lib"];
const DEBOUNCE_MS = 2000;

let buildTimeout: NodeJS.Timeout | null = null;
let lastBuildTime = 0;

async function sendAgentMessage(
  subject: string,
  body: string,
  importance: "normal" | "high" = "normal"
): Promise<void> {
  const message = {
    project_key: PROJECT_DIR,
    sender_name: "BuildBot",
    to: ["SilentCompass", "CobaltDeer"],
    subject,
    body_md: body,
    importance,
  };

  // Write to agent-mail via file (simpler than MCP call)
  console.log(`📧 Notifying agents: ${subject}`);
}

async function runBuild(): Promise<{ success: boolean; output: string }> {
  console.log("🔨 Running build...");
  try {
    const { stdout, stderr } = await execAsync("npm run build", {
      cwd: PROJECT_DIR,
      timeout: 120000,
    });
    return { success: true, output: stdout + stderr };
  } catch (error: unknown) {
    const execError = error as { stdout?: string; stderr?: string };
    return { success: false, output: (execError.stdout || "") + (execError.stderr || "") };
  }
}

async function runTypeCheck(): Promise<{ success: boolean; output: string }> {
  console.log("📝 Running type check...");
  try {
    const { stdout, stderr } = await execAsync("npx tsc --noEmit", {
      cwd: PROJECT_DIR,
      timeout: 60000,
    });
    return { success: true, output: stdout + stderr };
  } catch (error: unknown) {
    const execError = error as { stdout?: string; stderr?: string };
    return { success: false, output: (execError.stdout || "") + (execError.stderr || "") };
  }
}

async function handleFileChange(filename: string): Promise<void> {
  const now = Date.now();
  if (now - lastBuildTime < DEBOUNCE_MS) return;

  if (buildTimeout) clearTimeout(buildTimeout);

  buildTimeout = setTimeout(async () => {
    lastBuildTime = Date.now();
    console.log(`\n📁 File changed: ${filename}`);

    // Run type check first
    const typeCheck = await runTypeCheck();
    if (!typeCheck.success) {
      console.log("❌ Type errors found!");
      await sendAgentMessage(
        "⚠️ Type Check Failed",
        `File: ${filename}\n\nErrors:\n\`\`\`\n${typeCheck.output.slice(-2000)}\n\`\`\``,
        "high"
      );

      // Notify tester agent
      await execAsync(
        `tmux send-keys -t silent "# ⚠️ Type errors detected in ${filename} - please investigate" Enter`
      );
      return;
    }

    console.log("✅ Type check passed");

    // Run build
    const build = await runBuild();
    if (!build.success) {
      console.log("❌ Build failed!");
      await sendAgentMessage(
        "🚨 Build Failed",
        `File: ${filename}\n\nErrors:\n\`\`\`\n${build.output.slice(-2000)}\n\`\`\``,
        "high"
      );

      await execAsync(
        `tmux send-keys -t silent "# 🚨 Build failed after change to ${filename} - please fix" Enter`
      );
    } else {
      console.log("✅ Build successful");
      await execAsync(
        `tmux send-keys -t silent "# ✅ Build passed for ${filename}" Enter`
      );
    }
  }, DEBOUNCE_MS);
}

function startWatching(): void {
  console.log("👁️  Build Watcher started");
  console.log("   Watching:", WATCH_DIRS.join(", "));
  console.log("");

  for (const dir of WATCH_DIRS) {
    const fullPath = path.join(PROJECT_DIR, dir);
    try {
      watch(fullPath, { recursive: true }, (eventType, filename) => {
        if (filename && (filename.endsWith(".ts") || filename.endsWith(".tsx"))) {
          handleFileChange(path.join(dir, filename));
        }
      });
      console.log(`   ✓ Watching ${dir}`);
    } catch (e) {
      console.log(`   ✗ Could not watch ${dir}`);
    }
  }
}

startWatching();

// Keep process running
process.on("SIGINT", () => {
  console.log("\n👋 Build Watcher stopped");
  process.exit(0);
});
