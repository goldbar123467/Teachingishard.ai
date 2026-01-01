#!/bin/bash
# Git Auto-Commit - Commits changes when tasks are completed
# Triggered by agents via agent-mail or manually

PROJECT_DIR="/home/clark/classroom-sim"
cd "$PROJECT_DIR"

# Check if there are changes
if [ -z "$(git status --porcelain)" ]; then
    echo "No changes to commit"
    exit 0
fi

# Get the agent name from argument or default
AGENT_NAME="${1:-AutoCommit}"
TASK_DESC="${2:-Automated commit}"

# Stage all changes
git add -A

# Generate commit message
CHANGED_FILES=$(git diff --cached --name-only | head -10 | tr '\n' ', ' | sed 's/,$//')
TIMESTAMP=$(date +"%Y-%m-%d %H:%M:%S")

COMMIT_MSG="[$AGENT_NAME] $TASK_DESC

Changed files: $CHANGED_FILES

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: $AGENT_NAME <noreply@anthropic.com>
Timestamp: $TIMESTAMP"

# Commit
git commit -m "$COMMIT_MSG"

if [ $? -eq 0 ]; then
    echo "✅ Committed: $TASK_DESC"

    # Notify agents
    tmux send-keys -t cobalt "# ✅ Git commit: $TASK_DESC" Enter 2>/dev/null
else
    echo "❌ Commit failed"
    exit 1
fi
