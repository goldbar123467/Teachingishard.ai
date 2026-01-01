'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Plus,
  Lightbulb,
  GripVertical,
  Clock,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { LessonPlan } from './LessonPlanCard';

interface LessonPlansSidebarProps {
  lessonPlans: LessonPlan[];
  scheduledPlanIds?: string[];
  onCreateNew?: () => void;
  selectedFilter?: string;
  onFilterChange?: (subject: string) => void;
}

const SUBJECT_CONFIG: Record<LessonPlan['subject'], {
  icon: string;
  label: string;
  color: string;
  gradient: string;
  glow: string;
}> = {
  math: {
    icon: '🔢',
    label: 'Math',
    color: 'border-blue-400/50 dark:border-blue-400/60 bg-blue-500/10 dark:bg-blue-500/20',
    gradient: 'from-blue-500 to-cyan-500',
    glow: 'shadow-blue-500/30',
  },
  reading: {
    icon: '📚',
    label: 'Reading & Writing',
    color: 'border-purple-400/50 dark:border-purple-400/60 bg-purple-500/10 dark:bg-purple-500/20',
    gradient: 'from-purple-500 to-pink-500',
    glow: 'shadow-purple-500/30',
  },
  science: {
    icon: '🔬',
    label: 'Science',
    color: 'border-green-400/50 dark:border-green-400/60 bg-green-500/10 dark:bg-green-500/20',
    gradient: 'from-green-500 to-emerald-500',
    glow: 'shadow-green-500/30',
  },
  'social-studies': {
    icon: '🌍',
    label: 'Social Studies',
    color: 'border-amber-400/50 dark:border-amber-400/60 bg-amber-500/10 dark:bg-amber-500/20',
    gradient: 'from-amber-500 to-orange-500',
    glow: 'shadow-amber-500/30',
  },
  art: {
    icon: '🎨',
    label: 'Art',
    color: 'border-pink-400/50 dark:border-pink-400/60 bg-pink-500/10 dark:bg-pink-500/20',
    gradient: 'from-pink-500 to-rose-500',
    glow: 'shadow-pink-500/30',
  },
  pe: {
    icon: '⚽',
    label: 'PE',
    color: 'border-orange-400/50 dark:border-orange-400/60 bg-orange-500/10 dark:bg-orange-500/20',
    gradient: 'from-orange-500 to-red-500',
    glow: 'shadow-orange-500/30',
  },
};

const SUBJECT_OPTIONS: LessonPlan['subject'][] = [
  'math',
  'reading',
  'science',
  'social-studies',
  'art',
  'pe',
];

export function LessonPlansSidebar({
  lessonPlans,
  scheduledPlanIds = [],
  onCreateNew,
  selectedFilter = 'all',
  onFilterChange,
}: LessonPlansSidebarProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const dragImageRef = useRef<HTMLDivElement>(null);

  const filteredPlans =
    selectedFilter === 'all'
      ? lessonPlans
      : lessonPlans.filter(plan => plan.subject === selectedFilter);

  const unscheduledPlans = filteredPlans.filter(
    plan => !scheduledPlanIds.includes(plan.id)
  );

  const scheduledPlans = filteredPlans.filter(
    plan => scheduledPlanIds.includes(plan.id)
  );

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, plan: LessonPlan) => {
    setDraggingId(plan.id);

    // Set drag data
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('lessonPlanId', plan.id);
    e.dataTransfer.setData('lessonName', plan.name);
    e.dataTransfer.setData('lessonSubject', plan.subject);
    e.dataTransfer.setData('lessonDuration', plan.duration.toString());

    // Create custom drag image
    if (dragImageRef.current) {
      // Clone and position the drag image
      const config = SUBJECT_CONFIG[plan.subject];
      dragImageRef.current.innerHTML = `
        <div class="flex items-center gap-2 p-3 rounded-lg bg-card border-2 shadow-xl ${config.color}" style="width: 200px;">
          <div class="w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br ${config.gradient} text-white text-lg">
            ${config.icon}
          </div>
          <div class="flex-1 min-w-0">
            <div class="font-semibold text-sm truncate">${plan.name}</div>
            <div class="text-xs text-muted-foreground">${plan.duration}m</div>
          </div>
        </div>
      `;
      e.dataTransfer.setDragImage(dragImageRef.current, 100, 30);
    }
  };

  const handleDragEnd = () => {
    setDraggingId(null);
  };

  const getSubjectConfig = (subject: LessonPlan['subject']) => {
    return SUBJECT_CONFIG[subject] || SUBJECT_CONFIG.math;
  };

  return (
    <div className="space-y-4 h-full flex flex-col">
      {/* Hidden drag image container */}
      <div
        ref={dragImageRef}
        className="fixed -left-[9999px] -top-[9999px] pointer-events-none"
        aria-hidden="true"
      />

      {/* Header */}
      <div className="space-y-1">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <span className="text-xl">📋</span>
          My Lessons
        </h2>
        <p className="text-xs text-muted-foreground">
          Drag lessons to schedule them
        </p>
      </div>

      {/* Filter */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-muted-foreground">Filter by Subject</label>
        <Select value={selectedFilter} onValueChange={onFilterChange}>
          <SelectTrigger className="h-9 text-sm bg-background/50 dark:bg-slate-800/50 border-border/50">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">
              <span className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5" />
                All Subjects
              </span>
            </SelectItem>
            {SUBJECT_OPTIONS.map(subject => {
              const config = getSubjectConfig(subject);
              return (
                <SelectItem key={subject} value={subject}>
                  <span className="flex items-center gap-2">
                    <span>{config.icon}</span>
                    {config.label}
                  </span>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Badge variant="secondary" className="text-xs py-0.5">
          {unscheduledPlans.length} available
        </Badge>
        {scheduledPlans.length > 0 && (
          <Badge variant="outline" className="text-xs py-0.5 text-green-600 dark:text-green-400 border-green-500/30">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            {scheduledPlans.length} scheduled
          </Badge>
        )}
      </div>

      {/* Lesson Plans List */}
      <ScrollArea className="flex-1 pr-4 -mr-4">
        <div className="space-y-3">
          {unscheduledPlans.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 px-4 text-center rounded-lg border-2 border-dashed border-border/30 bg-muted/20 dark:bg-slate-800/30">
              {lessonPlans.length === 0 ? (
                <>
                  <div className="w-12 h-12 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center mb-3">
                    <Plus className="w-6 h-6 text-primary" />
                  </div>
                  <p className="text-sm font-medium text-foreground/80 mb-1">
                    No lesson plans yet
                  </p>
                  <p className="text-xs text-muted-foreground mb-4">
                    Create your first lesson to get started
                  </p>
                  {onCreateNew && (
                    <Button size="sm" onClick={onCreateNew} className="gap-2">
                      <Plus className="w-4 h-4" />
                      Create Lesson
                    </Button>
                  )}
                </>
              ) : (
                <>
                  <div className="w-12 h-12 rounded-full bg-green-500/10 dark:bg-green-500/20 flex items-center justify-center mb-3">
                    <CheckCircle2 className="w-6 h-6 text-green-500" />
                  </div>
                  <p className="text-sm font-medium text-green-600 dark:text-green-400 mb-1">
                    All lessons scheduled!
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {scheduledPlans.length} lesson{scheduledPlans.length !== 1 ? 's' : ''} on your schedule
                  </p>
                </>
              )}
            </div>
          ) : (
            unscheduledPlans.map((plan, index) => {
              const config = getSubjectConfig(plan.subject);
              const isHovered = hoveredId === plan.id;
              const isDragging = draggingId === plan.id;

              return (
                <TooltipProvider key={plan.id} delayDuration={500}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div
                        draggable
                        onDragStart={e => handleDragStart(e, plan)}
                        onDragEnd={handleDragEnd}
                        onMouseEnter={() => setHoveredId(plan.id)}
                        onMouseLeave={() => setHoveredId(null)}
                        className={cn(
                          'relative p-3 rounded-lg border-2 transition-all duration-300 ease-out',
                          'cursor-grab active:cursor-grabbing',
                          'group',
                          config.color,
                          // Hover/active states
                          isHovered && !isDragging && [
                            'scale-[1.02] shadow-lg',
                            config.glow,
                            'border-opacity-100',
                          ],
                          isDragging && 'opacity-40 scale-95',
                          // Animation delay based on index
                          'animate-in slide-in-from-left-2 fade-in',
                        )}
                        style={{
                          animationDelay: `${index * 50}ms`,
                          animationFillMode: 'backwards',
                        }}
                      >
                        {/* Grip Handle */}
                        <div className={cn(
                          'absolute left-1 top-1/2 -translate-y-1/2',
                          'opacity-30 group-hover:opacity-70',
                          'transition-opacity duration-200',
                        )}>
                          <GripVertical className="w-4 h-4 text-muted-foreground" />
                        </div>

                        {/* Card Content */}
                        <div className="pl-4">
                          {/* Header */}
                          <div className="flex items-start gap-2.5 mb-2">
                            <div className={cn(
                              'flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center',
                              'bg-gradient-to-br shadow-sm text-white text-xl',
                              config.gradient,
                              'transition-transform duration-200',
                              isHovered && 'scale-110',
                            )}>
                              {config.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-sm line-clamp-2 leading-tight text-foreground dark:text-foreground/90">
                                {plan.name}
                              </h3>
                              {plan.teachingMethod && (
                                <p className="text-xs text-muted-foreground mt-0.5 truncate">
                                  {plan.teachingMethod}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Stats */}
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge
                              variant="secondary"
                              className="text-xs h-5 px-2 bg-background/50 dark:bg-background/30"
                            >
                              <Clock className="w-3 h-3 mr-1" />
                              {plan.duration}m
                            </Badge>
                            <Badge
                              variant="outline"
                              className="text-xs h-5 px-2"
                            >
                              {plan.activities} activit{plan.activities !== 1 ? 'ies' : 'y'}
                            </Badge>
                          </div>

                          {/* Drag Hint */}
                          <div className={cn(
                            'mt-2 text-xs text-muted-foreground italic',
                            'opacity-0 group-hover:opacity-100 transition-opacity duration-200',
                            'flex items-center gap-1',
                          )}>
                            <span className="inline-block animate-pulse">✨</span>
                            Drag to schedule
                          </div>
                        </div>

                        {/* Shimmer effect on hover */}
                        {isHovered && !isDragging && (
                          <div className="absolute inset-0 rounded-lg overflow-hidden pointer-events-none">
                            <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent" />
                          </div>
                        )}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="max-w-xs">
                      <div className="space-y-1">
                        <p className="font-medium">{plan.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {plan.description || `${plan.duration} minute ${config.label} lesson`}
                        </p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              );
            })
          )}

          {/* Scheduled lessons section (collapsed) */}
          {scheduledPlans.length > 0 && (
            <div className="pt-4 border-t border-border/30">
              <div className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                Already Scheduled
              </div>
              <div className="space-y-1.5">
                {scheduledPlans.slice(0, 3).map(plan => {
                  const config = getSubjectConfig(plan.subject);
                  return (
                    <div
                      key={plan.id}
                      className="flex items-center gap-2 p-2 rounded-lg bg-muted/30 dark:bg-slate-800/30 opacity-60"
                    >
                      <span className="text-sm">{config.icon}</span>
                      <span className="text-xs font-medium truncate flex-1">
                        {plan.name}
                      </span>
                      <Badge variant="outline" className="text-[10px] h-4 px-1.5 bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20">
                        Scheduled
                      </Badge>
                    </div>
                  );
                })}
                {scheduledPlans.length > 3 && (
                  <div className="text-xs text-muted-foreground text-center py-1">
                    +{scheduledPlans.length - 3} more scheduled
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Create New Button */}
      <div className="border-t border-border/30 pt-4 space-y-3">
        {onCreateNew && (
          <Button
            onClick={onCreateNew}
            className={cn(
              'w-full gap-2',
              'bg-gradient-to-r from-primary to-primary/80',
              'hover:from-primary/90 hover:to-primary/70',
              'shadow-sm hover:shadow-md transition-all duration-200',
            )}
          >
            <Plus className="w-4 h-4" />
            Create New Lesson
          </Button>
        )}

        {/* Quick Tip */}
        <div className={cn(
          'rounded-lg p-3',
          'bg-gradient-to-br from-amber-500/10 to-orange-500/5 dark:from-amber-500/20 dark:to-orange-500/10',
          'border border-amber-500/20 dark:border-amber-500/30',
        )}>
          <div className="flex gap-2.5">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-500/20 dark:bg-amber-500/30 flex items-center justify-center">
              <Lightbulb className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-xs font-medium text-amber-900 dark:text-amber-200">
                Pro Tip
              </p>
              <p className="text-xs text-amber-800/80 dark:text-amber-200/70 mt-0.5">
                Drag lessons onto the schedule grid to assign them to specific time slots.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
