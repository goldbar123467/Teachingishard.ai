"use client";

import { useDroppable } from '@dnd-kit/core';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TimeBlock } from '@/lib/game/schedule';
import type { LessonPlan } from '@/lib/game/lessonPlan';
import { SUBJECT_COLORS, SUBJECT_ICONS, SUBJECT_LABELS } from '@/lib/game/lessonPlan';

interface DroppableTimeBlockProps {
  block: TimeBlock;
  assignedLesson?: LessonPlan | null;
  onRemoveLesson?: (blockId: string) => void;
  isOver?: boolean;
  canDrop?: boolean;
}

export function DroppableTimeBlock({
  block,
  assignedLesson,
  onRemoveLesson,
  isOver: isOverProp,
  canDrop: canDropProp,
}: DroppableTimeBlockProps) {
  const { isOver, setNodeRef, active } = useDroppable({
    id: block.id,
    data: {
      type: 'time-block',
      block,
    },
  });

  // Check if the currently dragged item can fit
  const draggedLessonPlan = active?.data?.current?.lessonPlan as LessonPlan | undefined;
  const canFit = draggedLessonPlan ? draggedLessonPlan.duration <= block.duration : true;
  const actualIsOver = isOverProp !== undefined ? isOverProp : isOver;
  const actualCanDrop = canDropProp !== undefined ? canDropProp : canFit;

  // Determine border and background colors based on state
  const getBorderColor = () => {
    if (actualIsOver) {
      return actualCanDrop ? 'border-green-500 ring-2 ring-green-500/50' : 'border-red-500 ring-2 ring-red-500/50';
    }
    if (assignedLesson) {
      return 'border-primary/50';
    }
    return 'border-dashed border-border/30';
  };

  const getBackgroundColor = () => {
    if (actualIsOver) {
      return actualCanDrop ? 'bg-green-500/10' : 'bg-red-500/10';
    }
    if (assignedLesson) {
      const subjectColor = SUBJECT_COLORS[assignedLesson.subject];
      return cn(subjectColor, 'bg-opacity-10');
    }
    return 'bg-muted/20';
  };

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  const dayLabel = days[block.dayOfWeek] || 'Day';

  return (
    <div ref={setNodeRef} className="h-full">
      <Card
        className={cn(
          "h-full min-h-[120px] transition-all duration-200",
          getBorderColor(),
          getBackgroundColor(),
          actualIsOver && "shadow-lg scale-[1.02]"
        )}
      >
        <div className="p-3 h-full flex flex-col">
          {/* Header */}
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium text-muted-foreground">
                {dayLabel} - {block.startTime}
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                <Clock className="h-3 w-3" />
                <span className="tabular-nums">{block.duration} min</span>
              </div>
            </div>
            {assignedLesson && onRemoveLesson && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 hover:bg-destructive/10 hover:text-destructive"
                onClick={() => onRemoveLesson(block.id)}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>

          {/* Content */}
          {assignedLesson ? (
            <div className="flex-1 space-y-2">
              <div className="font-medium text-sm line-clamp-2">
                {assignedLesson.name || 'Untitled Lesson'}
              </div>
              <Badge
                variant="secondary"
                className={cn(
                  "text-xs",
                  SUBJECT_COLORS[assignedLesson.subject],
                  "text-white"
                )}
              >
                <span className="mr-1">{SUBJECT_ICONS[assignedLesson.subject]}</span>
                {SUBJECT_LABELS[assignedLesson.subject]}
              </Badge>

              {/* Fit indicator */}
              <div className="flex items-center gap-1 text-xs">
                {assignedLesson.duration === block.duration ? (
                  <>
                    <CheckCircle2 className="h-3 w-3 text-green-600" />
                    <span className="text-green-600 font-medium">Perfect fit</span>
                  </>
                ) : assignedLesson.duration < block.duration ? (
                  <>
                    <AlertCircle className="h-3 w-3 text-amber-600" />
                    <span className="text-amber-600 font-medium">
                      {block.duration - assignedLesson.duration} min extra
                    </span>
                  </>
                ) : null}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center text-xs text-muted-foreground">
                {actualIsOver ? (
                  actualCanDrop ? (
                    <div className="flex flex-col items-center gap-1">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                      <span className="text-green-600 font-medium">Drop to assign</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-1">
                      <AlertCircle className="h-5 w-5 text-red-600" />
                      <span className="text-red-600 font-medium">Too long</span>
                      {draggedLessonPlan && (
                        <span className="text-xs">
                          Need {draggedLessonPlan.duration - block.duration} min more
                        </span>
                      )}
                    </div>
                  )
                ) : (
                  <span>Drag lesson here</span>
                )}
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
