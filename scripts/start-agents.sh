#!/bin/bash
# Auto-start all agents for Classroom Simulator
# Usage: ./scripts/start-agents.sh

PROJECT_DIR="/home/clark/classroom-sim"
TTYD_BIN="$HOME/.local/bin/ttyd"

echo "🚀 Starting Classroom Simulator Agent Team..."

# Kill existing sessions
tmux kill-session -t cobalt 2>/dev/null
tmux kill-session -t darkridge 2>/dev/null
tmux kill-session -t fuchsia 2>/dev/null
tmux kill-session -t silent 2>/dev/null
pkill -f ttyd 2>/dev/null
sleep 1

# Create tmux sessions
echo "📦 Creating agent sessions..."
tmux new-session -d -s cobalt -c "$PROJECT_DIR"
tmux new-session -d -s darkridge -c "$PROJECT_DIR"
tmux new-session -d -s fuchsia -c "$PROJECT_DIR"
tmux new-session -d -s silent -c "$PROJECT_DIR"

# Function to start an agent with permission dialog handling
start_agent() {
  local session=$1
  local prompt=$2

  echo "   Starting $session..."

  # Send the claude command
  tmux send-keys -t $session "claude --dangerously-skip-permissions \"$prompt\"" Enter

  # Wait for permission dialog to render
  sleep 4

  # Send Down arrow to select "Yes, I accept"
  tmux send-keys -t $session Down

  # Wait for selection to register
  sleep 1

  # Send Enter to confirm
  tmux send-keys -t $session Enter

  # Brief pause before next agent
  sleep 2
}

# Start agents with their roles
echo "🤖 Launching agents..."

start_agent "cobalt" "I am CobaltDeer, the Planner agent. FIRST: Use mcp__mcp-agent-mail__fetch_inbox to check messages. My role: Coordinate team, plan architecture, delegate tasks via mcp__mcp-agent-mail__send_message."

start_agent "darkridge" "I am DarkRidge, the Builder agent. FIRST: Use mcp__mcp-agent-mail__fetch_inbox to check messages. My role: Build Next.js/React components, implement features, report progress."

start_agent "fuchsia" "I am FuchsiaGlen, the Styler agent. FIRST: Use mcp__mcp-agent-mail__fetch_inbox to check messages. My role: Tailwind CSS styling, animations, responsive design."

start_agent "silent" "I am SilentCompass, the Tester agent. FIRST: Use mcp__mcp-agent-mail__fetch_inbox to check messages. My role: Run builds/tests, verify implementations, report errors."

# Start web terminals
echo "🌐 Starting web terminals..."
$TTYD_BIN -p 7681 tmux attach -t cobalt &
$TTYD_BIN -p 7682 tmux attach -t darkridge &
$TTYD_BIN -p 7683 tmux attach -t fuchsia &
$TTYD_BIN -p 7684 tmux attach -t silent &

# Start Next.js dev server
echo "⚡ Starting Next.js dev server..."
cd "$PROJECT_DIR"
npm run dev &

sleep 3

echo ""
echo "✅ All systems online!"
echo ""
echo "📊 Agent Command Center: http://localhost:3000/agents"
echo ""
echo "🖥️  Agent Terminals:"
echo "   CobaltDeer (Planner):    http://localhost:7681"
echo "   DarkRidge (Builder):     http://localhost:7682"
echo "   FuchsiaGlen (Styler):    http://localhost:7683"
echo "   SilentCompass (Tester):  http://localhost:7684"
echo ""
