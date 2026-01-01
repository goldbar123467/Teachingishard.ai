'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import {
  type SchoolYear,
  type SchoolDay,
  getSchoolYearProgress,
  getSemester,
  getQuarter,
  MONTH_NAMES,
  MONTH_ABBREV,
  formatSchoolDate,
} from '@/lib/game/calendar';

interface SchoolYearCalendarProps {
  schoolYear: SchoolYear;
  className?: string;
}

// Mini calendar showing months
function MonthMiniCalendar({
  days,
  currentDay,
  monthIndex,
}: {
  days: SchoolDay[];
  currentDay: number;
  monthIndex: number;
}) {
  const monthDays = days.filter(d => d.month === monthIndex);
  if (monthDays.length === 0) return null;

  return (
    <div className="space-y-1">
      <div className="text-xs font-medium text-muted-foreground">
        {MONTH_ABBREV[monthIndex]}
      </div>
      <div className="flex flex-wrap gap-0.5" style={{ maxWidth: '84px' }}>
        {monthDays.map((day, i) => {
          const isCurrent = day.dayNumber === currentDay;
          const isPast = day.dayNumber > 0 && day.dayNumber < currentDay;
          const isFuture = day.dayNumber > currentDay;

          return (
            <TooltipProvider key={i} delayDuration={100}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    className={cn(
                      'w-2.5 h-2.5 rounded-sm transition-all',
                      day.isWeekend && 'bg-muted/30',
                      day.isBreak && 'bg-amber-200 dark:bg-amber-900/50',
                      day.isSnowDay && !day.isBlizzard && 'bg-sky-300 dark:bg-sky-700',
                      day.isBlizzard && 'bg-blue-400 dark:bg-blue-600 animate-pulse',
                      day.isSchoolDay && isPast && 'bg-emerald-400 dark:bg-emerald-600',
                      day.isSchoolDay && isFuture && 'bg-muted',
                      isCurrent && 'ring-2 ring-primary ring-offset-1 ring-offset-background scale-125 z-10'
                    )}
                  />
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs">
                  <div className="font-medium">{formatSchoolDate(day.date)}</div>
                  {day.isSchoolDay && <div>Day {day.dayNumber}</div>}
                  {day.isBreak && <div className="text-amber-500">{day.breakName}</div>}
                  {day.isSnowDay && !day.isBlizzard && <div className="text-sky-500">Snow Day!</div>}
                  {day.isBlizzard && <div className="text-blue-500">BLIZZARD!</div>}
                  {day.isWeekend && <div className="text-muted-foreground">Weekend</div>}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        })}
      </div>
    </div>
  );
}

// Progress bar with milestones
function YearProgressBar({
  progress,
  semester,
  quarter,
}: {
  progress: number;
  semester: 1 | 2;
  quarter: 1 | 2 | 3 | 4;
}) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Aug</span>
        <span>|</span>
        <span>Dec</span>
        <span>|</span>
        <span>May</span>
      </div>
      <div className="relative">
        <Progress value={progress} className="h-3" />
        {/* Quarter markers */}
        <div className="absolute top-0 left-[25%] w-px h-3 bg-border" />
        <div className="absolute top-0 left-[50%] w-px h-3 bg-primary/50" />
        <div className="absolute top-0 left-[75%] w-px h-3 bg-border" />
      </div>
      <div className="flex justify-between text-xs">
        <Badge variant={quarter === 1 ? 'default' : 'outline'} className="text-[10px] px-1.5">Q1</Badge>
        <Badge variant={quarter === 2 ? 'default' : 'outline'} className="text-[10px] px-1.5">Q2</Badge>
        <Badge variant={quarter === 3 ? 'default' : 'outline'} className="text-[10px] px-1.5">Q3</Badge>
        <Badge variant={quarter === 4 ? 'default' : 'outline'} className="text-[10px] px-1.5">Q4</Badge>
      </div>
    </div>
  );
}

// Weather summary
function WeatherSummary({
  snowDaysUsed,
  blizzardOccurred,
  maxSnowDays,
}: {
  snowDaysUsed: number;
  blizzardOccurred: boolean;
  maxSnowDays: number;
}) {
  return (
    <div className="flex items-center gap-3 p-2 rounded-lg bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800">
      <div className="text-2xl">
        {blizzardOccurred ? '🌨️' : snowDaysUsed > 0 ? '❄️' : '☀️'}
      </div>
      <div className="flex-1">
        <div className="text-sm font-medium">
          {blizzardOccurred ? 'Blizzard Year!' : snowDaysUsed > 0 ? 'Snow Days' : 'Clear Weather'}
        </div>
        <div className="text-xs text-muted-foreground">
          {blizzardOccurred
            ? '5-day blizzard incoming!'
            : `${snowDaysUsed}/${maxSnowDays} snow days used`}
        </div>
      </div>
      {/* Snow day indicators */}
      <div className="flex gap-1">
        {Array.from({ length: maxSnowDays }).map((_, i) => (
          <div
            key={i}
            className={cn(
              'w-3 h-3 rounded-full border-2',
              i < snowDaysUsed
                ? 'bg-sky-400 border-sky-500'
                : 'bg-transparent border-muted-foreground/30'
            )}
          />
        ))}
      </div>
    </div>
  );
}

// Upcoming breaks
function UpcomingBreaks({
  breaks,
  currentDate,
}: {
  breaks: SchoolYear['breaks'];
  currentDate: Date;
}) {
  const upcomingBreaks = breaks.filter(b => b.startDate > currentDate);

  if (upcomingBreaks.length === 0) {
    return (
      <div className="text-center py-4 text-muted-foreground text-sm">
        No more breaks - almost summer!
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {upcomingBreaks.map((brk, i) => (
        <div
          key={i}
          className="flex items-center gap-3 p-2 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800"
        >
          <div className="text-xl">
            {brk.name.includes('Winter') ? '🎄' : brk.name.includes('Spring') ? '🌸' : '🍂'}
          </div>
          <div className="flex-1">
            <div className="text-sm font-medium">{brk.name}</div>
            <div className="text-xs text-muted-foreground">
              {formatSchoolDate(brk.startDate)} - {formatSchoolDate(brk.endDate)}
            </div>
          </div>
          <Badge variant="outline" className="text-xs">
            {brk.duration} days
          </Badge>
        </div>
      ))}
    </div>
  );
}

export function SchoolYearCalendar({ schoolYear, className }: SchoolYearCalendarProps) {
  const progress = useMemo(
    () => getSchoolYearProgress(schoolYear),
    [schoolYear]
  );
  const semester = getSemester(schoolYear.currentDay);
  const quarter = getQuarter(schoolYear.currentDay);

  // Get months that have school days
  const schoolMonths = useMemo(() => {
    const months = new Set<number>();
    schoolYear.days.forEach(d => months.add(d.month));
    return Array.from(months).sort((a, b) => {
      // Sort Aug-Dec first, then Jan-Jun
      const orderA = a >= 7 ? a - 7 : a + 5;
      const orderB = b >= 7 ? b - 7 : b + 5;
      return orderA - orderB;
    });
  }, [schoolYear]);

  const currentDayInfo = schoolYear.days.find(d => d.dayNumber === schoolYear.currentDay);

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <span className="text-xl">📅</span>
            School Year
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="font-mono">
              Day {schoolYear.currentDay}/{schoolYear.totalSchoolDays}
            </Badge>
            <Badge className={cn(
              semester === 1 ? 'bg-blue-500' : 'bg-green-500'
            )}>
              Semester {semester}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Current date display */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-primary/10 to-primary/5 border">
          <div>
            <div className="text-2xl font-bold">{progress.currentMonth}</div>
            <div className="text-sm text-muted-foreground">
              {currentDayInfo ? formatSchoolDate(currentDayInfo.date) : 'Start of Year'}
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-primary">{progress.percentComplete}%</div>
            <div className="text-sm text-muted-foreground">
              {progress.daysRemaining} days left
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <YearProgressBar progress={progress.percentComplete} semester={semester} quarter={quarter} />

        {/* Next break countdown */}
        {progress.nextBreak && (
          <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
            <span className="text-lg">
              {progress.nextBreak.name.includes('Winter') ? '🎄' : progress.nextBreak.name.includes('Spring') ? '🌸' : '🍂'}
            </span>
            <span className="text-sm">
              <span className="font-medium">{progress.nextBreak.name}</span>
              {' '}in{' '}
              <span className="font-bold text-primary">{progress.daysUntilBreak}</span>
              {' '}school days
            </span>
          </div>
        )}

        {/* Weather summary */}
        <WeatherSummary
          snowDaysUsed={schoolYear.snowDaysUsed}
          blizzardOccurred={schoolYear.blizzardOccurred}
          maxSnowDays={3}
        />

        {/* Mini calendar grid */}
        <div className="pt-2 border-t">
          <div className="text-xs font-medium text-muted-foreground mb-2">Year Overview</div>
          <div className="grid grid-cols-5 gap-3">
            {schoolMonths.map(month => (
              <MonthMiniCalendar
                key={month}
                days={schoolYear.days}
                currentDay={schoolYear.currentDay}
                monthIndex={month}
              />
            ))}
          </div>
          {/* Legend */}
          <div className="flex flex-wrap gap-3 mt-3 pt-2 border-t text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 rounded-sm bg-emerald-400" />
              <span>Complete</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 rounded-sm bg-muted" />
              <span>Upcoming</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 rounded-sm bg-amber-200" />
              <span>Break</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 rounded-sm bg-sky-300" />
              <span>Snow</span>
            </div>
          </div>
        </div>

        {/* Upcoming breaks */}
        <div className="pt-2 border-t">
          <div className="text-xs font-medium text-muted-foreground mb-2">Upcoming Breaks</div>
          <UpcomingBreaks
            breaks={schoolYear.breaks}
            currentDate={currentDayInfo?.date || new Date()}
          />
        </div>
      </CardContent>
    </Card>
  );
}

// Compact version for sidebar/header
export function SchoolYearProgress({ schoolYear }: { schoolYear: SchoolYear }) {
  const progress = getSchoolYearProgress(schoolYear);

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-1.5">
        <span className="text-sm">📅</span>
        <span className="text-sm font-medium">Day {schoolYear.currentDay}</span>
      </div>
      <div className="flex-1 max-w-[100px]">
        <Progress value={progress.percentComplete} className="h-1.5" />
      </div>
      <span className="text-xs text-muted-foreground">{progress.percentComplete}%</span>
    </div>
  );
}

// Hook for demo/testing
export function useSampleSchoolYear(): SchoolYear {
  return useMemo(() => {
    // Import dynamically to avoid circular deps
    const { generateSchoolYear } = require('@/lib/game/calendar');
    return generateSchoolYear(2024, 42); // Seeded for consistent demo
  }, []);
}
