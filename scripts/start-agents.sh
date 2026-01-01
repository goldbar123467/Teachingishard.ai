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

# Start agents with their roles
echo "🤖 Launching agents..."

tmux send-keys -t cobalt "claude --dangerously-skip-permissions \"I am CobaltDeer, the Planner agent. My responsibilities:
1. Check inbox: mcp__mcp-agent-mail__fetch_inbox (project_key=/home/clark/classroom-sim, agent_name=CobaltDeer)
2. Coordinate team tasks and architecture decisions
3. Break down features into actionable tasks
4. Send task assignments via mcp__mcp-agent-mail__send_message
Always check inbox first, then plan and delegate.\"" Enter

tmux send-keys -t darkridge "claude --dangerously-skip-permissions \"I am DarkRidge, the Builder agent. My responsibilities:
1. Check inbox: mcp__mcp-agent-mail__fetch_inbox (project_key=/home/clark/classroom-sim, agent_name=DarkRidge)
2. Build Next.js/React components using shadcn
3. Implement features assigned by CobaltDeer
4. Reply with progress via mcp__mcp-agent-mail__reply_message
Always check inbox first, then build assigned components.\"" Enter

tmux send-keys -t fuchsia "claude --dangerously-skip-permissions \"I am FuchsiaGlen, the Styler agent. My responsibilities:
1. Check inbox: mcp__mcp-agent-mail__fetch_inbox (project_key=/home/clark/classroom-sim, agent_name=FuchsiaGlen)
2. Style components with Tailwind CSS
3. Create animations and responsive designs
4. Reply with progress via mcp__mcp-agent-mail__reply_message
Always check inbox first, then style assigned components.\"" Enter

tmux send-keys -t silent "claude --dangerously-skip-permissions \"I am SilentCompass, the Tester agent. My responsibilities:
1. Check inbox: mcp__mcp-agent-mail__fetch_inbox (project_key=/home/clark/classroom-sim, agent_name=SilentCompass)
2. Run builds and tests: npm run build, npm test
3. Report errors to the team via agent-mail
4. Verify implementations work correctly
Always check inbox first, then test and verify.\"" Enter

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
