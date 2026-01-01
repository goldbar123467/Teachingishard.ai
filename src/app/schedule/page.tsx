'use client';

import { useState, useMemo, useContext } from 'react';
import { MainLayout } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { WeeklyCalendar } from '@/components/schedule/WeeklyCalendar';
import { BookOpen, AlertTriangle, CheckCircle, Clock, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { GameContext } from '@/lib/game/context';

// Subject color and icon mappings
const subjectConfig = {
  reading: {
    icon: '📚',
    color: 'bg-gradient-to-br from-purple-500 to-indigo-600',
    borderColor: 'border-purple-400',
    label: 'Reading/ELA',
    minDuration: 90,
  },
  math: {
    icon: '≠',
    color: 'bg-gradient-to-br from-blue-500 to-cyan-600',
    borderColor: 'border-blue-400',
    label: 'Math',
    minDuration: 60,
  },
  art: {
    icon: '🎨',
    color: 'bg-gradient-to-br from-pink-500 to-rose-600',
    borderColor: 'border-pink-400',
    label: 'Art',
    minDuration: 45,
  },
  gym: {
    icon: '💪',
    color: 'bg-gradient-to-br from-orange-500 to-red-600',
    borderColor: 'border-orange-400',
    label: 'Physical Education',
    minDuration: 45,
  },
  music: {
    icon: '🎵',
    color: 'bg-gradient-to-br from-green-500 to-teal-600',
    borderColor: 'border-green-400',
    label: 'Music',
    minDuration: 45,
  },
  'stem-lab': {
    icon: '🔬',
    color: 'bg-gradient-to-br from-amber-500 to-yellow-600',
    borderColor: 'border-amber-400',
    label: 'STEM Lab',
    minDuration: 45,
  },
};

// Mock schedule data - would come from context/API
const mockSchedule = [
  {
    id: '1',
    dayOfWeek: 0,
    subject: 'reading',
    startTime: '8:30',
    duration: 90,
    status: 'completed' as const,
  },
  {
    id: '2',
    dayOfWeek: 0,
    subject: 'math',
    startTime: '10:00',
    duration: 60,
    status: 'completed' as const,
  },
  {
    id: '3',
    dayOfWeek: 0,
    subject: 'art',
    startTime: '11:15',
    duration: 45,
    status: 'completed' as const,
  },
  {
    id: '4',
    dayOfWeek: 1,
    subject: 'reading',
    startTime: '8:30',
    duration: 90,
    status: 'in-progress' as const,
  },
  {
    id: '5',
    dayOfWeek: 1,
    subject: 'math',
    startTime: '10:00',
    duration: 60,
    status: 'planned' as const,
  },
  {
    id: '6',
    dayOfWeek: 1,
    subject: 'gym',
    startTime: '11:15',
    duration: 45,
    status: 'planned' as const,
  },
  {
    id: '7',
    dayOfWeek: 2,
    subject: 'reading',
    startTime: '8:30',
    duration: 90,
    status: 'planned' as const,
  },
  {
    id: '8',
    dayOfWeek: 2,
    subject: 'math',
    startTime: '10:00',
    duration: 60,
    status: 'planned' as const,
  },
  {
    id: '9',
    dayOfWeek: 2,
    subject: 'music',
    startTime: '11:15',
    duration: 45,
    status: 'planned' as const,
  },
];

interface TimeBlockData {
  id: string;
  dayOfWeek: number;
  subject: string;
  subjectIcon: any;
  startTime: string;
  duration: number;
  status: 'planned' | 'in-progress' | 'completed' | 'skipped';
  backgroundColor: string;
  borderColor: string;
}

export default function SchedulePage() {
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null);
  const gameContext = useContext(GameContext);

  if (!gameContext) {
    throw new Error('SchedulePage must be used within GameProvider');
  }

  const { dispatch } = gameContext;

  // Transform mock data to component format
  const calendarBlocks: TimeBlockData[] = useMemo(() => {
    return mockSchedule.map(block => {
      const config = subjectConfig[block.subject as keyof typeof subjectConfig];
      return {
        ...block,
        subjectIcon: config.icon,
        backgroundColor: config.color,
        borderColor: config.borderColor,
      };
    });
  }, []);

  // Calculate schedule validation
  const validation = useMemo(() => {
    const byDay: Record<number, { reading: number; math: number; specials: number; subjects: string[] }> = {};

    for (let i = 0; i < 5; i++) {
      byDay[i] = { reading: 0, math: 0, specials: 0, subjects: [] };
    }

    calendarBlocks.forEach(block => {
      const day = block.dayOfWeek;
      if (!byDay[day]) {
        byDay[day] = { reading: 0, math: 0, specials: 0, subjects: [] };
      }

      if (block.subject === 'reading') {
        byDay[day].reading += block.duration;
      } else if (block.subject === 'math') {
        byDay[day].math += block.duration;
      } else {
        byDay[day].specials += block.duration;
      }

      byDay[day].subjects.push(block.subject);
    });

    const issues: string[] = [];
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

    Object.entries(byDay).forEach(([dayIndex, day]) => {
      if (day.reading < 90) {
        issues.push(`${days[parseInt(dayIndex)]}: Reading block is too short (${day.reading}m, need 90m)`);
      }
      if (day.math < 60) {
        issues.push(`${days[parseInt(dayIndex)]}: Math block is too short (${day.math}m, need 60m)`);
      }
      if (day.specials < 45) {
        issues.push(`${days[parseInt(dayIndex)]}: Specials/Related Arts block is missing or too short (${day.specials}m, need 45m)`);
      }
    });

    return {
      valid: issues.length === 0,
      issues,
      byDay,
    };
  }, [calendarBlocks]);

  const handleBlockDrop = (blockId: string, newDayOfWeek: number, newStartTime: string) => {
    dispatch({
      type: 'MOVE_TIME_BLOCK',
      payload: { blockId, newDayOfWeek, newStartTime }
    });
  };

  const totalMinutes = calendarBlocks.reduce((sum, block) => sum + block.duration, 0);
  const completedMinutes = calendarBlocks
    .filter(block => block.status === 'completed')
    .reduce((sum, block) => sum + block.duration, 0);

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Weekly Schedule</h1>
          <p className="text-muted-foreground">
            Plan your week's lessons and manage time blocks for optimal learning
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center space-y-2">
                <div className="flex justify-center">
                  <Clock className="w-6 h-6 text-blue-500" />
                </div>
                <div className="text-2xl font-bold">{totalMinutes}m</div>
                <div className="text-sm text-muted-foreground">Total scheduled</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center space-y-2">
                <div className="flex justify-center">
                  <CheckCircle className="w-6 h-6 text-emerald-500" />
                </div>
                <div className="text-2xl font-bold">{completedMinutes}m</div>
                <div className="text-sm text-muted-foreground">Completed</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center space-y-2">
                <div className="flex justify-center">
                  <BookOpen className="w-6 h-6 text-purple-500" />
                </div>
                <div className="text-2xl font-bold">5</div>
                <div className="text-sm text-muted-foreground">Days planned</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center space-y-2">
                <div className="flex justify-center">
                  {validation.valid ? (
                    <CheckCircle className="w-6 h-6 text-emerald-500" />
                  ) : (
                    <AlertTriangle className="w-6 h-6 text-orange-500" />
                  )}
                </div>
                <div className="text-lg font-bold">
                  {validation.valid ? 'Valid' : 'Issues'}
                </div>
                <div className="text-sm text-muted-foreground">
                  {validation.valid ? 'All requirements met' : `${validation.issues.length} issue${validation.issues.length !== 1 ? 's' : ''}`}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Validation Alerts */}
        {!validation.valid && (
          <Alert className="border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-900/20">
            <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            <AlertDescription className="text-orange-900 dark:text-orange-200">
              <div className="font-semibold mb-2">Schedule Issues:</div>
              <ul className="list-disc list-inside space-y-1 text-sm">
                {validation.issues.map((issue, index) => (
                  <li key={index}>{issue}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {validation.valid && (
          <Alert className="border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20">
            <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <AlertDescription className="text-emerald-900 dark:text-emerald-200">
              Your schedule meets all requirements! All time blocks are properly allocated.
            </AlertDescription>
          </Alert>
        )}

        {/* Weekly Calendar */}
        <WeeklyCalendar
          timeBlocks={calendarBlocks}
          onBlockClick={setSelectedBlock}
          onBlockDrop={handleBlockDrop}
        />

        {/* Minimum Duration Requirements Reference */}
        <Card>
          <CardHeader className="bg-muted/50">
            <CardTitle className="text-lg">Minimum Duration Requirements</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(subjectConfig).map(([key, config]) => (
                <div
                  key={key}
                  className={cn(
                    'p-4 rounded-lg border-2 border-transparent',
                    config.color,
                    'text-white'
                  )}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="text-lg">{config.icon}</div>
                    <span className="font-semibold">{config.label}</span>
                  </div>
                  <div className="text-2xl font-bold">{config.minDuration}m</div>
                  <div className="text-sm opacity-90 mt-1">per day minimum</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          <Button size="lg" className="gap-2">
            <Plus className="w-4 h-4" />
            Add Time Block
          </Button>
          <Button variant="outline" size="lg">
            Save Schedule
          </Button>
          <Button variant="outline" size="lg">
            Reset to Default
          </Button>
          <div className="flex-1" />
          <Button size="lg" className="gap-2 bg-emerald-600 hover:bg-emerald-700">
            <CheckCircle className="w-4 h-4" />
            Start Teaching
          </Button>
        </div>
      </div>
    </MainLayout>
  );
}
