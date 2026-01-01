'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { GripVertical, Pencil, Trash2 } from 'lucide-react';
import type { LessonActivity } from '@/lib/game/lessonPlan';
import type { Lesson } from '@/lib/game/types';
import { SUBJECT_COLORS, GROUPING_LABELS } from '@/lib/game/lessonPlan';
import { cn } from '@/lib/utils';

interface ActivityCardProps {
  activity: LessonActivity;
  subject: Lesson['subject'];
  onEdit?: (activity: LessonActivity) => void;
  onDelete?: (activityId: string) => void;
}

export function ActivityCard({ activity, subject, onEdit, onDelete }: ActivityCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: activity.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const subjectColor = SUBJECT_COLORS[subject];

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={cn(
        'activity-card border-2 transition-shadow',
        isDragging && 'opacity-50 ring-2 ring-primary shadow-lg'
      )}
    >
      <CardContent className="p-3 flex items-center gap-3">
        {/* Drag Handle */}
        <div
          {...attributes}
          {...listeners}
          className="drag-handle cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground transition-colors"
        >
          <GripVertical className="h-5 w-5" />
        </div>

        {/* Activity Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-sm truncate">{activity.name}</span>
            <Badge
              variant="outline"
              className="text-xs shrink-0 tabular-nums"
            >
              {activity.duration} min
            </Badge>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Phase Badge */}
            <Badge
              variant="outline"
              className={cn('text-xs capitalize', subjectColor)}
            >
              {activity.phase}
            </Badge>

            {/* Grouping Badge */}
            <Badge variant="outline" className="text-xs">
              {GROUPING_LABELS[activity.grouping]}
            </Badge>

            {/* Materials count */}
            {activity.materials.length > 0 && (
              <span className="text-xs text-muted-foreground">
                {activity.materials.length} materials
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1 shrink-0">
          {onEdit && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(activity)}
              className="h-8 w-8 p-0"
            >
              <Pencil className="h-4 w-4" />
              <span className="sr-only">Edit activity</span>
            </Button>
          )}
          {onDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(activity.id)}
              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Delete activity</span>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
