'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import type { Lesson } from '@/lib/game/types';
import {
  LESSONS,
  SUBJECT_LABELS,
  SUBJECT_ICONS,
  SUBJECT_COLORS,
  getDifficultyStars,
} from '@/data/lessons';
import { cn } from '@/lib/utils';

interface LessonSelectorProps {
  selectedLesson: Lesson | null;
  onSelectLesson: (lesson: Lesson) => void;
  teacherEnergy: number;
}

const SUBJECTS = ['math', 'reading', 'science', 'social-studies', 'art', 'pe'] as const;

// Subject-specific border colors for hover states
const SUBJECT_BORDER_COLORS: Record<Lesson['subject'], string> = {
  math: 'hover:border-blue-300 dark:hover:border-blue-700',
  reading: 'hover:border-purple-300 dark:hover:border-purple-700',
  science: 'hover:border-green-300 dark:hover:border-green-700',
  'social-studies': 'hover:border-amber-300 dark:hover:border-amber-700',
  art: 'hover:border-pink-300 dark:hover:border-pink-700',
  pe: 'hover:border-orange-300 dark:hover:border-orange-700',
};

// Subject-specific selected ring colors
const SUBJECT_RING_COLORS: Record<Lesson['subject'], string> = {
  math: 'ring-blue-500 dark:ring-blue-400',
  reading: 'ring-purple-500 dark:ring-purple-400',
  science: 'ring-green-500 dark:ring-green-400',
  'social-studies': 'ring-amber-500 dark:ring-amber-400',
  art: 'ring-pink-500 dark:ring-pink-400',
  pe: 'ring-orange-500 dark:ring-orange-400',
};

// Subject-specific selected background tints
const SUBJECT_SELECTED_BG: Record<Lesson['subject'], string> = {
  math: 'bg-blue-50/50 dark:bg-blue-900/20',
  reading: 'bg-purple-50/50 dark:bg-purple-900/20',
  science: 'bg-green-50/50 dark:bg-green-900/20',
  'social-studies': 'bg-amber-50/50 dark:bg-amber-900/20',
  art: 'bg-pink-50/50 dark:bg-pink-900/20',
  pe: 'bg-orange-50/50 dark:bg-orange-900/20',
};

export function LessonSelector({
  selectedLesson,
  onSelectLesson,
  teacherEnergy,
}: LessonSelectorProps) {
  const [filterSubject, setFilterSubject] = useState<Lesson['subject'] | 'all'>('all');

  const filteredLessons = filterSubject === 'all'
    ? LESSONS
    : LESSONS.filter(l => l.subject === filterSubject);

  return (
    <div className="space-y-4">
      {/* Subject Filter */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={filterSubject === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilterSubject('all')}
          className="transition-all duration-200"
        >
          All Subjects
        </Button>
        {SUBJECTS.map(subject => (
          <Button
            key={subject}
            variant={filterSubject === subject ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterSubject(subject)}
            className={cn(
              'transition-all duration-200',
              filterSubject === subject ? '' : SUBJECT_COLORS[subject]
            )}
          >
            {SUBJECT_ICONS[subject]} {SUBJECT_LABELS[subject]}
          </Button>
        ))}
      </div>

      {/* Lesson Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <TooltipProvider>
          {filteredLessons.map(lesson => {
            const isSelected = selectedLesson?.id === lesson.id;
            const canAfford = teacherEnergy >= lesson.requiredEnergy;

            return (
              <Tooltip key={lesson.id}>
                <TooltipTrigger asChild>
                  <Card
                    className={cn(
                      'lesson-card cursor-pointer border-2 border-transparent',
                      `lesson-${lesson.subject.replace('-', '')}`,
                      canAfford && SUBJECT_BORDER_COLORS[lesson.subject],
                      isSelected && [
                        'lesson-card-selected ring-2 shadow-lg',
                        SUBJECT_RING_COLORS[lesson.subject],
                        SUBJECT_SELECTED_BG[lesson.subject],
                      ],
                      !canAfford && 'lesson-card-disabled opacity-50 cursor-not-allowed grayscale-[30%]'
                    )}
                    onClick={() => canAfford && onSelectLesson(lesson)}
                  >
                    <CardContent className="p-3 relative">
                      {/* Selection checkmark */}
                      {isSelected && (
                        <div className="lesson-card-checkmark absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-primary flex items-center justify-center shadow-md">
                          <svg className="w-3 h-3 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}

                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className="text-xl drop-shadow-sm">{SUBJECT_ICONS[lesson.subject]}</span>
                            <span className="font-medium text-sm truncate">{lesson.name}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span className="text-amber-500 tracking-tight">{getDifficultyStars(lesson.difficulty)}</span>
                            <span className="text-muted-foreground/40">•</span>
                            <span className="capitalize">{lesson.duration}</span>
                          </div>
                        </div>
                        <Badge
                          variant="outline"
                          className={cn(
                            'text-xs shrink-0 tabular-nums font-medium transition-colors',
                            canAfford
                              ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800'
                              : 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800'
                          )}
                        >
                          -{lesson.requiredEnergy}⚡
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-xs">
                  <div className="space-y-1">
                    <p className="font-medium">{lesson.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {SUBJECT_LABELS[lesson.subject]} • {lesson.duration} lesson
                    </p>
                    <p className="text-xs">
                      <span className={canAfford ? 'text-green-600' : 'text-red-600'}>
                        Energy cost: {lesson.requiredEnergy}
                      </span>
                      {!canAfford && <span className="ml-1">(need {lesson.requiredEnergy - teacherEnergy} more)</span>}
                    </p>
                  </div>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </TooltipProvider>
      </div>

      {/* Selected lesson confirmation */}
      {selectedLesson && (
        <div className={cn(
          'selection-confirm p-4 rounded-xl border-2 shadow-sm',
          SUBJECT_SELECTED_BG[selectedLesson.subject],
          SUBJECT_RING_COLORS[selectedLesson.subject].replace('ring-', 'border-')
        )}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-white dark:bg-zinc-800 shadow-sm flex items-center justify-center text-xl">
              {SUBJECT_ICONS[selectedLesson.subject]}
            </div>
            <div className="flex-1">
              <div className="font-semibold">{selectedLesson.name}</div>
              <div className="text-xs text-muted-foreground">
                {SUBJECT_LABELS[selectedLesson.subject]} • {getDifficultyStars(selectedLesson.difficulty)} difficulty
              </div>
            </div>
            <Badge className={cn('shadow-sm', SUBJECT_COLORS[selectedLesson.subject])}>
              Ready
            </Badge>
          </div>
        </div>
      )}
    </div>
  );
}
