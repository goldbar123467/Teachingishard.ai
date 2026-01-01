/**
 * Emergent Behavior Engine
 * Generates context-aware student actions based on personality, mood, and surroundings
 */

import type { Student, Mood } from '../game/types';
import { PERSONALITY_PROFILES } from './personalities';

export interface BehaviorContext {
  currentActivity: 'lesson' | 'transition' | 'groupwork' | 'independent' | 'recess' | 'test';
  nearbyStudents: Student[]; // Students in physical proximity
  recentEvents: string[]; // What just happened in class
  timeOfDay: 'morning' | 'midday' | 'afternoon';
  teacherAttention: 'focused' | 'distracted' | 'absent';
}

export interface EmergentAction {
  studentId: string;
  action: string;
  description: string;
  isDisruptive: boolean;
  isVisible: boolean; // Can teacher see this?
  affectsStudents: string[]; // Other students affected
  moodImpact: number; // -10 to +10 impact on student's mood
}

/**
 * Generate a personality-driven action based on current context
 */
export function generateEmergentAction(
  student: Student,
  context: BehaviorContext
): EmergentAction | null {
  const profile = PERSONALITY_PROFILES[student.primaryTrait];
  const isLowEnergy = student.energy < 40;
  const isNegativeMood = ['bored', 'frustrated', 'upset'].includes(student.mood);

  // Check if triggers are present
  const triggeredPositive = checkPositiveTriggers(student, context, profile);
  const triggeredNegative = checkNegativeTriggers(student, context, profile);

  // Low energy + negative mood = higher chance of disruptive behavior
  const disruptionChance = isLowEnergy && isNegativeMood ? 0.4 : 0.15;

  if (triggeredNegative && Math.random() < disruptionChance) {
    return generateNegativeBehavior(student, context);
  }

  if (triggeredPositive) {
    return generatePositiveBehavior(student, context);
  }

  // Personality-driven spontaneous actions
  return generatePersonalityAction(student, context);
}

/**
 * Check if positive triggers are present in context
 */
function checkPositiveTriggers(
  student: Student,
  context: BehaviorContext,
  profile: typeof PERSONALITY_PROFILES[keyof typeof PERSONALITY_PROFILES]
): boolean {
  const triggers = profile.triggers.positive.map(t => t.toLowerCase());

  if (context.currentActivity === 'groupwork' && triggers.some(t => t.includes('group') || t.includes('collaboration'))) {
    return true;
  }

  if (context.currentActivity === 'lesson' && triggers.some(t => t.includes('new topic') || t.includes('discovery'))) {
    return true;
  }

  return false;
}

/**
 * Check if negative triggers are present
 */
function checkNegativeTriggers(
  student: Student,
  context: BehaviorContext,
  profile: typeof PERSONALITY_PROFILES[keyof typeof PERSONALITY_PROFILES]
): boolean {
  const triggers = profile.triggers.negative.map(t => t.toLowerCase());

  if (context.currentActivity === 'independent' && triggers.some(t => t.includes('alone') || t.includes('individual'))) {
    return true;
  }

  if (context.currentActivity === 'test' && triggers.some(t => t.includes('rushed') || t.includes('mistake'))) {
    return true;
  }

  if (context.teacherAttention === 'focused' && triggers.some(t => t.includes('center of attention') || t.includes('called on'))) {
    return true;
  }

  return false;
}

/**
 * Generate behavior when negative triggers are activated
 */
function generateNegativeBehavior(
  student: Student,
  context: BehaviorContext
): EmergentAction {
  const profile = PERSONALITY_PROFILES[student.primaryTrait];
  const quirks = profile.quirks;

  const behaviors: EmergentAction[] = [];

  // Shy student called on unexpectedly
  if (student.primaryTrait === 'shy' && context.teacherAttention === 'focused') {
    behaviors.push({
      studentId: student.id,
      action: 'freeze',
      description: `${student.firstName} freezes up and ${quirks[0]?.toLowerCase() || 'looks down nervously'}`,
      isDisruptive: false,
      isVisible: true,
      affectsStudents: [],
      moodImpact: -5,
    });
  }

  // Distracted student during long lesson
  if (student.primaryTrait === 'distracted' && context.currentActivity === 'lesson') {
    behaviors.push({
      studentId: student.id,
      action: 'daydream',
      description: `${student.firstName} ${quirks[1]?.toLowerCase() || 'stares out the window'}`,
      isDisruptive: context.teacherAttention === 'focused',
      isVisible: true,
      affectsStudents: [],
      moodImpact: -2,
    });
  }

  // Outgoing student working alone
  if (student.primaryTrait === 'outgoing' && context.currentActivity === 'independent') {
    const nearbyStudent = context.nearbyStudents[0];
    if (nearbyStudent) {
      behaviors.push({
        studentId: student.id,
        action: 'distract_peer',
        description: `${student.firstName} tries to start a conversation with ${nearbyStudent.firstName}`,
        isDisruptive: true,
        isVisible: context.teacherAttention === 'focused',
        affectsStudents: [nearbyStudent.id],
        moodImpact: 3, // They feel better socializing
      });
    }
  }

  // Perfectionist making mistakes
  if (student.primaryTrait === 'perfectionist' && context.currentActivity === 'test') {
    behaviors.push({
      studentId: student.id,
      action: 'erase_repeatedly',
      description: `${student.firstName} ${quirks[0]?.toLowerCase() || 'erases and rewrites the same answer'}`,
      isDisruptive: false,
      isVisible: true,
      affectsStudents: [],
      moodImpact: -4,
    });
  }

  return behaviors.length > 0
    ? behaviors[Math.floor(Math.random() * behaviors.length)]
    : generateDefaultNegative(student);
}

/**
 * Generate behavior when positive triggers are activated
 */
function generatePositiveBehavior(
  student: Student,
  context: BehaviorContext
): EmergentAction {
  const profile = PERSONALITY_PROFILES[student.primaryTrait];
  const quirks = profile.quirks;

  const behaviors: EmergentAction[] = [];

  // Curious student with new topic
  if (student.primaryTrait === 'curious' && context.currentActivity === 'lesson') {
    behaviors.push({
      studentId: student.id,
      action: 'engage_enthusiastically',
      description: `${student.firstName}'s ${quirks[3]?.toLowerCase() || 'eyes light up'} as they lean forward`,
      isDisruptive: false,
      isVisible: true,
      affectsStudents: [],
      moodImpact: 5,
    });
  }

  // Outgoing student in group work
  if (student.primaryTrait === 'outgoing' && context.currentActivity === 'groupwork') {
    behaviors.push({
      studentId: student.id,
      action: 'lead_group',
      description: `${student.firstName} naturally takes the lead and ${quirks[0]?.toLowerCase() || 'energizes the group'}`,
      isDisruptive: false,
      isVisible: true,
      affectsStudents: context.nearbyStudents.map(s => s.id),
      moodImpact: 7,
    });
  }

  // Social student helping others
  if (student.primaryTrait === 'social' && context.nearbyStudents.length > 0) {
    const needyStudent = context.nearbyStudents.find(s => s.energy < 50 || s.mood === 'frustrated');
    if (needyStudent) {
      behaviors.push({
        studentId: student.id,
        action: 'help_peer',
        description: `${student.firstName} ${quirks[3]?.toLowerCase() || 'notices'} ${needyStudent.firstName} struggling and offers help`,
        isDisruptive: false,
        isVisible: true,
        affectsStudents: [needyStudent.id],
        moodImpact: 6,
      });
    }
  }

  // Creative student with art project
  if (student.primaryTrait === 'creative' && context.currentActivity === 'independent') {
    behaviors.push({
      studentId: student.id,
      action: 'creative_flow',
      description: `${student.firstName} ${quirks[1]?.toLowerCase() || 'hums while working'}, lost in creative flow`,
      isDisruptive: false,
      isVisible: true,
      affectsStudents: [],
      moodImpact: 8,
    });
  }

  return behaviors.length > 0
    ? behaviors[Math.floor(Math.random() * behaviors.length)]
    : generateDefaultPositive(student);
}

/**
 * Generate spontaneous personality-driven actions
 */
function generatePersonalityAction(
  student: Student,
  context: BehaviorContext
): EmergentAction | null {
  const profile = PERSONALITY_PROFILES[student.primaryTrait];
  const habits = profile.classroomHabits;
  const behaviors = profile.socialBehaviors;

  // Only generate spontaneous actions 30% of the time
  if (Math.random() > 0.3) return null;

  const spontaneousActions: EmergentAction[] = [];

  // During transitions
  if (context.currentActivity === 'transition') {
    if (student.primaryTrait === 'curious') {
      spontaneousActions.push({
        studentId: student.id,
        action: 'explore',
        description: `${student.firstName} ${habits[2]?.toLowerCase() || 'explores materials'} during the transition`,
        isDisruptive: false,
        isVisible: true,
        affectsStudents: [],
        moodImpact: 2,
      });
    }

    if (student.primaryTrait === 'social' && context.nearbyStudents.length > 0) {
      spontaneousActions.push({
        studentId: student.id,
        action: 'socialize',
        description: `${student.firstName} ${behaviors[0]?.toLowerCase() || 'chats with nearby students'}`,
        isDisruptive: false,
        isVisible: true,
        affectsStudents: context.nearbyStudents.slice(0, 2).map(s => s.id),
        moodImpact: 3,
      });
    }
  }

  // Random quirk manifestation
  const randomQuirk = profile.quirks[Math.floor(Math.random() * profile.quirks.length)];
  if (randomQuirk && context.teacherAttention !== 'focused') {
    spontaneousActions.push({
      studentId: student.id,
      action: 'quirk',
      description: `${student.firstName} ${randomQuirk.toLowerCase()}`,
      isDisruptive: false,
      isVisible: context.teacherAttention !== 'absent',
      affectsStudents: [],
      moodImpact: 0,
    });
  }

  return spontaneousActions.length > 0
    ? spontaneousActions[Math.floor(Math.random() * spontaneousActions.length)]
    : null;
}

/**
 * Chain reactions - one student's action triggers another's
 */
export function generateChainReaction(
  triggeringAction: EmergentAction,
  affectedStudent: Student,
  allStudents: Student[]
): EmergentAction | null {
  const triggeringStudent = allStudents.find(s => s.id === triggeringAction.studentId);
  if (!triggeringStudent) return null;

  const profile = PERSONALITY_PROFILES[affectedStudent.primaryTrait];

  // Outgoing students join in on laughter/fun
  if (triggeringAction.action.includes('laugh') || triggeringAction.action.includes('joke')) {
    if (affectedStudent.primaryTrait === 'outgoing' || affectedStudent.primaryTrait === 'social') {
      return {
        studentId: affectedStudent.id,
        action: 'join_laughter',
        description: `${affectedStudent.firstName} ${profile.quirks[2]?.toLowerCase() || 'laughs along'} with ${triggeringStudent.firstName}`,
        isDisruptive: true,
        isVisible: true,
        affectsStudents: [],
        moodImpact: 4,
      };
    }
  }

  // Distracted students get distracted by disruptions
  if (triggeringAction.isDisruptive && affectedStudent.primaryTrait === 'distracted') {
    return {
      studentId: affectedStudent.id,
      action: 'get_distracted',
      description: `${affectedStudent.firstName} loses focus watching ${triggeringStudent.firstName}`,
      isDisruptive: false,
      isVisible: true,
      affectsStudents: [],
      moodImpact: -2,
    };
  }

  // Analytical students get annoyed by disruptions
  if (triggeringAction.isDisruptive && affectedStudent.primaryTrait === 'analytical') {
    return {
      studentId: affectedStudent.id,
      action: 'show_annoyance',
      description: `${affectedStudent.firstName} shoots an annoyed look at ${triggeringStudent.firstName}`,
      isDisruptive: false,
      isVisible: true,
      affectsStudents: [triggeringStudent.id],
      moodImpact: -3,
    };
  }

  return null;
}

/**
 * Default negative behavior when no specific match
 */
function generateDefaultNegative(student: Student): EmergentAction {
  return {
    studentId: student.id,
    action: 'low_engagement',
    description: `${student.firstName} seems disengaged`,
    isDisruptive: false,
    isVisible: true,
    affectsStudents: [],
    moodImpact: -1,
  };
}

/**
 * Default positive behavior when no specific match
 */
function generateDefaultPositive(student: Student): EmergentAction {
  return {
    studentId: student.id,
    action: 'engage',
    description: `${student.firstName} is engaged and focused`,
    isDisruptive: false,
    isVisible: true,
    affectsStudents: [],
    moodImpact: 2,
  };
}
