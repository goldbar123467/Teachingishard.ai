'use client';

import { useState, useCallback } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Student } from '@/lib/game/types';
import { cn } from '@/lib/utils';

interface SeatPosition {
  id: string;
  row: number;
  col: number;
  studentId: string | null;
}

interface SeatingChartProps {
  students: Student[];
  onSeatingChange?: (seating: SeatPosition[]) => void;
  rows?: number;
  cols?: number;
}

const MOOD_COLORS = {
  excited: 'bg-purple-100 dark:bg-purple-900/30 border-purple-300 dark:border-purple-700',
  happy: 'bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700',
  neutral: 'bg-gray-100 dark:bg-gray-800/30 border-gray-300 dark:border-gray-700',
  bored: 'bg-yellow-100 dark:bg-yellow-900/30 border-yellow-300 dark:border-yellow-700',
  frustrated: 'bg-orange-100 dark:bg-orange-900/30 border-orange-300 dark:border-orange-700',
  upset: 'bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700',
};

const MOOD_EMOJI = {
  excited: '🤩',
  happy: '😊',
  neutral: '😐',
  bored: '😑',
  frustrated: '😤',
  upset: '😢',
};

function SortableSeat({
  position,
  student,
  allStudents,
}: {
  position: SeatPosition;
  student: Student | null;
  allStudents: Student[];
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: position.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Check for strategic seating issues
  const warnings: string[] = [];
  if (student && student.rivalIds.length > 0) {
    const adjacentSeats = allStudents.filter((s) =>
      student.rivalIds.includes(s.id)
    );
    if (adjacentSeats.length > 0) {
      warnings.push('rival');
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        'relative aspect-square rounded-lg border-2 transition-all duration-200 cursor-grab active:cursor-grabbing',
        isDragging && 'opacity-50 scale-105 z-50',
        student
          ? MOOD_COLORS[student.mood]
          : 'bg-white dark:bg-zinc-900/50 border-dashed border-gray-300 dark:border-gray-700'
      )}
    >
      {student ? (
        <div className="absolute inset-0 p-1 flex flex-col items-center justify-center text-center">
          <div className="text-2xl mb-0.5">{MOOD_EMOJI[student.mood]}</div>
          <div className="text-xs font-semibold truncate w-full px-1">
            {student.firstName}
          </div>
          <div className="text-xs text-muted-foreground truncate w-full px-1">
            {student.lastName[0]}.
          </div>
          {warnings.includes('rival') && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-xs"
              title="Rival nearby!"
            >
              !
            </Badge>
          )}
          {student.needsExtraHelp && (
            <Badge
              variant="secondary"
              className="absolute -bottom-1 -left-1 h-4 w-4 p-0 flex items-center justify-center text-xs"
              title="Needs extra help"
            >
              ?
            </Badge>
          )}
        </div>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center text-gray-400 dark:text-gray-600 text-xs">
          Empty
        </div>
      )}
    </div>
  );
}

export function SeatingChart({
  students,
  onSeatingChange,
  rows = 4,
  cols = 4,
}: SeatingChartProps) {
  // Initialize seating positions
  const [seatPositions, setSeatPositions] = useState<SeatPosition[]>(() => {
    const positions: SeatPosition[] = [];
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const index = row * cols + col;
        positions.push({
          id: `seat-${row}-${col}`,
          row,
          col,
          studentId: students[index]?.id || null,
        });
      }
    }
    return positions;
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;

      if (over && active.id !== over.id) {
        setSeatPositions((positions) => {
          const oldIndex = positions.findIndex((p) => p.id === active.id);
          const newIndex = positions.findIndex((p) => p.id === over.id);

          const newPositions = arrayMove(positions, oldIndex, newIndex);

          // Swap student assignments
          const tempStudentId = newPositions[oldIndex].studentId;
          newPositions[oldIndex].studentId = newPositions[newIndex].studentId;
          newPositions[newIndex].studentId = tempStudentId;

          if (onSeatingChange) {
            onSeatingChange(newPositions);
          }

          return newPositions;
        });
      }
    },
    [onSeatingChange]
  );

  const handleAutoArrange = useCallback(() => {
    // Auto-arrange: separate rivals, pair friends
    const newPositions = [...seatPositions];
    const studentsById = new Map(students.map((s) => [s.id, s]));

    // Simple strategy: place students with rivals far apart
    const assignedStudentIds = new Set<string>();

    students.forEach((student, idx) => {
      if (assignedStudentIds.has(student.id)) return;

      let bestSeatIndex = -1;
      let maxDistance = -1;

      // Find the best seat (furthest from rivals)
      for (let i = 0; i < newPositions.length; i++) {
        if (newPositions[i].studentId === null) {
          let minRivalDistance = Infinity;

          student.rivalIds.forEach((rivalId) => {
            const rivalSeatIndex = newPositions.findIndex(
              (p) => p.studentId === rivalId
            );
            if (rivalSeatIndex !== -1) {
              const distance =
                Math.abs(newPositions[i].row - newPositions[rivalSeatIndex].row) +
                Math.abs(newPositions[i].col - newPositions[rivalSeatIndex].col);
              minRivalDistance = Math.min(minRivalDistance, distance);
            }
          });

          if (minRivalDistance > maxDistance) {
            maxDistance = minRivalDistance;
            bestSeatIndex = i;
          }
        }
      }

      if (bestSeatIndex === -1) {
        // No optimal seat found, just use first available
        bestSeatIndex = newPositions.findIndex((p) => p.studentId === null);
      }

      if (bestSeatIndex !== -1) {
        newPositions[bestSeatIndex].studentId = student.id;
        assignedStudentIds.add(student.id);
      }
    });

    setSeatPositions(newPositions);
    if (onSeatingChange) {
      onSeatingChange(newPositions);
    }
  }, [seatPositions, students, onSeatingChange]);

  const handleClear = useCallback(() => {
    const clearedPositions = seatPositions.map((p) => ({
      ...p,
      studentId: null,
    }));
    setSeatPositions(clearedPositions);
    if (onSeatingChange) {
      onSeatingChange(clearedPositions);
    }
  }, [seatPositions, onSeatingChange]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Classroom Seating Chart</CardTitle>
        <CardDescription>
          Drag and drop students to arrange seating. Keep rivals apart and friends together!
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex gap-2 flex-wrap">
            <Button size="sm" onClick={handleAutoArrange} variant="outline">
              Auto-Arrange (Smart)
            </Button>
            <Button size="sm" onClick={handleClear} variant="outline">
              Clear All Seats
            </Button>
          </div>

          <div className="relative">
            {/* Front of class indicator */}
            <div className="text-center mb-2 text-sm font-medium text-muted-foreground">
              📋 Teacher&apos;s Desk (Front)
            </div>

            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={seatPositions.map((p) => p.id)}
                strategy={rectSortingStrategy}
              >
                <div
                  className="grid gap-3 auto-rows-fr"
                  style={{
                    gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
                  }}
                >
                  {seatPositions.map((position) => {
                    const student = students.find(
                      (s) => s.id === position.studentId
                    );
                    return (
                      <SortableSeat
                        key={position.id}
                        position={position}
                        student={student || null}
                        allStudents={students}
                      />
                    );
                  })}
                </div>
              </SortableContext>
            </DndContext>
          </div>

          {/* Legend */}
          <div className="border-t pt-4 mt-4">
            <div className="text-sm font-medium mb-2">Mood Legend:</div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              {Object.entries(MOOD_EMOJI).map(([mood, emoji]) => (
                <div key={mood} className="flex items-center gap-1.5">
                  <span className="text-base">{emoji}</span>
                  <span className="capitalize text-muted-foreground">{mood}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
