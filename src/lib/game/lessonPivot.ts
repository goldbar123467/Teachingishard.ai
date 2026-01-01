// ============ LESSON PIVOT TYPES ============

export type FailureRisk = 'low' | 'medium' | 'high' | 'critical';

export interface LessonStatus {
  progress: number; // 0-100%
  engagement: number; // class average engagement
  failureRisk: FailureRisk;
  canPivot: boolean;
  pivotOptions: PivotOption[];
}

export interface PivotOption {
  id: string;
  name: string;
  description: string;
  energyCost: number; // teacher energy required to pivot
  successChance: number; // 0-100%
  engagementBoost: number; // expected engagement increase
  type: PivotType;
}

export type PivotType =
  | 'activity-switch'
  | 'group-work'
  | 'game-based'
  | 'one-on-one'
  | 'abandon';

export interface PivotResult {
  success: boolean;
  engagementChange: number;
  energyCost: number;
  message: string;
}

// ============ PIVOT OPTIONS DATABASE ============

const PIVOT_OPTIONS: Record<PivotType, Omit<PivotOption, 'id'>> = {
  'activity-switch': {
    name: 'Switch to Hands-On Activity',
    description: 'Change from lecture to hands-on learning. Low risk, moderate engagement boost.',
    energyCost: 10,
    successChance: 80,
    engagementBoost: 15,
    type: 'activity-switch',
  },
  'group-work': {
    name: 'Break into Small Groups',
    description: 'Split class into collaborative groups. Works well for social learners.',
    energyCost: 15,
    successChance: 70,
    engagementBoost: 20,
    type: 'group-work',
  },
  'game-based': {
    name: 'Turn into Competition',
    description: 'Gamify the lesson with teams or points. High energy, high reward.',
    energyCost: 20,
    successChance: 75,
    engagementBoost: 25,
    type: 'game-based',
  },
  'one-on-one': {
    name: 'Focus on Struggling Students',
    description: 'Give individual attention to those falling behind. Very draining.',
    energyCost: 30,
    successChance: 85,
    engagementBoost: 10,
    type: 'one-on-one',
  },
  'abandon': {
    name: 'Abandon Lesson',
    description: 'Cut your losses and move to next subject. Emergency only.',
    energyCost: 5,
    successChance: 100,
    engagementBoost: -10,
    type: 'abandon',
  },
};

// ============ FAILURE RISK CALCULATION ============

/**
 * Calculates the failure risk of a lesson based on engagement and other factors
 */
export function calculateFailureRisk(
  engagement: number,
  confusionRate: number,
  disruptionLevel: number
): FailureRisk {
  let riskScore = 0;

  // Low engagement increases risk
  if (engagement < 30) {
    riskScore += 3;
  } else if (engagement < 50) {
    riskScore += 2;
  } else if (engagement < 70) {
    riskScore += 1;
  }

  // High confusion increases risk
  if (confusionRate > 50) {
    riskScore += 3;
  } else if (confusionRate > 30) {
    riskScore += 2;
  } else if (confusionRate > 15) {
    riskScore += 1;
  }

  // Disruptions increase risk
  if (disruptionLevel > 70) {
    riskScore += 3;
  } else if (disruptionLevel > 40) {
    riskScore += 2;
  } else if (disruptionLevel > 20) {
    riskScore += 1;
  }

  // Map score to risk level
  if (riskScore >= 6) return 'critical';
  if (riskScore >= 4) return 'high';
  if (riskScore >= 2) return 'medium';
  return 'low';
}

/**
 * Determines if a lesson can be pivoted based on current status
 */
export function canPivotLesson(
  failureRisk: FailureRisk,
  progress: number,
  teacherEnergy: number
): boolean {
  // Can't pivot if lesson is almost done
  if (progress > 80) return false;

  // Can't pivot if teacher has no energy
  if (teacherEnergy < 10) return false;

  // Can pivot if risk is medium or higher
  return failureRisk !== 'low';
}

// ============ PIVOT OPTIONS GENERATION ============

/**
 * Gets available pivot options based on current lesson status and teacher energy
 */
export function getPivotOptions(
  failureRisk: FailureRisk,
  teacherEnergy: number,
  classSize: number,
  hasSupplies: boolean
): PivotOption[] {
  const options: PivotOption[] = [];

  // Always offer activity switch if teacher has energy
  if (teacherEnergy >= PIVOT_OPTIONS['activity-switch'].energyCost && hasSupplies) {
    options.push({
      id: 'pivot-activity-switch',
      ...PIVOT_OPTIONS['activity-switch'],
    });
  }

  // Offer group work if class size supports it
  if (teacherEnergy >= PIVOT_OPTIONS['group-work'].energyCost && classSize >= 6) {
    options.push({
      id: 'pivot-group-work',
      ...PIVOT_OPTIONS['group-work'],
    });
  }

  // Offer game-based if teacher has energy and supplies
  if (teacherEnergy >= PIVOT_OPTIONS['game-based'].energyCost && hasSupplies) {
    options.push({
      id: 'pivot-game-based',
      ...PIVOT_OPTIONS['game-based'],
    });
  }

  // Offer one-on-one if teacher has significant energy
  if (teacherEnergy >= PIVOT_OPTIONS['one-on-one'].energyCost) {
    options.push({
      id: 'pivot-one-on-one',
      ...PIVOT_OPTIONS['one-on-one'],
    });
  }

  // Always offer abandon as last resort
  options.push({
    id: 'pivot-abandon',
    ...PIVOT_OPTIONS['abandon'],
  });

  return options;
}

// ============ PIVOT EXECUTION ============

/**
 * Executes a lesson pivot and returns the result
 */
export function executePivot(
  pivotOption: PivotOption,
  currentEngagement: number,
  teacherEnergy: number,
  studentPersonalities: Array<{ learningStyle: string; primaryTrait: string }>
): PivotResult {
  // Check if teacher has enough energy
  if (teacherEnergy < pivotOption.energyCost) {
    return {
      success: false,
      engagementChange: 0,
      energyCost: 0,
      message: 'Not enough energy to execute this pivot.',
    };
  }

  // Calculate success based on student compatibility
  let compatibilityBonus = 0;

  switch (pivotOption.type) {
    case 'activity-switch':
      // Kinesthetic learners benefit most
      const kinestheticCount = studentPersonalities.filter(
        s => s.learningStyle === 'kinesthetic'
      ).length;
      compatibilityBonus = (kinestheticCount / studentPersonalities.length) * 10;
      break;

    case 'group-work':
      // Social/outgoing students benefit
      const socialCount = studentPersonalities.filter(
        s => s.primaryTrait === 'social' || s.primaryTrait === 'outgoing'
      ).length;
      compatibilityBonus = (socialCount / studentPersonalities.length) * 15;
      break;

    case 'game-based':
      // Works well with curious/competitive students
      const engagedCount = studentPersonalities.filter(
        s => s.primaryTrait === 'curious' || s.primaryTrait === 'analytical'
      ).length;
      compatibilityBonus = (engagedCount / studentPersonalities.length) * 10;
      break;

    case 'one-on-one':
      // Always effective for struggling students
      compatibilityBonus = 15;
      break;

    case 'abandon':
      // No bonus for abandoning
      compatibilityBonus = 0;
      break;
  }

  // Roll for success
  const adjustedSuccessChance = Math.min(95, pivotOption.successChance + compatibilityBonus);
  const roll = Math.random() * 100;
  const success = roll <= adjustedSuccessChance;

  // Calculate engagement change
  let engagementChange = 0;
  if (success) {
    engagementChange = pivotOption.engagementBoost + Math.floor(Math.random() * 5);
  } else {
    // Partial failure - some benefit but not full
    engagementChange = Math.floor(pivotOption.engagementBoost * 0.3);
  }

  // Special case: abandon always works but has negative impact
  if (pivotOption.type === 'abandon') {
    return {
      success: true,
      engagementChange: -10,
      energyCost: pivotOption.energyCost,
      message: 'Lesson abandoned. Students are confused but disruption has stopped.',
    };
  }

  return {
    success,
    engagementChange,
    energyCost: pivotOption.energyCost,
    message: success
      ? `${pivotOption.name} successful! Engagement increased by ${engagementChange}.`
      : `${pivotOption.name} partially effective. Engagement only increased by ${engagementChange}.`,
  };
}

// ============ LESSON STATUS TRACKING ============

/**
 * Creates a lesson status object for tracking during teaching
 */
export function createLessonStatus(
  progress: number,
  engagement: number,
  confusionRate: number,
  disruptionLevel: number,
  teacherEnergy: number,
  classSize: number,
  hasSupplies: boolean
): LessonStatus {
  const failureRisk = calculateFailureRisk(engagement, confusionRate, disruptionLevel);
  const canPivot = canPivotLesson(failureRisk, progress, teacherEnergy);
  const pivotOptions = canPivot
    ? getPivotOptions(failureRisk, teacherEnergy, classSize, hasSupplies)
    : [];

  return {
    progress,
    engagement,
    failureRisk,
    canPivot,
    pivotOptions,
  };
}

/**
 * Checks if a lesson is failing and should trigger pivot options
 */
export function isLessonFailing(status: LessonStatus): boolean {
  return status.failureRisk === 'high' || status.failureRisk === 'critical';
}

/**
 * Gets recommended pivot based on current situation
 */
export function getRecommendedPivot(
  status: LessonStatus,
  teacherEnergy: number
): PivotOption | null {
  if (!status.canPivot || status.pivotOptions.length === 0) {
    return null;
  }

  // Filter by energy availability
  const affordableOptions = status.pivotOptions.filter(
    opt => opt.energyCost <= teacherEnergy
  );

  if (affordableOptions.length === 0) {
    return null;
  }

  // Sort by expected value (success chance * engagement boost)
  const sorted = affordableOptions
    .filter(opt => opt.type !== 'abandon') // Don't recommend abandon
    .sort((a, b) => {
      const valueA = (a.successChance / 100) * a.engagementBoost;
      const valueB = (b.successChance / 100) * b.engagementBoost;
      return valueB - valueA;
    });

  return sorted[0] || null;
}
