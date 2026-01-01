'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle, Play, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TimeBlockProps {
  id: string;
  subject: string;
  subjectIcon: React.ReactNode;
  startTime: string;
  duration: number;
  status: 'planned' | 'in-progress' | 'completed' | 'skipped';
  backgroundColor?: string;
  borderColor?: string;
  isDragging?: boolean;
}

const statusConfig = {
  planned: {
    badge: 'Planned',
    icon: AlertCircle,
    bgClass: 'bg-slate-50 dark:bg-slate-900/30',
    textClass: 'text-slate-700 dark:text-slate-300',
  },
  'in-progress': {
    badge: 'In Progress',
    icon: Play,
    bgClass: 'bg-blue-50 dark:bg-blue-900/30',
    textClass: 'text-blue-700 dark:text-blue-300',
  },
  completed: {
    badge: 'Completed',
    icon: CheckCircle,
    bgClass: 'bg-emerald-50 dark:bg-emerald-900/30',
    textClass: 'text-emerald-700 dark:text-emerald-300',
  },
  skipped: {
    badge: 'Skipped',
    icon: AlertCircle,
    bgClass: 'bg-orange-50 dark:bg-orange-900/30',
    textClass: 'text-orange-700 dark:text-orange-300',
  },
};

export function TimeBlock({
  id,
  subject,
  subjectIcon,
  startTime,
  duration,
  status,
  backgroundColor = 'bg-gradient-to-br from-violet-500 to-indigo-600',
  borderColor = 'border-violet-400',
  isDragging = false,
}: TimeBlockProps) {
  const config = statusConfig[status];
  const StatusIcon = config.icon;

  const endMinutes = parseInt(startTime.split(':')[1]) + duration;
  const endHours = parseInt(startTime.split(':')[0]) + Math.floor(endMinutes / 60);
  const endMins = endMinutes % 60;
  const endTime = `${endHours}:${String(endMins).padStart(2, '0')}`;

  return (
    <Card
      className={cn(
        'cursor-move transition-all duration-200 border-2',
        isDragging ? 'opacity-50 scale-95' : 'hover:shadow-lg',
        borderColor,
        config.bgClass
      )}
      draggable
    >
      <CardContent className="p-4 space-y-2">
        {/* Header with subject and icon */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 flex-1">
            <div className={cn('p-2 rounded-lg', backgroundColor)}>
              <div className="text-white">{subjectIcon}</div>
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-sm text-foreground">
                {subject}
              </h4>
            </div>
          </div>
          <Badge variant="secondary" className="shrink-0">
            {config.badge}
          </Badge>
        </div>

        {/* Time and duration */}
        <div className={cn('flex items-center gap-2 text-xs', config.textClass)}>
          <Clock className="w-3.5 h-3.5" />
          <span className="font-medium">
            {startTime} - {endTime}
          </span>
          <span className="text-muted-foreground">
            ({duration} min)
          </span>
        </div>

        {/* Status indicator bar */}
        <div className="pt-2">
          <div className="flex items-center gap-2">
            <StatusIcon className="w-3.5 h-3.5" />
            <div className="h-1.5 flex-1 bg-muted rounded-full overflow-hidden">
              <div
                className={cn(
                  'h-full transition-all duration-500',
                  status === 'completed'
                    ? 'w-full bg-emerald-500'
                    : status === 'in-progress'
                    ? 'w-1/2 bg-blue-500'
                    : 'w-0 bg-slate-400'
                )}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
