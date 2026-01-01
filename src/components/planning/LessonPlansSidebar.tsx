'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, Lightbulb } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { LessonPlan } from './LessonPlanCard';

interface LessonPlansSidebarProps {
  lessonPlans: LessonPlan[];
  scheduledPlanIds?: string[];
  onCreateNew?: () => void;
  selectedFilter?: string;
  onFilterChange?: (subject: string) => void;
}

const SUBJECT_ICONS: Record<LessonPlan['subject'], string> = {
  math: '🔢',
  reading: '📚',
  science: '🔬',
  'social-studies': '🌍',
  art: '🎨',
  pe: '⚽',
};

const SUBJECT_LABELS: Record<LessonPlan['subject'], string> = {
  math: 'Math',
  reading: 'Reading & Writing',
  science: 'Science',
  'social-studies': 'Social Studies',
  art: 'Art',
  pe: 'PE',
};

const SUBJECT_COLORS: Record<LessonPlan['subject'], string> = {
  math: 'border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20',
  reading: 'border-purple-300 dark:border-purple-700 bg-purple-50 dark:bg-purple-900/20',
  science: 'border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/20',
  'social-studies': 'border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20',
  art: 'border-pink-300 dark:border-pink-700 bg-pink-50 dark:bg-pink-900/20',
  pe: 'border-orange-300 dark:border-orange-700 bg-orange-50 dark:bg-orange-900/20',
};

const SUBJECT_OPTIONS: LessonPlan['subject'][] = [
  'math',
  'reading',
  'science',
  'social-studies',
  'art',
  'pe',
];

export function LessonPlansSidebar({
  lessonPlans,
  scheduledPlanIds = [],
  onCreateNew,
  selectedFilter = 'all',
  onFilterChange,
}: LessonPlansSidebarProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const filteredPlans =
    selectedFilter === 'all'
      ? lessonPlans
      : lessonPlans.filter(plan => plan.subject === selectedFilter);

  const unscheduledPlans = filteredPlans.filter(
    plan => !scheduledPlanIds.includes(plan.id)
  );

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, plan: LessonPlan) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('lessonPlanId', plan.id);
    e.dataTransfer.setData('lessonName', plan.name);
    e.dataTransfer.setData('lessonSubject', plan.subject);
    e.dataTransfer.setData('lessonDuration', plan.duration.toString());
  };

  return (
    <div className="space-y-4 h-full flex flex-col">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">My Lesson Plans</h2>
        <p className="text-xs text-muted-foreground">
          Drag lessons to schedule them for the week
        </p>
      </div>

      {/* Filter */}
      <div className="space-y-2">
        <label className="text-xs font-medium">Filter by Subject</label>
        <Select
          value={selectedFilter}
          onValueChange={onFilterChange}
        >
          <SelectTrigger className="h-9 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Subjects</SelectItem>
            {SUBJECT_OPTIONS.map(subject => (
              <SelectItem key={subject} value={subject}>
                {SUBJECT_ICONS[subject]} {SUBJECT_LABELS[subject]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Lesson Plans List */}
      <ScrollArea className="flex-1 pr-4">
        <div className="space-y-3">
          {unscheduledPlans.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-6 px-2 text-center">
              <p className="text-xs text-muted-foreground mb-3">
                {lessonPlans.length === 0
                  ? 'No lesson plans yet. Create one to get started!'
                  : 'All lessons are scheduled for this week!'}
              </p>
              {lessonPlans.length === 0 && onCreateNew && (
                <Button size="sm" variant="outline" onClick={onCreateNew}>
                  <Plus className="w-3 h-3 mr-1" />
                  Create First Lesson
                </Button>
              )}
            </div>
          ) : (
            unscheduledPlans.map(plan => (
              <div
                key={plan.id}
                draggable
                onDragStart={e => handleDragStart(e, plan)}
                onMouseEnter={() => setHoveredId(plan.id)}
                onMouseLeave={() => setHoveredId(null)}
                className={cn(
                  'p-3 rounded-lg border-2 transition-all duration-200 cursor-grab active:cursor-grabbing hover:shadow-md',
                  SUBJECT_COLORS[plan.subject],
                  hoveredId === plan.id && 'shadow-lg scale-105'
                )}
              >
                {/* Card Header */}
                <div className="flex items-start gap-2 mb-2">
                  <div className="text-xl">{SUBJECT_ICONS[plan.subject]}</div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm line-clamp-2 leading-tight">
                      {plan.name}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {plan.teachingMethod}
                    </p>
                  </div>
                </div>

                {/* Card Footer - Stats */}
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="secondary" className="text-xs h-6">
                    {plan.duration}m
                  </Badge>
                  <Badge variant="outline" className="text-xs h-6">
                    {plan.activities} activity
                    {plan.activities !== 1 ? 'ies' : ''}
                  </Badge>
                  {scheduledPlanIds.includes(plan.id) && (
                    <Badge className="text-xs h-6 bg-emerald-500 hover:bg-emerald-600">
                      Scheduled
                    </Badge>
                  )}
                </div>

                {/* Drag Hint */}
                {hoveredId === plan.id && (
                  <div className="mt-2 text-xs text-muted-foreground italic">
                    Drag to schedule
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      {/* Create New Button */}
      <div className="border-t pt-4 space-y-2">
        {onCreateNew && (
          <Button
            onClick={onCreateNew}
            size="sm"
            className="w-full gap-2"
          >
            <Plus className="w-4 h-4" />
            Create New Lesson
          </Button>
        )}

        {/* Quick Tip */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 text-xs text-blue-900 dark:text-blue-200">
          <div className="flex gap-2">
            <Lightbulb className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <p>
              Drop unscheduled lessons onto time blocks to assign them to your
              weekly schedule.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
