#!/bin/bash
# Master Orchestrator - Runs all automation systems
# Usage: ./scripts/orchestrator.sh [start|stop|status]

PROJECT_DIR="/home/clark/classroom-sim"
SCRIPTS_DIR="$PROJECT_DIR/scripts"
LOG_DIR="$PROJECT_DIR/.logs"
PID_DIR="$PROJECT_DIR/.pids"

mkdir -p "$LOG_DIR" "$PID_DIR"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log() {
    echo -e "${BLUE}[$(date '+%H:%M:%S')]${NC} $1"
}

start_service() {
    local name=$1
    local cmd=$2
    local log_file="$LOG_DIR/$name.log"
    local pid_file="$PID_DIR/$name.pid"

    if [ -f "$pid_file" ] && kill -0 $(cat "$pid_file") 2>/dev/null; then
        echo -e "  ${YELLOW}⏸${NC}  $name already running (PID: $(cat $pid_file))"
        return
    fi

    cd "$PROJECT_DIR"
    nohup $cmd > "$log_file" 2>&1 &
    echo $! > "$pid_file"
    echo -e "  ${GREEN}✓${NC}  $name started (PID: $!)"
}

stop_service() {
    local name=$1
    local pid_file="$PID_DIR/$name.pid"

    if [ -f "$pid_file" ]; then
        local pid=$(cat "$pid_file")
        if kill -0 $pid 2>/dev/null; then
            kill $pid
            echo -e "  ${GREEN}✓${NC}  $name stopped"
        fi
        rm -f "$pid_file"
    else
        echo -e "  ${YELLOW}⏸${NC}  $name not running"
    fi
}

check_service() {
    local name=$1
    local pid_file="$PID_DIR/$name.pid"

    if [ -f "$pid_file" ] && kill -0 $(cat "$pid_file") 2>/dev/null; then
        echo -e "  ${GREEN}●${NC}  $name running (PID: $(cat $pid_file))"
    else
        echo -e "  ${RED}○${NC}  $name stopped"
    fi
}

case "$1" in
    start)
        echo ""
        echo -e "${BLUE}🚀 Starting Classroom Simulator Orchestrator${NC}"
        echo ""

        # Start agents first
        log "Starting agents..."
        bash "$SCRIPTS_DIR/start-agents.sh" > "$LOG_DIR/agents.log" 2>&1

        sleep 3

        # Start automation services
        log "Starting automation services..."

        start_service "message-router" "npx tsx $SCRIPTS_DIR/message-router.ts"
        start_service "build-watcher" "npx tsx $SCRIPTS_DIR/build-watcher.ts"
        start_service "health-check" "npx tsx $SCRIPTS_DIR/health-check.ts"
        start_service "task-queue" "npx tsx $SCRIPTS_DIR/task-queue.ts"

        echo ""
        log "All systems online!"
        echo ""
        echo -e "${GREEN}📊 Dashboard:${NC} http://localhost:3000/agents"
        echo ""
        echo -e "${BLUE}🖥️  Terminals:${NC}"
        echo "   CobaltDeer:    http://localhost:7681"
        echo "   DarkRidge:     http://localhost:7682"
        echo "   FuchsiaGlen:   http://localhost:7683"
        echo "   SilentCompass: http://localhost:7684"
        echo ""
        ;;

    stop)
        echo ""
        echo -e "${YELLOW}🛑 Stopping Classroom Simulator Orchestrator${NC}"
        echo ""

        stop_service "task-queue"
        stop_service "health-check"
        stop_service "build-watcher"
        stop_service "message-router"

        # Stop agents
        log "Stopping agents..."
        pkill -f ttyd 2>/dev/null
        tmux kill-session -t cobalt 2>/dev/null
        tmux kill-session -t darkridge 2>/dev/null
        tmux kill-session -t fuchsia 2>/dev/null
        tmux kill-session -t silent 2>/dev/null
        echo -e "  ${GREEN}✓${NC}  Agents stopped"

        # Stop dev server
        pkill -f "next dev" 2>/dev/null
        echo -e "  ${GREEN}✓${NC}  Dev server stopped"

        echo ""
        log "All systems stopped"
        echo ""
        ;;

    status)
        echo ""
        echo -e "${BLUE}📊 Classroom Simulator Status${NC}"
        echo ""

        echo "Automation Services:"
        check_service "message-router"
        check_service "build-watcher"
        check_service "health-check"
        check_service "task-queue"

        echo ""
        echo "Agent Sessions:"
        for session in cobalt darkridge fuchsia silent; do
            if tmux has-session -t $session 2>/dev/null; then
                echo -e "  ${GREEN}●${NC}  $session running"
            else
                echo -e "  ${RED}○${NC}  $session stopped"
            fi
        done

        echo ""
        echo "Web Terminals:"
        for port in 7681 7682 7683 7684; do
            if curl -s -o /dev/null -w "" http://localhost:$port 2>/dev/null; then
                echo -e "  ${GREEN}●${NC}  Port $port online"
            else
                echo -e "  ${RED}○${NC}  Port $port offline"
            fi
        done

        echo ""
        ;;

    restart)
        $0 stop
        sleep 2
        $0 start
        ;;

    logs)
        echo "Recent logs:"
        tail -n 50 "$LOG_DIR"/*.log 2>/dev/null
        ;;

    *)
        echo "Usage: $0 {start|stop|status|restart|logs}"
        exit 1
        ;;
esac
