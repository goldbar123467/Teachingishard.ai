'use client';

import { useState, useMemo, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Clock, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ScheduledLesson {
  id: string;
  lessonPlanId: string;
  lessonName: string;
  subject: string;
  duration: number;
  dayOfWeek: number;
  timeSlot: string;
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

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const START_HOUR = 8;
const END_HOUR = 15;

const TIME_SLOTS = Array.from({ length: (END_HOUR - START_HOUR) * 2 }, (_, i) => {
  const hour = START_HOUR + Math.floor(i / 2);
  const minute = (i % 2) * 30;
  return `${hour}:${String(minute).padStart(2, '0')}`;
});

const SUBJECT_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  math: {
    bg: 'bg-blue-500',
    border: 'border-blue-400',
    text: 'text-blue-700 dark:text-blue-300',
  },
  reading: {
    bg: 'bg-purple-500',
    border: 'border-purple-400',
    text: 'text-purple-700 dark:text-purple-300',
  },
  science: {
    bg: 'bg-green-500',
    border: 'border-green-400',
    text: 'text-green-700 dark:text-green-300',
  },
  'social-studies': {
    bg: 'bg-amber-500',
    border: 'border-amber-400',
    text: 'text-amber-700 dark:text-amber-300',
  },
  art: {
    bg: 'bg-pink-500',
    border: 'border-pink-400',
    text: 'text-pink-700 dark:text-pink-300',
  },
  pe: {
    bg: 'bg-orange-500',
    border: 'border-orange-400',
    text: 'text-orange-700 dark:text-orange-300',
  },
};

const SUBJECT_ICONS: Record<string, string> = {
  math: '🔢',
  reading: '📚',
  science: '🔬',
  'social-studies': '🌍',
  art: '🎨',
  pe: '⚽',
};

export function SchedulePanel({
  scheduledLessons = [],
  onLessonAssigned,
  onLessonUnassigned,
}: SchedulePanelProps) {
  const [dragOverSlot, setDragOverSlot] = useState<string | null>(null);
  const [validDropZones, setValidDropZones] = useState<Set<string>>(new Set());

  // Group lessons by day and time
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

  // Calculate minutes per day
  const minutesByDay = useMemo(() => {
    const totals: Record<number, number> = {};

    for (let i = 0; i < 5; i++) {
      totals[i] = scheduledLessons
        .filter(l => l.dayOfWeek === i)
        .reduce((sum, l) => sum + l.duration, 0);
    }

    return totals;
  }, [scheduledLessons]);

  // Validation
  const validation = useMemo(() => {
    const issues: string[] = [];
    const minDuration = { math: 60, reading: 90, science: 45, 'social-studies': 45, art: 45, pe: 45 };

    for (let day = 0; day < 5; day++) {
      const dayLessons = scheduledLessons.filter(l => l.dayOfWeek === day);
      const subjectTotals: Record<string, number> = {};

      dayLessons.forEach(lesson => {
        subjectTotals[lesson.subject] = (subjectTotals[lesson.subject] || 0) + lesson.duration;
      });

      Object.entries(subjectTotals).forEach(([subject, duration]) => {
        const required = minDuration[subject as keyof typeof minDuration] || 45;
        if (duration < required) {
          issues.push(
            `${DAYS[day]}: ${subject} is ${duration}m (need ${required}m minimum)`
          );
        }
      });

      // Check for overlaps
      const sortedLessons = dayLessons.sort((a, b) => {
        const aTime = parseInt(a.timeSlot.replace(':', ''));
        const bTime = parseInt(b.timeSlot.replace(':', ''));
        return aTime - bTime;
      });

      for (let i = 0; i < sortedLessons.length - 1; i++) {
        const current = sortedLessons[i];
        const next = sortedLessons[i + 1];

        const currentEnd =
          parseInt(current.timeSlot.split(':')[0]) * 60 +
          parseInt(current.timeSlot.split(':')[1]) +
          current.duration;

        const nextStart =
          parseInt(next.timeSlot.split(':')[0]) * 60 + parseInt(next.timeSlot.split(':')[1]);

        if (currentEnd > nextStart) {
          issues.push(`${DAYS[day]}: "${current.lessonName}" overlaps with "${next.lessonName}"`);
        }
      }
    }

    return {
      isValid: issues.length === 0,
      issues,
    };
  }, [scheduledLessons]);

  const handleDragOver = useCallback(
    (e: React.DragEvent, dayOfWeek: number, timeSlot: string) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      setDragOverSlot(`${dayOfWeek}-${timeSlot}`);

      // Check if drop is valid (no overlap)
      const lessonAtSlot = scheduleGrid[`${dayOfWeek}-${timeSlot}`];
      if (!lessonAtSlot) {
        validDropZones.add(`${dayOfWeek}-${timeSlot}`);
      }
    },
    [scheduleGrid, validDropZones]
  );

  const handleDragLeave = useCallback(() => {
    setDragOverSlot(null);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent, dayOfWeek: number, timeSlot: string) => {
      e.preventDefault();
      setDragOverSlot(null);

      const lessonPlanId = e.dataTransfer.getData('lessonPlanId');
      const lessonName = e.dataTransfer.getData('lessonName');
      const lessonSubject = e.dataTransfer.getData('lessonSubject');
      const lessonDuration = parseInt(e.dataTransfer.getData('lessonDuration'));

      if (!lessonPlanId || !lessonName) return;

      // Check if slot is occupied
      if (scheduleGrid[`${dayOfWeek}-${timeSlot}`]) {
        alert('This time slot is already occupied. Please choose another time.');
        return;
      }

      onLessonAssigned?.(lessonName, dayOfWeek, timeSlot, lessonDuration);
    },
    [scheduleGrid, onLessonAssigned]
  );

  const handleRemoveLesson = (dayOfWeek: number, timeSlot: string) => {
    onLessonUnassigned?.(dayOfWeek, timeSlot);
  };

  return (
    <div className="space-y-4 flex flex-col h-full">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Weekly Schedule</h2>
        <p className="text-xs text-muted-foreground">
          Drop lessons here to assign them to your weekly schedule
        </p>
      </div>

      {/* Validation Alert */}
      {!validation.isValid && (
        <Alert className="border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-900/20">
          <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
          <AlertDescription className="text-orange-900 dark:text-orange-200 text-xs">
            <div className="font-semibold mb-1">Schedule Issues:</div>
            <ul className="list-disc list-inside space-y-0.5">
              {validation.issues.map((issue, i) => (
                <li key={i}>{issue}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Schedule Grid */}
      <div className="flex-1 overflow-x-auto border rounded-lg">
        <div
          className="inline-block min-w-full"
          style={{
            display: 'grid',
            gridTemplateColumns: '60px repeat(5, 1fr)',
            gap: '4px',
            padding: '12px',
            backgroundColor: 'hsl(var(--muted))',
          }}
        >
          {/* Time Column Header */}
          <div className="text-xs font-semibold text-muted-foreground py-2">Time</div>

          {/* Day Headers */}
          {DAYS.map((day, dayIndex) => (
            <div key={dayIndex} className="text-center">
              <div className="font-semibold text-sm mb-1">{day}</div>
              <Badge variant="secondary" className="text-xs">
                {minutesByDay[dayIndex]}m
              </Badge>
            </div>
          ))}

          {/* Time Slots */}
          {TIME_SLOTS.map((timeSlot, timeIndex) => (
            <div key={timeIndex} className="contents">
              {/* Time Label */}
              <div className="text-xs font-medium text-muted-foreground py-2 text-right pr-2">
                {timeSlot}
              </div>

              {/* Day Cells */}
              {DAYS.map((_, dayIndex) => {
                const slotKey = `${dayIndex}-${timeSlot}`;
                const lesson = scheduleGrid[slotKey];
                const isDropZone = dragOverSlot === slotKey;
                const colors = lesson ? SUBJECT_COLORS[lesson.subject] : { bg: '', border: '', text: '' };

                return (
                  <div
                    key={slotKey}
                    onDragOver={e => handleDragOver(e, dayIndex, timeSlot)}
                    onDragLeave={handleDragLeave}
                    onDrop={e => handleDrop(e, dayIndex, timeSlot)}
                    className={cn(
                      'min-h-[60px] rounded border-2 transition-all duration-200 p-2 flex flex-col items-start justify-center cursor-default',
                      lesson
                        ? cn(colors.border, 'bg-white dark:bg-slate-950 border-2')
                        : cn(
                          'border-dashed border-border/40 hover:border-border/60 bg-muted/20 hover:bg-muted/40',
                          isDropZone && 'border-solid border-primary bg-primary/10 shadow-md'
                        )
                    )}
                  >
                    {lesson ? (
                      <div className="w-full group">
                        <div className="flex items-start gap-1.5">
                          <div className="text-sm flex-1 min-w-0">
                            <div className="font-semibold text-xs line-clamp-2 text-foreground">
                              {SUBJECT_ICONS[lesson.subject]} {lesson.lessonName}
                            </div>
                            <div className={cn('text-xs mt-0.5', colors.text)}>
                              {lesson.duration}m
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => handleRemoveLesson(dayIndex, timeSlot)}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-xs text-muted-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity">
                        Drop here
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Summary Footer */}
      <Card>
        <CardContent className="pt-4">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {DAYS.map((day, dayIndex) => (
              <div key={dayIndex} className="text-xs">
                <div className="font-medium mb-1">{day}</div>
                <div className="text-muted-foreground">{minutesByDay[dayIndex]} min</div>
                <div className="flex gap-1 mt-1.5 flex-wrap">
                  {scheduledLessons
                    .filter(l => l.dayOfWeek === dayIndex)
                    .map(l => (
                      <Badge key={l.id} variant="outline" className="text-xs">
                        {SUBJECT_ICONS[l.subject]}
                      </Badge>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Status Footer */}
      <div className="text-xs text-muted-foreground text-center">
        {scheduledLessons.length === 0
          ? 'Drag lessons from the left to start scheduling'
          : `${scheduledLessons.length} lesson${scheduledLessons.length !== 1 ? 's' : ''} scheduled`}
      </div>
    </div>
  );
}
