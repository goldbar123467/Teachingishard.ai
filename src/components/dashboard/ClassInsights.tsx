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
      <div className="relative group">
        <div className="absolute -inset-[1px] rounded-xl bg-gradient-to-r from-emerald-400 to-cyan-400 opacity-0 group-hover:opacity-50 blur-sm transition-opacity duration-300" />
        <Card className="relative border-0 bg-card/95 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <span className="bg-gradient-to-r from-emerald-500 to-cyan-500 bg-clip-text text-transparent font-semibold">
                Class Morale
              </span>
              <Badge
                variant="outline"
                className={cn(
                  'ml-auto backdrop-blur-sm',
                  morale.average >= 60
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-400/30'
                    : morale.average >= 40
                    ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-400/30'
                    : 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-400/30'
                )}
              >
                {morale.average}%
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-1 justify-between">
              {Object.entries(morale.distribution).map(([mood, count]) => (
                <div key={mood} className="text-center flex-1 group/mood hover:scale-110 transition-transform cursor-default">
                  <div className="text-lg">
                    {mood === 'excited' && '🤩'}
                    {mood === 'happy' && '😊'}
                    {mood === 'neutral' && '😐'}
                    {mood === 'bored' && '😴'}
                    {mood === 'frustrated' && '😤'}
                    {mood === 'upset' && '😢'}
                  </div>
                  <div className="text-xs font-medium tabular-nums">{count}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Students Needing Attention */}
      {needsAttention.length > 0 && (
        <div className="relative group">
          <div className="absolute -inset-[1px] rounded-xl bg-gradient-to-r from-amber-400 to-orange-400 opacity-0 group-hover:opacity-50 blur-sm transition-opacity duration-300" />
          <Card className="relative border-0 bg-card/95 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent font-semibold">
                Students Needing Attention ({needsAttention.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {needsAttention.slice(0, 5).map(student => (
                  <Badge
                    key={student.id}
                    variant="outline"
                    className="bg-amber-500/10 backdrop-blur-sm border-amber-400/30 text-amber-600 dark:text-amber-400"
                  >
                    {student.firstName}
                    {student.mood === 'frustrated' || student.mood === 'upset' ? ' 😟' : ''}
                    {student.energy < 25 ? ' 😴' : ''}
                    {!student.homeworkCompleted ? ' 📝' : ''}
                  </Badge>
                ))}
                {needsAttention.length > 5 && (
                  <Badge variant="secondary" className="bg-secondary/50 backdrop-blur-sm">
                    +{needsAttention.length - 5} more
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Teaching Predictions */}
      {showPredictions && prediction && (
        <div className="relative group">
          <div className="absolute -inset-[1px] rounded-xl bg-gradient-to-r from-blue-400 to-violet-400 opacity-0 group-hover:opacity-50 blur-sm transition-opacity duration-300" />
          <Card className="relative border-0 bg-card/95 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm bg-gradient-to-r from-blue-500 to-violet-500 bg-clip-text text-transparent font-semibold">
                Lesson Predictions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-3 gap-2 text-center text-sm">
                <div className="p-2 rounded-lg bg-gradient-to-b from-transparent to-muted/30">
                  <div className={cn(
                    'text-lg font-bold bg-gradient-to-r bg-clip-text text-transparent',
                    prediction.averageEngagement >= 60
                      ? 'from-emerald-500 to-green-500'
                      : prediction.averageEngagement >= 40
                      ? 'from-amber-500 to-yellow-500'
                      : 'from-red-500 to-rose-500'
                  )}>
                    {prediction.averageEngagement}%
                  </div>
                  <div className="text-xs text-muted-foreground">Expected Engagement</div>
                </div>
                <div className="p-2 rounded-lg bg-gradient-to-b from-transparent to-muted/30">
                  <div className={cn(
                    'text-lg font-bold bg-gradient-to-r bg-clip-text text-transparent',
                    prediction.struggleCount === 0
                      ? 'from-emerald-500 to-green-500'
                      : prediction.struggleCount <= 3
                      ? 'from-amber-500 to-yellow-500'
                      : 'from-red-500 to-rose-500'
                  )}>
                    {prediction.struggleCount}
                  </div>
                  <div className="text-xs text-muted-foreground">May Struggle</div>
                </div>
                <div className="p-2 rounded-lg bg-gradient-to-b from-transparent to-muted/30">
                  <div className={cn(
                    'text-lg font-bold bg-gradient-to-r bg-clip-text text-transparent',
                    prediction.disruptionRisk < 0.2
                      ? 'from-emerald-500 to-green-500'
                      : prediction.disruptionRisk < 0.4
                      ? 'from-amber-500 to-yellow-500'
                      : 'from-red-500 to-rose-500'
                  )}>
                    {prediction.disruptionRisk < 0.2 ? 'Low' : prediction.disruptionRisk < 0.4 ? 'Med' : 'High'}
                  </div>
                  <div className="text-xs text-muted-foreground">Disruption Risk</div>
                </div>
              </div>

              {prediction.recommendedInterventions.length > 0 && (
                <div className="pt-2 border-t border-border/50">
                  <div className="text-xs font-medium text-muted-foreground mb-2">
                    Recommended Interventions:
                  </div>
                  <div className="space-y-1">
                    {prediction.recommendedInterventions.slice(0, 3).map((intervention, i) => (
                      <div
                        key={i}
                        className={cn(
                          'text-xs p-2 rounded-lg flex items-center justify-between backdrop-blur-sm',
                          intervention.priority === 'high'
                            ? 'bg-red-500/10 text-red-600 dark:text-red-400'
                            : intervention.priority === 'medium'
                            ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                            : 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                        )}
                      >
                        <span>{intervention.studentName}: {intervention.reason}</span>
                        <Badge variant="outline" className="text-xs capitalize border-current/30 bg-background/50">
                          {intervention.suggestedAction}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
