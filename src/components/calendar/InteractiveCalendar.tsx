"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { BackgroundBeams } from "@/components/ui/background-beams";
import type { DayOfWeek } from "@/lib/game/types";
import {
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Coffee,
  BookOpen,
  Users,
  Home,
  Sparkles,
  Star,
  Calendar,
  X,
} from "lucide-react";

interface DayData {
  day: DayOfWeek;
  label: string;
  phase: "morning" | "teaching" | "interaction" | "end-of-day";
  events: string[];
  metrics: {
    classAverage: number;
    attendance: number;
    mood: "great" | "good" | "okay" | "poor";
  };
  isToday?: boolean;
  isCompleted?: boolean;
}

interface InteractiveCalendarProps {
  currentWeek: number;
  currentDay: DayOfWeek;
  onDayClick?: (day: DayOfWeek) => void;
}

const DAYS: DayOfWeek[] = ["monday", "tuesday", "wednesday", "thursday", "friday"];

const DAY_ICONS: Record<DayOfWeek, React.ReactNode> = {
  monday: <Coffee className="h-5 w-5" />,
  tuesday: <BookOpen className="h-5 w-5" />,
  wednesday: <Users className="h-5 w-5" />,
  thursday: <Star className="h-5 w-5" />,
  friday: <Home className="h-5 w-5" />,
};

const MOOD_COLORS = {
  great: "from-emerald-400 to-green-500",
  good: "from-blue-400 to-cyan-500",
  okay: "from-amber-400 to-yellow-500",
  poor: "from-red-400 to-rose-500",
};

const MOOD_EMOJIS = {
  great: "🤩",
  good: "😊",
  okay: "😐",
  poor: "😟",
};

// Generate mock data for the week
function generateWeekData(currentDay: DayOfWeek): DayData[] {
  const currentDayIndex = DAYS.indexOf(currentDay);

  return DAYS.map((day, index) => ({
    day,
    label: day.charAt(0).toUpperCase() + day.slice(1),
    phase: "morning",
    events: index === 2 ? ["Pop Quiz", "Guest Speaker"] : index === 4 ? ["Class Party"] : [],
    metrics: {
      classAverage: 65 + Math.floor(Math.random() * 25),
      attendance: 13 + Math.floor(Math.random() * 3),
      mood: (["great", "good", "okay", "poor"] as const)[Math.floor(Math.random() * 3)],
    },
    isToday: index === currentDayIndex,
    isCompleted: index < currentDayIndex,
  }));
}

export function InteractiveCalendar({
  currentWeek,
  currentDay,
  onDayClick,
}: InteractiveCalendarProps) {
  const [selectedDay, setSelectedDay] = useState<DayData | null>(null);
  const [weekData] = useState(() => generateWeekData(currentDay));
  const [hoveredDay, setHoveredDay] = useState<DayOfWeek | null>(null);

  const handleDayClick = (dayData: DayData) => {
    setSelectedDay(dayData);
    onDayClick?.(dayData.day);
  };

  return (
    <div className="relative w-full overflow-hidden rounded-2xl">
      {/* Background with beams */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
        <BackgroundBeams className="opacity-40" />
      </div>

      <div className="relative z-10 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <motion.div
              className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center"
              whileHover={{ scale: 1.05, rotate: 5 }}
            >
              <Calendar className="h-5 w-5 text-white" />
            </motion.div>
            <div>
              <h3 className="text-lg font-bold text-white">Week {currentWeek}</h3>
              <p className="text-xs text-white/60">School Calendar</p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-white/70 hover:text-white hover:bg-white/10"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-white/70 hover:text-white hover:bg-white/10"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-5 gap-3">
          {weekData.map((dayData, index) => (
            <motion.div
              key={dayData.day}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onMouseEnter={() => setHoveredDay(dayData.day)}
              onMouseLeave={() => setHoveredDay(null)}
            >
              <motion.button
                onClick={() => handleDayClick(dayData)}
                className={cn(
                  "relative w-full p-4 rounded-xl text-left transition-all duration-300",
                  "bg-white/5 backdrop-blur-sm border border-white/10",
                  "hover:bg-white/10 hover:border-white/20",
                  dayData.isToday && "ring-2 ring-violet-500 ring-offset-2 ring-offset-transparent",
                  dayData.isCompleted && "opacity-70"
                )}
                whileHover={{ scale: 1.02, y: -4 }}
                whileTap={{ scale: 0.98 }}
              >
                {/* Today Indicator */}
                {dayData.isToday && (
                  <motion.div
                    className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                  />
                )}

                {/* Day Icon */}
                <div className={cn(
                  "h-10 w-10 rounded-lg flex items-center justify-center mb-3",
                  dayData.isToday
                    ? "bg-gradient-to-br from-violet-500 to-purple-600 text-white"
                    : "bg-white/10 text-white/70"
                )}>
                  {DAY_ICONS[dayData.day]}
                </div>

                {/* Day Label */}
                <div className="text-sm font-semibold text-white mb-1">
                  {dayData.label}
                </div>

                {/* Status */}
                <div className="text-xs text-white/50">
                  {dayData.isCompleted ? "Completed" : dayData.isToday ? "Today" : "Upcoming"}
                </div>

                {/* Events Badge */}
                {dayData.events.length > 0 && (
                  <motion.div
                    className="absolute bottom-2 right-2"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                  >
                    <Badge className="bg-amber-500/80 text-white text-[10px] px-1.5 py-0.5">
                      {dayData.events.length} event{dayData.events.length > 1 ? "s" : ""}
                    </Badge>
                  </motion.div>
                )}

                {/* Hover Glow */}
                <AnimatePresence>
                  {hoveredDay === dayData.day && (
                    <motion.div
                      className="absolute inset-0 rounded-xl bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    />
                  )}
                </AnimatePresence>
              </motion.button>
            </motion.div>
          ))}
        </div>

        {/* Selected Day Detail Modal */}
        <AnimatePresence>
          {selectedDay && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
              onClick={() => setSelectedDay(null)}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="relative w-full max-w-md mx-4"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Card Glow */}
                <div className={cn(
                  "absolute -inset-[2px] rounded-2xl blur-lg opacity-60",
                  `bg-gradient-to-r ${MOOD_COLORS[selectedDay.metrics.mood]}`
                )} />

                <Card className="relative border-0 bg-card/95 backdrop-blur-xl">
                  {/* Gradient Header */}
                  <div className={cn(
                    "h-2 rounded-t-xl bg-gradient-to-r",
                    MOOD_COLORS[selectedDay.metrics.mood]
                  )} />

                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "h-12 w-12 rounded-xl flex items-center justify-center",
                          `bg-gradient-to-br ${MOOD_COLORS[selectedDay.metrics.mood]}`
                        )}>
                          <span className="text-2xl">{MOOD_EMOJIS[selectedDay.metrics.mood]}</span>
                        </div>
                        <div>
                          <CardTitle className="text-xl">{selectedDay.label}</CardTitle>
                          <p className="text-sm text-muted-foreground">Week {currentWeek}</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSelectedDay(null)}
                        className="h-8 w-8"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Metrics */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="text-center p-3 rounded-lg bg-muted/50">
                        <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                          {selectedDay.metrics.classAverage}%
                        </div>
                        <div className="text-xs text-muted-foreground">Class Avg</div>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-muted/50">
                        <div className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent">
                          {selectedDay.metrics.attendance}/15
                        </div>
                        <div className="text-xs text-muted-foreground">Attendance</div>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-muted/50">
                        <div className="text-2xl">{MOOD_EMOJIS[selectedDay.metrics.mood]}</div>
                        <div className="text-xs text-muted-foreground capitalize">{selectedDay.metrics.mood}</div>
                      </div>
                    </div>

                    {/* Events */}
                    {selectedDay.events.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-amber-400" />
                          Special Events
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedDay.events.map((event, i) => (
                            <motion.div
                              key={i}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: i * 0.1 }}
                            >
                              <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0">
                                {event}
                              </Badge>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Status */}
                    <div className="pt-2 border-t">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Status</span>
                        <Badge
                          variant="outline"
                          className={cn(
                            selectedDay.isToday && "border-violet-500 text-violet-500",
                            selectedDay.isCompleted && "border-emerald-500 text-emerald-500"
                          )}
                        >
                          {selectedDay.isCompleted ? "Completed" : selectedDay.isToday ? "In Progress" : "Upcoming"}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
