import type { Lesson } from './types';

// ============ LESSON PLAN TYPES ============

export interface LearningObjective {
  id: string;
  description: string;
  completed: boolean;
}

export interface LessonMaterial {
  id: string;
  name: string;
  quantity?: number;
  required: boolean;
}

export type LessonPhase = 'intro' | 'main' | 'closing';

export type GroupingType = 'individual' | 'pairs' | 'small-group' | 'whole-class';

export interface LessonActivity {
  id: string;
  name: string;
  description: string;
  duration: number; // minutes
  phase: LessonPhase;
  grouping: GroupingType;
  materials: string[];
  order: number;
}

export type TeachingMethodType =
  | 'direct-instruction'
  | 'guided-practice'
  | 'collaborative-learning'
  | 'inquiry-based'
  | 'differentiated'
  | 'hands-on';

export interface LessonPlan {
  id: string;
  name: string;
  subject: Lesson['subject'];
  duration: number; // total minutes
  teachingMethod: TeachingMethodType;

  objectives: LearningObjective[];
  materials: LessonMaterial[];
  activities: LessonActivity[];

  createdAt: string;
  updatedAt: string;
}

// ============ SUBJECT CONSTANTS ============

export const SUBJECT_COLORS: Record<Lesson['subject'], string> = {
  math: 'bg-blue-500 dark:bg-blue-600',
  reading: 'bg-purple-500 dark:bg-purple-600',
  science: 'bg-green-500 dark:bg-green-600',
  'social-studies': 'bg-amber-500 dark:bg-amber-600',
  art: 'bg-pink-500 dark:bg-pink-600',
  pe: 'bg-orange-500 dark:bg-orange-600',
};

export const SUBJECT_ICONS: Record<Lesson['subject'], string> = {
  math: '🔢',
  reading: '📚',
  science: '🔬',
  'social-studies': '🌍',
  art: '🎨',
  pe: '⚽',
};

export const SUBJECT_LABELS: Record<Lesson['subject'], string> = {
  math: 'Math',
  reading: 'Reading & Writing',
  science: 'Science',
  'social-studies': 'Social Studies',
  art: 'Art',
  pe: 'PE',
};

export const PHASE_LABELS: Record<LessonPhase, string> = {
  intro: 'Introduction',
  main: 'Main Activity',
  closing: 'Closing/Review',
};

export const GROUPING_LABELS: Record<GroupingType, string> = {
  individual: 'Individual',
  pairs: 'Pairs',
  'small-group': 'Small Group',
  'whole-class': 'Whole Class',
};

export const METHOD_LABELS: Record<TeachingMethodType, string> = {
  'direct-instruction': 'Direct Instruction',
  'guided-practice': 'Guided Practice',
  'collaborative-learning': 'Collaborative Learning',
  'inquiry-based': 'Inquiry-Based',
  'differentiated': 'Differentiated',
  'hands-on': 'Hands-On',
};

// ============ VALIDATION HELPERS ============

export interface LessonPlanValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validates if a lesson plan fits within a time block
 */
export function validateLessonFit(
  lessonPlan: LessonPlan,
  blockDuration: number
): LessonPlanValidation {
  const errors: string[] = [];
  const warnings: string[] = [];

  const totalDuration = calculateTotalDuration(lessonPlan);

  // Check duration match
  if (totalDuration > blockDuration) {
    errors.push(
      `Lesson plan is ${totalDuration - blockDuration} minutes too long for this time block`
    );
  } else if (totalDuration < blockDuration - 10) {
    warnings.push(
      `Lesson plan is ${blockDuration - totalDuration} minutes shorter than the time block`
    );
  }

  // Check for required phases
  const phases = new Set(lessonPlan.activities.map(a => a.phase));
  if (!phases.has('intro')) {
    warnings.push('No introduction activity found');
  }
  if (!phases.has('main')) {
    errors.push('No main activity found');
  }
  if (!phases.has('closing')) {
    warnings.push('No closing/review activity found');
  }

  // Check for objectives
  if (lessonPlan.objectives.length === 0) {
    warnings.push('No learning objectives defined');
  }

  // Check for materials
  const requiredMaterials = lessonPlan.materials.filter(m => m.required);
  if (requiredMaterials.length === 0 && lessonPlan.teachingMethod === 'hands-on') {
    warnings.push('Hands-on lesson has no required materials');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Calculates the total duration of all activities in a lesson plan
 */
export function calculateTotalDuration(lessonPlan: LessonPlan): number {
  return lessonPlan.activities.reduce((sum, activity) => sum + activity.duration, 0);
}

/**
 * Groups activities by phase
 */
export function groupActivitiesByPhase(
  activities: LessonActivity[]
): Record<LessonPhase, LessonActivity[]> {
  return {
    intro: activities.filter(a => a.phase === 'intro').sort((a, b) => a.order - b.order),
    main: activities.filter(a => a.phase === 'main').sort((a, b) => a.order - b.order),
    closing: activities.filter(a => a.phase === 'closing').sort((a, b) => a.order - b.order),
  };
}

/**
 * Reorders activities after a drag-and-drop operation
 */
export function reorderActivities(
  activities: LessonActivity[],
  fromIndex: number,
  toIndex: number
): LessonActivity[] {
  const result = [...activities];
  const [removed] = result.splice(fromIndex, 1);
  result.splice(toIndex, 0, removed);

  // Update order values
  return result.map((activity, index) => ({
    ...activity,
    order: index,
  }));
}

/**
 * Creates a new empty lesson plan
 */
export function createEmptyLessonPlan(subject: Lesson['subject']): LessonPlan {
  return {
    id: crypto.randomUUID(),
    name: '',
    subject,
    duration: 45,
    teachingMethod: 'direct-instruction',
    objectives: [],
    materials: [],
    activities: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Duplicates a lesson plan with a new ID
 */
export function duplicateLessonPlan(lessonPlan: LessonPlan): LessonPlan {
  return {
    ...lessonPlan,
    id: crypto.randomUUID(),
    name: `${lessonPlan.name} (Copy)`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    objectives: lessonPlan.objectives.map(obj => ({
      ...obj,
      id: crypto.randomUUID(),
      completed: false,
    })),
    materials: lessonPlan.materials.map(mat => ({
      ...mat,
      id: crypto.randomUUID(),
    })),
    activities: lessonPlan.activities.map(act => ({
      ...act,
      id: crypto.randomUUID(),
    })),
  };
}

// ============ SCHEDULE ASSIGNMENT HELPERS ============

type TimeBlockWithAssignment = {
  id: string;
  duration: number;
  lessonPlanId?: string;
  [key: string]: any;
};

/**
 * Assigns a lesson plan to a time block
 */
export function assignLessonToBlock<T extends TimeBlockWithAssignment>(
  lessonPlanId: string,
  blockId: string,
  timeBlocks: T[]
): { success: boolean; error?: string; updatedBlocks?: T[] } {
  const block = timeBlocks.find(b => b.id === blockId);

  if (!block) {
    return { success: false, error: 'Time block not found' };
  }

  // Check if block already has a lesson assigned
  if (block.lessonPlanId) {
    return { success: false, error: 'Time block already has a lesson assigned' };
  }

  // Note: We can't validate lesson duration here without the actual lesson plan
  // That validation should happen in the component before calling this function

  const updatedBlocks = timeBlocks.map(b =>
    b.id === blockId ? { ...b, lessonPlanId } : b
  );

  return { success: true, updatedBlocks };
}

/**
 * Removes a lesson plan assignment from a time block
 */
export function unassignLessonFromBlock<T extends { id: string; lessonPlanId?: string; [key: string]: any }>(
  blockId: string,
  timeBlocks: T[]
): T[] {
  return timeBlocks.map(b =>
    b.id === blockId ? { ...b, lessonPlanId: undefined } : b
  );
}

/**
 * Gets the assigned lesson plan for a time block
 */
export function getAssignedLesson<T extends { id: string; lessonPlanId?: string }>(
  blockId: string,
  timeBlocks: T[],
  lessonPlans: LessonPlan[]
): LessonPlan | null {
  const block = timeBlocks.find(b => b.id === blockId);

  if (!block || !block.lessonPlanId) {
    return null;
  }

  return lessonPlans.find(lp => lp.id === block.lessonPlanId) || null;
}

/**
 * Gets lesson plans that are not yet assigned to any time block
 */
export function getUnassignedLessons<T extends { lessonPlanId?: string }>(
  lessonPlans: LessonPlan[],
  timeBlocks: T[]
): LessonPlan[] {
  const assignedIds = new Set(
    timeBlocks
      .filter(b => b.lessonPlanId)
      .map(b => b.lessonPlanId as string)
  );

  return lessonPlans.filter(lp => !assignedIds.has(lp.id));
}
