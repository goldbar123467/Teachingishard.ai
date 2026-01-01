'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { HomeworkType } from '@/lib/game/types';
import { cn } from '@/lib/utils';

interface HomeworkAssignerProps {
  selectedHomework: HomeworkType | null;
  onSelectHomework: (homework: HomeworkType) => void;
}

interface HomeworkOption {
  type: HomeworkType;
  label: string;
  description: string;
  icon: string;
  completionRate: number;
  completionLabel: string;
  impact: string;
  impactLevel: 0 | 1 | 2 | 3;
  borderColor: string;
  selectedBg: string;
}

const HOMEWORK_OPTIONS: HomeworkOption[] = [
  {
    type: 'none',
    label: 'No Homework',
    description: 'Give students a break tonight. Good for morale but limits learning reinforcement.',
    icon: '🎉',
    completionRate: 100,
    completionLabel: '100%',
    impact: 'No academic boost',
    impactLevel: 0,
    borderColor: 'hover:border-slate-300 dark:hover:border-slate-600',
    selectedBg: 'bg-slate-50/50 dark:bg-slate-900/20',
  },
  {
    type: 'light',
    label: 'Light Homework',
    description: '15-20 minutes of review. Easy to complete, good for building habits.',
    icon: '📝',
    completionRate: 90,
    completionLabel: '~90%',
    impact: 'Small boost',
    impactLevel: 1,
    borderColor: 'hover:border-green-300 dark:hover:border-green-700',
    selectedBg: 'bg-green-50/50 dark:bg-green-900/20',
  },
  {
    type: 'moderate',
    label: 'Moderate Homework',
    description: '30-45 minutes of practice. Reinforces the day\'s lessons effectively.',
    icon: '📚',
    completionRate: 75,
    completionLabel: '~75%',
    impact: 'Good boost',
    impactLevel: 2,
    borderColor: 'hover:border-blue-300 dark:hover:border-blue-700',
    selectedBg: 'bg-blue-50/50 dark:bg-blue-900/20',
  },
  {
    type: 'heavy',
    label: 'Heavy Homework',
    description: '60+ minutes of work. Maximum learning but may stress some students.',
    icon: '📖',
    completionRate: 55,
    completionLabel: '~55%',
    impact: 'Large boost (if completed)',
    impactLevel: 3,
    borderColor: 'hover:border-purple-300 dark:hover:border-purple-700',
    selectedBg: 'bg-purple-50/50 dark:bg-purple-900/20',
  },
];

const IMPACT_COLORS = [
  'text-muted-foreground',
  'text-green-600 dark:text-green-400',
  'text-blue-600 dark:text-blue-400',
  'text-purple-600 dark:text-purple-400',
];

const IMPACT_BADGE_COLORS = [
  'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700',
  'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800',
  'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
  'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800',
];

const RING_COLORS = [
  'ring-slate-400 dark:ring-slate-500',
  'ring-green-500 dark:ring-green-400',
  'ring-blue-500 dark:ring-blue-400',
  'ring-purple-500 dark:ring-purple-400',
];

// Mini completion rate ring component
function CompletionRing({ rate, size = 36 }: { rate: number; size?: number }) {
  const strokeWidth = 3;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (rate / 100) * circumference;

  const getColor = () => {
    if (rate >= 90) return 'stroke-green-500';
    if (rate >= 75) return 'stroke-blue-500';
    if (rate >= 55) return 'stroke-amber-500';
    return 'stroke-red-500';
  };

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          className="stroke-secondary"
        />
        {/* Progress ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          className={cn('completion-ring transition-all duration-500', getColor())}
          style={{
            strokeDasharray: circumference,
            strokeDashoffset: offset,
          }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-[10px] font-bold tabular-nums">{rate}%</span>
      </div>
    </div>
  );
}

// Impact level indicator
function ImpactIndicator({ level }: { level: 0 | 1 | 2 | 3 }) {
  return (
    <div className="flex gap-0.5">
      {[0, 1, 2, 3].map(i => (
        <div
          key={i}
          className={cn(
            'w-1.5 h-3 rounded-sm transition-colors',
            i <= level
              ? level === 0
                ? 'bg-slate-300 dark:bg-slate-600'
                : level === 1
                ? 'bg-green-400 dark:bg-green-500'
                : level === 2
                ? 'bg-blue-400 dark:bg-blue-500'
                : 'bg-purple-400 dark:bg-purple-500'
              : 'bg-secondary'
          )}
        />
      ))}
    </div>
  );
}

export function HomeworkAssigner({
  selectedHomework,
  onSelectHomework,
}: HomeworkAssignerProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {HOMEWORK_OPTIONS.map(option => {
          const isSelected = selectedHomework === option.type;

          return (
            <Card
              key={option.type}
              className={cn(
                'homework-card cursor-pointer border-2 border-transparent',
                option.borderColor,
                isSelected && [
                  'homework-card-selected ring-2 shadow-lg',
                  RING_COLORS[option.impactLevel],
                  option.selectedBg,
                ]
              )}
              onClick={() => onSelectHomework(option.type)}
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
                    {option.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="font-medium">{option.label}</span>
                    </div>

                    <p className="text-xs text-muted-foreground mb-3">
                      {option.description}
                    </p>

                    {/* Visual indicators row */}
                    <div className="flex items-center justify-between">
                      {/* Completion rate ring */}
                      <div className="flex items-center gap-2">
                        <CompletionRing rate={option.completionRate} />
                        <div className="text-xs">
                          <div className="text-muted-foreground">Expected</div>
                          <div className="font-medium">completion</div>
                        </div>
                      </div>

                      {/* Impact indicator */}
                      <div className="text-right">
                        <div className="flex items-center justify-end gap-2 mb-1">
                          <ImpactIndicator level={option.impactLevel} />
                        </div>
                        <span className={cn('text-xs font-medium', IMPACT_COLORS[option.impactLevel])}>
                          {option.impact}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Selected homework confirmation */}
      {selectedHomework && (() => {
        const option = HOMEWORK_OPTIONS.find(o => o.type === selectedHomework)!;
        return (
          <div className={cn(
            'selection-confirm p-4 rounded-xl border-2 shadow-sm',
            option.selectedBg,
            RING_COLORS[option.impactLevel].replace('ring-', 'border-')
          )}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-white dark:bg-zinc-800 shadow-sm flex items-center justify-center text-xl">
                {option.icon}
              </div>
              <div className="flex-1">
                <div className="font-semibold">{option.label}</div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{option.completionLabel} expected completion</span>
                  <span className="text-muted-foreground/40">•</span>
                  <span className={IMPACT_COLORS[option.impactLevel]}>{option.impact}</span>
                </div>
              </div>
              <Badge variant="outline" className={cn('shadow-sm', IMPACT_BADGE_COLORS[option.impactLevel])}>
                Ready
              </Badge>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
