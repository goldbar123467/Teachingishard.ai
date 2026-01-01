// ============ SCHEDULE TYPES ============

export type SubjectType =
  | 'reading'
  | 'math'
  | 'science'
  | 'social-studies'
  | 'art'
  | 'gym'
  | 'music'
  | 'library'
  | 'stem-lab'
  | 'lunch'
  | 'recess';

export type SpecialType = 'art' | 'gym' | 'music' | 'library' | 'stem-lab';

export type BlockStatus = 'planned' | 'in-progress' | 'completed' | 'skipped';

export interface TimeBlock {
  id: string;
  subject: SubjectType;
  startTime: string; // "8:30 AM" format
  duration: number; // minutes
  lessonId?: string; // Reference to Lesson
  status: BlockStatus;
}

export interface DailySchedule {
  blocks: TimeBlock[];
  totalMinutes: number; // Should equal ~360 mins (6 hour day)
  dayOfWeek: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday';
}

export interface ScheduleValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// ============ SCHEDULE CONSTANTS ============

// Minimum durations per subject (in minutes)
export const MIN_READING_DURATION = 90;
export const MIN_MATH_DURATION = 60;
export const SPECIALS_DURATION = 45;
export const STANDARD_DAY_MINUTES = 360; // 6 hours

// Specials rotation by day
export const SPECIALS_ROTATION: Record<'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday', SpecialType> = {
  monday: 'art',
  tuesday: 'gym',
  wednesday: 'music',
  thursday: 'library',
  friday: 'stem-lab',
};

// ============ SCHEDULE VALIDATION ============

/**
 * Validates a daily schedule against requirements:
 * - Reading >= 90 minutes
 * - Math >= 60 minutes
 * - Specials = 45 minutes
 * - Total time reasonable (~360 minutes)
 */
export function validateSchedule(schedule: DailySchedule): ScheduleValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Calculate subject durations
  const subjectDurations = new Map<SubjectType, number>();

  for (const block of schedule.blocks) {
    const current = subjectDurations.get(block.subject) || 0;
    subjectDurations.set(block.subject, current + block.duration);
  }

  // Check reading requirement
  const readingTime = subjectDurations.get('reading') || 0;
  if (readingTime < MIN_READING_DURATION) {
    errors.push(`Reading time is ${readingTime} minutes, must be at least ${MIN_READING_DURATION} minutes`);
  }

  // Check math requirement
  const mathTime = subjectDurations.get('math') || 0;
  if (mathTime < MIN_MATH_DURATION) {
    errors.push(`Math time is ${mathTime} minutes, must be at least ${MIN_MATH_DURATION} minutes`);
  }

  // Check specials requirement
  const expectedSpecial = SPECIALS_ROTATION[schedule.dayOfWeek];
  const specialTime = subjectDurations.get(expectedSpecial) || 0;

  if (specialTime === 0) {
    errors.push(`Missing ${expectedSpecial} block for ${schedule.dayOfWeek}`);
  } else if (specialTime !== SPECIALS_DURATION) {
    warnings.push(`${expectedSpecial} should be exactly ${SPECIALS_DURATION} minutes, currently ${specialTime}`);
  }

  // Check total time
  if (schedule.totalMinutes < STANDARD_DAY_MINUTES - 30) {
    warnings.push(`Day is shorter than standard (${schedule.totalMinutes} vs ${STANDARD_DAY_MINUTES} minutes)`);
  } else if (schedule.totalMinutes > STANDARD_DAY_MINUTES + 30) {
    warnings.push(`Day is longer than standard (${schedule.totalMinutes} vs ${STANDARD_DAY_MINUTES} minutes)`);
  }

  // Check for time conflicts (overlapping blocks)
  const sortedBlocks = [...schedule.blocks].sort((a, b) => {
    return timeToMinutes(a.startTime) - timeToMinutes(b.startTime);
  });

  for (let i = 0; i < sortedBlocks.length - 1; i++) {
    const current = sortedBlocks[i];
    const next = sortedBlocks[i + 1];

    const currentEnd = timeToMinutes(current.startTime) + current.duration;
    const nextStart = timeToMinutes(next.startTime);

    if (currentEnd > nextStart) {
      errors.push(`Time conflict: ${current.subject} (${current.startTime}) overlaps with ${next.subject} (${next.startTime})`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

// ============ SCHEDULE GENERATION ============

/**
 * Generates a default compliant schedule for a given day of the week
 */
export function generateDefaultSchedule(
  dayOfWeek: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday'
): DailySchedule {
  const special = SPECIALS_ROTATION[dayOfWeek];

  const blocks: TimeBlock[] = [
    {
      id: `${dayOfWeek}-morning-meeting`,
      subject: 'reading',
      startTime: '8:30 AM',
      duration: 15,
      status: 'planned',
    },
    {
      id: `${dayOfWeek}-reading-1`,
      subject: 'reading',
      startTime: '8:45 AM',
      duration: 45,
      status: 'planned',
    },
    {
      id: `${dayOfWeek}-reading-2`,
      subject: 'reading',
      startTime: '9:30 AM',
      duration: 30,
      status: 'planned',
    },
    {
      id: `${dayOfWeek}-recess`,
      subject: 'recess',
      startTime: '10:00 AM',
      duration: 15,
      status: 'planned',
    },
    {
      id: `${dayOfWeek}-math-1`,
      subject: 'math',
      startTime: '10:15 AM',
      duration: 60,
      status: 'planned',
    },
    {
      id: `${dayOfWeek}-lunch`,
      subject: 'lunch',
      startTime: '11:15 AM',
      duration: 30,
      status: 'planned',
    },
    {
      id: `${dayOfWeek}-special`,
      subject: special,
      startTime: '11:45 AM',
      duration: 45,
      status: 'planned',
    },
    {
      id: `${dayOfWeek}-science`,
      subject: 'science',
      startTime: '12:30 PM',
      duration: 45,
      status: 'planned',
    },
    {
      id: `${dayOfWeek}-social-studies`,
      subject: 'social-studies',
      startTime: '1:15 PM',
      duration: 30,
      status: 'planned',
    },
    {
      id: `${dayOfWeek}-reading-3`,
      subject: 'reading',
      startTime: '1:45 PM',
      duration: 30,
      status: 'planned',
    },
    {
      id: `${dayOfWeek}-dismissal`,
      subject: 'reading',
      startTime: '2:15 PM',
      duration: 15,
      status: 'planned',
    },
  ];

  const totalMinutes = blocks.reduce((sum, block) => sum + block.duration, 0);

  return {
    blocks,
    totalMinutes,
    dayOfWeek,
  };
}

/**
 * Gets the special for a specific day of the week
 */
export function getSpecialForDay(dayOfWeek: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday'): SpecialType {
  return SPECIALS_ROTATION[dayOfWeek];
}

/**
 * Finds the current active time block based on elapsed time
 */
export function getCurrentBlock(schedule: DailySchedule, currentTimeMinutes: number): TimeBlock | null {
  for (const block of schedule.blocks) {
    const blockStart = timeToMinutes(block.startTime);
    const blockEnd = blockStart + block.duration;

    if (currentTimeMinutes >= blockStart && currentTimeMinutes < blockEnd) {
      return block;
    }
  }

  return null;
}

/**
 * Finds the next scheduled block
 */
export function getNextBlock(schedule: DailySchedule, currentBlockId: string): TimeBlock | null {
  const currentIndex = schedule.blocks.findIndex(b => b.id === currentBlockId);
  if (currentIndex === -1 || currentIndex === schedule.blocks.length - 1) {
    return null;
  }

  return schedule.blocks[currentIndex + 1];
}

// ============ UTILITY FUNCTIONS ============

/**
 * Converts time string like "8:30 AM" to minutes since midnight
 */
export function timeToMinutes(timeStr: string): number {
  const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!match) return 0;

  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const period = match[3].toUpperCase();

  if (period === 'PM' && hours !== 12) {
    hours += 12;
  } else if (period === 'AM' && hours === 12) {
    hours = 0;
  }

  return hours * 60 + minutes;
}

/**
 * Converts minutes since midnight to time string like "8:30 AM"
 */
export function minutesToTime(minutes: number): string {
  const hours24 = Math.floor(minutes / 60);
  const mins = minutes % 60;

  const period = hours24 >= 12 ? 'PM' : 'AM';
  let hours12 = hours24 % 12;
  if (hours12 === 0) hours12 = 12;

  return `${hours12}:${mins.toString().padStart(2, '0')} ${period}`;
}

/**
 * Adds minutes to a time string
 */
export function addMinutesToTime(timeStr: string, minutesToAdd: number): string {
  const currentMinutes = timeToMinutes(timeStr);
  return minutesToTime(currentMinutes + minutesToAdd);
}
