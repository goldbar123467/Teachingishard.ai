// ============ ENHANCED TIME MANAGEMENT SYSTEM ============
// Advanced time mechanics: rushing, deep diving, and time pressure events

import type { Student, Teacher } from './types';
import type { TimeTracker } from './timeTracking';

// ============ TIME PACING MODES ============
export type PacingMode = 'normal' | 'rushing' | 'deep-dive';

export interface TimePacingState {
  mode: PacingMode;
  normalContentCoverage: number; // 0-100, baseline content covered
  comprehensionMultiplier: number; // Multiplier for learning effectiveness
  energyDrainMultiplier: number; // Multiplier for energy consumption
  timeMultiplier: number; // How fast time passes (1.0 = normal)
}

// ============ TIME PRESSURE EVENTS ============
export interface TimePressureEvent {
  id: string;
  type: 'fire-drill' | 'assembly' | 'tech-issue' | 'interruption' | 'early-dismissal';
  title: string;
  description: string;
  minutesLost: number;
  canRecover: boolean; // Can you make up the time?
  stressImpact: number; // 0-100, affects teacher energy
  studentImpact: {
    engagementChange: number;
    energyChange: number;
  };
}

// ============ RUSHING MECHANIC ============
export interface RushingEffect {
  contentCovered: number; // 0-100, how much content was rushed through
  comprehensionPenalty: number; // 0-100, reduction in student understanding
  engagementChange: number; // -100 to 100
  stressGain: number; // 0-100, teacher stress increase
  timesSaved: number; // Minutes saved
}

export function applyRushing(
  currentProgress: number,
  targetProgress: number,
  remainingMinutes: number
): RushingEffect {
  const contentToRush = targetProgress - currentProgress;

  // Rushing penalties - reduced max penalty to prevent permanent damage
  // Penalty now caps at 15 points (was 50) to allow reasonable recovery
  // Diminishing returns: first 20% of rushed content is easier to absorb
  const easyContent = Math.min(20, contentToRush);
  const hardContent = Math.max(0, contentToRush - 20);
  const comprehensionPenalty = Math.min(15, easyContent * 0.2 + hardContent * 0.35);

  const engagementDrop = -Math.min(20, contentToRush * 0.2); // Reduced from 30
  const teacherStress = Math.min(30, contentToRush * 0.3); // Reduced from 40

  // Time saved (can rush at ~1.5x speed)
  const normalTime = remainingMinutes;
  const rushedTime = normalTime / 1.5;
  const timeSaved = normalTime - rushedTime;

  return {
    contentCovered: Math.min(100, currentProgress + contentToRush),
    comprehensionPenalty,
    engagementChange: engagementDrop,
    stressGain: teacherStress,
    timesSaved: Math.round(timeSaved),
  };
}

// ============ DEEP DIVE MECHANIC ============
export interface DeepDiveEffect {
  masteryGain: number; // 0-100, additional understanding
  engagementChange: number; // -100 to 100
  energyCost: number; // Additional teacher energy cost
  timeRequired: number; // Extra minutes needed
  studentBenefits: {
    academicBoost: number; // Long-term academic improvement
    retentionBonus: number; // Better retention of material
  };
}

export function applyDeepDive(
  currentProgress: number,
  topic: string,
  availableTime: number,
  teacherEnergy: number
): DeepDiveEffect {
  // Deep dive requires at least 10 minutes extra
  const baseTime = 10;
  const actualTime = Math.min(availableTime, baseTime + 5);

  // Energy cost scales with time
  const energyCost = Math.min(25, actualTime * 2);

  // Only effective if teacher has enough energy
  const effectiveness = Math.min(1, teacherEnergy / 50);

  const masteryGain = Math.round(20 * effectiveness); // Up to 20% mastery
  const engagementChange = Math.round(15 * effectiveness); // Students appreciate depth
  const academicBoost = Math.round(5 * effectiveness); // Long-term benefit
  const retentionBonus = Math.round(10 * effectiveness); // Better memory

  return {
    masteryGain,
    engagementChange,
    energyCost,
    timeRequired: actualTime,
    studentBenefits: {
      academicBoost,
      retentionBonus,
    },
  };
}

// ============ TIME PRESSURE EVENTS ============

export function createTimePressureEvent(
  type: TimePressureEvent['type'],
  currentMinute: number
): TimePressureEvent {
  const events: Record<TimePressureEvent['type'], Omit<TimePressureEvent, 'id'>> = {
    'fire-drill': {
      type: 'fire-drill',
      title: 'Fire Drill',
      description: 'Unexpected fire drill! Students must evacuate the building.',
      minutesLost: 15,
      canRecover: false,
      stressImpact: 20,
      studentImpact: {
        engagementChange: -15,
        energyChange: 5, // Brief outdoor break
      },
    },
    'assembly': {
      type: 'assembly',
      title: 'School Assembly',
      description: 'Mandatory school-wide assembly announced.',
      minutesLost: 25,
      canRecover: false,
      stressImpact: 30,
      studentImpact: {
        engagementChange: -10,
        energyChange: -5,
      },
    },
    'tech-issue': {
      type: 'tech-issue',
      title: 'Technology Failure',
      description: 'Smartboard/computer stopped working mid-lesson!',
      minutesLost: 8,
      canRecover: true,
      stressImpact: 25,
      studentImpact: {
        engagementChange: -20,
        energyChange: 0,
      },
    },
    'interruption': {
      type: 'interruption',
      title: 'Classroom Interruption',
      description: 'Office needs to speak with a student. Multiple students called to guidance.',
      minutesLost: 10,
      canRecover: true,
      stressImpact: 15,
      studentImpact: {
        engagementChange: -8,
        energyChange: 0,
      },
    },
    'early-dismissal': {
      type: 'early-dismissal',
      title: 'Early Dismissal',
      description: 'Weather-related early dismissal announced!',
      minutesLost: 20,
      canRecover: false,
      stressImpact: 35,
      studentImpact: {
        engagementChange: 10, // Students excited
        energyChange: 10,
      },
    },
  };

  return {
    id: crypto.randomUUID(),
    ...events[type],
  };
}

/**
 * Apply time pressure event to lesson
 */
export function applyTimePressureEvent(
  event: TimePressureEvent,
  timeTracker: TimeTracker,
  teacher: Teacher,
  students: Student[]
): {
  updatedTimeTracker: TimeTracker;
  updatedTeacher: Teacher;
  updatedStudents: Student[];
  message: string;
} {
  // Reduce available time
  const updatedTimeTracker = {
    ...timeTracker,
    elapsedMinutes: Math.min(
      timeTracker.totalMinutes,
      timeTracker.elapsedMinutes + event.minutesLost
    ),
  };

  // Apply teacher stress
  const updatedTeacher = {
    ...teacher,
    energy: Math.max(0, teacher.energy - event.stressImpact),
  };

  // Apply student impacts
  const updatedStudents = students.map(student => ({
    ...student,
    engagement: Math.max(0, Math.min(100, student.engagement + event.studentImpact.engagementChange)),
    energy: Math.max(0, Math.min(100, student.energy + event.studentImpact.energyChange)),
  }));

  const message = event.canRecover
    ? `${event.title}: ${event.description} You can try to make up the time by rushing or adjusting your lesson.`
    : `${event.title}: ${event.description} Time cannot be recovered.`;

  return {
    updatedTimeTracker,
    updatedTeacher,
    updatedStudents,
    message,
  };
}

// ============ PACING MODE EFFECTS ============

export function createPacingState(mode: PacingMode): TimePacingState {
  const modes: Record<PacingMode, TimePacingState> = {
    normal: {
      mode: 'normal',
      normalContentCoverage: 100,
      comprehensionMultiplier: 1.0,
      energyDrainMultiplier: 1.0,
      timeMultiplier: 1.0,
    },
    rushing: {
      mode: 'rushing',
      normalContentCoverage: 140, // Cover more content
      comprehensionMultiplier: 0.65, // But comprehension drops
      energyDrainMultiplier: 1.5, // More tiring for teacher
      timeMultiplier: 1.4, // Move faster through material
    },
    'deep-dive': {
      mode: 'deep-dive',
      normalContentCoverage: 60, // Cover less content
      comprehensionMultiplier: 1.5, // But much better comprehension
      energyDrainMultiplier: 1.3, // More intensive teaching
      timeMultiplier: 0.7, // Slower, more thorough
    },
  };

  return modes[mode];
}

/**
 * Apply pacing mode effects to students during teaching
 */
export function applyPacingEffects(
  students: Student[],
  pacingState: TimePacingState,
  baseAcademicGain: number,
  baseEngagementChange: number
): Student[] {
  return students.map(student => {
    // Academic gain modified by comprehension multiplier
    const adjustedAcademicGain = baseAcademicGain * pacingState.comprehensionMultiplier;

    // Engagement changes based on student personality
    let engagementModifier = 1.0;

    if (pacingState.mode === 'rushing') {
      // Some students hate rushing
      if (student.primaryTrait === 'perfectionist' || student.primaryTrait === 'analytical') {
        engagementModifier = 0.6; // -40% engagement
      } else if (student.primaryTrait === 'distracted') {
        engagementModifier = 1.1; // Distracted students might keep up better
      }
    } else if (pacingState.mode === 'deep-dive') {
      // Some students love deep dives
      if (student.primaryTrait === 'curious' || student.primaryTrait === 'analytical') {
        engagementModifier = 1.3; // +30% engagement
      } else if (student.primaryTrait === 'distracted') {
        engagementModifier = 0.7; // Distracted students lose focus
      }
    }

    const adjustedEngagementChange = baseEngagementChange * engagementModifier;

    return {
      ...student,
      academicLevel: Math.min(100, student.academicLevel + adjustedAcademicGain),
      engagement: Math.max(0, Math.min(100, student.engagement + adjustedEngagementChange)),
    };
  });
}

// ============ TIME MANAGEMENT DECISIONS ============

export interface TimeManagementChoice {
  id: string;
  label: string;
  description: string;
  mode: PacingMode | 'skip-ahead' | 'extend-time';
  effects: {
    contentImpact: string;
    studentImpact: string;
    teacherImpact: string;
  };
}

export function getTimeManagementOptions(
  remainingMinutes: number,
  currentProgress: number,
  teacherEnergy: number
): TimeManagementChoice[] {
  const options: TimeManagementChoice[] = [
    {
      id: 'normal',
      label: 'Continue Normal Pace',
      description: 'Maintain current teaching speed and depth',
      mode: 'normal',
      effects: {
        contentImpact: 'Standard content coverage',
        studentImpact: 'Normal comprehension and engagement',
        teacherImpact: 'Standard energy use',
      },
    },
  ];

  // Only show rushing if behind schedule
  if (currentProgress < 70 && remainingMinutes < 15) {
    options.push({
      id: 'rushing',
      label: 'Rush Through Material',
      description: 'Speed up to cover more content, but students may not fully understand',
      mode: 'rushing',
      effects: {
        contentImpact: '+40% content coverage',
        studentImpact: '-35% comprehension, -20% engagement',
        teacherImpact: '+50% energy drain, +30 stress',
      },
    });
  }

  // Only show deep dive if ahead of schedule and high energy
  if (currentProgress > 60 && remainingMinutes > 10 && teacherEnergy > 40) {
    options.push({
      id: 'deep-dive',
      label: 'Deep Dive',
      description: 'Slow down and explore the topic in greater depth',
      mode: 'deep-dive',
      effects: {
        contentImpact: '-40% content coverage',
        studentImpact: '+50% comprehension, +15% engagement, +5 long-term academic gain',
        teacherImpact: '+30% energy drain',
      },
    });
  }

  // Skip ahead option if way behind
  if (currentProgress < 40 && remainingMinutes < 10) {
    options.push({
      id: 'skip-ahead',
      label: 'Skip to Summary',
      description: 'Skip remaining content and jump to key takeaways',
      mode: 'skip-ahead',
      effects: {
        contentImpact: 'Skip 50-60% of planned content',
        studentImpact: '-60% comprehension, -25% engagement',
        teacherImpact: '-20 reputation, +40 stress',
      },
    });
  }

  return options;
}

/**
 * Check if a time pressure event should occur (random chance)
 */
export function shouldTriggerTimePressure(
  difficulty: 'easy' | 'normal' | 'hard',
  currentMinute: number
): boolean {
  const chances = {
    easy: 0.05,   // 5% chance per lesson
    normal: 0.12, // 12% chance
    hard: 0.20,   // 20% chance
  };

  return Math.random() < chances[difficulty];
}

/**
 * Select random time pressure event type
 */
export function selectRandomTimePressure(): TimePressureEvent['type'] {
  const types: TimePressureEvent['type'][] = [
    'fire-drill',
    'assembly',
    'tech-issue',
    'interruption',
    'early-dismissal',
  ];

  const weights = [0.1, 0.15, 0.35, 0.3, 0.1]; // More common: tech issues and interruptions

  const rand = Math.random();
  let cumulative = 0;

  for (let i = 0; i < types.length; i++) {
    cumulative += weights[i];
    if (rand <= cumulative) {
      return types[i];
    }
  }

  return 'interruption'; // Default fallback
}
