'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Student, Lesson, TeachingMethod } from '@/lib/game/types';
import { predictClassOutcome, predictHomeworkCompletion } from '@/lib/ai/predictions';
import { getClassMorale, getStudentsNeedingAttention } from '@/lib/students/behavior';
import { cn } from '@/lib/utils';

interface ClassInsightsProps {
  students: Student[];
  selectedLesson: Lesson | null;
  selectedMethod: TeachingMethod | null;
  showPredictions?: boolean;
}

export function ClassInsights({
  students,
  selectedLesson,
  selectedMethod,
  showPredictions = true,
}: ClassInsightsProps) {
  const morale = useMemo(() => getClassMorale(students), [students]);
  const needsAttention = useMemo(() => getStudentsNeedingAttention(students), [students]);

  const prediction = useMemo(() => {
    if (!selectedLesson || !selectedMethod) return null;
    return predictClassOutcome(students, selectedLesson, selectedMethod);
  }, [students, selectedLesson, selectedMethod]);

  return (
    <div className="space-y-4">
      {/* Class Morale */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            Class Morale
            <Badge
              variant="outline"
              className={cn(
                'ml-auto',
                morale.average >= 60
                  ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                  : morale.average >= 40
                  ? 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                  : 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300'
              )}
            >
              {morale.average}%
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-1 justify-between">
            {Object.entries(morale.distribution).map(([mood, count]) => (
              <div key={mood} className="text-center flex-1">
                <div className="text-lg">
                  {mood === 'excited' && '🤩'}
                  {mood === 'happy' && '😊'}
                  {mood === 'neutral' && '😐'}
                  {mood === 'bored' && '😴'}
                  {mood === 'frustrated' && '😤'}
                  {mood === 'upset' && '😢'}
                </div>
                <div className="text-xs font-medium">{count}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Students Needing Attention */}
      {needsAttention.length > 0 && (
        <Card className="border-amber-200 dark:border-amber-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-amber-700 dark:text-amber-300">
              Students Needing Attention ({needsAttention.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {needsAttention.slice(0, 5).map(student => (
                <Badge
                  key={student.id}
                  variant="outline"
                  className="bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300"
                >
                  {student.firstName}
                  {student.mood === 'frustrated' || student.mood === 'upset' ? ' 😟' : ''}
                  {student.energy < 25 ? ' 😴' : ''}
                  {!student.homeworkCompleted ? ' 📝' : ''}
                </Badge>
              ))}
              {needsAttention.length > 5 && (
                <Badge variant="secondary">+{needsAttention.length - 5} more</Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Teaching Predictions */}
      {showPredictions && prediction && (
        <Card className="border-blue-200 dark:border-blue-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-blue-700 dark:text-blue-300">
              Lesson Predictions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-3 gap-2 text-center text-sm">
              <div>
                <div className={cn(
                  'text-lg font-bold',
                  prediction.averageEngagement >= 60
                    ? 'text-green-600 dark:text-green-400'
                    : prediction.averageEngagement >= 40
                    ? 'text-amber-600 dark:text-amber-400'
                    : 'text-red-600 dark:text-red-400'
                )}>
                  {prediction.averageEngagement}%
                </div>
                <div className="text-xs text-muted-foreground">Expected Engagement</div>
              </div>
              <div>
                <div className={cn(
                  'text-lg font-bold',
                  prediction.struggleCount === 0
                    ? 'text-green-600 dark:text-green-400'
                    : prediction.struggleCount <= 3
                    ? 'text-amber-600 dark:text-amber-400'
                    : 'text-red-600 dark:text-red-400'
                )}>
                  {prediction.struggleCount}
                </div>
                <div className="text-xs text-muted-foreground">May Struggle</div>
              </div>
              <div>
                <div className={cn(
                  'text-lg font-bold',
                  prediction.disruptionRisk < 0.2
                    ? 'text-green-600 dark:text-green-400'
                    : prediction.disruptionRisk < 0.4
                    ? 'text-amber-600 dark:text-amber-400'
                    : 'text-red-600 dark:text-red-400'
                )}>
                  {prediction.disruptionRisk < 0.2 ? 'Low' : prediction.disruptionRisk < 0.4 ? 'Med' : 'High'}
                </div>
                <div className="text-xs text-muted-foreground">Disruption Risk</div>
              </div>
            </div>

            {prediction.recommendedInterventions.length > 0 && (
              <div className="pt-2 border-t">
                <div className="text-xs font-medium text-muted-foreground mb-2">
                  Recommended Interventions:
                </div>
                <div className="space-y-1">
                  {prediction.recommendedInterventions.slice(0, 3).map((intervention, i) => (
                    <div
                      key={i}
                      className={cn(
                        'text-xs p-2 rounded flex items-center justify-between',
                        intervention.priority === 'high'
                          ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
                          : intervention.priority === 'medium'
                          ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300'
                          : 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                      )}
                    >
                      <span>{intervention.studentName}: {intervention.reason}</span>
                      <Badge variant="outline" className="text-xs capitalize">
                        {intervention.suggestedAction}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
