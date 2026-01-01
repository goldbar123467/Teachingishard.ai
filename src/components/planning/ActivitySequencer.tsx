'use client';

import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { ActivityCard } from './ActivityCard';
import type { LessonActivity, LessonPhase } from '@/lib/game/lessonPlan';
import type { Lesson } from '@/lib/game/types';
import { groupActivitiesByPhase, reorderActivities, PHASE_LABELS } from '@/lib/game/lessonPlan';
import { cn } from '@/lib/utils';

interface ActivitySequencerProps {
  activities: LessonActivity[];
  subject: Lesson['subject'];
  onReorder: (activities: LessonActivity[]) => void;
  onAddActivity?: (phase: LessonPhase) => void;
  onEditActivity?: (activity: LessonActivity) => void;
  onDeleteActivity?: (activityId: string) => void;
}

export function ActivitySequencer({
  activities,
  subject,
  onReorder,
  onAddActivity,
  onEditActivity,
  onDeleteActivity,
}: ActivitySequencerProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const groupedActivities = groupActivitiesByPhase(activities);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = activities.findIndex(a => a.id === active.id);
    const newIndex = activities.findIndex(a => a.id === over.id);

    const reordered = reorderActivities(activities, oldIndex, newIndex);
    onReorder(reordered);
  };

  const calculatePhaseDuration = (phaseActivities: LessonActivity[]): number => {
    return phaseActivities.reduce((sum, act) => sum + act.duration, 0);
  };

  const phases: LessonPhase[] = ['intro', 'main', 'closing'];

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <div className="space-y-4">
        {phases.map(phase => {
          const phaseActivities = groupedActivities[phase];
          const phaseDuration = calculatePhaseDuration(phaseActivities);

          return (
            <Card key={phase} className="activity-phase-group">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-semibold">
                    {PHASE_LABELS[phase]}
                  </CardTitle>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground tabular-nums">
                      {phaseDuration} minutes
                    </span>
                    {onAddActivity && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onAddActivity(phase)}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Activity
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pb-3">
                {phaseActivities.length === 0 ? (
                  <div className="empty-phase text-center py-8 text-sm text-muted-foreground border-2 border-dashed rounded-lg">
                    No activities in this phase yet.
                    {onAddActivity && (
                      <div className="mt-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onAddActivity(phase)}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add First Activity
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <SortableContext
                    items={phaseActivities.map(a => a.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-2">
                      {phaseActivities.map(activity => (
                        <ActivityCard
                          key={activity.id}
                          activity={activity}
                          subject={subject}
                          onEdit={onEditActivity}
                          onDelete={onDeleteActivity}
                        />
                      ))}
                    </div>
                  </SortableContext>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </DndContext>
  );
}
