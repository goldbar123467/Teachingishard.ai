// ============ TIME TRACKING TYPES ============

export type PacingStatus = 'behind' | 'on-track' | 'ahead';

export type AlertType = 'warning' | 'urgent' | 'info';

export interface TimeAlert {
  id: string;
  type: AlertType;
  message: string;
  timestamp: number; // minutes elapsed when alert triggered
}

export interface TimeTracker {
  blockStartTime: Date;
  elapsedMinutes: number;
  remainingMinutes: number;
  totalMinutes: number;
  pacing: PacingStatus;
  alerts: TimeAlert[];
}

export interface EarlyFinishOption {
  id: string;
  name: string;
  description: string;
  engagementBoost: number;
  academicBoost: number;
  energyRecovery: number;
}

export interface OvertimeOption {
  id: string;
  name: string;
  description: string;
  nextBlockPenalty: number; // minutes lost from next block
  stressCost: number; // teacher energy cost
}

// ============ TIME TRACKING ============

/**
 * Creates a new time tracker for a time block
 */
export function createTimeTracker(
  blockDurationMinutes: number,
  startTime: Date = new Date()
): TimeTracker {
  return {
    blockStartTime: startTime,
    elapsedMinutes: 0,
    remainingMinutes: blockDurationMinutes,
    totalMinutes: blockDurationMinutes,
    pacing: 'on-track',
    alerts: [],
  };
}

/**
 * Updates the time tracker with elapsed time
 */
export function updateTimeTracker(
  tracker: TimeTracker,
  elapsedMinutes: number
): TimeTracker {
  const blockDuration = tracker.elapsedMinutes + tracker.remainingMinutes;
  const newElapsed = elapsedMinutes;
  const newRemaining = Math.max(0, blockDuration - newElapsed);

  // Generate new alerts
  const newAlerts = [...tracker.alerts];

  // 10-minute warning
  if (newRemaining <= 10 && newRemaining > 0 && tracker.remainingMinutes > 10) {
    newAlerts.push({
      id: `alert-10min-${Date.now()}`,
      type: 'warning',
      message: '10 minutes remaining in this block',
      timestamp: newElapsed,
    });
  }

  // 5-minute warning
  if (newRemaining <= 5 && newRemaining > 0 && tracker.remainingMinutes > 5) {
    newAlerts.push({
      id: `alert-5min-${Date.now()}`,
      type: 'urgent',
      message: '5 minutes remaining - wrap up soon',
      timestamp: newElapsed,
    });
  }

  // Overtime alert
  if (newRemaining === 0 && tracker.remainingMinutes > 0) {
    newAlerts.push({
      id: `alert-overtime-${Date.now()}`,
      type: 'urgent',
      message: 'Block time has ended - choose how to proceed',
      timestamp: newElapsed,
    });
  }

  return {
    ...tracker,
    elapsedMinutes: newElapsed,
    remainingMinutes: newRemaining,
    alerts: newAlerts,
  };
}

// ============ PACING CALCULATION ============

/**
 * Calculates pacing status based on lesson progress vs time elapsed
 */
export function calculatePacing(
  lessonProgress: number, // 0-100%
  timeProgress: number // 0-100% of block time elapsed
): PacingStatus {
  const difference = lessonProgress - timeProgress;

  // Behind: progress is significantly less than time elapsed
  if (difference < -15) {
    return 'behind';
  }

  // Ahead: progress is significantly more than time elapsed
  if (difference > 15) {
    return 'ahead';
  }

  // On track: within reasonable range
  return 'on-track';
}

/**
 * Updates tracker with pacing information
 */
export function updatePacing(
  tracker: TimeTracker,
  lessonProgress: number
): TimeTracker {
  const blockDuration = tracker.elapsedMinutes + tracker.remainingMinutes;
  const timeProgress = (tracker.elapsedMinutes / blockDuration) * 100;
  const pacing = calculatePacing(lessonProgress, timeProgress);

  // Generate pacing alerts
  const newAlerts = [...tracker.alerts];

  // Alert when falling behind
  if (pacing === 'behind' && tracker.pacing !== 'behind') {
    newAlerts.push({
      id: `alert-behind-${Date.now()}`,
      type: 'warning',
      message: 'Lesson is falling behind schedule',
      timestamp: tracker.elapsedMinutes,
    });
  }

  // Alert when getting ahead
  if (pacing === 'ahead' && tracker.pacing !== 'ahead') {
    newAlerts.push({
      id: `alert-ahead-${Date.now()}`,
      type: 'info',
      message: 'Lesson is ahead of schedule - might finish early',
      timestamp: tracker.elapsedMinutes,
    });
  }

  return {
    ...tracker,
    pacing,
    alerts: newAlerts,
  };
}

// ============ TIME ALERTS ============

/**
 * Gets all active alerts that haven't been dismissed
 */
export function getTimeAlerts(tracker: TimeTracker): TimeAlert[] {
  return tracker.alerts;
}

/**
 * Gets the most recent alert
 */
export function getLatestAlert(tracker: TimeTracker): TimeAlert | null {
  if (tracker.alerts.length === 0) return null;
  return tracker.alerts[tracker.alerts.length - 1];
}

/**
 * Clears alerts older than specified timestamp
 */
export function clearOldAlerts(tracker: TimeTracker, beforeTimestamp: number): TimeTracker {
  return {
    ...tracker,
    alerts: tracker.alerts.filter(alert => alert.timestamp >= beforeTimestamp),
  };
}

// ============ EARLY FINISH OPTIONS ============

const EARLY_FINISH_OPTIONS: EarlyFinishOption[] = [
  {
    id: 'free-reading',
    name: 'Free Reading Time',
    description: 'Let students read books of their choice. Relaxing and educational.',
    engagementBoost: 10,
    academicBoost: 2,
    energyRecovery: 5,
  },
  {
    id: 'review-game',
    name: 'Review Game',
    description: 'Quick quiz game to reinforce what was learned. Fun and educational.',
    engagementBoost: 15,
    academicBoost: 5,
    energyRecovery: 0,
  },
  {
    id: 'brain-break',
    name: 'Brain Break',
    description: 'Movement activity or stretching. Helps students reset energy.',
    engagementBoost: 8,
    academicBoost: 0,
    energyRecovery: 10,
  },
  {
    id: 'start-next',
    name: 'Start Next Subject Early',
    description: 'Get a head start on the next block. Adds time to next subject.',
    engagementBoost: -5,
    academicBoost: 0,
    energyRecovery: 0,
  },
  {
    id: 'silent-work',
    name: 'Silent Independent Work',
    description: 'Students work quietly on practice problems. Teacher can rest.',
    engagementBoost: 0,
    academicBoost: 3,
    energyRecovery: 15,
  },
];

/**
 * Gets available options when finishing a lesson early
 */
export function getEarlyFinishOptions(): EarlyFinishOption[] {
  return EARLY_FINISH_OPTIONS;
}

/**
 * Handles early finish choice and applies effects
 */
export function handleEarlyFinish(
  option: EarlyFinishOption,
  remainingMinutes: number
): {
  engagementChange: number;
  academicChange: number;
  energyRecovery: number;
  nextBlockBonus: number;
  message: string;
} {
  let nextBlockBonus = 0;

  if (option.id === 'start-next') {
    // Add remaining time to next block
    nextBlockBonus = remainingMinutes;
  }

  return {
    engagementChange: option.engagementBoost,
    academicChange: option.academicBoost,
    energyRecovery: option.energyRecovery,
    nextBlockBonus,
    message: `${option.name}: ${option.description}`,
  };
}

// ============ OVERTIME OPTIONS ============

const OVERTIME_OPTIONS: OvertimeOption[] = [
  {
    id: 'rush-through',
    name: 'Rush Through Content',
    description: 'Speed up to finish on time. May reduce quality but keeps schedule.',
    nextBlockPenalty: 0,
    stressCost: 10,
  },
  {
    id: 'skip-content',
    name: 'Skip Non-Essential Content',
    description: 'Cut out parts of the lesson to finish faster. Students miss some material.',
    nextBlockPenalty: 0,
    stressCost: 5,
  },
  {
    id: 'extend-5min',
    name: 'Extend 5 Minutes',
    description: 'Take 5 minutes from the next block to finish properly.',
    nextBlockPenalty: 5,
    stressCost: 5,
  },
  {
    id: 'extend-10min',
    name: 'Extend 10 Minutes',
    description: 'Take 10 minutes from the next block. Keeps lesson quality high.',
    nextBlockPenalty: 10,
    stressCost: 10,
  },
  {
    id: 'finish-later',
    name: 'Finish Later',
    description: 'Save remaining content for tomorrow. Students may forget context.',
    nextBlockPenalty: 0,
    stressCost: 3,
  },
];

/**
 * Gets available options when running out of time
 */
export function getOvertimeOptions(): OvertimeOption[] {
  return OVERTIME_OPTIONS;
}

/**
 * Handles overtime choice and applies effects
 */
export function handleOvertime(
  option: OvertimeOption,
  currentProgress: number
): {
  progressChange: number;
  nextBlockPenalty: number;
  stressCost: number;
  message: string;
} {
  let progressChange = 0;

  if (option.id === 'rush-through') {
    // Force complete the lesson but with reduced quality
    progressChange = 100 - currentProgress;
  } else if (option.id === 'skip-content') {
    // Mark as complete but students miss material
    progressChange = 100 - currentProgress;
  } else if (option.id === 'extend-5min' || option.id === 'extend-10min') {
    // Continue lesson into next block
    const extraProgress = option.nextBlockPenalty * 2; // 2% progress per minute
    progressChange = Math.min(extraProgress, 100 - currentProgress);
  } else if (option.id === 'finish-later') {
    // No immediate progress, will resume tomorrow
    progressChange = 0;
  }

  return {
    progressChange,
    nextBlockPenalty: option.nextBlockPenalty,
    stressCost: option.stressCost,
    message: `${option.name}: ${option.description}`,
  };
}

// ============ UTILITY FUNCTIONS ============

/**
 * Formats minutes as a time duration string
 */
export function formatDuration(minutes: number): string {
  if (minutes < 1) return 'less than a minute';
  if (minutes === 1) return '1 minute';
  if (minutes < 60) return `${minutes} minutes`;

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (remainingMinutes === 0) {
    return hours === 1 ? '1 hour' : `${hours} hours`;
  }

  return `${hours}h ${remainingMinutes}m`;
}

/**
 * Calculates progress percentage needed to stay on track
 */
export function getTargetProgress(elapsedMinutes: number, totalMinutes: number): number {
  return Math.round((elapsedMinutes / totalMinutes) * 100);
}

/**
 * Checks if a time warning should be shown
 */
export function shouldShowTimeWarning(
  remainingMinutes: number,
  lessonProgress: number
): boolean {
  // Show warning if less than 10 minutes remain and lesson not nearly done
  return remainingMinutes <= 10 && lessonProgress < 80;
}
