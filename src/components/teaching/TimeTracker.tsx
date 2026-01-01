'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Clock, AlertTriangle, TrendingUp, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TimeTrackerProps {
  blockStartTime: Date;
  elapsedMinutes: number;
  remainingMinutes: number;
  totalMinutes: number;
  pacing: 'behind' | 'on-track' | 'ahead';
  showWarning?: boolean;
  onWarning?: (warning: string) => void;
}

const pacingConfig = {
  behind: {
    color: 'bg-orange-500',
    bgClass: 'bg-orange-50 dark:bg-orange-900/20',
    textClass: 'text-orange-700 dark:text-orange-300',
    label: 'Behind Schedule',
    icon: AlertTriangle,
    description: 'You\'re running behind. Consider rushing through or extending time.',
  },
  'on-track': {
    color: 'bg-emerald-500',
    bgClass: 'bg-emerald-50 dark:bg-emerald-900/20',
    textClass: 'text-emerald-700 dark:text-emerald-300',
    label: 'On Track',
    icon: Clock,
    description: 'Pacing is on schedule. Keep going!',
  },
  ahead: {
    color: 'bg-blue-500',
    bgClass: 'bg-blue-50 dark:bg-blue-900/20',
    textClass: 'text-blue-700 dark:text-blue-300',
    label: 'Ahead of Schedule',
    icon: TrendingUp,
    description: 'Ahead of schedule. Use bonus time for review or a brain break.',
  },
};

export function TimeTracker({
  blockStartTime,
  elapsedMinutes,
  remainingMinutes,
  totalMinutes,
  pacing,
  showWarning = false,
  onWarning,
}: TimeTrackerProps) {
  const config = pacingConfig[pacing];
  const PacingIcon = config.icon;
  const progressPercent = (elapsedMinutes / totalMinutes) * 100;
  const isLowTime = remainingMinutes <= 10 && remainingMinutes > 0;
  const isOutOfTime = remainingMinutes <= 0;

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const getStartTimeDisplay = () => {
    const hours = blockStartTime.getHours();
    const minutes = blockStartTime.getMinutes();
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Time Management
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Block started at {getStartTimeDisplay()}
            </p>
          </div>
          <Badge
            variant="outline"
            className={cn('shrink-0', config.textClass, config.bgClass)}
          >
            <PacingIcon className="w-3 h-3 mr-1" />
            {config.label}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Time spent vs remaining */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 rounded-lg bg-muted/50">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
              <Zap className="w-3.5 h-3.5" />
              Time Spent
            </div>
            <div className="text-2xl font-bold">
              {formatTime(elapsedMinutes)}
            </div>
          </div>
          <div className={cn(
            'p-3 rounded-lg',
            isOutOfTime
              ? 'bg-red-100 dark:bg-red-900/20'
              : isLowTime
              ? 'bg-orange-100 dark:bg-orange-900/20'
              : 'bg-emerald-100 dark:bg-emerald-900/20'
          )}>
            <div className={cn(
              'flex items-center gap-2 text-xs mb-1',
              isOutOfTime
                ? 'text-red-700 dark:text-red-300'
                : isLowTime
                ? 'text-orange-700 dark:text-orange-300'
                : 'text-emerald-700 dark:text-emerald-300'
            )}>
              <Clock className="w-3.5 h-3.5" />
              Time Remaining
            </div>
            <div className={cn(
              'text-2xl font-bold',
              isOutOfTime
                ? 'text-red-700 dark:text-red-400'
                : isLowTime
                ? 'text-orange-700 dark:text-orange-400'
                : 'text-emerald-700 dark:text-emerald-400'
            )}>
              {isOutOfTime ? 'Time\'s Up!' : formatTime(remainingMinutes)}
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Block Progress</span>
            <span className="text-xs text-muted-foreground">
              {Math.round(progressPercent)}% complete
            </span>
          </div>
          <Progress
            value={Math.min(progressPercent, 100)}
            className="h-3"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{totalMinutes}m total</span>
          </div>
        </div>

        {/* Pacing indicator */}
        <div className={cn(
          'p-3 rounded-lg border',
          config.bgClass,
          'border-transparent'
        )}>
          <div className={cn('flex items-start gap-2', config.textClass)}>
            <PacingIcon className="w-4 h-4 mt-0.5 shrink-0" />
            <div>
              <div className="font-medium text-sm">
                {config.label}
              </div>
              <p className="text-xs mt-1">
                {config.description}
              </p>
            </div>
          </div>
        </div>

        {/* Low time warning */}
        {isLowTime && (
          <Alert className="border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-900/20">
            <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            <AlertDescription className="text-orange-800 dark:text-orange-200">
              <strong>Low Time Warning:</strong> You have {remainingMinutes} minutes left.
              Consider wrapping up or extending into the next block.
            </AlertDescription>
          </Alert>
        )}

        {/* Out of time warning */}
        {isOutOfTime && (
          <Alert className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
            <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
            <AlertDescription className="text-red-800 dark:text-red-200">
              <strong>Time Expired:</strong> You've gone over time for this block.
              Move to the next subject or adjust the schedule.
            </AlertDescription>
          </Alert>
        )}

        {/* Time quality indicator */}
        <div className="border-t pt-4">
          <div className="text-sm font-medium mb-2">Time Quality Factors</div>
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between p-2 rounded bg-muted/50">
              <span>Pacing Adherence</span>
              <span className={cn(
                'font-semibold px-2 py-1 rounded',
                pacing === 'on-track'
                  ? 'bg-emerald-200 text-emerald-900 dark:bg-emerald-900/50 dark:text-emerald-200'
                  : pacing === 'ahead'
                  ? 'bg-blue-200 text-blue-900 dark:bg-blue-900/50 dark:text-blue-200'
                  : 'bg-orange-200 text-orange-900 dark:bg-orange-900/50 dark:text-orange-200'
              )}>
                {pacing === 'on-track' ? 'Good' : pacing === 'ahead' ? 'Good' : 'Needs Work'}
              </span>
            </div>
            <div className="flex items-center justify-between p-2 rounded bg-muted/50">
              <span>Time Management Impact</span>
              <span className={cn(
                'font-semibold px-2 py-1 rounded',
                remainingMinutes > totalMinutes * 0.25
                  ? 'bg-emerald-200 text-emerald-900 dark:bg-emerald-900/50 dark:text-emerald-200'
                  : 'bg-orange-200 text-orange-900 dark:bg-orange-900/50 dark:text-orange-200'
              )}>
                {remainingMinutes > totalMinutes * 0.25 ? 'On Pace' : 'Critical'}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
