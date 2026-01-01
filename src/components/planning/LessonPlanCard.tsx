'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Edit2,
  Copy,
  Trash2,
  Calendar,
  MoreHorizontal,
  BookOpen,
  Clock,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface LessonPlan {
  id: string;
  name: string;
  subject: 'math' | 'reading' | 'science' | 'social-studies' | 'art' | 'pe';
  duration: number; // in minutes
  activities: number;
  teachingMethod: string;
  description?: string;
}

interface LessonPlanCardProps {
  plan: LessonPlan;
  onEdit?: (plan: LessonPlan) => void;
  onDuplicate?: (plan: LessonPlan) => void;
  onDelete?: (id: string) => void;
  onSchedule?: (plan: LessonPlan) => void;
}

const SUBJECT_ICONS: Record<LessonPlan['subject'], string> = {
  math: '🔢',
  reading: '📚',
  science: '🔬',
  'social-studies': '🌍',
  art: '🎨',
  pe: '⚽',
};

const SUBJECT_COLORS: Record<LessonPlan['subject'], string> = {
  math: 'border-blue-300 dark:border-blue-700 hover:border-blue-400 dark:hover:border-blue-600',
  reading: 'border-purple-300 dark:border-purple-700 hover:border-purple-400 dark:hover:border-purple-600',
  science: 'border-green-300 dark:border-green-700 hover:border-green-400 dark:hover:border-green-600',
  'social-studies':
    'border-amber-300 dark:border-amber-700 hover:border-amber-400 dark:hover:border-amber-600',
  art: 'border-pink-300 dark:border-pink-700 hover:border-pink-400 dark:hover:border-pink-600',
  pe: 'border-orange-300 dark:border-orange-700 hover:border-orange-400 dark:hover:border-orange-600',
};

const SUBJECT_BG: Record<LessonPlan['subject'], string> = {
  math: 'bg-blue-50 dark:bg-blue-900/20',
  reading: 'bg-purple-50 dark:bg-purple-900/20',
  science: 'bg-green-50 dark:bg-green-900/20',
  'social-studies': 'bg-amber-50 dark:bg-amber-900/20',
  art: 'bg-pink-50 dark:bg-pink-900/20',
  pe: 'bg-orange-50 dark:bg-orange-900/20',
};

export function LessonPlanCard({
  plan,
  onEdit,
  onDuplicate,
  onDelete,
  onSchedule,
}: LessonPlanCardProps) {
  return (
    <TooltipProvider>
      <Card
        className={cn(
          'overflow-hidden transition-all duration-200 border-2 cursor-pointer hover:shadow-lg',
          SUBJECT_COLORS[plan.subject]
        )}
      >
        {/* Header with Subject Icon and Actions */}
        <div className={cn('px-4 py-3 flex items-start justify-between', SUBJECT_BG[plan.subject])}>
          <div className="flex items-center gap-2">
            <div className="text-3xl drop-shadow-sm">{SUBJECT_ICONS[plan.subject]}</div>
            <div className="flex-1">
              <h3 className="font-semibold text-sm line-clamp-2">{plan.name}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">{plan.teachingMethod}</p>
            </div>
          </div>

          {/* Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 flex-shrink-0">
                <MoreHorizontal className="w-4 h-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {onEdit && (
                <DropdownMenuItem onClick={() => onEdit(plan)} className="gap-2">
                  <Edit2 className="w-4 h-4" />
                  Edit
                </DropdownMenuItem>
              )}
              {onDuplicate && (
                <DropdownMenuItem onClick={() => onDuplicate(plan)} className="gap-2">
                  <Copy className="w-4 h-4" />
                  Duplicate
                </DropdownMenuItem>
              )}
              {onSchedule && (
                <DropdownMenuItem onClick={() => onSchedule(plan)} className="gap-2">
                  <Calendar className="w-4 h-4" />
                  Schedule
                </DropdownMenuItem>
              )}
              {onDelete && (
                <DropdownMenuItem
                  onClick={() => onDelete(plan.id)}
                  className="gap-2 text-destructive focus:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Content */}
        <CardContent className="p-4 space-y-4">
          {/* Description */}
          {plan.description && (
            <p className="text-xs text-muted-foreground line-clamp-2">{plan.description}</p>
          )}

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 text-xs">
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1.5 p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                  <Clock className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span className="font-medium">{plan.duration}m</span>
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">
                Planned duration
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1.5 p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                  <BookOpen className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
                  <span className="font-medium">{plan.activities}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">
                Activities
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1.5 p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                  <Zap className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  <span className="font-medium">{plan.activities}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">
                Engagement level
              </TooltipContent>
            </Tooltip>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            {onEdit && (
              <Button
                variant="outline"
                size="sm"
                className="flex-1 h-8 text-xs"
                onClick={() => onEdit(plan)}
              >
                <Edit2 className="w-3 h-3 mr-1" />
                Edit
              </Button>
            )}
            {onSchedule && (
              <Button size="sm" className="flex-1 h-8 text-xs" onClick={() => onSchedule(plan)}>
                <Calendar className="w-3 h-3 mr-1" />
                Schedule
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}
