'use client';

import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DurationValidatorProps {
  actualDuration: number; // in minutes
  targetDuration?: number; // in minutes, defaults to 45
  lessonName?: string;
}

export function DurationValidator({
  actualDuration,
  targetDuration = 45,
  lessonName = 'Lesson',
}: DurationValidatorProps) {
  const percentage = Math.round((actualDuration / targetDuration) * 100);
  const difference = actualDuration - targetDuration;
  const fits = actualDuration <= targetDuration;
  const isClose = actualDuration > targetDuration * 0.9 && actualDuration <= targetDuration;

  let status: 'good' | 'warning' | 'error';
  let statusColor: string;
  let statusIcon: React.ReactNode;
  let statusMessage: string;

  if (fits && !isClose) {
    status = 'good';
    statusColor = 'text-green-600 dark:text-green-400';
    statusIcon = <CheckCircle className="w-5 h-5" />;
    statusMessage = `Perfect! Fits within the ${targetDuration}-minute block with ${Math.abs(difference)} minutes to spare.`;
  } else if (isClose) {
    status = 'warning';
    statusColor = 'text-amber-600 dark:text-amber-400';
    statusIcon = <Clock className="w-5 h-5" />;
    statusMessage = `This fits the block, but with only ${Math.abs(difference)} minutes remaining. Tight timing!`;
  } else {
    status = 'error';
    statusColor = 'text-red-600 dark:text-red-400';
    statusIcon = <AlertTriangle className="w-5 h-5" />;
    statusMessage = `This lesson runs ${Math.abs(difference)} minutes over the ${targetDuration}-minute block.`;
  }

  const progressColor =
    status === 'good'
      ? 'bg-green-500'
      : status === 'warning'
        ? 'bg-amber-500'
        : 'bg-red-500';

  return (
    <div className="space-y-4">
      {/* Time Summary Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {/* Duration Display */}
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="space-y-1">
                <div className="text-2xl font-bold text-primary">
                  {actualDuration}
                </div>
                <div className="text-xs text-muted-foreground">Planned Duration</div>
              </div>
              <div className="flex items-center justify-center">
                <div className="text-muted-foreground">/</div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-muted-foreground">
                  {targetDuration}
                </div>
                <div className="text-xs text-muted-foreground">Target Duration</div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Time Allocation</span>
                <span className={cn('text-sm font-semibold', statusColor)}>
                  {percentage}%
                </span>
              </div>
              <div className="h-3 rounded-full bg-muted overflow-hidden">
                <div
                  className={cn(
                    'h-full transition-all duration-300 rounded-full',
                    progressColor
                  )}
                  style={{ width: `${Math.min(percentage, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status Alert */}
      {status === 'good' && (
        <Alert className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20">
          <div className={cn('flex items-start gap-3', statusColor)}>
            <div className="flex-shrink-0 mt-0.5">{statusIcon}</div>
            <div>
              <h3 className="font-semibold text-green-900 dark:text-green-100 mb-1">
                Perfect Timing
              </h3>
              <AlertDescription className="text-green-800 dark:text-green-200 text-sm">
                {statusMessage}
              </AlertDescription>
            </div>
          </div>
        </Alert>
      )}

      {status === 'warning' && (
        <Alert className="border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20">
          <div className={cn('flex items-start gap-3', statusColor)}>
            <div className="flex-shrink-0 mt-0.5">{statusIcon}</div>
            <div>
              <h3 className="font-semibold text-amber-900 dark:text-amber-100 mb-1">
                Tight Timing
              </h3>
              <AlertDescription className="text-amber-800 dark:text-amber-200 text-sm">
                {statusMessage}
              </AlertDescription>
            </div>
          </div>
        </Alert>
      )}

      {status === 'error' && (
        <Alert className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
          <div className={cn('flex items-start gap-3', statusColor)}>
            <div className="flex-shrink-0 mt-0.5">{statusIcon}</div>
            <div>
              <h3 className="font-semibold text-red-900 dark:text-red-100 mb-1">
                Duration Too Long
              </h3>
              <AlertDescription className="text-red-800 dark:text-red-200 text-sm">
                {statusMessage}
              </AlertDescription>
            </div>
          </div>
        </Alert>
      )}

      {/* Suggestions */}
      <div className="text-sm text-muted-foreground p-3 rounded-lg bg-muted/50">
        <div className="font-medium mb-1">Tips:</div>
        <ul className="space-y-1 text-xs list-disc list-inside">
          <li>Allocate {Math.round(targetDuration * 0.1)} minutes for transitions</li>
          <li>Reserve {Math.round(targetDuration * 0.15)} minutes for unexpected delays</li>
          <li>Prioritize essential content if running over</li>
        </ul>
      </div>
    </div>
  );
}
