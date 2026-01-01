/**
 * Student Social Media Post Mechanics
 *
 * This module provides the core mechanics for student social media posting,
 * including posting probability, frequency, viral mechanics, and engagement.
 *
 * @module postMechanics
 */

// Re-export all social media types and functions
export type {
  StudentPhone,
  PostCategory,
  PostType,
  StudentPost,
  PostComment,
  PostContext,
} from './socialMedia';

export {
  calculatePostingProbability,
  calculateViralScore,
  generatePostEngagement,
  generateHandle,
  initializeStudentPhone,
} from './socialMedia';

// Re-export frequency mechanics
export {
  PERSONALITY_POST_FREQUENCY,
  TIME_OF_DAY_MODIFIERS,
  EVENT_TRIGGERS,
  PHASE_POSTING_WINDOWS,
  POSTING_COOLDOWN,
  getTimeOfDay,
  getTimeModifier,
  getEventMultiplier,
  getBoredomMultiplier,
  getExpectedPostsPerDay,
  getPostingWindow,
  canPostNow,
  getCategoryDistribution,
  selectPostCategory,
} from './postFrequency';

export type {
  TimeOfDayModifier,
  PostingEventTrigger,
  PostingWindow,
} from './postFrequency';

// Re-export viral mechanics
export {
  getTrendingPosts,
  calculateTrendingHashtags,
  generateLikesAndComments,
  calculateEngagementStats,
  isViralPost,
  applyViralBoost,
  getRelatedPosts,
  generateViralComments,
} from './viralMechanics';

export type {
  TrendingPost,
  TrendingHashtag,
  EngagementStats,
} from './viralMechanics';
