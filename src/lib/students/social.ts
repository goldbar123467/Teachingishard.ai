// ============ SOCIAL DYNAMICS TYPES ============

/**
 * Extended social information for each student
 */
export interface StudentSocial {
  /** Map of student IDs to friendship strength (-100 to 100) */
  friendships: Map<string, number>;
  /** Overall popularity score (0-100) */
  popularity: number;
  /** Clique membership (if any) */
  clique: CliqueType | null;
  /** Social battery for introverts/extroverts */
  socialEnergy: number; // 0-100
  /** Recent social interactions */
  recentInteractions: SocialInteraction[];
}

/**
 * Types of cliques that naturally form
 */
export type CliqueType = 'popular' | 'nerds' | 'artists' | 'athletes' | 'loners' | 'creatives';

/**
 * Types of social interactions
 */
export type SocialInteractionType =
  | 'chat'          // Friendly conversation
  | 'conflict'      // Argument or disagreement
  | 'help'          // Academic or social help
  | 'gossip'        // Spreading information
  | 'note'          // Passing notes in class
  | 'drama'         // Social drama event
  | 'compliment'    // Positive interaction
  | 'exclude'       // Exclusion from group
  | 'teamwork';     // Collaborative activity

/**
 * Outcome sentiment of an interaction
 */
export type SocialOutcome = 'positive' | 'negative' | 'neutral';

/**
 * A social interaction between students
 */
export interface SocialInteraction {
  id: string;
  type: SocialInteractionType;
  participants: string[]; // Student IDs involved
  timestamp: number; // Game turn/day number
  outcome: SocialOutcome;
  description: string;
  /** How much this affected friendships */
  friendshipDelta: number; // -50 to +50
  /** Was this visible to the teacher? */
  wasObserved: boolean;
}

/**
 * Feed post for the social dashboard
 */
export interface FeedPost {
  id: string;
  type: FeedPostType;
  author: string; // Student ID or 'system'
  content: string;
  emoji: string;
  timestamp: number; // Game turn/day number
  likes?: number; // Number of students who "agree"
  comments?: FeedComment[];
  sentiment: 'positive' | 'negative' | 'neutral' | 'dramatic';
  /** Related interaction if applicable */
  interactionId?: string;
}

export type FeedPostType =
  | 'interaction'     // Social interaction happened
  | 'mood_change'     // Student mood shifted
  | 'achievement'     // Student achievement
  | 'drama'           // Dramatic event
  | 'teacher_action'  // Teacher intervened
  | 'clique_change';  // Clique membership changed

export interface FeedComment {
  studentId: string;
  content: string;
  timestamp: number;
}

/**
 * Compatibility matrix for personality-based friendships
 */
export interface CompatibilityScore {
  trait1: string;
  trait2: string;
  score: number; // -50 to +50
  reason: string;
}

/**
 * Clique membership information
 */
export interface Clique {
  type: CliqueType;
  members: string[]; // Student IDs
  leader?: string; // Optional leader student ID
  cohesion: number; // 0-100, how tight-knit the group is
}
