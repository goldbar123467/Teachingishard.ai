"use client";

import * as React from "react";
import {
  BookOpen,
  Calendar,
  ChevronDown,
  GraduationCap,
  LayoutDashboard,
  Settings,
  Sparkles,
  Users,
  Zap,
  DollarSign,
  Save,
  Clock,
  ClipboardList,
} from "lucide-react";
import { useGame } from "@/hooks/useGame";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface NavItem {
  title: string;
  icon: React.ElementType;
  isActive?: boolean;
  badge?: string | number;
}

const navItems: NavItem[] = [
  { title: "Dashboard", icon: LayoutDashboard, isActive: true },
  { title: "Lesson Planning", icon: ClipboardList },
  { title: "Students", icon: Users },
  { title: "Teaching", icon: BookOpen },
  { title: "Events", icon: Sparkles },
  { title: "Calendar", icon: Calendar },
  { title: "Settings", icon: Settings },
];

export function AppSidebar() {
  const { state } = useGame();
  const { state: sidebarState } = useSidebar();
  const isCollapsed = sidebarState === "collapsed";

  const teacher = state.teacher;
  const activeEventsCount = state.turn.activeEvents.length;

  // Update nav items with dynamic badges
  const itemsWithBadges = navItems.map((item) => {
    if (item.title === "Events" && activeEventsCount > 0) {
      return { ...item, badge: activeEventsCount };
    }
    return item;
  });

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-3 px-2 py-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-blue-500 text-white shadow-lg">
            <GraduationCap className="h-5 w-5" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-sidebar-foreground">
                Classroom Sim
              </span>
              <span className="text-xs text-sidebar-foreground/60">
                5th Grade
              </span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/50">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {itemsWithBadges.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    isActive={item.isActive}
                    tooltip={item.title}
                    className={cn(
                      "relative transition-all",
                      item.isActive &&
                        "bg-gradient-to-r from-violet-500/20 to-blue-500/10 text-sidebar-primary"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                    {item.badge && (
                      <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-500 px-1.5 text-[10px] font-semibold text-white">
                        {item.badge}
                      </span>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/50">
            Quick Actions
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Save Game">
                  <Save className="h-4 w-4" />
                  <span>Save Game</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <div className="space-y-3 px-2 py-3">
          {/* Energy */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-sidebar-foreground/70">
                <Zap className="h-3.5 w-3.5 text-amber-400" />
                {!isCollapsed && <span>Energy</span>}
              </div>
              {!isCollapsed && (
                <span className="text-xs font-medium text-sidebar-foreground">
                  {teacher.energy}%
                </span>
              )}
            </div>
            <Progress
              value={teacher.energy}
              className="h-1.5 bg-sidebar-accent"
            />
          </div>

          {/* Budget */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-sidebar-foreground/70">
                <DollarSign className="h-3.5 w-3.5 text-emerald-400" />
                {!isCollapsed && <span>Budget</span>}
              </div>
              {!isCollapsed && (
                <span className="text-xs font-medium text-sidebar-foreground">
                  ${teacher.suppliesBudget}
                </span>
              )}
            </div>
            <Progress
              value={Math.min(teacher.suppliesBudget, 100)}
              className="h-1.5 bg-sidebar-accent"
            />
          </div>

          {/* Week/Day indicator */}
          {!isCollapsed && (
            <div className="flex items-center justify-between rounded-lg bg-sidebar-accent/50 px-3 py-2">
              <span className="text-xs text-sidebar-foreground/70">
                Week {state.turn.week}
              </span>
              <span className="text-xs font-medium capitalize text-sidebar-foreground">
                {state.turn.dayOfWeek}
              </span>
            </div>
          )}
        </div>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
