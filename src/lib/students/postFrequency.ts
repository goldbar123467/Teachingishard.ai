import type { Student, PersonalityTrait, GamePhase } from '../game/types';
import type { PostContext } from './socialMedia';

// ============ POSTING FREQUENCY MECHANICS ============

/**
 * Daily posting frequency by personality type
 */
export const PERSONALITY_POST_FREQUENCY: Record<PersonalityTrait, { min: number; max: number }> = {
  outgoing: { min: 3, max: 5 },      // Very active posters
  social: { min: 2, max: 4 },         // Active posters
  creative: { min: 2, max: 4 },       // Share their art/ideas
  distracted: { min: 2, max: 5 },     // Post when bored (often)
  curious: { min: 1, max: 3 },        // Share discoveries
  perfectionist: { min: 0, max: 2 },  // Careful posters
  analytical: { min: 0, max: 1 },     // Rarely post
  shy: { min: 0, max: 1 },            // Very rare posts
};

/**
 * Time of day modifiers for posting likelihood
 */
export interface TimeOfDayModifier {
  period: 'morning' | 'lunch' | 'afternoon' | 'afterschool' | 'evening';
  modifier: number;
  description: string;
}

export const TIME_OF_DAY_MODIFIERS: TimeOfDayModifier[] = [
  {
    period: 'morning',
    modifier: 0.7,
    description: 'Students are arriving, low activity',
  },
  {
    period: 'lunch',
    modifier: 2.5,
    description: 'Peak social time, highest activity',
  },
  {
    period: 'afternoon',
    modifier: 0.8,
    description: 'In class, moderate activity',
  },
  {
    period: 'afterschool',
    modifier: 2.0,
    description: 'Just released, high activity',
  },
  {
    period: 'evening',
    modifier: 1.5,
    description: 'Homework time, moderate-high activity',
  },
];

/**
 * Get time of day based on game phase
 */
export function getTimeOfDay(phase: GamePhase): TimeOfDayModifier['period'] {
  const phaseMapping: Record<GamePhase, TimeOfDayModifier['period']> = {
    morning: 'morning',
    teaching: 'afternoon',
    interaction: 'afterschool',
    'end-of-day': 'evening',
  };
  return phaseMapping[phase];
}

/**
 * Calculate the modifier for current time of day
 */
export function getTimeModifier(period: TimeOfDayModifier['period']): number {
  const modifier = TIME_OF_DAY_MODIFIERS.find(m => m.period === period);
  return modifier?.modifier ?? 1.0;
}

// ============ EVENT TRIGGERS ============

/**
 * Events that trigger posting spikes
 */
export interface PostingEventTrigger {
  eventType: string;
  multiplier: number;
  affectedCategories: string[];
  description: string;
}

export const EVENT_TRIGGERS: PostingEventTrigger[] = [
  {
    eventType: 'test_announced',
    multiplier: 2.0,
    affectedCategories: ['panic', 'complaint', 'help'],
    description: 'Test announced - panic posts increase',
  },
  {
    eventType: 'drama',
    multiplier: 3.0,
    affectedCategories: ['gossip', 'social'],
    description: 'Drama happened - gossip explodes',
  },
  {
    eventType: 'field_trip_announced',
    multiplier: 1.8,
    affectedCategories: ['celebration', 'social'],
    description: 'Field trip - excitement posts',
  },
  {
    eventType: 'substitute_teacher',
    multiplier: 1.5,
    affectedCategories: ['boredom', 'random'],
    description: 'Sub day - more free time posting',
  },
  {
    eventType: 'fight',
    multiplier: 2.5,
    affectedCategories: ['gossip', 'social'],
    description: 'Fight - everyone posting about it',
  },
  {
    eventType: 'birthday',
    multiplier: 1.6,
    affectedCategories: ['celebration', 'social'],
    description: 'Birthday celebration',
  },
  {
    eventType: 'homework_heavy',
    multiplier: 1.7,
    affectedCategories: ['complaint', 'panic', 'help'],
    description: 'Too much homework assigned',
  },
  {
    eventType: 'holiday_week',
    multiplier: 1.4,
    affectedCategories: ['celebration', 'social', 'random'],
    description: 'Holiday spirit posting',
  },
  {
    eventType: 'snow_day',
    multiplier: 2.2,
    affectedCategories: ['celebration', 'random'],
    description: 'Snow day - everyone celebrating',
  },
];

/**
 * Get posting multiplier for current events
 */
export function getEventMultiplier(context: PostContext): number {
  let multiplier = 1.0;

  if (context.isTestWeek) {
    multiplier *= 1.5;
  }

  if (context.isHoliday) {
    multiplier *= 1.3;
  }

  if (context.recentEvent) {
    const trigger = EVENT_TRIGGERS.find(t => t.eventType === context.recentEvent);
    if (trigger) {
      multiplier *= trigger.multiplier;
    }
  }

  return multiplier;
}

// ============ BOREDOM MULTIPLIER ============

/**
 * Calculate posting multiplier based on engagement level
 * Lower engagement = more posting (students are bored)
 */
export function getBoredomMultiplier(
  engagement: number,
  lessonEngagement: number,
  phase: GamePhase
): number {
  // Only applies during teaching phase
  if (phase !== 'teaching') {
    return 1.0;
  }

  // Calculate average boredom
  const avgEngagement = (engagement + lessonEngagement) / 2;

  // Inverse relationship: low engagement = high posting
  if (avgEngagement < 30) {
    return 3.0; // Very bored - lots of posting
  } else if (avgEngagement < 50) {
    return 2.0; // Bored - more posting
  } else if (avgEngagement < 70) {
    return 1.2; // Moderate - slight increase
  } else {
    return 0.6; // Engaged - less posting
  }
}

// ============ EXPECTED POSTS PER DAY ============

/**
 * Calculate expected number of posts per day for a student
 */
export function getExpectedPostsPerDay(
  student: Student,
  context: PostContext
): number {
  const freqRange = PERSONALITY_POST_FREQUENCY[student.primaryTrait];
  let baseFrequency = (freqRange.min + freqRange.max) / 2;

  // Secondary trait influence (25% weight)
  const secondaryFreq = PERSONALITY_POST_FREQUENCY[student.secondaryTrait];
  const secondaryAvg = (secondaryFreq.min + secondaryFreq.max) / 2;
  baseFrequency = baseFrequency * 0.75 + secondaryAvg * 0.25;

  // Mood modifier
  const moodMods = {
    excited: 1.3,
    happy: 1.1,
    neutral: 1.0,
    bored: 1.8,
    frustrated: 1.4,
    upset: 1.2,
  };
  baseFrequency *= moodMods[student.mood];

  // Engagement modifier (student's overall engagement level)
  const engagementMod = 1.5 - (student.engagement / 100); // 0.5x to 1.5x
  baseFrequency *= engagementMod;

  // Event multiplier
  baseFrequency *= getEventMultiplier(context);

  // Popularity factor (popular kids post more)
  const popularityMod = 0.8 + (student.popularity / 100) * 0.4; // 0.8x to 1.2x
  baseFrequency *= popularityMod;

  return Math.max(0, Math.round(baseFrequency * 10) / 10); // Round to 1 decimal
}

// ============ PHASE-BASED POSTING WINDOWS ============

/**
 * Posting window probability by phase
 * Represents when during that phase students are likely to post
 */
export interface PostingWindow {
  phase: GamePhase;
  checkFrequency: number; // How many times to check for posts
  baseChance: number;     // Base probability per check
}

export const PHASE_POSTING_WINDOWS: PostingWindow[] = [
  {
    phase: 'morning',
    checkFrequency: 2, // Check twice during morning phase
    baseChance: 0.15,
  },
  {
    phase: 'teaching',
    checkFrequency: 4, // Check multiple times during teaching
    baseChance: 0.10,  // Lower base, but boredom can spike it
  },
  {
    phase: 'interaction',
    checkFrequency: 2,
    baseChance: 0.25,  // High chance after school
  },
  {
    phase: 'end-of-day',
    checkFrequency: 3,
    baseChance: 0.20,  // Evening posting
  },
];

/**
 * Get posting window settings for current phase
 */
export function getPostingWindow(phase: GamePhase): PostingWindow {
  return PHASE_POSTING_WINDOWS.find(w => w.phase === phase) ?? {
    phase: 'morning',
    checkFrequency: 2,
    baseChance: 0.15,
  };
}

// ============ POSTING COOLDOWN ============

/**
 * Minimum time between posts (in minutes of game time)
 * Prevents spam posting
 */
export const POSTING_COOLDOWN: Record<PersonalityTrait, number> = {
  outgoing: 15,      // Can post every 15 min
  social: 20,
  creative: 20,
  distracted: 25,
  curious: 30,
  perfectionist: 60, // Takes time to craft posts
  analytical: 60,
  shy: 120,          // Very rare, spread out
};

/**
 * Check if student can post based on cooldown
 */
export function canPostNow(
  student: Student,
  lastPostTime: number,
  currentTime: number
): boolean {
  const cooldown = POSTING_COOLDOWN[student.primaryTrait];
  const timeSinceLastPost = currentTime - lastPostTime;
  return timeSinceLastPost >= cooldown;
}

// ============ CATEGORY DISTRIBUTION ============

/**
 * Probability distribution of post categories based on context
 */
export function getCategoryDistribution(
  student: Student,
  context: PostContext
): Record<string, number> {
  const distribution: Record<string, number> = {
    complaint: 0.15,
    celebration: 0.10,
    social: 0.20,
    boredom: 0.10,
    help: 0.10,
    random: 0.20,
    panic: 0.05,
    gossip: 0.10,
  };

  // Adjust based on mood
  if (student.mood === 'bored') {
    distribution.boredom += 0.2;
    distribution.random += 0.1;
  } else if (student.mood === 'frustrated') {
    distribution.complaint += 0.2;
    distribution.panic += 0.1;
  } else if (student.mood === 'excited' || student.mood === 'happy') {
    distribution.celebration += 0.15;
    distribution.social += 0.1;
  }

  // Context adjustments
  if (context.isTestWeek) {
    distribution.panic += 0.25;
    distribution.help += 0.15;
  }

  if (context.hasHomework) {
    distribution.complaint += 0.1;
  }

  if (context.currentPhase === 'teaching' && context.lessonEngagement < 40) {
    distribution.boredom += 0.3;
  }

  // Personality adjustments
  if (student.primaryTrait === 'social' || student.primaryTrait === 'outgoing') {
    distribution.social += 0.15;
    distribution.gossip += 0.1;
  }

  if (student.primaryTrait === 'analytical' || student.isGifted) {
    distribution.help += 0.15;
  }

  if (student.primaryTrait === 'creative') {
    distribution.random += 0.15;
    distribution.celebration += 0.1;
  }

  // Normalize to sum to 1.0
  const total = Object.values(distribution).reduce((sum, val) => sum + val, 0);
  Object.keys(distribution).forEach(key => {
    distribution[key] /= total;
  });

  return distribution;
}

/**
 * Select a category based on weighted distribution
 */
export function selectPostCategory(distribution: Record<string, number>): string {
  const rand = Math.random();
  let cumulative = 0;

  for (const [category, weight] of Object.entries(distribution)) {
    cumulative += weight;
    if (rand < cumulative) {
      return category;
    }
  }

  return 'random'; // Fallback
}
