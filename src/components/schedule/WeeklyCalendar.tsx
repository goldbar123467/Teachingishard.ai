'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TimeBlock } from './TimeBlock';
import { Book, Calculator, Palette, Dumbbell, Music, Award } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TimeBlockData {
  id: string;
  dayOfWeek: number; // 0 = Monday, 4 = Friday
  subject: string;
  subjectIcon: React.ReactNode;
  startTime: string;
  duration: number;
  status: 'planned' | 'in-progress' | 'completed' | 'skipped';
  backgroundColor: string;
  borderColor: string;
}

interface WeeklyCalendarProps {
  timeBlocks: TimeBlockData[];
  onBlockClick?: (blockId: string) => void;
  onBlockDrop?: (blockId: string, newDayOfWeek: number, newStartTime: string) => void;
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const START_HOUR = 8; // 8 AM
const END_HOUR = 15; // 3 PM
const TIME_SLOTS = Array.from({ length: (END_HOUR - START_HOUR) * 2 }, (_, i) => {
  const hour = START_HOUR + Math.floor(i / 2);
  const minute = (i % 2) * 30;
  return `${hour}:${String(minute).padStart(2, '0')}`;
});

const subjectIcons: Record<string, React.ReactNode> = {
  reading: <Book className="w-4 h-4" />,
  math: <Calculator className="w-4 h-4" />,
  art: <Palette className="w-4 h-4" />,
  gym: <Dumbbell className="w-4 h-4" />,
  music: <Music className="w-4 h-4" />,
  'stem-lab': <Award className="w-4 h-4" />,
};

const subjectColors: Record<string, { bg: string; border: string }> = {
  reading: { bg: 'bg-gradient-to-br from-purple-500 to-indigo-600', border: 'border-purple-400' },
  math: { bg: 'bg-gradient-to-br from-blue-500 to-cyan-600', border: 'border-blue-400' },
  art: { bg: 'bg-gradient-to-br from-pink-500 to-rose-600', border: 'border-pink-400' },
  gym: { bg: 'bg-gradient-to-br from-orange-500 to-red-600', border: 'border-orange-400' },
  music: { bg: 'bg-gradient-to-br from-green-500 to-teal-600', border: 'border-green-400' },
  'stem-lab': { bg: 'bg-gradient-to-br from-amber-500 to-yellow-600', border: 'border-amber-400' },
};

export function WeeklyCalendar({ timeBlocks, onBlockClick, onBlockDrop }: WeeklyCalendarProps) {
  // Group blocks by day and time for easier rendering
  const blocksByDay = useMemo(() => {
    const grid: Record<number, TimeBlockData[]> = {};
    for (let i = 0; i < 5; i++) {
      grid[i] = [];
    }
    timeBlocks.forEach(block => {
      if (!grid[block.dayOfWeek]) {
        grid[block.dayOfWeek] = [];
      }
      grid[block.dayOfWeek].push(block);
    });
    return grid;
  }, [timeBlocks]);

  // Calculate total minutes per day
  const minutesByDay = useMemo(() => {
    const totals: Record<number, number> = {};
    for (let i = 0; i < 5; i++) {
      totals[i] = blocksByDay[i]?.reduce((sum, block) => sum + block.duration, 0) || 0;
    }
    return totals;
  }, [blocksByDay]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (dayOfWeek: number) => (e: React.DragEvent) => {
    e.preventDefault();
    const blockId = e.dataTransfer.getData('blockId');
    const newStartTime = e.dataTransfer.getData('startTime');
    if (onBlockDrop && blockId && newStartTime) {
      onBlockDrop(blockId, dayOfWeek, newStartTime);
    }
  };

  return (
    <Card className="w-full overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <CardTitle className="text-2xl">Weekly Schedule</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <div className="grid gap-0.5 bg-muted/30 p-4 min-w-full" style={{
            gridTemplateColumns: '80px repeat(5, 1fr)',
            minHeight: '600px',
          }}>
            {/* Time labels (left column) */}
            <div className="space-y-1">
              <div className="h-12 flex items-end pb-2">
                <span className="text-xs font-semibold text-muted-foreground">
                  Time
                </span>
              </div>
              {TIME_SLOTS.map(time => (
                <div
                  key={time}
                  className="h-12 flex items-start text-xs font-medium text-muted-foreground"
                >
                  {time}
                </div>
              ))}
            </div>

            {/* Day columns */}
            {DAYS.map((day, dayIndex) => (
              <div
                key={dayIndex}
                className="space-y-1 rounded-lg border border-border/50 bg-background p-2"
                onDragOver={handleDragOver}
                onDrop={handleDrop(dayIndex)}
              >
                {/* Day header */}
                <div className="h-12 flex flex-col items-center justify-between">
                  <span className="font-semibold text-sm">{day}</span>
                  <Badge
                    variant="secondary"
                    className="text-xs"
                  >
                    {minutesByDay[dayIndex]}m
                  </Badge>
                </div>

                {/* Time slots */}
                <div className="space-y-1 relative">
                  {TIME_SLOTS.map(time => {
                    const blocksInSlot = blocksByDay[dayIndex]?.filter(
                      block => block.startTime === time
                    ) || [];

                    return (
                      <div
                        key={`${dayIndex}-${time}`}
                        className="h-12 rounded border border-dashed border-border/30 bg-muted/20 relative"
                      >
                        {blocksInSlot.length > 0 && (
                          <div className="absolute inset-0">
                            {blocksInSlot[0] && (
                              <div
                                onClick={() => onBlockClick?.(blocksInSlot[0].id)}
                                className="cursor-pointer h-full"
                              >
                                <TimeBlock
                                  id={blocksInSlot[0].id}
                                  subject={blocksInSlot[0].subject}
                                  subjectIcon={blocksInSlot[0].subjectIcon}
                                  startTime={blocksInSlot[0].startTime}
                                  duration={blocksInSlot[0].duration}
                                  status={blocksInSlot[0].status}
                                  backgroundColor={blocksInSlot[0].backgroundColor}
                                  borderColor={blocksInSlot[0].borderColor}
                                />
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Summary footer */}
        <div className="border-t bg-muted/30 p-4">
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
            {DAYS.map((day, dayIndex) => (
              <div key={dayIndex} className="text-sm">
                <div className="font-medium">{day}</div>
                <div className="text-muted-foreground">
                  {minutesByDay[dayIndex]} minutes scheduled
                </div>
                <div className="flex gap-1 mt-2 flex-wrap">
                  {blocksByDay[dayIndex]?.map(block => (
                    <Badge
                      key={block.id}
                      variant="outline"
                      className="text-xs"
                    >
                      {block.subject}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
