'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import type { Student, TurnState, HomeworkType } from '@/lib/game/types';
import { DAY_LABELS } from '@/lib/game/constants';
import { cn } from '@/lib/utils';

interface DaySummary {
  lessonsCompleted: number;
  studentsHelped: number;
  eventsResolved: number;
  homeworkAssigned: HomeworkType | null;
  moodChanges: {
    improved: number;
    declined: number;
    unchanged: number;
  };
  academicProgress: number;
  teacherEnergyUsed: number;
}

interface DayTransitionProps {
  open: boolean;
  onClose: () => void;
  onAdvance: () => void;
  currentDay: TurnState['dayOfWeek'];
  currentWeek: number;
  students: Student[];
  summary: DaySummary;
}

export function DayTransition({
  open,
  onClose,
  onAdvance,
  currentDay,
  currentWeek,
  students,
  summary,
}: DayTransitionProps) {
  const [showingNext, setShowingNext] = useState(false);

  useEffect(() => {
    if (open) {
      setShowingNext(false);
    }
  }, [open]);

  const handleAdvance = () => {
    setShowingNext(true);
    setTimeout(() => {
      onAdvance();
      onClose();
    }, 500);
  };

  // Calculate next day info
  const dayOrder: TurnState['dayOfWeek'][] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
  const currentIndex = dayOrder.indexOf(currentDay);
  const isLastDay = currentIndex === dayOrder.length - 1;
  const nextDay = isLastDay ? 'monday' : dayOrder[currentIndex + 1];
  const nextWeek = isLastDay ? currentWeek + 1 : currentWeek;

  // Stats
  const presentCount = students.filter(s => s.attendanceToday).length;
  const avgMood = Math.round(
    students.reduce((sum, s) => {
      const moodValue = { excited: 100, happy: 80, neutral: 50, bored: 30, frustrated: 20, upset: 0 }[s.mood];
      return sum + moodValue;
    }, 0) / students.length
  );

  const topPerformers = students
    .filter(s => s.academicLevel > 70)
    .sort((a, b) => b.academicLevel - a.academicLevel)
    .slice(0, 3);

  const needsAttention = students
    .filter(s => s.mood === 'frustrated' || s.mood === 'upset' || s.academicLevel < 40)
    .slice(0, 3);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <span className="text-3xl">
              {currentDay === 'friday' ? '🎉' : '📚'}
            </span>
            <div>
              <DialogTitle className="text-2xl">
                End of {DAY_LABELS[currentDay]}
              </DialogTitle>
              <p className="text-muted-foreground">
                Week {currentWeek} Summary
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className={cn(
          'space-y-6 transition-opacity duration-300',
          showingNext && 'opacity-50'
        )}>
          {/* Quick Stats */}
          <div className="grid grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-3 text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {presentCount}/15
                </div>
                <div className="text-xs text-muted-foreground">Attendance</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 text-center">
                <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  {avgMood}%
                </div>
                <div className="text-xs text-muted-foreground">Class Mood</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 text-center">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {summary.lessonsCompleted}
                </div>
                <div className="text-xs text-muted-foreground">Lessons</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 text-center">
                <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                  {summary.eventsResolved}
                </div>
                <div className="text-xs text-muted-foreground">Events</div>
              </CardContent>
            </Card>
          </div>

          {/* Mood Changes */}
          <Card>
            <CardContent className="p-4">
              <div className="text-sm font-medium mb-3">Mood Changes Today</div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-green-500">↑</span>
                  <span className="text-sm">{summary.moodChanges.improved} improved</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-400">→</span>
                  <span className="text-sm">{summary.moodChanges.unchanged} unchanged</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-red-500">↓</span>
                  <span className="text-sm">{summary.moodChanges.declined} declined</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Top Performers & Needs Attention */}
          <div className="grid grid-cols-2 gap-4">
            {topPerformers.length > 0 && (
              <Card className="border-green-200 dark:border-green-800">
                <CardContent className="p-4">
                  <div className="text-sm font-medium text-green-700 dark:text-green-300 mb-2 flex items-center gap-2">
                    <span>⭐</span> Top Performers
                  </div>
                  <div className="space-y-2">
                    {topPerformers.map(student => (
                      <div key={student.id} className="flex items-center justify-between text-sm">
                        <span>{student.firstName} {student.lastName[0]}.</span>
                        <Badge variant="secondary" className="text-xs">
                          {student.academicLevel}%
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {needsAttention.length > 0 && (
              <Card className="border-amber-200 dark:border-amber-800">
                <CardContent className="p-4">
                  <div className="text-sm font-medium text-amber-700 dark:text-amber-300 mb-2 flex items-center gap-2">
                    <span>👀</span> Needs Attention
                  </div>
                  <div className="space-y-2">
                    {needsAttention.map(student => (
                      <div key={student.id} className="flex items-center justify-between text-sm">
                        <span>{student.firstName} {student.lastName[0]}.</span>
                        <Badge
                          variant="outline"
                          className={cn(
                            'text-xs',
                            student.mood === 'frustrated' || student.mood === 'upset'
                              ? 'text-red-600 dark:text-red-400'
                              : 'text-amber-600 dark:text-amber-400'
                          )}
                        >
                          {student.mood === 'frustrated' || student.mood === 'upset'
                            ? student.mood
                            : `${student.academicLevel}%`}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Homework */}
          {summary.homeworkAssigned && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm">
                    <span className="font-medium">Homework Assigned: </span>
                    <span className="capitalize text-muted-foreground">
                      {summary.homeworkAssigned}
                    </span>
                  </div>
                  <Badge variant="outline">
                    {summary.homeworkAssigned === 'none' && '🎉 No homework'}
                    {summary.homeworkAssigned === 'light' && '📝 Light load'}
                    {summary.homeworkAssigned === 'moderate' && '📚 Standard'}
                    {summary.homeworkAssigned === 'heavy' && '📖 Heavy'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}

          <Separator />

          {/* Next Day Preview */}
          <div className="text-center space-y-3">
            <div className="text-sm text-muted-foreground">Coming up next...</div>
            <div className="text-xl font-bold">
              {isLastDay ? (
                <span className="text-primary">
                  Week {nextWeek} - {DAY_LABELS[nextDay]} 🌅
                </span>
              ) : (
                <span>{DAY_LABELS[nextDay]}</span>
              )}
            </div>
            {isLastDay && (
              <p className="text-sm text-muted-foreground">
                A new week begins! Students will be refreshed and ready to learn.
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Stay on Summary
            </Button>
            <Button onClick={handleAdvance} className="flex-1">
              {showingNext ? 'Loading...' : `Go to ${DAY_LABELS[nextDay]}`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Hook to calculate day summary from state changes
export function calculateDaySummary(
  previousStudents: Student[],
  currentStudents: Student[],
  turn: TurnState,
  teacherEnergyStart: number,
  teacherEnergyEnd: number
): DaySummary {
  let improved = 0;
  let declined = 0;
  let unchanged = 0;

  const moodValues: Record<string, number> = {
    excited: 5,
    happy: 4,
    neutral: 3,
    bored: 2,
    frustrated: 1,
    upset: 0,
  };

  for (let i = 0; i < currentStudents.length; i++) {
    const prev = previousStudents.find(s => s.id === currentStudents[i].id);
    if (!prev) continue;

    const prevMood = moodValues[prev.mood];
    const currMood = moodValues[currentStudents[i].mood];

    if (currMood > prevMood) improved++;
    else if (currMood < prevMood) declined++;
    else unchanged++;
  }

  return {
    lessonsCompleted: turn.selectedLesson ? 1 : 0,
    studentsHelped: 0, // Would need to track this in state
    eventsResolved: turn.resolvedEvents.length,
    homeworkAssigned: turn.homeworkAssigned,
    moodChanges: { improved, declined, unchanged },
    academicProgress: Math.round(
      currentStudents.reduce((sum, s) => sum + s.academicLevel, 0) / currentStudents.length -
      previousStudents.reduce((sum, s) => sum + s.academicLevel, 0) / previousStudents.length
    ),
    teacherEnergyUsed: teacherEnergyStart - teacherEnergyEnd,
  };
}
