"use client";

import { useEffect, useState, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Users, Radio, Terminal, Sparkles, MessageCircle, Mail, Zap, Clock } from "lucide-react";

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
  avatar: string;
  statusColor: string;
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
    avatar: "🦌",
    statusColor: "bg-blue-500",
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
    avatar: "🏔️",
    statusColor: "bg-slate-400",
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
    avatar: "🌸",
    statusColor: "bg-fuchsia-500",
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
    avatar: "🧭",
    statusColor: "bg-emerald-500",
  },
];

type ViewMode = "chat" | "email";

export default function AgentMailPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [command, setCommand] = useState("");
  const [sending, setSending] = useState(false);
  const [selectedAgents, setSelectedAgents] = useState<string[]>(agents.map(a => a.name));
  const [viewMode, setViewMode] = useState<ViewMode>("chat");
  const [typingAgents, setTypingAgents] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await fetch("/api/messages");
        if (res.ok) {
          const data = await res.json();
          const newMessages = data.messages || [];
          // Simulate typing when new messages arrive
          if (newMessages.length > messages.length) {
            const newMsg = newMessages[newMessages.length - 1];
            if (newMsg) {
              setTypingAgents(prev => [...prev, newMsg.from]);
              setTimeout(() => {
                setTypingAgents(prev => prev.filter(a => a !== newMsg.from));
              }, 500);
            }
          }
          setMessages(newMessages);
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
  }, [messages.length]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const getAgent = (name: string) => agents.find((a) => a.name === name);

  const formatTime = (ts: string) => {
    const date = new Date(ts);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return date.toLocaleDateString();
  };

  const formatFullTime = (ts: string) => {
    return new Date(ts).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
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

  // Extract short status from message body
  const getShortStatus = (body: string): string => {
    // Get first line or first 100 chars
    const firstLine = body.split('\n')[0].replace(/^#+\s*/, '').trim();
    if (firstLine.length <= 80) return firstLine;
    return firstLine.substring(0, 77) + "...";
  };

  // Check if message is a quick status update (short)
  const isQuickUpdate = (msg: Message): boolean => {
    return msg.body_md.length < 200 && !msg.body_md.includes('##');
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-zinc-100 flex flex-col">
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-[radial-gradient(ellipse_at_center,_rgba(59,130,246,0.08)_0%,_transparent_50%)] animate-pulse" />
        <div className="absolute bottom-[-50%] right-[-50%] w-[200%] h-[200%] bg-[radial-gradient(ellipse_at_center,_rgba(217,70,239,0.06)_0%,_transparent_50%)] animate-pulse" style={{ animationDelay: "1s" }} />
      </div>

      {/* Header */}
      <header className="relative border-b border-white/5 bg-white/[0.02] backdrop-blur-xl sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 via-fuchsia-500 to-emerald-500 flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">Agent Command Center</h1>
              <p className="text-xs text-zinc-500">{agents.length} agents online</p>
            </div>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-2 bg-white/5 rounded-lg p-1">
            <button
              onClick={() => setViewMode("chat")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-all ${
                viewMode === "chat"
                  ? "bg-blue-500/20 text-blue-400"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              <MessageCircle className="w-4 h-4" />
              Chat
            </button>
            <button
              onClick={() => setViewMode("email")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-all ${
                viewMode === "email"
                  ? "bg-fuchsia-500/20 text-fuchsia-400"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              <Mail className="w-4 h-4" />
              Email
            </button>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs text-zinc-400">{messages.length} msgs</span>
          </div>
        </div>
      </header>

      <div className="relative flex-1 max-w-6xl w-full mx-auto flex">
        {/* Sidebar - Compact Agent List */}
        <div className="w-16 border-r border-white/5 py-4 flex flex-col items-center gap-3">
          {agents.map((agent) => {
            const isSelected = selectedAgents.includes(agent.name);
            const isTyping = typingAgents.includes(agent.name);
            return (
              <button
                key={agent.name}
                onClick={() => toggleAgent(agent.name)}
                className={`relative group transition-all duration-200 ${
                  isSelected ? "scale-100" : "scale-90 opacity-40"
                }`}
                title={`${agent.name} (${agent.role})`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg
                  bg-gradient-to-br ${agent.gradient} border border-white/10
                  ${isSelected ? agent.glow : ""}
                `}>
                  {agent.avatar}
                </div>
                {/* Online indicator */}
                <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#0a0a0f] ${agent.statusColor} ${isTyping ? "animate-pulse" : ""}`} />
                {/* Typing indicator */}
                {isTyping && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center animate-bounce">
                    <span className="text-[8px]">✍️</span>
                  </div>
                )}
              </button>
            );
          })}
          <div className="flex-1" />
          <div className="w-8 h-px bg-white/10 my-2" />
          <a
            href="/"
            className="w-10 h-10 rounded-xl flex items-center justify-center text-zinc-500 hover:text-white hover:bg-white/10 transition-all"
            title="Back to Game"
          >
            🎮
          </a>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Messages */}
          <ScrollArea className="flex-1 p-4" ref={scrollRef}>
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  <p className="text-zinc-500 text-sm">Connecting to agents...</p>
                </div>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="text-4xl mb-2">🤖</div>
                  <p className="text-zinc-500">No messages yet</p>
                  <p className="text-zinc-600 text-sm">Agents are standing by...</p>
                </div>
              </div>
            ) : viewMode === "chat" ? (
              /* Chat View */
              <div className="space-y-3">
                {messages.map((msg, idx) => {
                  const agent = getAgent(msg.from);
                  const prevMsg = messages[idx - 1];
                  const showAvatar = !prevMsg || prevMsg.from !== msg.from;
                  const isQuick = isQuickUpdate(msg);

                  return (
                    <div key={msg.id} className={`flex gap-3 ${showAvatar ? "mt-4" : "mt-1"}`}>
                      {/* Avatar column */}
                      <div className="w-8 flex-shrink-0">
                        {showAvatar && (
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm
                            bg-gradient-to-br ${agent?.gradient || "from-zinc-700 to-zinc-800"}
                          `}>
                            {agent?.avatar || "🤖"}
                          </div>
                        )}
                      </div>

                      {/* Message content */}
                      <div className="flex-1 min-w-0">
                        {showAvatar && (
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`font-semibold text-sm ${agent?.text || "text-zinc-300"}`}>
                              {msg.from}
                            </span>
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 border-white/10 text-zinc-500">
                              {agent?.role}
                            </Badge>
                            <span className="text-[10px] text-zinc-600">{formatTime(msg.created_ts)}</span>
                            {msg.importance === "high" || msg.importance === "urgent" ? (
                              <Zap className="w-3 h-3 text-amber-400" />
                            ) : null}
                          </div>
                        )}

                        {isQuick ? (
                          /* Quick chat bubble */
                          <div className={`inline-block max-w-[80%] px-3 py-2 rounded-2xl rounded-tl-md
                            bg-gradient-to-br ${agent?.gradient || "from-zinc-800 to-zinc-900"}
                            border border-white/5
                          `}>
                            <p className="text-sm text-zinc-200">{msg.body_md}</p>
                          </div>
                        ) : (
                          /* Longer message with subject */
                          <div className={`max-w-[90%] rounded-xl overflow-hidden
                            bg-white/[0.03] border border-white/5 hover:border-white/10 transition-all
                          `}>
                            <div className="px-3 py-2 border-b border-white/5 bg-white/[0.02]">
                              <p className="text-sm font-medium text-zinc-200">{msg.subject}</p>
                            </div>
                            <div className="px-3 py-2">
                              <p className="text-xs text-zinc-400 line-clamp-3">
                                {getShortStatus(msg.body_md)}
                              </p>
                              {msg.body_md.length > 200 && (
                                <button className="text-[10px] text-blue-400 hover:text-blue-300 mt-1">
                                  Show more...
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Typing indicators */}
                {typingAgents.length > 0 && (
                  <div className="flex gap-3 mt-2">
                    <div className="w-8" />
                    <div className="flex items-center gap-2 text-zinc-500 text-xs">
                      <div className="flex gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce" style={{ animationDelay: "0ms" }} />
                        <div className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce" style={{ animationDelay: "150ms" }} />
                        <div className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce" style={{ animationDelay: "300ms" }} />
                      </div>
                      <span>{typingAgents.join(", ")} typing...</span>
                    </div>
                  </div>
                )}

                <div ref={bottomRef} />
              </div>
            ) : (
              /* Email View */
              <div className="space-y-3">
                {messages.map((msg) => {
                  const agent = getAgent(msg.from);
                  return (
                    <div
                      key={msg.id}
                      className={`
                        rounded-xl p-4 transition-all duration-200
                        bg-gradient-to-br ${agent?.gradient || "from-zinc-800/50 to-zinc-900/50"}
                        border border-white/5 hover:border-white/10
                      `}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm
                          bg-gradient-to-br ${agent?.gradient || "from-zinc-700 to-zinc-800"}
                        `}>
                          {agent?.avatar || "🤖"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className={`font-semibold text-sm ${agent?.text || "text-zinc-300"}`}>
                              {msg.from}
                            </span>
                            <span className="text-zinc-600 text-xs">→</span>
                            <span className="text-xs text-zinc-500 truncate">{msg.to?.join(", ")}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-3 h-3 text-zinc-600" />
                            <span className="text-[10px] text-zinc-600">{formatFullTime(msg.created_ts)}</span>
                            {msg.importance === "high" && (
                              <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-[10px] h-4">
                                Priority
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <p className="text-sm font-medium text-zinc-200 mb-2">{msg.subject}</p>
                      <div className="text-xs text-zinc-400 bg-black/20 rounded-lg p-3 font-mono whitespace-pre-wrap max-h-48 overflow-y-auto">
                        {msg.body_md}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollArea>

          {/* Input Area */}
          <div className="border-t border-white/5 p-4 bg-white/[0.02]">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] text-zinc-600 uppercase tracking-wider">To:</span>
              <div className="flex gap-1">
                {selectedAgents.map(name => {
                  const agent = getAgent(name);
                  return (
                    <span
                      key={name}
                      className={`text-[10px] px-1.5 py-0.5 rounded ${agent?.text} bg-white/5`}
                    >
                      {agent?.avatar} {name}
                    </span>
                  );
                })}
              </div>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={command}
                onChange={(e) => setCommand(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendCommand()}
                placeholder="Send a message to agents..."
                className="
                  flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm
                  focus:outline-none focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500/50
                  placeholder:text-zinc-600
                "
              />
              <button
                onClick={sendCommand}
                disabled={sending || !command.trim() || selectedAgents.length === 0}
                className="
                  px-4 py-3 rounded-xl font-medium text-sm
                  bg-gradient-to-r from-blue-600 to-blue-500
                  hover:from-blue-500 hover:to-blue-400
                  disabled:opacity-30 disabled:cursor-not-allowed
                  transition-all flex items-center gap-2
                "
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Sidebar - Active Build Status */}
        <div className="w-64 border-l border-white/5 p-4 hidden lg:block">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-4 h-4 text-amber-400" />
            <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Active Build</h3>
          </div>

          <div className="space-y-3">
            <div className="rounded-lg bg-white/[0.03] border border-white/5 p-3">
              <p className="text-xs text-zinc-500 mb-1">Current Task</p>
              <p className="text-sm text-zinc-200 font-medium">Teacher Phase Expansion</p>
            </div>

            <div className="space-y-2">
              {agents.map(agent => {
                const recentMsg = [...messages].reverse().find(m => m.from === agent.name);
                return (
                  <div key={agent.name} className="flex items-center gap-2 text-xs">
                    <div className={`w-6 h-6 rounded flex items-center justify-center text-xs
                      bg-gradient-to-br ${agent.gradient}
                    `}>
                      {agent.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium ${agent.text}`}>{agent.name}</p>
                      <p className="text-zinc-600 truncate">
                        {recentMsg ? getShortStatus(recentMsg.body_md).substring(0, 30) : "Idle..."}
                      </p>
                    </div>
                    <div className={`w-2 h-2 rounded-full ${agent.statusColor}`} />
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-white/5">
            <div className="flex items-center gap-2 mb-3">
              <Radio className="w-4 h-4 text-emerald-400" />
              <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Quick Stats</h3>
            </div>
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="rounded-lg bg-white/[0.03] p-2">
                <p className="text-lg font-bold text-white">{messages.length}</p>
                <p className="text-[10px] text-zinc-500">Messages</p>
              </div>
              <div className="rounded-lg bg-white/[0.03] p-2">
                <p className="text-lg font-bold text-emerald-400">4</p>
                <p className="text-[10px] text-zinc-500">Online</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
