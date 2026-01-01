/**
 * AI Predictions Stub
 *
 * This module provides behavior prediction interfaces that can later be
 * replaced with XGBoost or other ML models. Currently uses heuristic-based
 * predictions that approximate what a trained model would predict.
 */

import type { Student, Lesson, TeachingMethod, HomeworkType } from '../game/types';
import { PERSONALITY_PROFILES } from '../students/personalities';

export interface BehaviorPrediction {
  engagementLikelihood: number;  // 0-1 probability of staying engaged
  disruptionRisk: number;        // 0-1 probability of disruption
  learningOutcome: number;       // 0-1 expected learning effectiveness
  moodTrajectory: 'improving' | 'stable' | 'declining';
}

export interface ClassPrediction {
  averageEngagement: number;     // 0-100 predicted class engagement
  struggleCount: number;         // Number of students likely to struggle
  disruptionRisk: number;        // 0-1 class-wide disruption probability
  recommendedInterventions: StudentIntervention[];
}

export interface StudentIntervention {
  studentId: string;
  studentName: string;
  reason: string;
  suggestedAction: 'praise' | 'help' | 'redirect' | 'check-in';
  priority: 'low' | 'medium' | 'high';
}

// Heuristic-based prediction (stub for XGBoost)
export function predictStudentBehavior(
  student: Student,
  lesson: Lesson,
  method: TeachingMethod
): BehaviorPrediction {
  const profile = PERSONALITY_PROFILES[student.primaryTrait];
  const styleMatch = method.bestFor.includes(student.learningStyle);

  // Engagement likelihood
  let engagementBase = student.engagement / 100;
  if (styleMatch) engagementBase += 0.15;
  if (student.energy > 60) engagementBase += 0.1;
  if (student.mood === 'happy' || student.mood === 'excited') engagementBase += 0.1;
  const engagementLikelihood = Math.min(1, Math.max(0, engagementBase));

  // Disruption risk
  let disruptionBase = 0.1;
  if (student.primaryTrait === 'distracted') disruptionBase += 0.2;
  if (student.primaryTrait === 'outgoing' && method.id === 'lecture') disruptionBase += 0.15;
  if (student.energy < 30) disruptionBase += 0.15;
  if (student.mood === 'bored') disruptionBase += 0.2;
  if (student.mood === 'frustrated') disruptionBase += 0.25;
  const disruptionRisk = Math.min(1, Math.max(0, disruptionBase));

  // Learning outcome
  let learningBase = 0.5;
  if (styleMatch) learningBase += 0.2;
  learningBase += (student.academicLevel / 100) * 0.2;
  learningBase += engagementLikelihood * 0.2;
  if (student.hasIEP && !styleMatch) learningBase -= 0.15;
  const learningOutcome = Math.min(1, Math.max(0, learningBase));

  // Mood trajectory
  let moodTrajectory: 'improving' | 'stable' | 'declining' = 'stable';
  if (styleMatch && method.engagementModifier > 5) {
    moodTrajectory = 'improving';
  } else if (!styleMatch && lesson.difficulty === 3 && student.academicLevel < 50) {
    moodTrajectory = 'declining';
  }

  return {
    engagementLikelihood,
    disruptionRisk,
    learningOutcome,
    moodTrajectory,
  };
}

// Predict class-wide outcomes
export function predictClassOutcome(
  students: Student[],
  lesson: Lesson,
  method: TeachingMethod
): ClassPrediction {
  const predictions = students.map(s => ({
    student: s,
    prediction: predictStudentBehavior(s, lesson, method),
  }));

  // Calculate averages
  const avgEngagement = predictions.reduce(
    (sum, p) => sum + p.prediction.engagementLikelihood, 0
  ) / students.length * 100;

  const struggleCount = predictions.filter(
    p => p.prediction.learningOutcome < 0.4 || p.prediction.engagementLikelihood < 0.3
  ).length;

  const classDisruption = predictions.reduce(
    (sum, p) => sum + p.prediction.disruptionRisk, 0
  ) / students.length;

  // Generate interventions
  const interventions: StudentIntervention[] = [];

  for (const { student, prediction } of predictions) {
    if (prediction.disruptionRisk > 0.5) {
      interventions.push({
        studentId: student.id,
        studentName: `${student.firstName} ${student.lastName}`,
        reason: 'High disruption risk',
        suggestedAction: 'redirect',
        priority: prediction.disruptionRisk > 0.7 ? 'high' : 'medium',
      });
    } else if (prediction.learningOutcome < 0.35) {
      interventions.push({
        studentId: student.id,
        studentName: `${student.firstName} ${student.lastName}`,
        reason: 'May struggle with material',
        suggestedAction: 'help',
        priority: student.hasIEP ? 'high' : 'medium',
      });
    } else if (prediction.moodTrajectory === 'declining') {
      interventions.push({
        studentId: student.id,
        studentName: `${student.firstName} ${student.lastName}`,
        reason: 'Mood may worsen',
        suggestedAction: 'check-in',
        priority: 'low',
      });
    }
  }

  // Sort by priority
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  interventions.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  return {
    averageEngagement: Math.round(avgEngagement),
    struggleCount,
    disruptionRisk: classDisruption,
    recommendedInterventions: interventions.slice(0, 5), // Top 5
  };
}

// Predict homework completion for class
export function predictHomeworkCompletion(
  students: Student[],
  homeworkType: HomeworkType
): { expectedCompletion: number; atRiskStudents: string[] } {
  if (homeworkType === 'none') {
    return { expectedCompletion: 100, atRiskStudents: [] };
  }

  const baseDifficulty = { light: 0.9, moderate: 0.75, heavy: 0.55, none: 1 }[homeworkType];
  const atRiskStudents: string[] = [];
  let totalChance = 0;

  for (const student of students) {
    let chance = baseDifficulty;

    // Adjust for student factors
    chance += (student.academicLevel - 50) / 200;
    chance += (student.engagement - 50) / 200;

    if (student.primaryTrait === 'perfectionist') chance += 0.1;
    if (student.primaryTrait === 'distracted') chance -= 0.15;

    chance = Math.min(1, Math.max(0, chance));
    totalChance += chance;

    if (chance < 0.6) {
      atRiskStudents.push(`${student.firstName} ${student.lastName}`);
    }
  }

  return {
    expectedCompletion: Math.round((totalChance / students.length) * 100),
    atRiskStudents,
  };
}

// Feature vector for future XGBoost integration
export interface StudentFeatureVector {
  academicLevel: number;
  engagement: number;
  energy: number;
  socialSkills: number;
  moodScore: number;
  primaryTraitEncoded: number;
  learningStyleEncoded: number;
  hasIEP: number;
  isGifted: number;
  homeworkStreak: number;
  recentTestAvg: number;
}

// Extract features for ML (stub for XGBoost)
export function extractFeatures(student: Student): StudentFeatureVector {
  const traitEncoding: Record<string, number> = {
    shy: 0, outgoing: 1, curious: 2, distracted: 3,
    perfectionist: 4, creative: 5, analytical: 6, social: 7,
  };

  const styleEncoding: Record<string, number> = {
    visual: 0, auditory: 1, kinesthetic: 2, reading: 3,
  };

  const moodScores: Record<string, number> = {
    upset: 0, frustrated: 1, bored: 2, neutral: 3, happy: 4, excited: 5,
  };

  return {
    academicLevel: student.academicLevel / 100,
    engagement: student.engagement / 100,
    energy: student.energy / 100,
    socialSkills: student.socialSkills / 100,
    moodScore: moodScores[student.mood] / 5,
    primaryTraitEncoded: traitEncoding[student.primaryTrait] / 7,
    learningStyleEncoded: styleEncoding[student.learningStyle] / 3,
    hasIEP: student.hasIEP ? 1 : 0,
    isGifted: student.isGifted ? 1 : 0,
    homeworkStreak: student.homeworkCompleted ? 1 : 0, // Simplified
    recentTestAvg: student.testScores.length > 0
      ? student.testScores.slice(-3).reduce((a, b) => a + b, 0) / Math.min(3, student.testScores.length) / 100
      : 0.5,
  };
}
