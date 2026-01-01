'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Template {
  id: string;
  name: string;
  subject: 'math' | 'reading' | 'science' | 'social-studies' | 'art' | 'pe';
  description: string;
  duration: number;
  activities: number;
  difficulty: 1 | 2 | 3;
}

interface TemplateGalleryProps {
  templates: Template[];
  onUseTemplate?: (template: Template) => void;
}

const SUBJECT_ICONS: Record<Template['subject'], string> = {
  math: '🔢',
  reading: '📚',
  science: '🔬',
  'social-studies': '🌍',
  art: '🎨',
  pe: '⚽',
};

const SUBJECT_LABELS: Record<Template['subject'], string> = {
  math: 'Math',
  reading: 'Reading & Writing',
  science: 'Science',
  'social-studies': 'Social Studies',
  art: 'Art',
  pe: 'PE',
};

const SUBJECT_COLORS: Record<Template['subject'], string> = {
  math: 'border-blue-300 dark:border-blue-700 hover:border-blue-400 dark:hover:border-blue-600',
  reading:
    'border-purple-300 dark:border-purple-700 hover:border-purple-400 dark:hover:border-purple-600',
  science: 'border-green-300 dark:border-green-700 hover:border-green-400 dark:hover:border-green-600',
  'social-studies':
    'border-amber-300 dark:border-amber-700 hover:border-amber-400 dark:hover:border-amber-600',
  art: 'border-pink-300 dark:border-pink-700 hover:border-pink-400 dark:hover:border-pink-600',
  pe: 'border-orange-300 dark:border-orange-700 hover:border-orange-400 dark:hover:border-orange-600',
};

const SUBJECT_BG: Record<Template['subject'], string> = {
  math: 'bg-blue-50 dark:bg-blue-900/20',
  reading: 'bg-purple-50 dark:bg-purple-900/20',
  science: 'bg-green-50 dark:bg-green-900/20',
  'social-studies': 'bg-amber-50 dark:bg-amber-900/20',
  art: 'bg-pink-50 dark:bg-pink-900/20',
  pe: 'bg-orange-50 dark:bg-orange-900/20',
};

const DIFFICULTY_LABELS = {
  1: 'Beginner',
  2: 'Intermediate',
  3: 'Advanced',
};

const DIFFICULTY_COLORS = {
  1: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800',
  2: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
  3: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800',
};

export function TemplateGallery({ templates, onUseTemplate }: TemplateGalleryProps) {
  const [filterSubject, setFilterSubject] = useState<Template['subject'] | 'all'>('all');

  const SUBJECTS = ['math', 'reading', 'science', 'social-studies', 'art', 'pe'] as const;

  const filteredTemplates =
    filterSubject === 'all'
      ? templates
      : templates.filter(t => t.subject === filterSubject);

  return (
    <div className="space-y-6">
      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={filterSubject === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilterSubject('all')}
          className="transition-all duration-200"
        >
          All Templates
        </Button>
        {SUBJECTS.map(subject => (
          <Button
            key={subject}
            variant={filterSubject === subject ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterSubject(subject)}
            className="transition-all duration-200 gap-1.5"
          >
            <span>{SUBJECT_ICONS[subject]}</span>
            <span className="hidden sm:inline">{SUBJECT_LABELS[subject]}</span>
          </Button>
        ))}
      </div>

      {/* Templates Grid */}
      {filteredTemplates.length === 0 ? (
        <Card className="border-dashed bg-muted/30">
          <CardContent className="pt-6 text-center">
            <p className="text-sm text-muted-foreground mb-4">
              No templates found for this subject.
            </p>
            <Button
              variant="outline"
              onClick={() => setFilterSubject('all')}
            >
              View All Templates
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <TooltipProvider>
            {filteredTemplates.map(template => (
              <Card
                key={template.id}
                className={cn(
                  'overflow-hidden transition-all duration-200 border-2 cursor-pointer hover:shadow-lg',
                  SUBJECT_COLORS[template.subject]
                )}
              >
                {/* Header */}
                <div className={cn('px-4 py-3', SUBJECT_BG[template.subject])}>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <div className="text-2xl drop-shadow-sm">
                        {SUBJECT_ICONS[template.subject]}
                      </div>
                      <h3 className="font-semibold text-sm line-clamp-2">{template.name}</h3>
                    </div>
                    <Badge
                      variant="outline"
                      className={cn(
                        'flex-shrink-0 text-xs font-medium',
                        DIFFICULTY_COLORS[template.difficulty]
                      )}
                    >
                      {DIFFICULTY_LABELS[template.difficulty]}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {SUBJECT_LABELS[template.subject]}
                  </p>
                </div>

                {/* Content */}
                <CardContent className="p-4 space-y-4">
                  {/* Description */}
                  <p className="text-xs text-muted-foreground line-clamp-3">
                    {template.description}
                  </p>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center gap-1.5 p-2 rounded-lg bg-muted/50">
                          <span className="font-medium">{template.duration}m</span>
                          <span className="text-muted-foreground">duration</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="text-xs">
                        Typical lesson duration
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center gap-1.5 p-2 rounded-lg bg-muted/50">
                          <span className="font-medium">{template.activities}</span>
                          <span className="text-muted-foreground">activities</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="text-xs">
                        Number of activities
                      </TooltipContent>
                    </Tooltip>
                  </div>

                  {/* Use Template Button */}
                  {onUseTemplate && (
                    <Button
                      onClick={() => onUseTemplate(template)}
                      className="w-full h-9 text-sm gap-1.5"
                    >
                      <Zap className="w-4 h-4" />
                      Use Template
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </TooltipProvider>
        </div>
      )}
    </div>
  );
}
