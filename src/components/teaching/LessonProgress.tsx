'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, TrendingDown, Zap, Users, Play } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PivotOption {
  id: string;
  name: string;
  description: string;
  energyCost: number;
  successChance: number;
}

interface LessonProgressProps {
  lessonName: string;
  progress: number; // 0-100
  engagement: number; // 0-100 (class average)
  failureRisk: 'low' | 'medium' | 'high' | 'critical';
  canPivot: boolean;
  pivotOptions?: PivotOption[];
  onPivot?: (optionId: string) => void;
  teacherEnergy?: number;
}

const failureRiskConfig = {
  low: {
    color: 'bg-emerald-500',
    bgClass: 'bg-emerald-50 dark:bg-emerald-900/20',
    textClass: 'text-emerald-700 dark:text-emerald-300',
    badge: 'Low Risk',
    icon: null,
  },
  medium: {
    color: 'bg-yellow-500',
    bgClass: 'bg-yellow-50 dark:bg-yellow-900/20',
    textClass: 'text-yellow-700 dark:text-yellow-300',
    badge: 'Medium Risk',
    icon: AlertTriangle,
  },
  high: {
    color: 'bg-orange-500',
    bgClass: 'bg-orange-50 dark:bg-orange-900/20',
    textClass: 'text-orange-700 dark:text-orange-300',
    badge: 'High Risk',
    icon: AlertTriangle,
  },
  critical: {
    color: 'bg-red-500',
    bgClass: 'bg-red-50 dark:bg-red-900/20',
    textClass: 'text-red-700 dark:text-red-300',
    badge: 'Critical!',
    icon: AlertTriangle,
  },
};

const engagementColor = (engagement: number) => {
  if (engagement >= 70) return 'bg-emerald-500';
  if (engagement >= 50) return 'bg-yellow-500';
  if (engagement >= 30) return 'bg-orange-500';
  return 'bg-red-500';
};

const engagementLabel = (engagement: number) => {
  if (engagement >= 70) return 'High';
  if (engagement >= 50) return 'Moderate';
  if (engagement >= 30) return 'Low';
  return 'Critical';
};

export function LessonProgress({
  lessonName,
  progress,
  engagement,
  failureRisk,
  canPivot,
  pivotOptions = [],
  onPivot,
  teacherEnergy = 50,
}: LessonProgressProps) {
  const riskConfig = failureRiskConfig[failureRisk];
  const RiskIcon = riskConfig.icon;

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="text-xl">{lessonName}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Current lesson status and student engagement
            </p>
          </div>
          <Badge
            variant="outline"
            className={cn('shrink-0', riskConfig.textClass, riskConfig.bgClass)}
          >
            {RiskIcon && <RiskIcon className="w-3 h-3 mr-1" />}
            {riskConfig.badge}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Lesson Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Lesson Progress</label>
            <span className="text-xs font-semibold text-muted-foreground">
              {progress}%
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Engagement Meter */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-500" />
              Class Engagement
            </label>
            <span className="text-xs font-semibold">{engagement}%</span>
          </div>
          <Progress
            value={engagement}
            className="h-3"
          />
          <div className="flex justify-between items-center text-xs text-muted-foreground">
            <span className={cn(
              'px-2 py-1 rounded-full font-medium',
              engagementColor(engagement) === 'bg-emerald-500'
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                : engagementColor(engagement) === 'bg-yellow-500'
                ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
                : engagementColor(engagement) === 'bg-orange-500'
                ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300'
                : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
            )}>
              {engagementLabel(engagement)} Engagement
            </span>
          </div>
        </div>

        {/* Failure Risk Indicator */}
        {failureRisk !== 'low' && (
          <div className={cn(
            'p-3 rounded-lg border',
            riskConfig.bgClass,
            'border-transparent'
          )}>
            <div className={cn('flex items-start gap-2', riskConfig.textClass)}>
              <TrendingDown className="w-4 h-4 mt-0.5 shrink-0" />
              <div className="flex-1">
                <div className="font-medium text-sm">
                  {failureRisk === 'critical'
                    ? 'Lesson in Critical Condition'
                    : failureRisk === 'high'
                    ? 'Lesson at High Risk'
                    : 'Engagement Declining'}
                </div>
                <p className="text-xs mt-1 opacity-90">
                  {failureRisk === 'critical'
                    ? 'Consider pivoting immediately to prevent lesson failure.'
                    : failureRisk === 'high'
                    ? 'Students are losing interest. A pivot may help.'
                    : 'Watch for signs of disengagement.'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Pivot Options */}
        {canPivot && pivotOptions.length > 0 && (
          <div className="space-y-3 border-t pt-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Play className="w-4 h-4 text-blue-500" />
              Pivot Options
            </div>
            <div className="space-y-2">
              {pivotOptions.map(option => {
                const canAfford = teacherEnergy >= option.energyCost;
                return (
                  <div
                    key={option.id}
                    className={cn(
                      'p-3 rounded-lg border-2 transition-all',
                      canAfford
                        ? 'border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30'
                        : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/20 opacity-60'
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm">
                          {option.name}
                        </h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          {option.description}
                        </p>
                        <div className="flex gap-2 mt-2 text-xs">
                          <Badge variant="secondary">
                            <Zap className="w-3 h-3 mr-1" />
                            {option.energyCost} energy
                          </Badge>
                          <Badge variant="secondary">
                            {option.successChance}% success
                          </Badge>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => onPivot?.(option.id)}
                        disabled={!canAfford}
                        className="shrink-0"
                      >
                        Pivot
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Teacher Energy Indicator */}
        <div className="border-t pt-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              <span className="font-medium">Teacher Energy</span>
            </div>
            <span className={cn(
              'font-semibold',
              teacherEnergy < 30
                ? 'text-red-600 dark:text-red-400'
                : teacherEnergy < 60
                ? 'text-amber-600 dark:text-amber-400'
                : 'text-emerald-600 dark:text-emerald-400'
            )}>
              {teacherEnergy}%
            </span>
          </div>
          <Progress value={teacherEnergy} className="h-2 mt-2" />
        </div>
      </CardContent>
    </Card>
  );
}
