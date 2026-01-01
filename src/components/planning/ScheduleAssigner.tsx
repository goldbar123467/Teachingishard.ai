"use client";

import { useState, useMemo } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Calendar, CheckCircle2 } from 'lucide-react';
import { DraggableLessonPlan } from './DraggableLessonPlan';
import { DroppableTimeBlock } from './DroppableTimeBlock';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import type { LessonPlan } from '@/lib/game/lessonPlan';
import type { TimeBlock } from '@/lib/game/schedule';
import { assignLessonToBlock, unassignLessonFromBlock, getAssignedLesson, getUnassignedLessons } from '@/lib/game/lessonPlan';

interface ScheduleAssignerProps {
  lessonPlans: LessonPlan[];
  timeBlocks: TimeBlock[];
  onAssignmentChange?: (updatedBlocks: TimeBlock[]) => void;
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

export function ScheduleAssigner({
  lessonPlans,
  timeBlocks,
  onAssignmentChange,
}: ScheduleAssignerProps) {
  const [blocks, setBlocks] = useState<TimeBlock[]>(timeBlocks);
  const [activeLessonPlan, setActiveLessonPlan] = useState<LessonPlan | null>(null);
  const { toast } = useToast();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Calculate unassigned lesson plans
  const unassignedPlans = useMemo(() => {
    return getUnassignedLessons(lessonPlans, blocks);
  }, [lessonPlans, blocks]);

  // Group blocks by day
  const blocksByDay = useMemo(() => {
    const grouped: Record<number, TimeBlock[]> = {
      0: [],
      1: [],
      2: [],
      3: [],
      4: [],
    };

    blocks.forEach(block => {
      if (block.dayOfWeek >= 0 && block.dayOfWeek <= 4) {
        grouped[block.dayOfWeek].push(block);
      }
    });

    // Sort blocks within each day by start time
    Object.values(grouped).forEach(dayBlocks => {
      dayBlocks.sort((a, b) => {
        const timeA = timeToMinutes(a.startTime);
        const timeB = timeToMinutes(b.startTime);
        return timeA - timeB;
      });
    });

    return grouped;
  }, [blocks]);

  // Calculate assignment stats
  const stats = useMemo(() => {
    const assigned = blocks.filter(b => b.lessonPlanId).length;
    const total = blocks.length;
    const percentage = total > 0 ? Math.round((assigned / total) * 100) : 0;

    return { assigned, total, percentage };
  }, [blocks]);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const lessonPlan = active.data?.current?.lessonPlan as LessonPlan | undefined;
    if (lessonPlan) {
      setActiveLessonPlan(lessonPlan);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveLessonPlan(null);

    const { active, over } = event;

    if (!over) {
      return;
    }

    const lessonPlan = active.data?.current?.lessonPlan as LessonPlan | undefined;
    const targetBlock = over.data?.current?.block as TimeBlock | undefined;

    if (!lessonPlan || !targetBlock) {
      return;
    }

    // Validate assignment
    const result = assignLessonToBlock(lessonPlan.id, targetBlock.id, blocks);

    if (result.success && result.updatedBlocks) {
      setBlocks(result.updatedBlocks);
      onAssignmentChange?.(result.updatedBlocks);

      toast({
        title: "Lesson assigned",
        description: `"${lessonPlan.name}" assigned to ${DAYS[targetBlock.dayOfWeek]} at ${targetBlock.startTime}`,
        duration: 3000,
      });
    } else {
      toast({
        variant: "destructive",
        title: "Cannot assign lesson",
        description: result.error || "Unknown error occurred",
        duration: 4000,
      });
    }
  };

  const handleRemoveLesson = (blockId: string) => {
    const block = blocks.find(b => b.id === blockId);
    if (!block || !block.lessonPlanId) {
      return;
    }

    const assignedLesson = lessonPlans.find(lp => lp.id === block.lessonPlanId);
    const updatedBlocks = unassignLessonFromBlock(blockId, blocks);

    setBlocks(updatedBlocks);
    onAssignmentChange?.(updatedBlocks);

    toast({
      title: "Lesson removed",
      description: assignedLesson ? `"${assignedLesson.name}" removed from schedule` : "Lesson removed",
      duration: 3000,
    });
  };

  const getAssignedLessonForBlock = (block: TimeBlock): LessonPlan | null => {
    return getAssignedLesson(block.id, blocks, lessonPlans);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 lg:grid-cols-[350px_1fr] gap-6 h-full">
        {/* Left Panel: Lesson Plans */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Lesson Plans
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 mb-4">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Drag lesson plans onto time blocks in the weekly schedule
                  </AlertDescription>
                </Alert>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Assignment Progress</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">
                      {stats.assigned} / {stats.total}
                    </Badge>
                    <span className="font-medium">{stats.percentage}%</span>
                  </div>
                </div>
              </div>

              <ScrollArea className="h-[600px] pr-4">
                <div className="space-y-3">
                  {unassignedPlans.length === 0 ? (
                    <div className="text-center py-8 text-sm text-muted-foreground">
                      <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-green-600" />
                      <div className="font-medium">All lessons assigned!</div>
                      <div className="text-xs mt-1">
                        Remove a lesson from a time block to reassign it
                      </div>
                    </div>
                  ) : (
                    unassignedPlans.map(plan => (
                      <DraggableLessonPlan
                        key={plan.id}
                        lessonPlan={plan}
                        isDragging={activeLessonPlan?.id === plan.id}
                      />
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Right Panel: Weekly Schedule */}
        <Card className="overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
            <CardTitle className="text-xl">Weekly Schedule</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[700px]">
              <div className="p-6">
                <div className="grid gap-6">
                  {DAYS.map((day, dayIndex) => {
                    const dayBlocks = blocksByDay[dayIndex] || [];
                    const assignedCount = dayBlocks.filter(b => b.lessonPlanId).length;

                    return (
                      <div key={dayIndex} className="space-y-3">
                        <div className="flex items-center justify-between sticky top-0 bg-background py-2 border-b">
                          <h3 className="font-semibold text-lg">{day}</h3>
                          <Badge variant="outline">
                            {assignedCount} / {dayBlocks.length} assigned
                          </Badge>
                        </div>

                        {dayBlocks.length === 0 ? (
                          <div className="text-center py-8 text-sm text-muted-foreground border-2 border-dashed rounded-lg">
                            No time blocks scheduled for {day}
                          </div>
                        ) : (
                          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            {dayBlocks.map(block => (
                              <DroppableTimeBlock
                                key={block.id}
                                block={block}
                                assignedLesson={getAssignedLessonForBlock(block)}
                                onRemoveLesson={handleRemoveLesson}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Drag Overlay */}
      <DragOverlay>
        {activeLessonPlan ? (
          <div className="rotate-3 scale-105">
            <DraggableLessonPlan lessonPlan={activeLessonPlan} isDragging />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

// Helper function to convert time string to minutes
function timeToMinutes(timeStr: string): number {
  const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!match) return 0;

  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const period = match[3].toUpperCase();

  if (period === 'PM' && hours !== 12) {
    hours += 12;
  } else if (period === 'AM' && hours === 12) {
    hours = 0;
  }

  return hours * 60 + minutes;
}
