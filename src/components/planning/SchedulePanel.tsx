'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  useDraggable,
  closestCenter,
  MeasuringStrategy,
} from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  AlertTriangle,
  Clock,
  X,
  GripVertical,
  CheckCircle2,
  Sparkles,
  Trash2,
  Copy,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ============ TYPES ============

interface ScheduledLesson {
  id: string;
  lessonPlanId: string;
  lessonName: string;
  subject: string;
  duration: number;
  dayOfWeek: number;
  timeSlot: string;
}

interface DraggableLessonData {
  id: string;
  name: string;
  subject: string;
  duration: number;
}

interface SchedulePanelProps {
  scheduledLessons?: ScheduledLesson[];
  onLessonAssigned?: (
    lessonName: string,
    dayOfWeek: number,
    timeSlot: string,
    duration: number
  ) => void;
  onLessonUnassigned?: (dayOfWeek: number, timeSlot: string) => void;
}

// ============ CONSTANTS ============

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const DAY_ABBREV = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
const START_HOUR = 8;
const END_HOUR = 15;

const TIME_SLOTS = Array.from({ length: (END_HOUR - START_HOUR) * 2 }, (_, i) => {
  const hour = START_HOUR + Math.floor(i / 2);
  const minute = (i % 2) * 30;
  return `${hour}:${String(minute).padStart(2, '0')}`;
});

const SUBJECT_CONFIG: Record<string, {
  bg: string;
  border: string;
  text: string;
  glow: string;
  icon: string;
  gradient: string;
}> = {
  math: {
    bg: 'bg-blue-500/20 dark:bg-blue-500/30',
    border: 'border-blue-400/50 dark:border-blue-400/60',
    text: 'text-blue-700 dark:text-blue-300',
    glow: 'shadow-blue-500/20 dark:shadow-blue-500/40',
    icon: '🔢',
    gradient: 'from-blue-500 to-cyan-500',
  },
  reading: {
    bg: 'bg-purple-500/20 dark:bg-purple-500/30',
    border: 'border-purple-400/50 dark:border-purple-400/60',
    text: 'text-purple-700 dark:text-purple-300',
    glow: 'shadow-purple-500/20 dark:shadow-purple-500/40',
    icon: '📚',
    gradient: 'from-purple-500 to-pink-500',
  },
  science: {
    bg: 'bg-green-500/20 dark:bg-green-500/30',
    border: 'border-green-400/50 dark:border-green-400/60',
    text: 'text-green-700 dark:text-green-300',
    glow: 'shadow-green-500/20 dark:shadow-green-500/40',
    icon: '🔬',
    gradient: 'from-green-500 to-emerald-500',
  },
  'social-studies': {
    bg: 'bg-amber-500/20 dark:bg-amber-500/30',
    border: 'border-amber-400/50 dark:border-amber-400/60',
    text: 'text-amber-700 dark:text-amber-300',
    glow: 'shadow-amber-500/20 dark:shadow-amber-500/40',
    icon: '🌍',
    gradient: 'from-amber-500 to-orange-500',
  },
  art: {
    bg: 'bg-pink-500/20 dark:bg-pink-500/30',
    border: 'border-pink-400/50 dark:border-pink-400/60',
    text: 'text-pink-700 dark:text-pink-300',
    glow: 'shadow-pink-500/20 dark:shadow-pink-500/40',
    icon: '🎨',
    gradient: 'from-pink-500 to-rose-500',
  },
  pe: {
    bg: 'bg-orange-500/20 dark:bg-orange-500/30',
    border: 'border-orange-400/50 dark:border-orange-400/60',
    text: 'text-orange-700 dark:text-orange-300',
    glow: 'shadow-orange-500/20 dark:shadow-orange-500/40',
    icon: '⚽',
    gradient: 'from-orange-500 to-red-500',
  },
};

const getSubjectConfig = (subject: string) => {
  return SUBJECT_CONFIG[subject] || SUBJECT_CONFIG.math;
};

// ============ DROPPABLE TIME SLOT COMPONENT ============

interface DroppableSlotProps {
  dayIndex: number;
  timeSlot: string;
  lesson: ScheduledLesson | null;
  isOver: boolean;
  isDraggingOver: boolean;
  draggedItem: DraggableLessonData | null;
  onRemove: () => void;
  onQuickAction?: (action: 'duplicate' | 'delete', lesson: ScheduledLesson) => void;
}

function DroppableSlot({
  dayIndex,
  timeSlot,
  lesson,
  isOver,
  isDraggingOver,
  draggedItem,
  onRemove,
  onQuickAction,
}: DroppableSlotProps) {
  const { isOver: isDropOver, setNodeRef, active } = useDroppable({
    id: `slot-${dayIndex}-${timeSlot}`,
    data: {
      type: 'slot',
      dayIndex,
      timeSlot,
    },
  });

  const [isHovered, setIsHovered] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);

  const config = lesson ? getSubjectConfig(lesson.subject) : null;
  const actualIsOver = isOver || isDropOver;

  // Determine slot state
  const isEmpty = !lesson;
  const canDrop = isEmpty && isDraggingOver;

  return (
    <div
      ref={setNodeRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setShowQuickActions(false);
      }}
      className={cn(
        'relative min-h-[72px] rounded-lg border-2 transition-all duration-300 ease-out',
        'group overflow-hidden',
        // Empty state
        isEmpty && !actualIsOver && [
          'border-dashed border-border/30 dark:border-border/20',
          'bg-gradient-to-br from-muted/20 to-muted/10 dark:from-slate-800/30 dark:to-slate-900/20',
          'hover:border-border/50 dark:hover:border-border/40',
          'hover:bg-muted/30 dark:hover:bg-slate-800/50',
        ],
        // Drag over - valid drop
        actualIsOver && isEmpty && [
          'border-solid border-primary/70 dark:border-primary',
          'bg-gradient-to-br from-primary/20 to-primary/10 dark:from-primary/30 dark:to-primary/20',
          'shadow-lg shadow-primary/20 dark:shadow-primary/40',
          'scale-[1.02]',
          'ring-2 ring-primary/30 dark:ring-primary/50',
        ],
        // Occupied state
        lesson && [
          'border-solid',
          config?.border,
          config?.bg,
          'hover:shadow-lg',
          config?.glow && `hover:${config.glow}`,
          isHovered && 'scale-[1.01]',
        ],
        // Blocked drop target
        actualIsOver && lesson && [
          'border-red-500/50 dark:border-red-400/60',
          'ring-2 ring-red-500/20',
        ],
      )}
    >
      {/* Background pattern for empty slots */}
      {isEmpty && !actualIsOver && (
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle, currentColor 1px, transparent 1px)`,
            backgroundSize: '12px 12px',
          }} />
        </div>
      )}

      {/* Shimmer effect on drag over */}
      {actualIsOver && isEmpty && (
        <div className="absolute inset-0 overflow-hidden rounded-lg">
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </div>
      )}

      {/* Content */}
      {lesson ? (
        <div className="relative p-3 h-full flex flex-col">
          {/* Header with subject icon and name */}
          <div className="flex items-start gap-2">
            <div className={cn(
              'flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center',
              'bg-gradient-to-br shadow-sm',
              config?.gradient,
              'text-white text-lg',
            )}>
              {config?.icon}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-sm line-clamp-1 text-foreground dark:text-foreground/90">
                {lesson.lessonName}
              </h4>
              <div className={cn('text-xs mt-0.5 flex items-center gap-1', config?.text)}>
                <Clock className="w-3 h-3" />
                <span className="font-medium">{lesson.duration}m</span>
              </div>
            </div>

            {/* Remove button */}
            <TooltipProvider delayDuration={300}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      'h-6 w-6 p-0 rounded-full',
                      'opacity-0 group-hover:opacity-100',
                      'hover:bg-destructive/10 hover:text-destructive',
                      'transition-all duration-200',
                    )}
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemove();
                    }}
                  >
                    <X className="w-3.5 h-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs">
                  Remove from schedule
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {/* Quick actions on hover */}
          {isHovered && (
            <div className={cn(
              'absolute bottom-2 left-2 right-2',
              'flex items-center gap-1',
              'opacity-0 group-hover:opacity-100',
              'transition-all duration-200',
            )}>
              <TooltipProvider delayDuration={300}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-xs bg-background/80 dark:bg-background/50 backdrop-blur-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onQuickAction?.('duplicate', lesson);
                      }}
                    >
                      <Copy className="w-3 h-3 mr-1" />
                      Copy
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="text-xs">
                    Duplicate to another slot
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          )}
        </div>
      ) : (
        <div className="flex items-center justify-center h-full p-2">
          {actualIsOver ? (
            <div className="flex flex-col items-center gap-1 text-center">
              <div className="w-8 h-8 rounded-full bg-primary/20 dark:bg-primary/30 flex items-center justify-center animate-pulse">
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
              <span className="text-xs font-medium text-primary">Drop here</span>
            </div>
          ) : (
            <span className="text-xs text-muted-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              Drag lesson here
            </span>
          )}
        </div>
      )}
    </div>
  );
}

// ============ DRAGGED ITEM PREVIEW ============

interface DragPreviewProps {
  item: DraggableLessonData;
}

function DragPreview({ item }: DragPreviewProps) {
  const config = getSubjectConfig(item.subject);

  return (
    <div
      className={cn(
        'w-48 p-3 rounded-lg border-2 shadow-2xl',
        'bg-card/95 dark:bg-card/90 backdrop-blur-sm',
        config.border,
        'rotate-3 scale-105',
        'pointer-events-none',
      )}
    >
      <div className="flex items-center gap-2">
        <div className={cn(
          'w-8 h-8 rounded-lg flex items-center justify-center',
          'bg-gradient-to-br shadow-sm text-white text-lg',
          config.gradient,
        )}>
          {config.icon}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-sm line-clamp-1">{item.name}</h4>
          <div className={cn('text-xs flex items-center gap-1', config.text)}>
            <Clock className="w-3 h-3" />
            <span>{item.duration}m</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============ MAIN COMPONENT ============

export function SchedulePanel({
  scheduledLessons = [],
  onLessonAssigned,
  onLessonUnassigned,
}: SchedulePanelProps) {
  const [draggedItem, setDraggedItem] = useState<DraggableLessonData | null>(null);
  const [activeSlot, setActiveSlot] = useState<string | null>(null);
  const [recentlyDropped, setRecentlyDropped] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Group lessons by slot
  const scheduleGrid = useMemo(() => {
    const grid: Record<string, ScheduledLesson | null> = {};
    for (let day = 0; day < 5; day++) {
      for (const time of TIME_SLOTS) {
        grid[`${day}-${time}`] = null;
      }
    }
    scheduledLessons.forEach(lesson => {
      grid[`${lesson.dayOfWeek}-${lesson.timeSlot}`] = lesson;
    });
    return grid;
  }, [scheduledLessons]);

  // Calculate daily totals
  const dailyStats = useMemo(() => {
    const stats = DAYS.map((_, i) => ({
      totalMinutes: 0,
      lessonCount: 0,
      subjects: new Set<string>(),
    }));

    scheduledLessons.forEach(lesson => {
      stats[lesson.dayOfWeek].totalMinutes += lesson.duration;
      stats[lesson.dayOfWeek].lessonCount++;
      stats[lesson.dayOfWeek].subjects.add(lesson.subject);
    });

    return stats;
  }, [scheduledLessons]);

  // Validation
  const validation = useMemo(() => {
    const issues: string[] = [];
    const warnings: string[] = [];

    const minDuration = {
      math: 60,
      reading: 90,
      science: 45,
      'social-studies': 45,
      art: 45,
      pe: 45
    };

    for (let day = 0; day < 5; day++) {
      const dayLessons = scheduledLessons.filter(l => l.dayOfWeek === day);
      const subjectTotals: Record<string, number> = {};

      dayLessons.forEach(lesson => {
        subjectTotals[lesson.subject] = (subjectTotals[lesson.subject] || 0) + lesson.duration;
      });

      // Check minimum requirements
      Object.entries(subjectTotals).forEach(([subject, duration]) => {
        const required = minDuration[subject as keyof typeof minDuration] || 45;
        if (duration < required) {
          warnings.push(`${DAYS[day]}: ${subject} is ${duration}m (need ${required}m)`);
        }
      });

      // Check for conflicts
      const sortedLessons = [...dayLessons].sort((a, b) => {
        return parseInt(a.timeSlot.replace(':', '')) - parseInt(b.timeSlot.replace(':', ''));
      });

      for (let i = 0; i < sortedLessons.length - 1; i++) {
        const current = sortedLessons[i];
        const next = sortedLessons[i + 1];
        const currentEnd =
          parseInt(current.timeSlot.split(':')[0]) * 60 +
          parseInt(current.timeSlot.split(':')[1]) +
          current.duration;
        const nextStart =
          parseInt(next.timeSlot.split(':')[0]) * 60 +
          parseInt(next.timeSlot.split(':')[1]);

        if (currentEnd > nextStart) {
          issues.push(`${DAYS[day]}: Time conflict between lessons`);
        }
      }
    }

    return { isValid: issues.length === 0, issues, warnings };
  }, [scheduledLessons]);

  // Handle external drag events (from sidebar)
  useEffect(() => {
    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      if (e.dataTransfer) {
        e.dataTransfer.dropEffect = 'move';
      }
    };

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      const target = e.target as HTMLElement;
      const slotElement = target.closest('[data-slot]');

      if (slotElement && e.dataTransfer) {
        const slotId = slotElement.getAttribute('data-slot');
        const lessonName = e.dataTransfer.getData('lessonName');
        const duration = parseInt(e.dataTransfer.getData('lessonDuration'));

        if (slotId && lessonName) {
          const [dayStr, timeSlot] = slotId.split('-');
          const dayOfWeek = parseInt(dayStr);

          // Check if slot is occupied
          if (!scheduleGrid[slotId]) {
            onLessonAssigned?.(lessonName, dayOfWeek, timeSlot, duration);
            setRecentlyDropped(slotId);
            setTimeout(() => setRecentlyDropped(null), 500);
          }
        }
      }
    };

    document.addEventListener('dragover', handleDragOver);
    document.addEventListener('drop', handleDrop);

    return () => {
      document.removeEventListener('dragover', handleDragOver);
      document.removeEventListener('drop', handleDrop);
    };
  }, [scheduleGrid, onLessonAssigned]);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const data = event.active.data.current;
    if (data?.type === 'lesson') {
      setDraggedItem(data.lesson);
    }
  }, []);

  const handleDragOver = useCallback((event: DragOverEvent) => {
    const overId = event.over?.id;
    if (overId && typeof overId === 'string' && overId.startsWith('slot-')) {
      setActiveSlot(overId.replace('slot-', ''));
    } else {
      setActiveSlot(null);
    }
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    setDraggedItem(null);
    setActiveSlot(null);

    const { active, over } = event;
    if (!over) return;

    const overData = over.data.current;
    if (overData?.type === 'slot' && active.data.current?.type === 'lesson') {
      const lesson = active.data.current.lesson;
      const { dayIndex, timeSlot } = overData;

      if (!scheduleGrid[`${dayIndex}-${timeSlot}`]) {
        onLessonAssigned?.(lesson.name, dayIndex, timeSlot, lesson.duration);
        setRecentlyDropped(`${dayIndex}-${timeSlot}`);
        setTimeout(() => setRecentlyDropped(null), 500);
      }
    }
  }, [scheduleGrid, onLessonAssigned]);

  const handleRemoveLesson = useCallback((dayOfWeek: number, timeSlot: string) => {
    onLessonUnassigned?.(dayOfWeek, timeSlot);
  }, [onLessonUnassigned]);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      measuring={{
        droppable: {
          strategy: MeasuringStrategy.Always,
        },
      }}
    >
      <div className="space-y-4 flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <span className="text-xl">📅</span>
              Weekly Schedule
            </h2>
            <p className="text-xs text-muted-foreground">
              Drag lessons onto time slots to build your week
            </p>
          </div>

          {/* Stats Badge */}
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className={cn(
                'px-3 py-1 text-xs font-medium',
                'bg-gradient-to-r from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10',
                'border-primary/20 dark:border-primary/30',
              )}
            >
              <Zap className="w-3 h-3 mr-1 text-primary" />
              {scheduledLessons.length} lessons
            </Badge>
          </div>
        </div>

        {/* Validation Alert */}
        {!validation.isValid && (
          <Alert className="border-red-200 dark:border-red-800/50 bg-red-50/50 dark:bg-red-900/20">
            <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
            <AlertDescription className="text-red-900 dark:text-red-200 text-xs">
              <div className="font-semibold mb-1">Schedule Issues:</div>
              <ul className="list-disc list-inside space-y-0.5">
                {validation.issues.map((issue, i) => (
                  <li key={i}>{issue}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {validation.warnings.length > 0 && validation.isValid && (
          <Alert className="border-amber-200 dark:border-amber-800/50 bg-amber-50/50 dark:bg-amber-900/20">
            <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <AlertDescription className="text-amber-900 dark:text-amber-200 text-xs">
              <div className="font-semibold mb-1">Recommendations:</div>
              <ul className="list-disc list-inside space-y-0.5">
                {validation.warnings.slice(0, 3).map((warning, i) => (
                  <li key={i}>{warning}</li>
                ))}
                {validation.warnings.length > 3 && (
                  <li>+{validation.warnings.length - 3} more...</li>
                )}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {/* Schedule Grid */}
        <div className="flex-1 overflow-hidden rounded-xl border border-border/50 dark:border-border/30 bg-gradient-to-br from-muted/30 to-muted/10 dark:from-slate-800/50 dark:to-slate-900/30">
          <div className="overflow-x-auto h-full">
            <div
              className="inline-block min-w-full p-3"
              style={{
                display: 'grid',
                gridTemplateColumns: '70px repeat(5, minmax(160px, 1fr))',
                gap: '8px',
              }}
            >
              {/* Time Column Header */}
              <div className="sticky left-0 z-10 bg-transparent">
                <div className="text-xs font-semibold text-muted-foreground py-2 px-1">
                  Time
                </div>
              </div>

              {/* Day Headers */}
              {DAYS.map((day, dayIndex) => (
                <div
                  key={dayIndex}
                  className={cn(
                    'rounded-lg p-2 text-center',
                    'bg-gradient-to-b from-background to-muted/30 dark:from-slate-800/80 dark:to-slate-900/50',
                    'border border-border/30 dark:border-border/20',
                  )}
                >
                  <div className="font-semibold text-sm text-foreground dark:text-foreground/90">
                    {day}
                  </div>
                  <div className="flex items-center justify-center gap-2 mt-1">
                    <Badge
                      variant="secondary"
                      className={cn(
                        'text-xs px-2 py-0.5',
                        dailyStats[dayIndex].totalMinutes >= 180
                          ? 'bg-green-500/20 text-green-700 dark:text-green-300 border-green-500/30'
                          : dailyStats[dayIndex].totalMinutes >= 90
                          ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/30'
                          : 'bg-muted/50',
                      )}
                    >
                      {dailyStats[dayIndex].totalMinutes}m
                    </Badge>
                    {dailyStats[dayIndex].lessonCount > 0 && (
                      <div className="flex -space-x-1">
                        {Array.from(dailyStats[dayIndex].subjects).slice(0, 3).map((subject, i) => (
                          <div
                            key={i}
                            className="w-4 h-4 rounded-full border border-background flex items-center justify-center text-[10px]"
                            style={{ zIndex: 3 - i }}
                          >
                            {getSubjectConfig(subject).icon}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Time Slots */}
              {TIME_SLOTS.map((timeSlot, timeIndex) => (
                <div key={timeIndex} className="contents">
                  {/* Time Label */}
                  <div className="sticky left-0 z-10 bg-transparent">
                    <div className="text-xs font-medium text-muted-foreground py-2 px-1 text-right">
                      {timeSlot}
                    </div>
                  </div>

                  {/* Day Cells */}
                  {DAYS.map((_, dayIndex) => {
                    const slotKey = `${dayIndex}-${timeSlot}`;
                    const lesson = scheduleGrid[slotKey];
                    const isActiveSlot = activeSlot === slotKey;
                    const wasRecentlyDropped = recentlyDropped === slotKey;

                    return (
                      <div
                        key={slotKey}
                        data-slot={slotKey}
                        className={cn(
                          'transition-transform duration-300',
                          wasRecentlyDropped && 'animate-[bounce_0.3s_ease-out]',
                        )}
                      >
                        <DroppableSlot
                          dayIndex={dayIndex}
                          timeSlot={timeSlot}
                          lesson={lesson}
                          isOver={isActiveSlot}
                          isDraggingOver={!!draggedItem}
                          draggedItem={draggedItem}
                          onRemove={() => handleRemoveLesson(dayIndex, timeSlot)}
                        />
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Summary Footer */}
        <Card className="border-border/50 dark:border-border/30 bg-gradient-to-r from-muted/30 to-muted/20 dark:from-slate-800/50 dark:to-slate-900/40">
          <CardContent className="py-3 px-4">
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
              {DAYS.map((day, dayIndex) => (
                <div key={dayIndex} className="text-xs">
                  <div className="font-semibold text-foreground/80 dark:text-foreground/70 mb-1">
                    {DAY_ABBREV[dayIndex]}
                  </div>
                  <div className="text-muted-foreground mb-1.5">
                    {dailyStats[dayIndex].totalMinutes}m · {dailyStats[dayIndex].lessonCount} lesson{dailyStats[dayIndex].lessonCount !== 1 ? 's' : ''}
                  </div>
                  <div className="flex gap-1 flex-wrap">
                    {scheduledLessons
                      .filter(l => l.dayOfWeek === dayIndex)
                      .slice(0, 4)
                      .map(l => (
                        <span key={l.id} className="text-sm" title={l.lessonName}>
                          {getSubjectConfig(l.subject).icon}
                        </span>
                      ))}
                    {dailyStats[dayIndex].lessonCount > 4 && (
                      <span className="text-muted-foreground">+{dailyStats[dayIndex].lessonCount - 4}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Status Footer */}
        <div className="text-xs text-muted-foreground text-center flex items-center justify-center gap-2">
          {scheduledLessons.length === 0 ? (
            <>
              <span className="text-lg">👈</span>
              Drag lessons from the sidebar to start scheduling
            </>
          ) : validation.isValid ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span className="text-green-600 dark:text-green-400">
                Schedule is valid - {scheduledLessons.length} lesson{scheduledLessons.length !== 1 ? 's' : ''} scheduled
              </span>
            </>
          ) : (
            <>
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span>Review the issues above</span>
            </>
          )}
        </div>
      </div>

      {/* Drag Overlay */}
      <DragOverlay dropAnimation={{
        duration: 200,
        easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
      }}>
        {draggedItem && <DragPreview item={draggedItem} />}
      </DragOverlay>
    </DndContext>
  );
}
