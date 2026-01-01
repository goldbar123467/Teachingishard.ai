import type { Student, Mood, PersonalityTrait } from '../game/types';
import { PERSONALITY_PROFILES } from './personalities';

// ============ STUDENT PHONE & SOCIAL MEDIA ============

/**
 * Student's social media profile
 */
export interface StudentPhone {
  /** Unique handle (e.g., "cool_kid_22", "math_wizard") */
  handle: string;
  /** Number of followers (reflects popularity + engagement) */
  followers: number;
  /** Number of accounts they follow */
  following: number;
  /** Posting frequency multiplier (0.5 = less, 1.5 = more) */
  postingBehavior: number;
  /** Average engagement rate (likes per post) */
  avgEngagement: number;
}

/**
 * Post category types
 */
export type PostCategory =
  | 'complaint'      // Complaining about school/homework
  | 'celebration'    // Achievements, good news
  | 'social'         // Friend interactions, drama
  | 'boredom'        // Posted when bored in class
  | 'help'           // Asking for help/advice
  | 'random'         // Random thoughts, memes
  | 'panic'          // Stress about tests/deadlines
  | 'gossip';        // Spreading rumors/news

/**
 * Post format type
 */
export type PostType =
  | 'text'           // Simple text post
  | 'poll'           // Question with options
  | 'photo'          // Picture (imaginary)
  | 'meme';          // Humorous image/text

/**
 * A student's social media post
 */
export interface StudentPost {
  id: string;
  authorId: string;
  handle: string;
  content: string;
  category: PostCategory;
  type: PostType;
  timestamp: number; // Game day number
  timeOfDay: 'morning' | 'lunch' | 'afternoon' | 'afterschool' | 'evening';
  likes: number;
  comments: PostComment[];
  /** Viral score (0-100) - higher = more trending */
  viralScore: number;
  hashtags: string[];
  /** Was this posted during class (teacher might see) */
  duringClass: boolean;
}

/**
 * Comment on a post
 */
export interface PostComment {
  id: string;
  authorId: string;
  handle: string;
  content: string;
  timestamp: number;
  likes: number;
}

/**
 * Context for post generation
 */
export interface PostContext {
  currentPhase: 'morning' | 'teaching' | 'interaction' | 'end-of-day';
  lessonEngagement: number; // 0-100
  recentEvent?: string;
  isTestWeek?: boolean;
  isHoliday?: boolean;
  hasHomework?: boolean;
}

// ============ POSTING PROBABILITY ============

/**
 * Calculate the probability a student will post right now
 * @returns Probability 0-1
 */
export function calculatePostingProbability(
  student: Student,
  context: PostContext
): number {
  let baseProbability = 0.1; // 10% base chance per check

  // Mood modifiers
  const moodModifiers: Record<Mood, number> = {
    excited: 1.5,
    happy: 1.2,
    neutral: 1.0,
    bored: 2.0,      // Bored students post more!
    frustrated: 1.8,
    upset: 1.3,
  };
  baseProbability *= moodModifiers[student.mood];

  // Engagement modifier (inverse relationship)
  const engagementMod = 1.5 - (student.engagement / 100); // 0.5x to 1.5x
  baseProbability *= engagementMod;

  // Personality modifiers
  const traitModifiers: Partial<Record<PersonalityTrait, number>> = {
    outgoing: 1.8,
    social: 1.6,
    shy: 0.3,
    distracted: 1.7,
    creative: 1.4,
    analytical: 0.6,
    perfectionist: 0.7,
    curious: 1.1,
  };
  baseProbability *= traitModifiers[student.primaryTrait] ?? 1.0;

  // Context modifiers
  if (context.currentPhase === 'teaching') {
    baseProbability *= 0.5; // Less likely during active teaching
    if (context.lessonEngagement < 40) {
      baseProbability *= 2.0; // But more if lesson is boring
    }
  }

  if (context.isTestWeek) {
    baseProbability *= 1.5; // More stress posting
  }

  if (context.hasHomework && student.mood === 'frustrated') {
    baseProbability *= 1.3;
  }

  // Popularity boost (popular kids post more)
  const popularityMod = 0.8 + (student.popularity / 100) * 0.4; // 0.8x to 1.2x
  baseProbability *= popularityMod;

  // Cap at reasonable max (50%)
  return Math.min(0.5, Math.max(0.01, baseProbability));
}

// ============ VIRAL SCORE ============

/**
 * Calculate how viral/trending a post is
 * @returns Score 0-100
 */
export function calculateViralScore(
  post: StudentPost,
  authorPopularity: number,
  totalStudents: number
): number {
  let score = 0;

  // Likes factor (normalized by class size)
  const likeRatio = post.likes / totalStudents;
  score += likeRatio * 40; // Max 40 points from likes

  // Comment factor (comments worth more than likes)
  const commentRatio = post.comments.length / totalStudents;
  score += commentRatio * 50; // Max 50 points from comments

  // Author popularity boost
  score += (authorPopularity / 100) * 10; // Max 10 points

  // Category viral potential
  const categoryViralBonus: Partial<Record<PostCategory, number>> = {
    gossip: 15,
    social: 12,
    panic: 10,
    celebration: 8,
    complaint: 5,
  };
  score += categoryViralBonus[post.category] ?? 0;

  // Recency boost (newer posts trend higher)
  // This would be calculated based on current game time vs post time
  // For now, just a placeholder

  return Math.min(100, Math.max(0, score));
}

// ============ ENGAGEMENT GENERATION ============

/**
 * Generate likes and comments for a post based on student relationships
 */
export function generatePostEngagement(
  post: StudentPost,
  author: Student,
  allStudents: Student[],
  currentDay: number
): { likes: number; comments: PostComment[] } {
  let likes = 0;
  const comments: PostComment[] = [];

  for (const student of allStudents) {
    if (student.id === author.id) continue; // Can't like own post

    // Calculate engagement probability
    let engageProb = 0.15; // 15% base

    // Friend boost
    if (author.friendIds.includes(student.id)) {
      const friendshipStrength = author.friendshipStrengths[student.id] ?? 50;
      engageProb += (friendshipStrength / 100) * 0.3; // Up to +30%
    }

    // Rival penalty
    if (author.rivalIds.includes(student.id)) {
      engageProb *= 0.2; // Much less likely to engage
    }

    // Clique affinity
    if (author.clique && student.clique === author.clique) {
      engageProb += 0.15; // +15% for same clique
    }

    // Personality compatibility
    const profile = PERSONALITY_PROFILES[student.primaryTrait];
    if (student.primaryTrait === 'social' || student.primaryTrait === 'outgoing') {
      engageProb *= 1.3; // More active on social media
    }
    if (student.primaryTrait === 'shy' || student.primaryTrait === 'analytical') {
      engageProb *= 0.6; // Less active
    }

    // Category interest
    if (post.category === 'gossip' && student.socialSkills > 60) {
      engageProb *= 1.4;
    }
    if (post.category === 'help' && (student.primaryTrait === 'social' || student.isGifted)) {
      engageProb *= 1.3;
    }

    // Roll for engagement
    if (Math.random() < engageProb) {
      likes++;

      // Chance to comment (20% of engagers comment)
      if (Math.random() < 0.2) {
        comments.push(generateComment(student, post, currentDay));
      }
    }
  }

  return { likes, comments };
}

/**
 * Generate a comment based on student personality and post content
 */
function generateComment(
  student: Student,
  post: StudentPost,
  currentDay: number
): PostComment {
  const profile = PERSONALITY_PROFILES[student.primaryTrait];

  // Simple comment templates based on post category and personality
  const commentTemplates: Record<PostCategory, string[]> = {
    complaint: ['Same here 😭', 'So true!', 'Tell me about it', 'This is the worst'],
    celebration: ['Congrats!', 'Nice job!', 'So happy for you!', 'You deserve it!'],
    social: ['What happened?', 'Tell me more!', 'OMG', 'I heard about this'],
    boredom: ['Same', 'Bored too', 'This class is so slow', 'Can\'t wait for recess'],
    help: ['I can help!', 'Try asking the teacher', 'I don\'t get it either', 'Check your notes'],
    random: ['LOL', 'Haha', 'What?', 'Random but ok'],
    panic: ['You got this!', 'Don\'t worry!', 'Same energy', 'We\'re all doomed'],
    gossip: ['Wait really?', 'I heard differently', 'Spill the tea', 'Who told you?'],
  };

  const templates = commentTemplates[post.category];
  const content = templates[Math.floor(Math.random() * templates.length)];

  return {
    id: crypto.randomUUID(),
    authorId: student.id,
    handle: generateHandle(student),
    content,
    timestamp: currentDay,
    likes: Math.random() < 0.3 ? Math.floor(Math.random() * 3) : 0,
  };
}

/**
 * Generate a social media handle for a student
 */
export function generateHandle(student: Student): string {
  const adjectives = ['cool', 'super', 'awesome', 'epic', 'rad', 'smart', 'wild', 'the_real'];
  const nouns = ['kid', 'one', 'student', 'legend', 'star', 'pro', 'master', 'king', 'queen'];
  const numbers = ['21', '22', '23', '99', '100', '777', '42'];

  // Use personality for some handles
  const traitWords: Partial<Record<PersonalityTrait, string[]>> = {
    shy: ['quiet', 'silent', 'whisper', 'soft'],
    outgoing: ['party', 'social', 'fun', 'loud'],
    curious: ['why', 'wonder', 'explore', 'question'],
    creative: ['art', 'create', 'imagine', 'color'],
    analytical: ['logic', 'math', 'brain', 'smart'],
    social: ['friend', 'squad', 'crew', 'fam'],
    perfectionist: ['perfect', 'best', 'grade_a', 'flawless'],
    distracted: ['space', 'dreamer', 'random', 'vibes'],
  };

  const traitSpecific = traitWords[student.primaryTrait];

  if (traitSpecific && Math.random() < 0.4) {
    const word = traitSpecific[Math.floor(Math.random() * traitSpecific.length)];
    const number = numbers[Math.floor(Math.random() * numbers.length)];
    return `${word}_${number}`;
  }

  // Generic cool handle
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const number = numbers[Math.floor(Math.random() * numbers.length)];

  return `${adj}_${noun}_${number}`;
}

/**
 * Initialize phone/social media for a student
 */
export function initializeStudentPhone(student: Student): StudentPhone {
  // Followers based on popularity and social skills
  const baseFollowers = Math.floor((student.popularity + student.socialSkills) / 2);
  const followers = Math.max(5, Math.floor(baseFollowers * 0.15)); // Roughly 7-15 followers

  // Following is usually followers +/- 20%
  const following = Math.floor(followers * (0.8 + Math.random() * 0.4));

  // Posting behavior based on personality
  let postingBehavior = 1.0;
  const traitMods: Partial<Record<PersonalityTrait, number>> = {
    outgoing: 1.5,
    social: 1.4,
    shy: 0.4,
    distracted: 1.3,
    creative: 1.2,
    analytical: 0.7,
  };
  postingBehavior = traitMods[student.primaryTrait] ?? 1.0;

  return {
    handle: generateHandle(student),
    followers,
    following,
    postingBehavior,
    avgEngagement: Math.max(0.2, student.popularity / 100),
  };
}
