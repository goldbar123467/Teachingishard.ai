/**
 * Detention and Reward System
 * Consequences for behavior and academic performance
 */

import type { Student, Mood } from './types';
import { shiftMood } from '../students/behavior';

export type ConsequenceType = 'detention' | 'warning' | 'parent_contact' | 'reward' | 'privilege';

export interface Consequence {
  id: string;
  type: ConsequenceType;
  studentId: string;
  reason: string;
  date: number;
  severity: 'minor' | 'moderate' | 'major';
  resolved: boolean;
  effects?: {
    mood?: number;
    engagement?: number;
    behaviorModifier?: number;
  };
}

export interface Reward {
  id: string;
  type: 'sticker' | 'praise' | 'privilege' | 'certificate' | 'class_helper';
  studentId: string;
  reason: string;
  date: number;
  effects: {
    mood?: number;
    engagement?: number;
    motivation?: number;
  };
}

export interface DetentionRecord {
  studentId: string;
  detentions: Consequence[];
  warnings: number;
  totalIncidents: number;
  lastIncident?: number;
  onProbation: boolean;
}

// Escalation thresholds
const ESCALATION_LEVELS = {
  WARNING_THRESHOLD: 1,
  DETENTION_THRESHOLD: 3,
  PARENT_CONTACT_THRESHOLD: 5,
  PROBATION_THRESHOLD: 7,
};

/**
 * Determine if a behavior incident warrants consequences
 */
export function shouldIssueConsequence(
  student: Student,
  behaviorType: 'disruption' | 'homework' | 'respect' | 'safety',
  severity: 'minor' | 'moderate' | 'major'
): boolean {
  // Safety issues always warrant consequences
  if (behaviorType === 'safety') return true;

  // Major incidents always warrant consequences
  if (severity === 'major') return true;

  // For minor/moderate, consider student history
  const incidents = student.behaviorIncidents || 0;

  if (severity === 'moderate' && incidents >= 1) return true;
  if (severity === 'minor' && incidents >= 2) return true;

  return false;
}

/**
 * Issue appropriate consequence based on escalation level
 */
export function issueConsequence(
  student: Student,
  behaviorType: 'disruption' | 'homework' | 'respect' | 'safety',
  severity: 'minor' | 'moderate' | 'major',
  reason: string
): Consequence {
  const incidents = student.behaviorIncidents || 0;
  let type: ConsequenceType = 'warning';
  let consequenceSeverity: Consequence['severity'] = severity;

  // Escalation logic
  if (incidents >= ESCALATION_LEVELS.PARENT_CONTACT_THRESHOLD) {
    type = 'parent_contact';
    consequenceSeverity = 'major';
  } else if (incidents >= ESCALATION_LEVELS.DETENTION_THRESHOLD || severity === 'major') {
    type = 'detention';
    consequenceSeverity = severity === 'major' ? 'major' : 'moderate';
  } else if (incidents >= ESCALATION_LEVELS.WARNING_THRESHOLD) {
    type = 'warning';
  }

  // Safety issues escalate immediately
  if (behaviorType === 'safety') {
    type = 'detention';
    consequenceSeverity = 'major';
  }

  const consequence: Consequence = {
    id: `consequence-${student.id}-${Date.now()}`,
    type,
    studentId: student.id,
    reason,
    date: Date.now(),
    severity: consequenceSeverity,
    resolved: false,
    effects: calculateConsequenceEffects(type, consequenceSeverity)
  };

  return consequence;
}

/**
 * Calculate the effects of a consequence on student
 */
function calculateConsequenceEffects(
  type: ConsequenceType,
  severity: Consequence['severity']
): Consequence['effects'] {
  const effects: Consequence['effects'] = {};

  switch (type) {
    case 'warning':
      effects.mood = -1;
      effects.engagement = 5; // Warnings can refocus
      effects.behaviorModifier = 2;
      break;

    case 'detention':
      effects.mood = severity === 'major' ? -3 : -2;
      effects.engagement = severity === 'major' ? -10 : -5;
      effects.behaviorModifier = severity === 'major' ? 15 : 10;
      break;

    case 'parent_contact':
      effects.mood = -2;
      effects.engagement = -8;
      effects.behaviorModifier = 20;
      break;
  }

  return effects;
}

/**
 * Apply consequence effects to student
 */
export function applyConsequence(student: Student, consequence: Consequence): Student {
  const updated = { ...student };

  if (consequence.effects?.mood) {
    updated.mood = shiftMood(updated.mood, consequence.effects.mood);
  }

  if (consequence.effects?.engagement) {
    updated.engagement = Math.max(0, Math.min(100, updated.engagement + consequence.effects.engagement));
  }

  return updated;
}

/**
 * Student response to detention/consequence
 */
export function simulateConsequenceResponse(
  student: Student,
  consequence: Consequence
): {
  attitude: 'remorseful' | 'defiant' | 'neutral' | 'apologetic';
  behaviorImprovement: number; // 0-100
  description: string;
} {
  let attitude: 'remorseful' | 'defiant' | 'neutral' | 'apologetic' = 'neutral';
  let behaviorImprovement = 50; // Base improvement

  // Personality affects response
  if (student.primaryTrait === 'perfectionist') {
    attitude = 'remorseful';
    behaviorImprovement = 80;
  } else if (student.primaryTrait === 'outgoing') {
    attitude = Math.random() < 0.6 ? 'apologetic' : 'defiant';
    behaviorImprovement = attitude === 'apologetic' ? 60 : 30;
  } else if (student.primaryTrait === 'shy') {
    attitude = 'remorseful';
    behaviorImprovement = 70;
  } else if (student.primaryTrait === 'distracted') {
    attitude = 'neutral';
    behaviorImprovement = 40;
  }

  // Mood affects response
  if (student.mood === 'upset' || student.mood === 'frustrated') {
    behaviorImprovement -= 15;
    if (attitude === 'neutral') attitude = 'defiant';
  } else if (student.mood === 'happy') {
    behaviorImprovement += 10;
    if (attitude === 'neutral') attitude = 'apologetic';
  }

  // Severity affects response
  if (consequence.severity === 'major') {
    behaviorImprovement += 10; // Wake-up call
  }

  behaviorImprovement = Math.max(0, Math.min(100, behaviorImprovement));

  const descriptions = {
    remorseful: `${student.firstName} is genuinely remorseful and promises to do better.`,
    defiant: `${student.firstName} doesn't think the consequence was fair and is resistant.`,
    neutral: `${student.firstName} accepts the consequence without much reaction.`,
    apologetic: `${student.firstName} apologizes and seems to understand what they did wrong.`,
  };

  return {
    attitude,
    behaviorImprovement,
    description: descriptions[attitude]
  };
}

/**
 * Positive reinforcement system
 */
export function shouldIssueReward(
  student: Student,
  achievementType: 'academic' | 'behavior' | 'improvement' | 'helping' | 'participation'
): boolean {
  switch (achievementType) {
    case 'academic':
      return student.academicLevel > 80 && Math.random() < 0.15;

    case 'behavior':
      return student.engagement > 75 && student.behaviorIncidents === 0 && Math.random() < 0.12;

    case 'improvement':
      // Would need to track previous levels
      return student.engagement > 60 && Math.random() < 0.1;

    case 'helping':
      return student.socialSkills > 70 && Math.random() < 0.08;

    case 'participation':
      return student.engagement > 70 && Math.random() < 0.1;
  }

  return false;
}

/**
 * Issue a reward to a student
 */
export function issueReward(
  student: Student,
  achievementType: 'academic' | 'behavior' | 'improvement' | 'helping' | 'participation',
  reason: string
): Reward {
  // Determine reward type based on achievement
  let type: Reward['type'] = 'praise';

  if (achievementType === 'academic' && student.academicLevel > 90) {
    type = 'certificate';
  } else if (achievementType === 'behavior') {
    type = Math.random() < 0.5 ? 'sticker' : 'privilege';
  } else if (achievementType === 'helping') {
    type = 'class_helper';
  } else {
    type = Math.random() < 0.7 ? 'sticker' : 'praise';
  }

  const effects = calculateRewardEffects(type);

  return {
    id: `reward-${student.id}-${Date.now()}`,
    type,
    studentId: student.id,
    reason,
    date: Date.now(),
    effects
  };
}

/**
 * Calculate reward effects
 */
function calculateRewardEffects(type: Reward['type']): Reward['effects'] {
  const effects: Reward['effects'] = {};

  switch (type) {
    case 'sticker':
      effects.mood = 1;
      effects.engagement = 5;
      effects.motivation = 5;
      break;

    case 'praise':
      effects.mood = 2;
      effects.engagement = 8;
      effects.motivation = 8;
      break;

    case 'privilege':
      effects.mood = 2;
      effects.engagement = 10;
      effects.motivation = 12;
      break;

    case 'certificate':
      effects.mood = 3;
      effects.engagement = 12;
      effects.motivation = 15;
      break;

    case 'class_helper':
      effects.mood = 2;
      effects.engagement = 15;
      effects.motivation = 10;
      break;
  }

  return effects;
}

/**
 * Apply reward effects to student
 */
export function applyReward(student: Student, reward: Reward): Student {
  const updated = { ...student };

  if (reward.effects.mood) {
    updated.mood = shiftMood(updated.mood, reward.effects.mood);
  }

  if (reward.effects.engagement) {
    updated.engagement = Math.max(0, Math.min(100, updated.engagement + reward.effects.engagement));
  }

  // Track positive notes
  updated.positiveNotes = (updated.positiveNotes || 0) + 1;

  return updated;
}

/**
 * Track long-term behavior patterns
 */
export interface BehaviorTracking {
  studentId: string;
  weeklyIncidents: number[];
  trendDirection: 'improving' | 'stable' | 'declining';
  interventionNeeded: boolean;
  strengths: string[];
  concerns: string[];
}

export function analyzeBehaviorTrend(
  student: Student,
  historicalData?: { incidents: number[]; rewards: number[] }
): BehaviorTracking {
  const tracking: BehaviorTracking = {
    studentId: student.id,
    weeklyIncidents: historicalData?.incidents || [student.behaviorIncidents || 0],
    trendDirection: 'stable',
    interventionNeeded: false,
    strengths: [],
    concerns: []
  };

  // Analyze trend
  if (historicalData && historicalData.incidents.length >= 3) {
    const recent = historicalData.incidents.slice(-3);
    const average = recent.reduce((a, b) => a + b, 0) / recent.length;

    if (recent[2] < recent[0]) {
      tracking.trendDirection = 'improving';
    } else if (recent[2] > recent[0] && average > 2) {
      tracking.trendDirection = 'declining';
      tracking.interventionNeeded = true;
    }
  }

  // Identify strengths
  if (student.academicLevel > 70) tracking.strengths.push('Strong academic performance');
  if (student.socialSkills > 70) tracking.strengths.push('Good social skills');
  if (student.engagement > 70) tracking.strengths.push('Highly engaged');
  if ((student.positiveNotes || 0) > 3) tracking.strengths.push('Consistently positive behavior');

  // Identify concerns
  if (student.behaviorIncidents >= 3) tracking.concerns.push('Multiple behavior incidents');
  if (student.engagement < 40) tracking.concerns.push('Low engagement');
  if (student.friendIds.length === 0) tracking.concerns.push('Social isolation');
  if (!student.homeworkCompleted) tracking.concerns.push('Incomplete homework');

  return tracking;
}
