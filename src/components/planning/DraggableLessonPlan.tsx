"use client";

import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GripVertical, Clock, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { LessonPlan } from '@/lib/game/lessonPlan';
import { SUBJECT_COLORS, SUBJECT_ICONS, SUBJECT_LABELS } from '@/lib/game/lessonPlan';

interface DraggableLessonPlanProps {
  lessonPlan: LessonPlan;
  isDragging?: boolean;
}

export function DraggableLessonPlan({ lessonPlan, isDragging = false }: DraggableLessonPlanProps) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: lessonPlan.id,
    data: {
      type: 'lesson-plan',
      lessonPlan,
    },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
  };

  const subjectColor = SUBJECT_COLORS[lessonPlan.subject];
  const subjectIcon = SUBJECT_ICONS[lessonPlan.subject];
  const subjectLabel = SUBJECT_LABELS[lessonPlan.subject];

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={cn(
        "cursor-grab active:cursor-grabbing transition-all",
        isDragging && "opacity-50 shadow-2xl scale-105",
        "hover:shadow-md hover:border-primary/50"
      )}
      {...listeners}
      {...attributes}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start gap-2">
          <GripVertical className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <CardTitle className="text-sm font-semibold truncate">
              {lessonPlan.name || 'Untitled Lesson Plan'}
            </CardTitle>
            <div className="flex items-center gap-2 mt-1">
              <Badge
                variant="secondary"
                className={cn("text-xs", subjectColor, "text-white")}
              >
                <span className="mr-1">{subjectIcon}</span>
                {subjectLabel}
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0 space-y-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span className="font-medium tabular-nums">{lessonPlan.duration} min</span>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <BookOpen className="h-4 w-4" />
          <span>{lessonPlan.activities.length} activities</span>
        </div>

        {lessonPlan.objectives.length > 0 && (
          <div className="text-xs text-muted-foreground pt-1 border-t">
            <div className="font-medium">Objectives:</div>
            <ul className="list-disc list-inside space-y-0.5 mt-1">
              {lessonPlan.objectives.slice(0, 2).map(obj => (
                <li key={obj.id} className="truncate">
                  {obj.description}
                </li>
              ))}
              {lessonPlan.objectives.length > 2 && (
                <li className="text-muted-foreground/70">
                  +{lessonPlan.objectives.length - 2} more
                </li>
              )}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
