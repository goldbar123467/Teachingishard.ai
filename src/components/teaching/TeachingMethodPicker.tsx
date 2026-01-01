'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import type { TeachingMethod, LearningStyle } from '@/lib/game/types';
import {
  TEACHING_METHODS,
  LEARNING_STYLE_LABELS,
  LEARNING_STYLE_ICONS,
  METHOD_ICONS,
} from '@/data/teaching-methods';
import { cn } from '@/lib/utils';

interface TeachingMethodPickerProps {
  selectedMethod: TeachingMethod | null;
  onSelectMethod: (method: TeachingMethod) => void;
  teacherEnergy: number;
  classLearningStyles: LearningStyle[];
}

// Learning style badge colors
const LEARNING_STYLE_COLORS: Record<LearningStyle, string> = {
  visual: 'bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 border-violet-200 dark:border-violet-800',
  auditory: 'bg-sky-100 dark:bg-sky-900/40 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800',
  kinesthetic: 'bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800',
  reading: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
};

export function TeachingMethodPicker({
  selectedMethod,
  onSelectMethod,
  teacherEnergy,
  classLearningStyles,
}: TeachingMethodPickerProps) {
  // Calculate how many students each method works well for
  const getEffectiveness = (method: TeachingMethod) => {
    const matching = classLearningStyles.filter(style =>
      method.bestFor.includes(style)
    ).length;
    return Math.round((matching / classLearningStyles.length) * 100);
  };

  // Get count of students per learning style for the tooltip
  const getStyleCount = (style: LearningStyle) => {
    return classLearningStyles.filter(s => s === style).length;
  };

  return (
    <div className="space-y-4">
      {/* Learning style legend */}
      <div className="flex flex-wrap gap-2 p-3 bg-muted/50 rounded-lg">
        <span className="text-xs text-muted-foreground font-medium mr-1">Class learning styles:</span>
        {(['visual', 'auditory', 'kinesthetic', 'reading'] as LearningStyle[]).map(style => {
          const count = getStyleCount(style);
          if (count === 0) return null;
          return (
            <Badge
              key={style}
              variant="outline"
              className={cn('text-xs gap-1', LEARNING_STYLE_COLORS[style])}
            >
              {LEARNING_STYLE_ICONS[style]} {LEARNING_STYLE_LABELS[style]}
              <span className="font-bold ml-0.5">×{count}</span>
            </Badge>
          );
        })}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <TooltipProvider>
          {TEACHING_METHODS.map(method => {
            const isSelected = selectedMethod?.id === method.id;
            const canAfford = teacherEnergy >= method.energyCost;
            const effectiveness = getEffectiveness(method);
            const matchingCount = classLearningStyles.filter(style =>
              method.bestFor.includes(style)
            ).length;

            return (
              <Tooltip key={method.id}>
                <TooltipTrigger asChild>
                  <Card
                    className={cn(
                      'method-card cursor-pointer border-2 border-transparent hover:border-primary/30',
                      isSelected && 'method-card-selected ring-2 ring-primary shadow-lg bg-primary/5',
                      !canAfford && 'method-card-disabled opacity-50 cursor-not-allowed grayscale-[30%]'
                    )}
                    onClick={() => canAfford && onSelectMethod(method)}
                  >
                    <CardContent className="p-4 relative">
                      {/* Selection checkmark */}
                      {isSelected && (
                        <div className="lesson-card-checkmark absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-primary flex items-center justify-center shadow-md">
                          <svg className="w-3 h-3 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}

                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center text-2xl shrink-0">
                          {METHOD_ICONS[method.id] || '📖'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span className="font-medium">{method.name}</span>
                            <Badge
                              variant="outline"
                              className={cn(
                                'text-xs shrink-0 tabular-nums font-medium',
                                canAfford
                                  ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800'
                                  : 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800'
                              )}
                            >
                              -{method.energyCost}⚡
                            </Badge>
                          </div>

                          <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                            {method.description}
                          </p>

                          {/* Learning style badges */}
                          <div className="flex flex-wrap gap-1 mb-3">
                            {method.bestFor.map(style => (
                              <Badge
                                key={style}
                                variant="outline"
                                className={cn(
                                  'learning-style-badge text-xs px-1.5 py-0 gap-0.5',
                                  LEARNING_STYLE_COLORS[style]
                                )}
                                title={`${LEARNING_STYLE_LABELS[style]}: ${getStyleCount(style)} students`}
                              >
                                {LEARNING_STYLE_ICONS[style]}
                                <span className="sr-only sm:not-sr-only">{LEARNING_STYLE_LABELS[style]}</span>
                              </Badge>
                            ))}
                          </div>

                          {/* Effectiveness bar with animation */}
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground">Class match</span>
                              <span className={cn(
                                'font-semibold tabular-nums',
                                effectiveness >= 60 ? 'text-green-600 dark:text-green-400' :
                                effectiveness >= 30 ? 'text-amber-600 dark:text-amber-400' :
                                'text-red-600 dark:text-red-400'
                              )}>
                                {matchingCount}/{classLearningStyles.length} students ({effectiveness}%)
                              </span>
                            </div>
                            <div className="h-2 rounded-full bg-secondary/80 overflow-hidden">
                              <div
                                className={cn(
                                  'effectiveness-bar h-full rounded-full',
                                  effectiveness >= 60
                                    ? 'bg-gradient-to-r from-green-500 to-emerald-400'
                                    : effectiveness >= 30
                                    ? 'bg-gradient-to-r from-amber-500 to-yellow-400'
                                    : 'bg-gradient-to-r from-red-500 to-rose-400'
                                )}
                                style={{ width: `${effectiveness}%` }}
                              />
                            </div>
                          </div>

                          {/* Engagement modifier */}
                          {method.engagementModifier !== 0 && (
                            <div className="mt-3 pt-2 border-t border-border/50">
                              <Badge
                                variant="outline"
                                className={cn(
                                  'text-xs',
                                  method.engagementModifier > 0
                                    ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                                    : 'bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800'
                                )}
                              >
                                {method.engagementModifier > 0 ? '↑' : '↓'} {method.engagementModifier > 0 ? '+' : ''}{method.engagementModifier} Engagement
                              </Badge>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-xs">
                  <div className="space-y-2">
                    <p className="font-medium">{method.name}</p>
                    <p className="text-xs text-muted-foreground">{method.description}</p>
                    <div className="text-xs space-y-1">
                      <p>Best for: {method.bestFor.map(s => LEARNING_STYLE_LABELS[s]).join(', ')}</p>
                      <p className={cn(
                        'font-medium',
                        effectiveness >= 60 ? 'text-green-600' : effectiveness >= 30 ? 'text-amber-600' : 'text-red-600'
                      )}>
                        Matches {matchingCount} of {classLearningStyles.length} students ({effectiveness}%)
                      </p>
                    </div>
                  </div>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </TooltipProvider>
      </div>

      {/* Selected method confirmation */}
      {selectedMethod && (
        <div className="selection-confirm p-4 rounded-xl border-2 border-primary/30 bg-primary/5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-white dark:bg-zinc-800 shadow-sm flex items-center justify-center text-xl">
              {METHOD_ICONS[selectedMethod.id] || '📖'}
            </div>
            <div className="flex-1">
              <div className="font-semibold">{selectedMethod.name}</div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>Matches {getEffectiveness(selectedMethod)}% of class</span>
                {selectedMethod.engagementModifier !== 0 && (
                  <>
                    <span className="text-muted-foreground/40">•</span>
                    <span className={selectedMethod.engagementModifier > 0 ? 'text-emerald-600' : 'text-orange-600'}>
                      {selectedMethod.engagementModifier > 0 ? '+' : ''}{selectedMethod.engagementModifier} engagement
                    </span>
                  </>
                )}
              </div>
            </div>
            <Badge className="bg-primary text-primary-foreground shadow-sm">
              Ready
            </Badge>
          </div>
        </div>
      )}
    </div>
  );
}
