import type { Student } from '../game/types';
import type { StudentPost, PostComment } from './socialMedia';
import { generatePostEngagement } from './socialMedia';

// ============ VIRAL MECHANICS ============

/**
 * Trending post with additional metadata
 */
export interface TrendingPost extends StudentPost {
  trendingRank: number;
  trendingScore: number;
  trendVelocity: number; // How fast it's gaining traction
}

/**
 * Hashtag usage statistics
 */
export interface TrendingHashtag {
  tag: string;
  count: number;
  associatedPosts: string[]; // Post IDs
  sentiment: 'positive' | 'negative' | 'neutral';
}

/**
 * Engagement statistics for analytics
 */
export interface EngagementStats {
  totalLikes: number;
  totalComments: number;
  averageLikesPerPost: number;
  averageCommentsPerPost: number;
  mostEngagedStudent: string | null;
  leastEngagedStudent: string | null;
}

// ============ TRENDING POSTS ============

/**
 * Get trending posts ranked by viral score
 * @param posts All posts to consider
 * @param limit Maximum number of trending posts to return
 * @param timeWindow Only consider posts from last N days (optional)
 * @returns Trending posts sorted by score
 */
export function getTrendingPosts(
  posts: StudentPost[],
  students: Student[],
  limit: number = 10,
  timeWindow?: number
): TrendingPost[] {
  const currentDay = Math.max(...posts.map(p => p.timestamp), 0);

  // Filter by time window if specified
  let filteredPosts = posts;
  if (timeWindow) {
    filteredPosts = posts.filter(p => currentDay - p.timestamp <= timeWindow);
  }

  // Calculate trending scores with velocity
  const trendingPosts: TrendingPost[] = filteredPosts.map(post => {
    const author = students.find(s => s.id === post.authorId);
    const authorPopularity = author?.popularity ?? 50;

    // Base viral score
    const viralScore = calculateEnhancedViralScore(post, authorPopularity, students.length);

    // Calculate velocity (engagement rate over time)
    const postAge = Math.max(1, currentDay - post.timestamp);
    const trendVelocity = (post.likes + post.comments.length * 2) / postAge;

    // Trending score combines viral score and velocity
    const trendingScore = viralScore * 0.7 + trendVelocity * 30 * 0.3;

    return {
      ...post,
      trendingRank: 0, // Will be set after sorting
      trendingScore,
      trendVelocity,
    };
  });

  // Sort by trending score
  trendingPosts.sort((a, b) => b.trendingScore - a.trendingScore);

  // Set ranks
  trendingPosts.forEach((post, index) => {
    post.trendingRank = index + 1;
  });

  return trendingPosts.slice(0, limit);
}

/**
 * Enhanced viral score calculation with more factors
 */
function calculateEnhancedViralScore(
  post: StudentPost,
  authorPopularity: number,
  totalStudents: number
): number {
  let score = 0;

  // Engagement metrics
  const likeRatio = post.likes / totalStudents;
  const commentRatio = post.comments.length / totalStudents;

  score += likeRatio * 35; // Max 35 points from likes
  score += commentRatio * 45; // Max 45 points from comments

  // Comments are worth more than likes
  score += post.comments.length * 2;
  score += post.likes * 0.5;

  // Author influence
  score += (authorPopularity / 100) * 10; // Max 10 points

  // Category bonuses
  const categoryBonus: Record<string, number> = {
    gossip: 15,
    social: 12,
    panic: 10,
    celebration: 8,
    drama: 15,
    complaint: 5,
    help: 4,
    boredom: 2,
    random: 3,
  };
  score += categoryBonus[post.category] ?? 0;

  // Hashtag bonus (more hashtags = more discoverable)
  score += Math.min(post.hashtags.length * 2, 10);

  // Type bonuses
  const typeBonus: Record<string, number> = {
    poll: 8,   // Polls encourage interaction
    meme: 10,  // Memes go viral
    photo: 6,
    text: 0,
  };
  score += typeBonus[post.type] ?? 0;

  // Time of day bonus (lunch posts get more eyes)
  const timeBonus: Record<string, number> = {
    morning: 0,
    lunch: 10,
    afternoon: 5,
    afterschool: 8,
    evening: 3,
  };
  score += timeBonus[post.timeOfDay] ?? 0;

  return Math.min(100, Math.max(0, score));
}

// ============ TRENDING HASHTAGS ============

/**
 * Calculate trending hashtags from all posts
 * @param posts All posts to analyze
 * @param limit Maximum number of hashtags to return
 * @returns Trending hashtags with metadata
 */
export function calculateTrendingHashtags(
  posts: StudentPost[],
  limit: number = 10,
  timeWindow?: number
): TrendingHashtag[] {
  const currentDay = Math.max(...posts.map(p => p.timestamp), 0);

  // Filter by time window
  let filteredPosts = posts;
  if (timeWindow) {
    filteredPosts = posts.filter(p => currentDay - p.timestamp <= timeWindow);
  }

  // Count hashtag usage
  const hashtagMap = new Map<string, { count: number; postIds: string[]; sentiments: string[] }>();

  for (const post of filteredPosts) {
    for (const tag of post.hashtags) {
      const normalized = tag.toLowerCase();
      const existing = hashtagMap.get(normalized);

      if (existing) {
        existing.count++;
        existing.postIds.push(post.id);
        existing.sentiments.push(post.category);
      } else {
        hashtagMap.set(normalized, {
          count: 1,
          postIds: [post.id],
          sentiments: [post.category],
        });
      }
    }
  }

  // Convert to trending hashtags
  const trendingHashtags: TrendingHashtag[] = Array.from(hashtagMap.entries()).map(
    ([tag, data]) => {
      // Determine overall sentiment
      const sentimentCounts = {
        positive: 0,
        negative: 0,
        neutral: 0,
      };

      for (const category of data.sentiments) {
        if (['celebration', 'help', 'social'].includes(category)) {
          sentimentCounts.positive++;
        } else if (['complaint', 'panic', 'gossip'].includes(category)) {
          sentimentCounts.negative++;
        } else {
          sentimentCounts.neutral++;
        }
      }

      const sentiment =
        sentimentCounts.positive > sentimentCounts.negative &&
        sentimentCounts.positive > sentimentCounts.neutral
          ? 'positive'
          : sentimentCounts.negative > sentimentCounts.neutral
          ? 'negative'
          : 'neutral';

      return {
        tag,
        count: data.count,
        associatedPosts: data.postIds,
        sentiment,
      };
    }
  );

  // Sort by count
  trendingHashtags.sort((a, b) => b.count - a.count);

  return trendingHashtags.slice(0, limit);
}

// ============ ORGANIC ENGAGEMENT ============

/**
 * Generate organic likes and comments for a post
 * This simulates natural engagement over time
 */
export function generateLikesAndComments(
  post: StudentPost,
  author: Student,
  allStudents: Student[],
  currentDay: number,
  previousEngagement?: { likes: number; comments: PostComment[] }
): { likes: number; comments: PostComment[] } {
  // If no previous engagement, generate fresh
  if (!previousEngagement) {
    return generatePostEngagement(post, author, allStudents, currentDay);
  }

  // Otherwise, add incremental engagement
  const { likes: newLikes, comments: newComments } = generatePostEngagement(
    post,
    author,
    allStudents,
    currentDay
  );

  // Only add a portion of new engagement (organic growth)
  const incrementalLikes = Math.floor(newLikes * 0.3);
  const incrementalComments = newComments.slice(0, Math.floor(newComments.length * 0.3));

  return {
    likes: previousEngagement.likes + incrementalLikes,
    comments: [...previousEngagement.comments, ...incrementalComments],
  };
}

// ============ ENGAGEMENT ANALYTICS ============

/**
 * Calculate engagement statistics across all posts
 */
export function calculateEngagementStats(
  posts: StudentPost[],
  students: Student[]
): EngagementStats {
  const totalLikes = posts.reduce((sum, post) => sum + post.likes, 0);
  const totalComments = posts.reduce((sum, post) => sum + post.comments.length, 0);

  const stats: EngagementStats = {
    totalLikes,
    totalComments,
    averageLikesPerPost: posts.length > 0 ? totalLikes / posts.length : 0,
    averageCommentsPerPost: posts.length > 0 ? totalComments / posts.length : 0,
    mostEngagedStudent: null,
    leastEngagedStudent: null,
  };

  // Calculate per-student engagement
  const studentEngagement = new Map<string, number>();

  for (const student of students) {
    let engagementScore = 0;

    // Count posts made
    const studentPosts = posts.filter(p => p.authorId === student.id);
    engagementScore += studentPosts.length * 5;

    // Count likes received
    for (const post of studentPosts) {
      engagementScore += post.likes;
      engagementScore += post.comments.length * 2;
    }

    // Count comments made
    for (const post of posts) {
      const commentsBy = post.comments.filter(c => c.authorId === student.id);
      engagementScore += commentsBy.length * 1.5;
    }

    studentEngagement.set(student.id, engagementScore);
  }

  // Find most and least engaged
  let maxEngagement = -1;
  let minEngagement = Infinity;
  let mostEngagedId: string | null = null;
  let leastEngagedId: string | null = null;

  for (const [studentId, engagement] of Array.from(studentEngagement.entries())) {
    if (engagement > maxEngagement) {
      maxEngagement = engagement;
      mostEngagedId = studentId;
    }
    if (engagement < minEngagement) {
      minEngagement = engagement;
      leastEngagedId = studentId;
    }
  }

  stats.mostEngagedStudent = mostEngagedId;
  stats.leastEngagedStudent = leastEngagedId;

  return stats;
}

// ============ VIRAL DETECTION ============

/**
 * Detect if a post has gone viral
 * @returns True if post meets viral thresholds
 */
export function isViralPost(
  post: StudentPost,
  students: Student[],
  thresholds?: {
    likePercentage?: number;    // % of class who liked
    commentPercentage?: number; // % of class who commented
    viralScore?: number;        // Min viral score
  }
): boolean {
  const defaults = {
    likePercentage: 0.6,      // 60% of class
    commentPercentage: 0.3,   // 30% of class
    viralScore: 70,           // Viral score of 70+
  };

  const config = { ...defaults, ...thresholds };

  const likeRatio = post.likes / students.length;
  const commentRatio = post.comments.length / students.length;

  return (
    likeRatio >= config.likePercentage ||
    commentRatio >= config.commentPercentage ||
    post.viralScore >= config.viralScore
  );
}

// ============ ENGAGEMENT BOOST ============

/**
 * Apply viral boost to a post that's gaining traction
 * Popular posts get exponential engagement
 */
export function applyViralBoost(
  post: StudentPost,
  students: Student[]
): { likesBoost: number; commentBoost: number } {
  const likeRatio = post.likes / students.length;

  let likesBoost = 0;
  let commentBoost = 0;

  // Threshold-based boosts
  if (likeRatio > 0.3) {
    // 30% threshold - small boost
    likesBoost = Math.floor(students.length * 0.1);
    commentBoost = 1;
  }

  if (likeRatio > 0.5) {
    // 50% threshold - medium boost
    likesBoost = Math.floor(students.length * 0.15);
    commentBoost = 2;
  }

  if (likeRatio > 0.7) {
    // 70% threshold - large boost (going viral)
    likesBoost = Math.floor(students.length * 0.2);
    commentBoost = 3;
  }

  return { likesBoost, commentBoost };
}

// ============ RELATED POSTS ============

/**
 * Find posts related to a given post (same category, hashtags, etc.)
 */
export function getRelatedPosts(
  targetPost: StudentPost,
  allPosts: StudentPost[],
  limit: number = 5
): StudentPost[] {
  const scoredPosts = allPosts
    .filter(p => p.id !== targetPost.id)
    .map(post => {
      let score = 0;

      // Same category
      if (post.category === targetPost.category) {
        score += 10;
      }

      // Shared hashtags
      const sharedTags = post.hashtags.filter(tag =>
        targetPost.hashtags.includes(tag)
      );
      score += sharedTags.length * 5;

      // Same time period
      const timeDiff = Math.abs(post.timestamp - targetPost.timestamp);
      if (timeDiff <= 1) {
        score += 8; // Same day
      } else if (timeDiff <= 3) {
        score += 4; // Within 3 days
      }

      // Similar engagement level
      const engagementDiff = Math.abs(post.viralScore - targetPost.viralScore);
      if (engagementDiff < 20) {
        score += 5;
      }

      return { post, score };
    });

  // Sort by score and return top matches
  scoredPosts.sort((a, b) => b.score - a.score);
  return scoredPosts.slice(0, limit).map(sp => sp.post);
}

// ============ COMMENT GENERATION HELPERS ============

/**
 * Generate additional comments as post gains traction
 */
export function generateViralComments(
  post: StudentPost,
  author: Student,
  students: Student[],
  numComments: number,
  currentDay: number
): PostComment[] {
  const newComments: PostComment[] = [];
  const potentialCommenters = students.filter(s => s.id !== author.id);

  for (let i = 0; i < numComments && potentialCommenters.length > 0; i++) {
    // Random student comments
    const randomIndex = Math.floor(Math.random() * potentialCommenters.length);
    const commenter = potentialCommenters[randomIndex];
    potentialCommenters.splice(randomIndex, 1); // Don't comment twice

    const templates = getCommentTemplates(post.category);
    const content = templates[Math.floor(Math.random() * templates.length)];

    newComments.push({
      id: crypto.randomUUID(),
      authorId: commenter.id,
      handle: `user_${commenter.id.slice(0, 8)}`,
      content,
      timestamp: currentDay,
      likes: Math.random() < 0.4 ? Math.floor(Math.random() * 3) : 0,
    });
  }

  return newComments;
}

/**
 * Get comment templates for a post category
 */
function getCommentTemplates(category: string): string[] {
  const templates: Record<string, string[]> = {
    gossip: ['OMG tell me everything!', 'Wait WHAT?', 'I heard something different', 'No way!!'],
    social: ['This is so true', 'Felt that', 'Big mood', 'Same here'],
    panic: ['We got this!', 'I\'m stressed too', 'Help me too pls', 'Gonna fail fr'],
    celebration: ['Congrats!!!', 'So proud of you!', 'You deserved it!', 'Amazing!'],
    complaint: ['This is so unfair', 'Right?!', 'Literally the worst', 'Same here ughhh'],
    boredom: ['Same energy', 'This is so boring', 'Someone save us', 'When does this end'],
    help: ['I can explain it!', 'Ask the teacher', 'Same question tbh', 'It\'s confusing right?'],
    random: ['LOL', 'What??', 'Random but ok', 'Haha true'],
  };

  return templates[category] ?? templates.random;
}
