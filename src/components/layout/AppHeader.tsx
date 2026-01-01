"use client";

import * as React from "react";
import { useGame } from "@/hooks/useGame";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sun, Moon, Save, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const phaseLabels: Record<string, string> = {
  morning: "Morning Review",
  teaching: "Teaching Phase",
  interaction: "Student Interaction",
  "end-of-day": "End of Day",
};

const phaseColors: Record<string, string> = {
  morning: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  teaching: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  interaction:
    "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20",
  "end-of-day":
    "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20",
};

interface AppHeaderProps {
  onSaveClick?: () => void;
}

export function AppHeader({ onSaveClick }: AppHeaderProps) {
  const { state } = useGame();
  const [isDark, setIsDark] = React.useState(false);

  React.useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains("dark");
    setIsDark(isDarkMode);
  }, []);

  const toggleTheme = () => {
    document.documentElement.classList.toggle("dark");
    setIsDark(!isDark);
  };

  const currentPhase = state.turn.phase;

  return (
    <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center gap-2 border-b border-slate-200 dark:border-slate-700/50 bg-background/80 dark:bg-slate-900/80 backdrop-blur-md transition-[width,height] ease-linear shadow-sm dark:shadow-none">
      <div className="flex w-full items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />

        {/* Breadcrumb */}
        <Breadcrumb className="hidden md:flex">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="#" className="text-muted-foreground">
                Classroom
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Dashboard</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Phase Indicator */}
        <Badge
          variant="outline"
          className={cn(
            "hidden rounded-full px-3 py-1 text-xs font-medium sm:flex",
            phaseColors[currentPhase]
          )}
        >
          {phaseLabels[currentPhase]}
        </Badge>

        {/* Week/Day on mobile */}
        <Badge variant="secondary" className="hidden text-xs sm:flex">
          Week {state.turn.week} • <span className="capitalize ml-1">{state.turn.dayOfWeek}</span>
        </Badge>

        {/* Quick Actions */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={onSaveClick}
          >
            <Save className="h-4 w-4" />
            <span className="sr-only">Save game</span>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={toggleTheme}
          >
            {isDark ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
            <span className="sr-only">Toggle theme</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
