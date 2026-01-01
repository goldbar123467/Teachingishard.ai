// School Year Calendar System
// 180 school days from August 15 to May/June

export interface SchoolDay {
  date: Date;
  dayNumber: number; // 1-180
  isSchoolDay: boolean;
  isWeekend: boolean;
  isBreak: boolean;
  breakName?: string;
  isSnowDay: boolean;
  isBlizzard: boolean;
  month: number;
  weekOfYear: number;
}

export interface SchoolYear {
  startDate: Date;
  endDate: Date;
  totalSchoolDays: number;
  currentDay: number;
  days: SchoolDay[];
  snowDaysUsed: number;
  blizzardOccurred: boolean;
  breaks: SchoolBreak[];
}

export interface SchoolBreak {
  name: string;
  startDate: Date;
  endDate: Date;
  duration: number;
}

export interface WeatherEvent {
  type: 'snow_day' | 'blizzard';
  startDay: number;
  duration: number;
  occurred: boolean;
}

// Constants
export const SCHOOL_YEAR_CONFIG = {
  startMonth: 7, // August (0-indexed)
  startDay: 15,
  totalSchoolDays: 180,

  // Breaks
  fallBreak: {
    name: 'Fall Break',
    weekOfOctober: 2, // 2nd week of October
    duration: 5, // 1 week (weekdays)
  },
  christmasBreak: {
    name: 'Winter Break',
    startMonth: 11, // December
    startDay: 20,
    duration: 14, // 2 weeks
  },
  springBreak: {
    name: 'Spring Break',
    weekOfMarch: 3, // 3rd week of March
    duration: 5, // 1 week (weekdays)
  },

  // Weather
  snowDayChance: 0.02, // 2% chance per winter day
  blizzardChance: 0.05, // 5% chance for a blizzard event during winter
  maxSnowDays: 3,
  blizzardDuration: 5,
};

export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const MONTH_ABBREV = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

// Helper functions
function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6;
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function getWeekOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 1);
  const diff = date.getTime() - start.getTime();
  const oneDay = 86400000;
  const dayOfYear = Math.floor(diff / oneDay) + 1;
  return Math.ceil(dayOfYear / 7);
}

function isInBreak(date: Date, breaks: SchoolBreak[]): SchoolBreak | null {
  for (const brk of breaks) {
    if (date >= brk.startDate && date <= brk.endDate) {
      return brk;
    }
  }
  return null;
}

function isWinterMonth(month: number): boolean {
  return month === 11 || month === 0 || month === 1 || month === 2; // Dec, Jan, Feb, Mar
}

// Generate the school year calendar
export function generateSchoolYear(year: number, seed?: number): SchoolYear {
  const config = SCHOOL_YEAR_CONFIG;
  const startDate = new Date(year, config.startMonth, config.startDay);

  // Calculate breaks
  const breaks: SchoolBreak[] = [];

  // Fall break - 2nd week of October
  const fallBreakStart = new Date(year, 9, 1); // October 1
  while (fallBreakStart.getDay() !== 1) fallBreakStart.setDate(fallBreakStart.getDate() + 1); // Find first Monday
  fallBreakStart.setDate(fallBreakStart.getDate() + 7); // 2nd week
  breaks.push({
    name: config.fallBreak.name,
    startDate: new Date(fallBreakStart),
    endDate: addDays(fallBreakStart, 4),
    duration: 5,
  });

  // Christmas break
  const christmasStart = new Date(year, config.christmasBreak.startMonth, config.christmasBreak.startDay);
  breaks.push({
    name: config.christmasBreak.name,
    startDate: christmasStart,
    endDate: addDays(christmasStart, config.christmasBreak.duration - 1),
    duration: config.christmasBreak.duration,
  });

  // Spring break - 3rd week of March
  const springBreakStart = new Date(year + 1, 2, 1); // March 1 of next year
  while (springBreakStart.getDay() !== 1) springBreakStart.setDate(springBreakStart.getDate() + 1);
  springBreakStart.setDate(springBreakStart.getDate() + 14); // 3rd week
  breaks.push({
    name: config.springBreak.name,
    startDate: new Date(springBreakStart),
    endDate: addDays(springBreakStart, 4),
    duration: 5,
  });

  // Generate weather events (deterministic if seed provided)
  const rng = seed !== undefined ? seededRandom(seed) : Math.random;
  const blizzardOccurs = rng() < config.blizzardChance;
  let snowDaysCount = 0;
  const snowDayDates: number[] = [];

  // Generate all days
  const days: SchoolDay[] = [];
  let currentDate = new Date(startDate);
  let schoolDayCount = 0;
  let blizzardStartDay = -1;

  // Pre-calculate blizzard day if it occurs
  if (blizzardOccurs) {
    // Blizzard happens in January or February
    blizzardStartDay = 80 + Math.floor(rng() * 40); // Between day 80-120
  }

  while (schoolDayCount < config.totalSchoolDays) {
    const weekend = isWeekend(currentDate);
    const breakInfo = isInBreak(currentDate, breaks);
    const month = currentDate.getMonth();
    const isWinter = isWinterMonth(month);

    let isSnowDay = false;
    let isBlizzard = false;

    // Check for snow/blizzard on school days
    if (!weekend && !breakInfo) {
      // Check for blizzard
      if (blizzardOccurs &&
          schoolDayCount >= blizzardStartDay &&
          schoolDayCount < blizzardStartDay + config.blizzardDuration) {
        isBlizzard = true;
        isSnowDay = true;
      }
      // Check for random snow days (only if not in blizzard and in winter)
      else if (isWinter &&
               snowDaysCount < config.maxSnowDays &&
               !blizzardOccurs &&
               rng() < config.snowDayChance) {
        isSnowDay = true;
        snowDaysCount++;
        snowDayDates.push(schoolDayCount);
      }
    }

    const isSchoolDay = !weekend && !breakInfo && !isSnowDay;

    days.push({
      date: new Date(currentDate),
      dayNumber: isSchoolDay ? schoolDayCount + 1 : 0,
      isSchoolDay,
      isWeekend: weekend,
      isBreak: !!breakInfo,
      breakName: breakInfo?.name,
      isSnowDay,
      isBlizzard,
      month,
      weekOfYear: getWeekOfYear(currentDate),
    });

    if (isSchoolDay) {
      schoolDayCount++;
    }

    currentDate = addDays(currentDate, 1);
  }

  const endDate = days[days.length - 1].date;

  return {
    startDate,
    endDate,
    totalSchoolDays: config.totalSchoolDays,
    currentDay: 1,
    days,
    snowDaysUsed: snowDaysCount + (blizzardOccurs ? config.blizzardDuration : 0),
    blizzardOccurred: blizzardOccurs,
    breaks,
  };
}

// Seeded random for deterministic generation
function seededRandom(seed: number): () => number {
  let s = seed;
  return function() {
    s = Math.sin(s) * 10000;
    return s - Math.floor(s);
  };
}

// Get progress through the school year
export function getSchoolYearProgress(schoolYear: SchoolYear): {
  percentComplete: number;
  daysRemaining: number;
  currentMonth: string;
  currentWeek: number;
  nextBreak: SchoolBreak | null;
  daysUntilBreak: number;
} {
  const { currentDay, totalSchoolDays, days, breaks } = schoolYear;
  const percentComplete = Math.round((currentDay / totalSchoolDays) * 100);
  const daysRemaining = totalSchoolDays - currentDay;

  // Find current day info
  const currentDayInfo = days.find(d => d.dayNumber === currentDay);
  const currentMonth = currentDayInfo
    ? MONTH_NAMES[currentDayInfo.month]
    : MONTH_NAMES[new Date().getMonth()];
  const currentWeek = currentDayInfo?.weekOfYear || 1;

  // Find next break
  let nextBreak: SchoolBreak | null = null;
  let daysUntilBreak = 0;

  if (currentDayInfo) {
    for (const brk of breaks) {
      if (brk.startDate > currentDayInfo.date) {
        nextBreak = brk;
        // Count school days until break
        daysUntilBreak = days.filter(d =>
          d.isSchoolDay &&
          d.date >= currentDayInfo.date &&
          d.date < brk.startDate
        ).length;
        break;
      }
    }
  }

  return {
    percentComplete,
    daysRemaining,
    currentMonth,
    currentWeek,
    nextBreak,
    daysUntilBreak,
  };
}

// Get semester info
export function getSemester(currentDay: number): 1 | 2 {
  return currentDay <= 90 ? 1 : 2;
}

// Get quarter info
export function getQuarter(currentDay: number): 1 | 2 | 3 | 4 {
  if (currentDay <= 45) return 1;
  if (currentDay <= 90) return 2;
  if (currentDay <= 135) return 3;
  return 4;
}

// Format date for display
export function formatSchoolDate(date: Date): string {
  return `${MONTH_ABBREV[date.getMonth()]} ${date.getDate()}`;
}
