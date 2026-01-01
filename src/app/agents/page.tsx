"use client";

import { useEffect, useState, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Users, Radio, Terminal, Sparkles } from "lucide-react";

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

interface Agent {
  name: string;
  role: string;
  description: string;
  port: number;
  gradient: string;
  glow: string;
  text: string;
  ring: string;
}

const agents: Agent[] = [
  {
    name: "CobaltDeer",
    role: "Planner",
    description: "Architecture & task planning",
    port: 7681,
    gradient: "from-blue-500/20 via-blue-600/10 to-cyan-500/20",
    glow: "shadow-[0_0_30px_rgba(59,130,246,0.3)]",
    text: "text-blue-400",
    ring: "ring-blue-500/50",
  },
  {
    name: "DarkRidge",
    role: "Builder",
    description: "Next.js/React & shadcn",
    port: 7682,
    gradient: "from-slate-400/20 via-slate-500/10 to-zinc-400/20",
    glow: "shadow-[0_0_30px_rgba(148,163,184,0.3)]",
    text: "text-slate-300",
    ring: "ring-slate-400/50",
  },
  {
    name: "FuchsiaGlen",
    role: "Styler",
    description: "Tailwind & animations",
    port: 7683,
    gradient: "from-fuchsia-500/20 via-pink-500/10 to-purple-500/20",
    glow: "shadow-[0_0_30px_rgba(217,70,239,0.3)]",
    text: "text-fuchsia-400",
    ring: "ring-fuchsia-500/50",
  },
  {
    name: "SilentCompass",
    role: "Tester",
    description: "Testing & verification",
    port: 7684,
    gradient: "from-emerald-500/20 via-green-500/10 to-teal-500/20",
    glow: "shadow-[0_0_30px_rgba(16,185,129,0.3)]",
    text: "text-emerald-400",
    ring: "ring-emerald-500/50",
  },
];

export default function AgentMailPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [command, setCommand] = useState("");
  const [sending, setSending] = useState(false);
  const [selectedAgents, setSelectedAgents] = useState<string[]>(agents.map(a => a.name));
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await fetch("/api/messages");
        if (res.ok) {
          const data = await res.json();
          setMessages(data.messages || []);
        }
      } catch (e) {
        console.error("Failed to fetch messages:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 2000);
    return () => clearInterval(interval);
  }, []);

  const getAgent = (name: string) => agents.find((a) => a.name === name);

  const formatTime = (ts: string) => {
    return new Date(ts).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const toggleAgent = (name: string) => {
    setSelectedAgents(prev =>
      prev.includes(name)
        ? prev.filter(n => n !== name)
        : [...prev, name]
    );
  };

  const sendCommand = async () => {
    if (!command.trim() || selectedAgents.length === 0) return;

    setSending(true);
    try {
      await fetch("/api/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          command: command.trim(),
          agents: selectedAgents,
        }),
      });
      setCommand("");
    } catch (e) {
      console.error("Failed to send command:", e);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-zinc-100 overflow-hidden">
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-[radial-gradient(ellipse_at_center,_rgba(59,130,246,0.08)_0%,_transparent_50%)] animate-pulse" />
        <div className="absolute bottom-[-50%] right-[-50%] w-[200%] h-[200%] bg-[radial-gradient(ellipse_at_center,_rgba(217,70,239,0.06)_0%,_transparent_50%)] animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute top-[20%] right-[10%] w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "2s" }} />
      </div>

      {/* Header */}
      <header className="relative border-b border-white/5 bg-white/[0.02] backdrop-blur-xl sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-fuchsia-500 to-emerald-500 rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
              <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 via-fuchsia-500 to-emerald-500 flex items-center justify-center shadow-lg">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
                Agent Command Center
              </h1>
              <p className="text-sm text-zinc-500">Classroom Simulator • 4 Agents Online</p>
            </div>
          </div>
          <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 backdrop-blur border border-white/10">
            <div className="relative">
              <Radio className="w-4 h-4 text-emerald-400" />
              <div className="absolute inset-0 text-emerald-400 animate-ping opacity-50">
                <Radio className="w-4 h-4" />
              </div>
            </div>
            <span className="text-sm text-zinc-300">{messages.length} messages</span>
          </div>
        </div>
      </header>

      <div className="relative max-w-7xl mx-auto p-6 grid grid-cols-12 gap-6">
        {/* Sidebar - Agent Cards */}
        <div className="col-span-3 space-y-4">
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="w-4 h-4 text-zinc-500" />
            <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider">
              Agents
            </h2>
          </div>
          {agents.map((agent) => {
            const isSelected = selectedAgents.includes(agent.name);
            return (
              <div
                key={agent.name}
                onClick={() => toggleAgent(agent.name)}
                className={`
                  relative group cursor-pointer transition-all duration-300
                  ${isSelected ? "scale-100" : "scale-95 opacity-50"}
                `}
              >
                {/* Glow effect */}
                <div className={`
                  absolute inset-0 rounded-2xl transition-all duration-300
                  ${isSelected ? agent.glow : "shadow-none"}
                  ${isSelected ? "opacity-100" : "opacity-0"}
                `} />

                {/* Card */}
                <div className={`
                  relative rounded-2xl p-4 transition-all duration-300
                  bg-gradient-to-br ${agent.gradient}
                  backdrop-blur-xl border border-white/10
                  ${isSelected ? `ring-2 ${agent.ring}` : ""}
                  hover:border-white/20 hover:bg-white/[0.03]
                `}>
                  <div className="flex items-center justify-between mb-3">
                    <span className={`font-bold ${agent.text}`}>{agent.name}</span>
                    <Badge
                      variant="outline"
                      className={`text-xs ${agent.text} border-current bg-black/20 backdrop-blur`}
                    >
                      {agent.role}
                    </Badge>
                  </div>
                  <p className="text-xs text-zinc-500 mb-4">{agent.description}</p>
                  <a
                    href={`http://localhost:${agent.port}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className={`
                      inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg
                      bg-black/30 backdrop-blur border border-white/10
                      ${agent.text} hover:bg-white/10 transition-all
                    `}
                  >
                    <Terminal className="w-3 h-3" />
                    :{agent.port}
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        {/* Main Content - Messages */}
        <div className="col-span-9 space-y-6">
          {/* Command Input */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-fuchsia-500/20 to-emerald-500/20 rounded-2xl blur-xl opacity-50" />
            <div className="relative rounded-2xl p-5 bg-white/[0.03] backdrop-blur-xl border border-white/10">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-sm text-zinc-500">Broadcasting to:</span>
                <div className="flex flex-wrap gap-2">
                  {selectedAgents.map(name => {
                    const agent = getAgent(name);
                    return (
                      <span
                        key={name}
                        className={`
                          text-xs px-2 py-1 rounded-full
                          bg-gradient-to-r ${agent?.gradient}
                          ${agent?.text} border border-white/10 backdrop-blur
                        `}
                      >
                        {name}
                      </span>
                    );
                  })}
                </div>
                {selectedAgents.length === 0 && (
                  <span className="text-sm text-zinc-600 italic">Select agents from sidebar</span>
                )}
              </div>
              <div className="flex gap-4">
                <input
                  type="text"
                  value={command}
                  onChange={(e) => setCommand(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendCommand()}
                  placeholder="Enter command for selected agents..."
                  className="
                    flex-1 bg-black/40 backdrop-blur-xl
                    border border-white/10 rounded-xl px-5 py-4 text-sm
                    focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50
                    placeholder:text-zinc-600 transition-all
                  "
                />
                <button
                  onClick={sendCommand}
                  disabled={sending || !command.trim() || selectedAgents.length === 0}
                  className="
                    relative group px-8 py-4 rounded-xl font-medium text-sm
                    bg-gradient-to-r from-blue-600 via-fuchsia-600 to-emerald-600
                    hover:from-blue-500 hover:via-fuchsia-500 hover:to-emerald-500
                    disabled:opacity-30 disabled:cursor-not-allowed
                    transition-all duration-300 overflow-hidden
                  "
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-fuchsia-400 to-emerald-400 opacity-0 group-hover:opacity-20 transition-opacity" />
                  <span className="relative flex items-center gap-2">
                    <Send className="w-4 h-4" />
                    Send
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Message Feed */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent rounded-2xl" />
            <div className="relative rounded-2xl bg-white/[0.02] backdrop-blur-xl border border-white/10 overflow-hidden">
              <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">
                  Message Feed
                </h3>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs text-zinc-500">Live</span>
                </div>
              </div>

              <ScrollArea className="h-[calc(100vh-380px)]" ref={scrollRef}>
                <div className="p-5">
                  {loading ? (
                    <div className="text-center py-16">
                      <div className="relative w-12 h-12 mx-auto mb-4">
                        <div className="absolute inset-0 rounded-full border-2 border-white/10" />
                        <div className="absolute inset-0 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
                      </div>
                      <p className="text-zinc-500">Loading messages...</p>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="text-center py-16">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
                        <Radio className="w-8 h-8 text-zinc-600" />
                      </div>
                      <p className="text-zinc-500">No messages yet</p>
                      <p className="text-zinc-600 text-sm">Agents are starting up...</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages.map((msg) => {
                        const agent = getAgent(msg.from);
                        return (
                          <div
                            key={msg.id}
                            className={`
                              relative group rounded-xl p-4 transition-all duration-300
                              bg-gradient-to-br ${agent?.gradient || "from-zinc-800/50 to-zinc-900/50"}
                              backdrop-blur border border-white/5
                              hover:border-white/10 hover:bg-white/[0.02]
                            `}
                          >
                            {/* Subtle glow on hover */}
                            <div className={`
                              absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity
                              ${agent?.glow || ""}
                            `} style={{ filter: "blur(20px)", transform: "scale(0.9)" }} />

                            <div className="relative">
                              <div className="flex items-center gap-3 mb-3">
                                <div className={`w-2 h-2 rounded-full ${
                                  agent?.text.includes("blue") ? "bg-blue-500"
                                  : agent?.text.includes("slate") ? "bg-slate-400"
                                  : agent?.text.includes("fuchsia") ? "bg-fuchsia-500"
                                  : agent?.text.includes("emerald") ? "bg-emerald-500"
                                  : "bg-zinc-500"
                                } shadow-lg`} style={{
                                  boxShadow: agent?.text.includes("blue") ? "0 0 10px rgba(59,130,246,0.5)"
                                    : agent?.text.includes("fuchsia") ? "0 0 10px rgba(217,70,239,0.5)"
                                    : agent?.text.includes("emerald") ? "0 0 10px rgba(16,185,129,0.5)"
                                    : "0 0 10px rgba(148,163,184,0.5)"
                                }} />
                                <span className={`font-semibold text-sm ${agent?.text || "text-zinc-300"}`}>
                                  {msg.from}
                                </span>
                                <span className="text-zinc-600">→</span>
                                <span className="text-sm text-zinc-500">
                                  {msg.to?.join(", ")}
                                </span>
                                {msg.importance === "high" && (
                                  <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-xs animate-pulse">
                                    Priority
                                  </Badge>
                                )}
                                <span className="text-xs text-zinc-600 ml-auto font-mono">
                                  {formatTime(msg.created_ts)}
                                </span>
                              </div>
                              <p className="text-sm font-medium text-zinc-200 mb-3">
                                {msg.subject}
                              </p>
                              <div className="text-sm text-zinc-400 whitespace-pre-wrap bg-black/30 backdrop-blur rounded-lg p-4 font-mono text-xs leading-relaxed border border-white/5">
                                {msg.body_md.length > 500
                                  ? msg.body_md.substring(0, 500) + "..."
                                  : msg.body_md}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
