// ============ GRADING SYSTEM ============
// Comprehensive grading and assessment system for teacher simulation

import type { Student } from './types';

// ============ GRADE TYPES ============
export type LetterGrade = 'A+' | 'A' | 'A-' | 'B+' | 'B' | 'B-' | 'C+' | 'C' | 'C-' | 'D+' | 'D' | 'D-' | 'F';

export type AssignmentType =
  | 'homework'
  | 'quiz'
  | 'test'
  | 'project'
  | 'participation'
  | 'presentation'
  | 'classwork';

export type GradingCriteria = {
  id: string;
  name: string;
  description: string;
  maxPoints: number;
  weight: number; // Percentage of total grade (0-100)
};

export type RubricLevel = {
  level: 'excellent' | 'proficient' | 'developing' | 'beginning' | 'incomplete';
  description: string;
  pointsEarned: number;
  maxPoints: number;
};

// ============ ASSIGNMENT MODEL ============
export interface Assignment {
  id: string;
  name: string;
  type: AssignmentType;
  subject: 'math' | 'reading' | 'science' | 'social-studies' | 'art' | 'pe';
  dueDate: string; // ISO date string
  assignedDate: string;
  maxPoints: number;
  weight: number; // Weight in overall grade calculation
  rubric?: GradingCriteria[];
  instructions: string;
  difficulty: 1 | 2 | 3;
}

// ============ STUDENT GRADE ============
export interface StudentGrade {
  id: string;
  studentId: string;
  assignmentId: string;
  pointsEarned: number;
  maxPoints: number;
  percentageScore: number; // 0-100
  letterGrade: LetterGrade;
  rubricScores?: Record<string, number>; // criteriaId -> points earned
  feedback: string;
  gradedDate?: string;
  submitted: boolean;
  lateSubmission: boolean;
  excused: boolean;
}

// ============ GRADEBOOK ============
export interface Gradebook {
  assignments: Assignment[];
  grades: StudentGrade[];
  weights: Record<AssignmentType, number>; // Category weights
}

// ============ GRADE CALCULATION ============

/**
 * Convert a numerical score (0-100) to a letter grade
 */
export function calculateLetterGrade(percentage: number): LetterGrade {
  if (percentage >= 97) return 'A+';
  if (percentage >= 93) return 'A';
  if (percentage >= 90) return 'A-';
  if (percentage >= 87) return 'B+';
  if (percentage >= 83) return 'B';
  if (percentage >= 80) return 'B-';
  if (percentage >= 77) return 'C+';
  if (percentage >= 73) return 'C';
  if (percentage >= 70) return 'C-';
  if (percentage >= 67) return 'D+';
  if (percentage >= 63) return 'D';
  if (percentage >= 60) return 'D-';
  return 'F';
}

/**
 * Calculate overall grade for a student across all assignments
 */
export function calculateOverallGrade(
  studentId: string,
  gradebook: Gradebook
): {
  percentage: number;
  letterGrade: LetterGrade;
  breakdown: Record<AssignmentType, { percentage: number; weight: number }>;
} {
  const studentGrades = gradebook.grades.filter(g => g.studentId === studentId && !g.excused);

  if (studentGrades.length === 0) {
    return {
      percentage: 0,
      letterGrade: 'F',
      breakdown: {} as Record<AssignmentType, { percentage: number; weight: number }>,
    };
  }

  // Group grades by assignment type
  const gradesByType = new Map<AssignmentType, StudentGrade[]>();

  for (const grade of studentGrades) {
    const assignment = gradebook.assignments.find(a => a.id === grade.assignmentId);
    if (!assignment) continue;

    if (!gradesByType.has(assignment.type)) {
      gradesByType.set(assignment.type, []);
    }
    gradesByType.get(assignment.type)!.push(grade);
  }

  // Calculate average for each type
  const breakdown: Record<AssignmentType, { percentage: number; weight: number }> = {} as any;
  let weightedSum = 0;
  let totalWeight = 0;

  for (const [type, grades] of gradesByType.entries()) {
    const typeWeight = gradebook.weights[type] || 0;
    const typeAverage = grades.reduce((sum, g) => sum + g.percentageScore, 0) / grades.length;

    breakdown[type] = {
      percentage: typeAverage,
      weight: typeWeight,
    };

    weightedSum += typeAverage * (typeWeight / 100);
    totalWeight += typeWeight;
  }

  // Normalize if weights don't add to 100
  const finalPercentage = totalWeight > 0 ? (weightedSum / totalWeight) * 100 : 0;

  return {
    percentage: Math.round(finalPercentage * 100) / 100,
    letterGrade: calculateLetterGrade(finalPercentage),
    breakdown,
  };
}

/**
 * Grade an assignment using rubric criteria
 */
export function gradeWithRubric(
  assignment: Assignment,
  criteriaScores: Record<string, number> // criteriaId -> points earned
): {
  pointsEarned: number;
  maxPoints: number;
  percentage: number;
  letterGrade: LetterGrade;
} {
  if (!assignment.rubric || assignment.rubric.length === 0) {
    throw new Error('Assignment does not have a rubric');
  }

  let totalEarned = 0;
  let totalMax = 0;

  for (const criteria of assignment.rubric) {
    const earned = criteriaScores[criteria.id] || 0;
    const max = criteria.maxPoints;

    // Validate earned points
    if (earned > max) {
      throw new Error(`Points earned (${earned}) exceeds max points (${max}) for criteria ${criteria.name}`);
    }

    totalEarned += earned;
    totalMax += max;
  }

  const percentage = totalMax > 0 ? (totalEarned / totalMax) * 100 : 0;

  return {
    pointsEarned: totalEarned,
    maxPoints: totalMax,
    percentage: Math.round(percentage * 100) / 100,
    letterGrade: calculateLetterGrade(percentage),
  };
}

/**
 * Create a default rubric for an assignment type
 */
export function createDefaultRubric(type: AssignmentType): GradingCriteria[] {
  const baseRubrics: Record<AssignmentType, GradingCriteria[]> = {
    homework: [
      {
        id: 'completion',
        name: 'Completion',
        description: 'All problems/questions answered',
        maxPoints: 40,
        weight: 40,
      },
      {
        id: 'accuracy',
        name: 'Accuracy',
        description: 'Correctness of answers',
        maxPoints: 40,
        weight: 40,
      },
      {
        id: 'effort',
        name: 'Effort',
        description: 'Work shown and effort demonstrated',
        maxPoints: 20,
        weight: 20,
      },
    ],
    quiz: [
      {
        id: 'content-knowledge',
        name: 'Content Knowledge',
        description: 'Understanding of key concepts',
        maxPoints: 70,
        weight: 70,
      },
      {
        id: 'application',
        name: 'Application',
        description: 'Ability to apply concepts',
        maxPoints: 30,
        weight: 30,
      },
    ],
    test: [
      {
        id: 'content-mastery',
        name: 'Content Mastery',
        description: 'Comprehensive understanding',
        maxPoints: 60,
        weight: 60,
      },
      {
        id: 'critical-thinking',
        name: 'Critical Thinking',
        description: 'Analysis and problem-solving',
        maxPoints: 30,
        weight: 30,
      },
      {
        id: 'communication',
        name: 'Communication',
        description: 'Clear expression of ideas',
        maxPoints: 10,
        weight: 10,
      },
    ],
    project: [
      {
        id: 'content',
        name: 'Content Quality',
        description: 'Depth and accuracy of content',
        maxPoints: 30,
        weight: 30,
      },
      {
        id: 'creativity',
        name: 'Creativity',
        description: 'Originality and innovation',
        maxPoints: 20,
        weight: 20,
      },
      {
        id: 'presentation',
        name: 'Presentation',
        description: 'Visual appeal and organization',
        maxPoints: 20,
        weight: 20,
      },
      {
        id: 'effort',
        name: 'Effort',
        description: 'Time and dedication invested',
        maxPoints: 30,
        weight: 30,
      },
    ],
    participation: [
      {
        id: 'engagement',
        name: 'Class Engagement',
        description: 'Active participation in discussions',
        maxPoints: 50,
        weight: 50,
      },
      {
        id: 'behavior',
        name: 'Classroom Behavior',
        description: 'Respectful and on-task',
        maxPoints: 50,
        weight: 50,
      },
    ],
    presentation: [
      {
        id: 'content',
        name: 'Content',
        description: 'Knowledge and understanding',
        maxPoints: 40,
        weight: 40,
      },
      {
        id: 'delivery',
        name: 'Delivery',
        description: 'Speaking skills and confidence',
        maxPoints: 30,
        weight: 30,
      },
      {
        id: 'visuals',
        name: 'Visual Aids',
        description: 'Quality of supporting materials',
        maxPoints: 30,
        weight: 30,
      },
    ],
    classwork: [
      {
        id: 'completion',
        name: 'Completion',
        description: 'Finished assigned work',
        maxPoints: 50,
        weight: 50,
      },
      {
        id: 'quality',
        name: 'Quality',
        description: 'Accuracy and neatness',
        maxPoints: 50,
        weight: 50,
      },
    ],
  };

  return baseRubrics[type];
}

/**
 * Auto-grade based on student attributes and assignment difficulty
 * Used for simulated grading when students complete work
 */
export function autoGradeAssignment(
  student: Student,
  assignment: Assignment,
  wasLate: boolean = false
): StudentGrade {
  // Base score from student's academic level
  let baseScore = student.academicLevel;

  // Adjust for assignment difficulty
  const difficultyModifier = {
    1: 10,  // Easy: +10%
    2: 0,   // Medium: no change
    3: -15, // Hard: -15%
  }[assignment.difficulty];

  baseScore += difficultyModifier;

  // Adjust for student traits
  if (student.primaryTrait === 'perfectionist') {
    baseScore += 5;
  } else if (student.primaryTrait === 'distracted') {
    baseScore -= 10;
  }

  // Adjust for energy level
  if (student.energy < 30) {
    baseScore -= 10;
  } else if (student.energy > 80) {
    baseScore += 5;
  }

  // Adjust for mood
  const moodModifier = {
    excited: 5,
    happy: 3,
    neutral: 0,
    bored: -5,
    frustrated: -8,
    upset: -12,
  }[student.mood];

  baseScore += moodModifier;

  // Late penalty
  if (wasLate) {
    baseScore -= 15;
  }

  // Clamp to 0-100
  baseScore = Math.max(0, Math.min(100, baseScore));

  // Add some randomness (±5%)
  const randomVariance = (Math.random() - 0.5) * 10;
  const finalScore = Math.max(0, Math.min(100, baseScore + randomVariance));

  const pointsEarned = Math.round((finalScore / 100) * assignment.maxPoints);
  const percentage = Math.round(finalScore * 100) / 100;

  return {
    id: crypto.randomUUID(),
    studentId: student.id,
    assignmentId: assignment.id,
    pointsEarned,
    maxPoints: assignment.maxPoints,
    percentageScore: percentage,
    letterGrade: calculateLetterGrade(percentage),
    feedback: generateAutoFeedback(percentage, assignment.type),
    gradedDate: new Date().toISOString(),
    submitted: true,
    lateSubmission: wasLate,
    excused: false,
  };
}

/**
 * Generate automatic feedback based on score
 */
function generateAutoFeedback(percentage: number, type: AssignmentType): string {
  const feedbackTemplates = {
    excellent: [
      'Excellent work! Shows strong understanding.',
      'Outstanding effort and mastery!',
      'Exceptional performance!',
      'Great job! Keep up the excellent work!',
    ],
    proficient: [
      'Good work! Solid understanding demonstrated.',
      'Nice job! You\'re on the right track.',
      'Well done! Shows good comprehension.',
      'Good effort and understanding.',
    ],
    developing: [
      'Good effort. Review key concepts for improvement.',
      'Making progress. Let\'s work on strengthening these skills.',
      'Decent attempt. Consider studying more on this topic.',
      'You\'re getting there! Keep practicing.',
    ],
    needsWork: [
      'Needs improvement. Please see me for extra help.',
      'Let\'s work together to improve understanding.',
      'Additional practice needed. Office hours available.',
      'I\'m here to help you improve. Let\'s talk.',
    ],
  };

  let category: keyof typeof feedbackTemplates;
  if (percentage >= 90) category = 'excellent';
  else if (percentage >= 80) category = 'proficient';
  else if (percentage >= 70) category = 'developing';
  else category = 'needsWork';

  const templates = feedbackTemplates[category];
  return templates[Math.floor(Math.random() * templates.length)];
}

/**
 * Create a new gradebook with default weights
 */
export function createGradebook(): Gradebook {
  return {
    assignments: [],
    grades: [],
    weights: {
      homework: 20,
      quiz: 15,
      test: 35,
      project: 20,
      participation: 5,
      presentation: 3,
      classwork: 2,
    },
  };
}

/**
 * Add assignment to gradebook
 */
export function addAssignment(gradebook: Gradebook, assignment: Assignment): Gradebook {
  return {
    ...gradebook,
    assignments: [...gradebook.assignments, assignment],
  };
}

/**
 * Update assignment in gradebook
 */
export function updateAssignment(gradebook: Gradebook, assignment: Assignment): Gradebook {
  return {
    ...gradebook,
    assignments: gradebook.assignments.map(a => a.id === assignment.id ? assignment : a),
  };
}

/**
 * Delete assignment and all associated grades
 */
export function deleteAssignment(gradebook: Gradebook, assignmentId: string): Gradebook {
  return {
    ...gradebook,
    assignments: gradebook.assignments.filter(a => a.id !== assignmentId),
    grades: gradebook.grades.filter(g => g.assignmentId !== assignmentId),
  };
}

/**
 * Add or update a grade
 */
export function addOrUpdateGrade(gradebook: Gradebook, grade: StudentGrade): Gradebook {
  const existingIndex = gradebook.grades.findIndex(
    g => g.studentId === grade.studentId && g.assignmentId === grade.assignmentId
  );

  if (existingIndex >= 0) {
    // Update existing grade
    const newGrades = [...gradebook.grades];
    newGrades[existingIndex] = grade;
    return {
      ...gradebook,
      grades: newGrades,
    };
  } else {
    // Add new grade
    return {
      ...gradebook,
      grades: [...gradebook.grades, grade],
    };
  }
}

/**
 * Get all grades for a specific student
 */
export function getStudentGrades(gradebook: Gradebook, studentId: string): StudentGrade[] {
  return gradebook.grades.filter(g => g.studentId === studentId);
}

/**
 * Get all grades for a specific assignment
 */
export function getAssignmentGrades(gradebook: Gradebook, assignmentId: string): StudentGrade[] {
  return gradebook.grades.filter(g => g.assignmentId === assignmentId);
}

/**
 * Calculate class average for an assignment
 */
export function calculateAssignmentAverage(gradebook: Gradebook, assignmentId: string): number {
  const grades = getAssignmentGrades(gradebook, assignmentId);
  const submittedGrades = grades.filter(g => g.submitted && !g.excused);

  if (submittedGrades.length === 0) return 0;

  const sum = submittedGrades.reduce((acc, g) => acc + g.percentageScore, 0);
  return Math.round((sum / submittedGrades.length) * 100) / 100;
}

/**
 * Get grade distribution for an assignment
 */
export function getGradeDistribution(
  gradebook: Gradebook,
  assignmentId: string
): Record<LetterGrade, number> {
  const grades = getAssignmentGrades(gradebook, assignmentId);
  const distribution: Record<LetterGrade, number> = {
    'A+': 0, 'A': 0, 'A-': 0,
    'B+': 0, 'B': 0, 'B-': 0,
    'C+': 0, 'C': 0, 'C-': 0,
    'D+': 0, 'D': 0, 'D-': 0,
    'F': 0,
  };

  for (const grade of grades) {
    if (grade.submitted && !grade.excused) {
      distribution[grade.letterGrade]++;
    }
  }

  return distribution;
}
