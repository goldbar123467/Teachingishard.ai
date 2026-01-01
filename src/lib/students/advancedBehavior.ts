/**
 * Advanced Student Behavior Patterns
 * Personality-based behaviors: class clown, perfectionist, social butterfly, shy student
 */

import type { Student, Mood } from '../game/types';
import { shiftMood } from './behavior';

export interface BehaviorEvent {
  id: string;
  type: 'disruption' | 'stress' | 'social' | 'breakthrough';
  studentId: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  timestamp: number;
  effects: {
    mood?: number;
    engagement?: number;
    energy?: number;
    stress?: number;
    socialSkills?: number;
  };
}

export interface PersonalityBehaviorPattern {
  trait: string;
  behaviors: {
    positive: BehaviorGenerator[];
    negative: BehaviorGenerator[];
    neutral: BehaviorGenerator[];
  };
}

type BehaviorGenerator = (student: Student, context?: any) => BehaviorEvent | null;

// Class Clown Behaviors
export const classClownBehaviors: PersonalityBehaviorPattern = {
  trait: 'outgoing',
  behaviors: {
    positive: [
      (student: Student) => {
        if (student.engagement > 60 && Math.random() < 0.15) {
          return {
            id: `joke-${student.id}-${Date.now()}`,
            type: 'disruption',
            studentId: student.id,
            description: `${student.firstName} makes a clever joke that actually relates to the lesson, getting everyone engaged!`,
            severity: 'low',
            timestamp: Date.now(),
            effects: { engagement: 10, mood: 1, energy: -5 }
          };
        }
        return null;
      },
      (student: Student) => {
        if (student.mood === 'happy' && Math.random() < 0.1) {
          return {
            id: `entertain-${student.id}-${Date.now()}`,
            type: 'social',
            studentId: student.id,
            description: `${student.firstName} entertains classmates during group work, keeping morale high.`,
            severity: 'low',
            timestamp: Date.now(),
            effects: { socialSkills: 3, mood: 1 }
          };
        }
        return null;
      }
    ],
    negative: [
      (student: Student) => {
        if (student.mood === 'bored' && student.energy > 60 && Math.random() < 0.25) {
          return {
            id: `disrupt-${student.id}-${Date.now()}`,
            type: 'disruption',
            studentId: student.id,
            description: `${student.firstName} is making jokes and disrupting the lesson to get attention.`,
            severity: 'high',
            timestamp: Date.now(),
            effects: { engagement: -15, mood: 1, energy: -10 }
          };
        }
        return null;
      },
      (student: Student) => {
        if (student.engagement < 40 && Math.random() < 0.2) {
          return {
            id: `sidebar-${student.id}-${Date.now()}`,
            type: 'disruption',
            studentId: student.id,
            description: `${student.firstName} starts a side conversation, distracting nearby students.`,
            severity: 'medium',
            timestamp: Date.now(),
            effects: { engagement: -8, energy: -5 }
          };
        }
        return null;
      }
    ],
    neutral: [
      (student: Student) => {
        if (Math.random() < 0.1) {
          return {
            id: `performance-${student.id}-${Date.now()}`,
            type: 'social',
            studentId: student.id,
            description: `${student.firstName} is performing for their friends during transitions.`,
            severity: 'low',
            timestamp: Date.now(),
            effects: { socialSkills: 2, energy: -3 }
          };
        }
        return null;
      }
    ]
  }
};

// Perfectionist Behaviors
export const perfectionistBehaviors: PersonalityBehaviorPattern = {
  trait: 'perfectionist',
  behaviors: {
    positive: [
      (student: Student) => {
        if (student.academicLevel > 70 && Math.random() < 0.15) {
          return {
            id: `excellence-${student.id}-${Date.now()}`,
            type: 'breakthrough',
            studentId: student.id,
            description: `${student.firstName} produces exceptional work that exceeds expectations!`,
            severity: 'low',
            timestamp: Date.now(),
            effects: { mood: 2, engagement: 5, stress: -10 }
          };
        }
        return null;
      },
      (student: Student) => {
        if (student.engagement > 80 && Math.random() < 0.1) {
          return {
            id: `help-others-${student.id}-${Date.now()}`,
            type: 'social',
            studentId: student.id,
            description: `${student.firstName} helps struggling classmates reach the same high standards.`,
            severity: 'low',
            timestamp: Date.now(),
            effects: { socialSkills: 4, mood: 1 }
          };
        }
        return null;
      }
    ],
    negative: [
      (student: Student) => {
        if (student.academicLevel < 60 && Math.random() < 0.2) {
          return {
            id: `stress-${student.id}-${Date.now()}`,
            type: 'stress',
            studentId: student.id,
            description: `${student.firstName} is visibly stressed about not meeting their own high standards.`,
            severity: 'high',
            timestamp: Date.now(),
            effects: { mood: -2, stress: 20, energy: -10, engagement: -5 }
          };
        }
        return null;
      },
      (student: Student) => {
        if (student.mood === 'frustrated' && Math.random() < 0.15) {
          return {
            id: `anxiety-${student.id}-${Date.now()}`,
            type: 'stress',
            studentId: student.id,
            description: `${student.firstName} shows signs of test anxiety and perfectionism paralysis.`,
            severity: 'high',
            timestamp: Date.now(),
            effects: { mood: -1, stress: 15, engagement: -10 }
          };
        }
        return null;
      },
      (student: Student) => {
        if (student.energy < 30 && Math.random() < 0.1) {
          return {
            id: `burnout-${student.id}-${Date.now()}`,
            type: 'stress',
            studentId: student.id,
            description: `${student.firstName} is showing signs of burnout from self-imposed pressure.`,
            severity: 'medium',
            timestamp: Date.now(),
            effects: { mood: -1, stress: 10, energy: -15 }
          };
        }
        return null;
      }
    ],
    neutral: [
      (student: Student) => {
        if (Math.random() < 0.12) {
          return {
            id: `recheck-${student.id}-${Date.now()}`,
            type: 'stress',
            studentId: student.id,
            description: `${student.firstName} is checking and rechecking their work meticulously.`,
            severity: 'low',
            timestamp: Date.now(),
            effects: { stress: 5, energy: -5 }
          };
        }
        return null;
      }
    ]
  }
};

// Social Butterfly Behaviors
export const socialButterflyBehaviors: PersonalityBehaviorPattern = {
  trait: 'social',
  behaviors: {
    positive: [
      (student: Student) => {
        if (student.socialSkills > 70 && Math.random() < 0.15) {
          return {
            id: `mediate-${student.id}-${Date.now()}`,
            type: 'social',
            studentId: student.id,
            description: `${student.firstName} helps resolve a conflict between classmates with their social skills.`,
            severity: 'low',
            timestamp: Date.now(),
            effects: { socialSkills: 5, mood: 1, engagement: 5 }
          };
        }
        return null;
      },
      (student: Student) => {
        if (student.mood === 'happy' && Math.random() < 0.1) {
          return {
            id: `connector-${student.id}-${Date.now()}`,
            type: 'social',
            studentId: student.id,
            description: `${student.firstName} introduces shy students to each other, building class community.`,
            severity: 'low',
            timestamp: Date.now(),
            effects: { socialSkills: 4, mood: 1 }
          };
        }
        return null;
      }
    ],
    negative: [
      (student: Student) => {
        if (student.engagement < 50 && Math.random() < 0.2) {
          return {
            id: `gossip-${student.id}-${Date.now()}`,
            type: 'social',
            studentId: student.id,
            description: `${student.firstName} is spreading gossip about other students during class time.`,
            severity: 'high',
            timestamp: Date.now(),
            effects: { engagement: -10, socialSkills: -3, energy: -5 }
          };
        }
        return null;
      },
      (student: Student) => {
        if (student.mood === 'bored' && Math.random() < 0.15) {
          return {
            id: `drama-${student.id}-${Date.now()}`,
            type: 'social',
            studentId: student.id,
            description: `${student.firstName} is stirring up drama to make things more interesting.`,
            severity: 'medium',
            timestamp: Date.now(),
            effects: { engagement: -8, mood: -1 }
          };
        }
        return null;
      },
      (student: Student) => {
        if (Math.random() < 0.1) {
          return {
            id: `distracted-${student.id}-${Date.now()}`,
            type: 'disruption',
            studentId: student.id,
            description: `${student.firstName} is too focused on social interactions to pay attention to the lesson.`,
            severity: 'medium',
            timestamp: Date.now(),
            effects: { engagement: -12, academicLevel: -1 }
          };
        }
        return null;
      }
    ],
    neutral: [
      (student: Student) => {
        if (Math.random() < 0.15) {
          return {
            id: `network-${student.id}-${Date.now()}`,
            type: 'social',
            studentId: student.id,
            description: `${student.firstName} is chatting with everyone, maintaining their social network.`,
            severity: 'low',
            timestamp: Date.now(),
            effects: { socialSkills: 2, energy: -5 }
          };
        }
        return null;
      }
    ]
  }
};

// Shy Student Progression Behaviors
export const shyStudentBehaviors: PersonalityBehaviorPattern = {
  trait: 'shy',
  behaviors: {
    positive: [
      (student: Student) => {
        if (student.socialSkills > 40 && student.mood !== 'upset' && Math.random() < 0.1) {
          return {
            id: `breakthrough-${student.id}-${Date.now()}`,
            type: 'breakthrough',
            studentId: student.id,
            description: `${student.firstName} voluntarily participates in class - a huge step forward!`,
            severity: 'low',
            timestamp: Date.now(),
            effects: { socialSkills: 8, mood: 2, engagement: 10, stress: -5 }
          };
        }
        return null;
      },
      (student: Student) => {
        if (student.socialSkills > 35 && Math.random() < 0.08) {
          return {
            id: `small-group-${student.id}-${Date.now()}`,
            type: 'breakthrough',
            studentId: student.id,
            description: `${student.firstName} is more comfortable participating in small group discussions.`,
            severity: 'low',
            timestamp: Date.now(),
            effects: { socialSkills: 5, mood: 1, engagement: 5 }
          };
        }
        return null;
      },
      (student: Student) => {
        if (student.friendIds.length > 0 && Math.random() < 0.12) {
          return {
            id: `confidence-${student.id}-${Date.now()}`,
            type: 'breakthrough',
            studentId: student.id,
            description: `${student.firstName} shows increased confidence when working with friends.`,
            severity: 'low',
            timestamp: Date.now(),
            effects: { socialSkills: 4, mood: 1, stress: -3 }
          };
        }
        return null;
      }
    ],
    negative: [
      (student: Student) => {
        if (student.mood === 'upset' && Math.random() < 0.15) {
          return {
            id: `withdraw-${student.id}-${Date.now()}`,
            type: 'stress',
            studentId: student.id,
            description: `${student.firstName} is withdrawing further, avoiding all social interaction.`,
            severity: 'high',
            timestamp: Date.now(),
            effects: { socialSkills: -5, mood: -1, engagement: -10, stress: 10 }
          };
        }
        return null;
      },
      (student: Student) => {
        if (student.engagement < 30 && Math.random() < 0.1) {
          return {
            id: `anxiety-${student.id}-${Date.now()}`,
            type: 'stress',
            studentId: student.id,
            description: `${student.firstName} shows signs of social anxiety during group activities.`,
            severity: 'medium',
            timestamp: Date.now(),
            effects: { stress: 12, mood: -1, engagement: -8 }
          };
        }
        return null;
      }
    ],
    neutral: [
      (student: Student) => {
        if (Math.random() < 0.1) {
          return {
            id: `observe-${student.id}-${Date.now()}`,
            type: 'social',
            studentId: student.id,
            description: `${student.firstName} is quietly observing classmates, learning social cues.`,
            severity: 'low',
            timestamp: Date.now(),
            effects: { socialSkills: 1, stress: 2 }
          };
        }
        return null;
      }
    ]
  }
};

// Behavior Pattern Registry
export const BEHAVIOR_PATTERNS: Record<string, PersonalityBehaviorPattern> = {
  'outgoing': classClownBehaviors,
  'perfectionist': perfectionistBehaviors,
  'social': socialButterflyBehaviors,
  'shy': shyStudentBehaviors,
};

/**
 * Generate personality-based behavior events for a student
 */
export function generatePersonalityBehaviors(student: Student): BehaviorEvent[] {
  const events: BehaviorEvent[] = [];

  // Check primary trait
  const primaryPattern = BEHAVIOR_PATTERNS[student.primaryTrait];
  if (primaryPattern) {
    // Try to generate behaviors
    const tryGenerate = (generators: BehaviorGenerator[]) => {
      for (const generator of generators) {
        const event = generator(student);
        if (event) events.push(event);
      }
    };

    // Weight based on mood and engagement
    if (student.mood === 'happy' || student.mood === 'excited') {
      tryGenerate(primaryPattern.behaviors.positive);
    } else if (student.mood === 'frustrated' || student.mood === 'upset') {
      tryGenerate(primaryPattern.behaviors.negative);
    } else {
      tryGenerate(primaryPattern.behaviors.neutral);
    }
  }

  return events;
}

/**
 * Apply behavior event effects to a student
 */
export function applyBehaviorEffects(student: Student, event: BehaviorEvent): Student {
  const updated = { ...student };

  if (event.effects.mood !== undefined) {
    updated.mood = shiftMood(updated.mood, event.effects.mood);
  }

  if (event.effects.engagement !== undefined) {
    updated.engagement = Math.max(0, Math.min(100, updated.engagement + event.effects.engagement));
  }

  if (event.effects.energy !== undefined) {
    updated.energy = Math.max(0, Math.min(100, updated.energy + event.effects.energy));
  }

  if (event.effects.socialSkills !== undefined) {
    updated.socialSkills = Math.max(0, Math.min(100, updated.socialSkills + event.effects.socialSkills));
  }

  // Track behavior incidents for negative high-severity events
  if (event.type === 'disruption' && event.severity === 'high') {
    updated.behaviorIncidents = (updated.behaviorIncidents || 0) + 1;
  }

  return updated;
}

/**
 * Calculate stress level for a student (0-100)
 */
export function calculateStressLevel(student: Student): number {
  let stress = 30; // Base stress

  // Academic pressure
  if (student.primaryTrait === 'perfectionist') {
    stress += (100 - student.academicLevel) * 0.3;
  }

  // Social stress
  if (student.primaryTrait === 'shy') {
    stress += (100 - student.socialSkills) * 0.2;
  }

  // Workload stress
  if (!student.homeworkCompleted) {
    stress += 15;
  }

  // Mood affects stress
  const moodStress: Record<Mood, number> = {
    'excited': -10,
    'happy': -5,
    'neutral': 0,
    'bored': 5,
    'frustrated': 15,
    'upset': 25
  };
  stress += moodStress[student.mood];

  // Energy affects stress
  if (student.energy < 25) {
    stress += 20; // Exhaustion increases stress
  }

  // Social isolation increases stress
  if (student.friendIds.length === 0) {
    stress += 15;
  }

  return Math.max(0, Math.min(100, Math.round(stress)));
}

/**
 * Track shy student progression over time
 */
export interface ShyStudentProgress {
  studentId: string;
  startingSocialSkills: number;
  currentSocialSkills: number;
  breakthroughCount: number;
  participationCount: number;
  milestones: {
    firstParticipation?: number; // day number
    firstFriend?: number;
    firstVolunteerAnswer?: number;
    comfortableInGroups?: number;
  };
}

export function trackShyProgress(
  student: Student,
  previousSkills: number,
  event?: BehaviorEvent
): Partial<ShyStudentProgress> | null {
  if (student.primaryTrait !== 'shy') return null;

  const progress: Partial<ShyStudentProgress> = {
    studentId: student.id,
    currentSocialSkills: student.socialSkills,
  };

  // Track milestones
  if (event?.type === 'breakthrough') {
    progress.breakthroughCount = 1;

    if (event.description.includes('voluntarily participates')) {
      progress.milestones = { firstVolunteerAnswer: Date.now() };
    } else if (event.description.includes('small group')) {
      progress.milestones = { comfortableInGroups: Date.now() };
    }
  }

  // Track friend milestone
  if (student.friendIds.length > 0 && previousSkills < 40) {
    progress.milestones = { firstFriend: Date.now() };
  }

  return progress;
}
