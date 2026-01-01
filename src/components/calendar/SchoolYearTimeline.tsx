"use client";

import React, { useMemo } from "react";
import {
  useMotionValueEvent,
  useScroll,
  useTransform,
  motion,
  AnimatePresence,
} from "motion/react";
import { useRef, useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import type { Student } from "@/lib/game/types";
import {
  Calendar,
  GraduationCap,
  Star,
  Trophy,
  BookOpen,
  Users,
  Sparkles,
  TrendingUp,
  Award,
} from "lucide-react";

interface WeekData {
  week: number;
  averageGrade: number;
  highlights: string[];
  events: string[];
  studentSpotlight?: {
    name: string;
    achievement: string;
  };
}

interface SchoolYearTimelineProps {
  currentWeek: number;
  totalWeeks?: number;
  students: Student[];
  weeklyData?: WeekData[];
}

// Generate mock weekly data for the timeline
function generateWeeklyData(currentWeek: number, students: Student[]): WeekData[] {
  const weeks: WeekData[] = [];
  const classAverage = Math.round(
    students.reduce((sum, s) => sum + s.academicLevel, 0) / students.length
  );

  for (let i = 1; i <= currentWeek; i++) {
    const variance = Math.floor(Math.random() * 10) - 5;
    const weekAverage = Math.max(0, Math.min(100, classAverage + variance));

    const highlights: string[] = [];
    const events: string[] = [];

    // Add some variety to weekly highlights
    if (i === 1) {
      highlights.push("First day of school!");
      events.push("Welcome assembly");
    }
    if (i % 4 === 0) {
      events.push("Monthly assessment");
    }
    if (i % 3 === 0) {
      highlights.push("Class project completed");
    }
    if (weekAverage > 75) {
      highlights.push("Excellent class performance");
    }

    const spotlightStudent = students[Math.floor(Math.random() * students.length)];

    weeks.push({
      week: i,
      averageGrade: weekAverage,
      highlights,
      events,
      studentSpotlight: i % 2 === 0 ? {
        name: spotlightStudent.firstName,
        achievement: spotlightStudent.academicLevel > 75
          ? "Outstanding academic progress"
          : "Great improvement this week",
      } : undefined,
    });
  }

  return weeks;
}

// Milestone icons based on week number
const getMilestoneIcon = (week: number) => {
  if (week === 1) return <GraduationCap className="h-5 w-5" />;
  if (week % 10 === 0) return <Trophy className="h-5 w-5" />;
  if (week % 5 === 0) return <Star className="h-5 w-5" />;
  return <Calendar className="h-5 w-5" />;
};

// Grade color based on performance
const getGradeColor = (grade: number) => {
  if (grade >= 80) return "from-emerald-400 to-green-500";
  if (grade >= 60) return "from-amber-400 to-yellow-500";
  return "from-red-400 to-rose-500";
};

export function SchoolYearTimeline({
  currentWeek,
  totalWeeks = 36,
  students,
  weeklyData,
}: SchoolYearTimelineProps) {
  const ref = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);
  const [activeWeek, setActiveWeek] = useState<number | null>(null);

  const data = useMemo(
    () => weeklyData || generateWeeklyData(currentWeek, students),
    [weeklyData, currentWeek, students]
  );

  useEffect(() => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setHeight(rect.height);
    }
  }, [ref, data]);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 10%", "end 50%"],
  });

  const heightTransform = useTransform(scrollYProgress, [0, 1], [0, height]);
  const opacityTransform = useTransform(scrollYProgress, [0, 0.1], [0, 1]);

  const progressPercent = (currentWeek / totalWeeks) * 100;

  return (
    <div
      ref={containerRef}
      className="w-full bg-transparent font-sans md:px-6"
    >
      {/* Header */}
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
            <BookOpen className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-violet-400 via-purple-400 to-fuchsia-400 bg-clip-text text-transparent">
              School Year Journey
            </h2>
            <p className="text-sm text-muted-foreground">
              Week {currentWeek} of {totalWeeks} completed
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="relative mt-6">
          <div className="h-3 rounded-full bg-muted/50 overflow-hidden backdrop-blur-sm">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span>Start</span>
            <span className="font-semibold text-foreground">{Math.round(progressPercent)}% Complete</span>
            <span>End of Year</span>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div ref={ref} className="relative max-w-4xl mx-auto pb-20">
        {data.map((item, index) => (
          <motion.div
            key={item.week}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5, delay: index * 0.05 }}
            className="flex justify-start pt-8 md:pt-16 md:gap-8"
            onMouseEnter={() => setActiveWeek(item.week)}
            onMouseLeave={() => setActiveWeek(null)}
          >
            {/* Timeline Dot */}
            <div className="sticky flex flex-col md:flex-row z-40 items-center top-40 self-start max-w-xs lg:max-w-sm md:w-48">
              <motion.div
                className={cn(
                  "h-12 w-12 absolute left-3 md:left-3 rounded-full flex items-center justify-center shadow-lg transition-all duration-300",
                  item.week === currentWeek
                    ? "bg-gradient-to-br from-violet-500 to-fuchsia-500 shadow-violet-500/40"
                    : "bg-card border-2 border-muted-foreground/20",
                  activeWeek === item.week && "scale-110"
                )}
                whileHover={{ scale: 1.1 }}
              >
                <span className={cn(
                  item.week === currentWeek ? "text-white" : "text-muted-foreground"
                )}>
                  {getMilestoneIcon(item.week)}
                </span>
              </motion.div>
              <h3 className="hidden md:block text-xl md:pl-20 font-bold text-muted-foreground">
                Week {item.week}
              </h3>
            </div>

            {/* Content Card */}
            <div className="relative pl-20 pr-4 md:pl-4 w-full">
              <h3 className="md:hidden block text-lg mb-3 font-bold text-muted-foreground">
                Week {item.week}
              </h3>

              <motion.div
                className="relative group"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                {/* Glow Effect */}
                <div className={cn(
                  "absolute -inset-[2px] rounded-xl opacity-0 group-hover:opacity-60 blur-md transition-opacity duration-300",
                  `bg-gradient-to-r ${getGradeColor(item.averageGrade)}`
                )} />

                <Card className="relative border-0 bg-card/90 backdrop-blur-sm overflow-hidden">
                  {/* Gradient Header */}
                  <div className={cn(
                    "h-1 w-full bg-gradient-to-r",
                    getGradeColor(item.averageGrade)
                  )} />

                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Class Average</span>
                      </div>
                      <Badge
                        className={cn(
                          "bg-gradient-to-r border-0 text-white font-bold",
                          getGradeColor(item.averageGrade)
                        )}
                      >
                        {item.averageGrade}%
                      </Badge>
                    </div>

                    {/* Highlights */}
                    {item.highlights.length > 0 && (
                      <div className="space-y-1 mb-3">
                        {item.highlights.map((highlight, i) => (
                          <div key={i} className="flex items-center gap-2 text-sm">
                            <Sparkles className="h-3 w-3 text-amber-400" />
                            <span>{highlight}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Events */}
                    {item.events.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {item.events.map((event, i) => (
                          <Badge
                            key={i}
                            variant="outline"
                            className="text-xs bg-blue-500/10 border-blue-400/30 text-blue-600 dark:text-blue-400"
                          >
                            {event}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Student Spotlight */}
                    {item.studentSpotlight && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-3 p-3 rounded-lg bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-400/20"
                      >
                        <div className="flex items-center gap-2">
                          <Award className="h-4 w-4 text-amber-500" />
                          <span className="text-sm font-medium text-amber-600 dark:text-amber-400">
                            Student Spotlight
                          </span>
                        </div>
                        <p className="text-sm mt-1">
                          <span className="font-semibold">{item.studentSpotlight.name}</span>
                          {" - "}
                          {item.studentSpotlight.achievement}
                        </p>
                      </motion.div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </motion.div>
        ))}

        {/* Animated Timeline Line */}
        <div
          style={{ height: height + "px" }}
          className="absolute md:left-8 left-8 top-0 overflow-hidden w-[3px] bg-gradient-to-b from-transparent via-muted to-transparent"
        >
          <motion.div
            style={{
              height: heightTransform,
              opacity: opacityTransform,
            }}
            className="absolute inset-x-0 top-0 w-[3px] bg-gradient-to-t from-violet-500 via-purple-500 to-fuchsia-500 rounded-full shadow-lg shadow-violet-500/50"
          />
        </div>
      </div>
    </div>
  );
}
