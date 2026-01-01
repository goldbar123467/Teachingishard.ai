/**
 * Example usage of the Post Mechanics Engine
 *
 * This file demonstrates how to use all the post mechanics functions
 * in a realistic game scenario.
 */

import type { Student, GamePhase } from '../game/types';
import {
  initializeStudentPhone,
  calculatePostingProbability,
  generatePostEngagement,
  calculateViralScore,
  getExpectedPostsPerDay,
  getCategoryDistribution,
  selectPostCategory,
  canPostNow,
  getTrendingPosts,
  calculateTrendingHashtags,
  isViralPost,
  type StudentPhone,
  type StudentPost,
  type PostContext,
} from './postMechanics';

// ============ EXAMPLE 1: Initialize Student Phones ============

export function initializeAllStudentPhones(students: Student[]): Record<string, StudentPhone> {
  const phones: Record<string, StudentPhone> = {};

  for (const student of students) {
    phones[student.id] = initializeStudentPhone(student);
  }

  return phones;
}

// ============ EXAMPLE 2: Generate Posts During a Game Phase ============

export function processStudentPosts(
  students: Student[],
  currentPhase: GamePhase,
  lessonEngagement: number,
  currentDay: number,
  lastPostTimes: Record<string, number>,
  recentEvent?: string,
  isTestWeek = false
): {
  newPosts: StudentPost[];
  updatedLastPostTimes: Record<string, number>;
} {
  const context: PostContext = {
    currentPhase,
    lessonEngagement,
    recentEvent,
    isTestWeek,
    hasHomework: true, // Example
  };

  const newPosts: StudentPost[] = [];
  const updatedTimes = { ...lastPostTimes };
  const currentMinute = currentDay * 480; // Assuming 480 minutes per day

  for (const student of students) {
    // Check cooldown
    const lastTime = lastPostTimes[student.id] ?? 0;
    if (!canPostNow(student, lastTime, currentMinute)) {
      continue;
    }

    // Calculate posting probability
    const probability = calculatePostingProbability(student, context);

    // Roll the dice
    if (Math.random() < probability) {
      // Generate the post
      const post = generateStudentPost(student, context, currentDay);

      // Generate engagement (likes and comments from other students)
      const { likes, comments } = generatePostEngagement(
        post,
        student,
        students,
        currentDay
      );

      // Update post with engagement
      post.likes = likes;
      post.comments = comments;
      post.viralScore = calculateViralScore(post, student.popularity, students.length);

      newPosts.push(post);
      updatedTimes[student.id] = currentMinute;
    }
  }

  return { newPosts, updatedLastPostTimes: updatedTimes };
}

// ============ EXAMPLE 3: Generate a Complete Post ============

function generateStudentPost(
  student: Student,
  context: PostContext,
  currentDay: number
): StudentPost {
  // Get category based on context and student state
  const distribution = getCategoryDistribution(student, context);
  const category = selectPostCategory(distribution);

  // Generate content based on category (simplified)
  const content = generatePostContent(student, category, context);

  // Extract hashtags from content
  const hashtags = extractHashtags(content);

  // Determine time of day
  const timeOfDay = getTimeOfDayFromPhase(context.currentPhase);

  // Determine post type (mostly text, occasionally other types)
  const postType = Math.random() < 0.7 ? 'text' :
                   Math.random() < 0.5 ? 'poll' :
                   Math.random() < 0.5 ? 'photo' : 'meme';

  return {
    id: crypto.randomUUID(),
    authorId: student.id,
    handle: `${student.firstName.toLowerCase()}_${Math.floor(Math.random() * 100)}`,
    content,
    category: category as any,
    type: postType as any,
    timestamp: currentDay,
    timeOfDay,
    likes: 0,
    comments: [],
    viralScore: 0,
    hashtags,
    duringClass: context.currentPhase === 'teaching',
  };
}

// ============ EXAMPLE 4: Generate Post Content ============

function generatePostContent(student: Student, category: string, context: PostContext): string {
  const templates: Record<string, string[]> = {
    complaint: [
      `Ugh, why is there SO much homework?? #stressed`,
      `This is literally the worst day ever 😭`,
      `Can we just skip to recess already? #bored`,
      `Who else forgot their homework? 🙋`,
    ],
    celebration: [
      `Just got an A on my test!! 🎉 #winning`,
      `YASSS recess time! #finally`,
      `Best day ever!! ❤️`,
      `So excited for the field trip! #cantwait`,
    ],
    social: [
      `Hanging with the squad at lunch 😎 #friends`,
      `Why is everyone acting so weird today? 🤔`,
      `Can we talk about what happened?? #drama`,
      `Love my bestie!! 💕 #bff`,
    ],
    boredom: [
      `This class is sooooo boring 😴 #helpme`,
      `How much longer??? ⏰ #countdown`,
      `Someone save me from this lecture 💀`,
      `*stares at clock* #eternal`,
    ],
    help: [
      `Does anyone understand the math homework?? #confused`,
      `Can someone explain this to me? 🤷`,
      `Need help with science project! Anyone??`,
      `SOS - totally lost on this assignment 😭`,
    ],
    random: [
      `Just thinking about pizza 🍕 #random`,
      `Why do we even need school? 🤔 #showerthoughts`,
      `*random noises* #bored`,
      `Is it Friday yet? #weekendvibes`,
    ],
    panic: [
      `TEST TOMORROW AND I HAVEN'T STUDIED 😱 #panic`,
      `We're all gonna fail omg #help`,
      `How is it already due?? I just started! 💀`,
      `STRESSED STRESSED STRESSED #testweek`,
    ],
    gossip: [
      `Did you hear what happened at recess?? 👀`,
      `OMG you'll never believe this... #tea`,
      `Everyone's talking about it #drama`,
      `Wait is this actually true??? #rumors`,
    ],
  };

  const categoryTemplates = templates[category] ?? templates.random;
  return categoryTemplates[Math.floor(Math.random() * categoryTemplates.length)];
}

// ============ EXAMPLE 5: Extract Hashtags ============

function extractHashtags(content: string): string[] {
  const matches = content.match(/#\w+/g);
  return matches ? matches.map(tag => tag.slice(1).toLowerCase()) : [];
}

// ============ EXAMPLE 6: Get Time of Day ============

function getTimeOfDayFromPhase(phase: GamePhase): 'morning' | 'lunch' | 'afternoon' | 'afterschool' | 'evening' {
  const mapping: Record<GamePhase, any> = {
    morning: 'morning',
    teaching: 'afternoon',
    interaction: 'afterschool',
    'end-of-day': 'evening',
  };
  return mapping[phase];
}

// ============ EXAMPLE 7: Get Trending Feed ============

export function getTrendingFeed(
  allPosts: StudentPost[],
  students: Student[],
  limit = 10
): {
  trendingPosts: StudentPost[];
  trendingHashtags: Array<{ tag: string; count: number }>;
  viralPosts: StudentPost[];
} {
  // Get trending posts from last 3 days
  const trending = getTrendingPosts(allPosts, students, limit, 3);

  // Get trending hashtags
  const hashtags = calculateTrendingHashtags(allPosts, 10, 3);

  // Find viral posts
  const viral = allPosts.filter(post => isViralPost(post, students));

  return {
    trendingPosts: trending,
    trendingHashtags: hashtags.map(h => ({ tag: h.tag, count: h.count })),
    viralPosts: viral,
  };
}

// ============ EXAMPLE 8: Daily Summary ============

export function getDailySummary(
  students: Student[],
  context: PostContext
): Array<{ studentName: string; expectedPosts: number }> {
  return students.map(student => ({
    studentName: `${student.firstName} ${student.lastName}`,
    expectedPosts: getExpectedPostsPerDay(student, context),
  })).sort((a, b) => b.expectedPosts - a.expectedPosts);
}

// ============ EXAMPLE 9: Check for Drama Events ============

export function detectDramaEvents(
  recentPosts: StudentPost[],
  students: Student[]
): Array<{ description: string; severity: 'low' | 'medium' | 'high' }> {
  const events: Array<{ description: string; severity: 'low' | 'medium' | 'high' }> = [];

  // Check for gossip spikes
  const gossipPosts = recentPosts.filter(p => p.category === 'gossip');
  if (gossipPosts.length > students.length * 0.3) {
    events.push({
      description: 'Gossip spreading rapidly through the class',
      severity: 'medium',
    });
  }

  // Check for viral drama posts
  const viralDrama = recentPosts.filter(p =>
    (p.category === 'gossip' || p.category === 'social') &&
    isViralPost(p, students)
  );

  if (viralDrama.length > 0) {
    events.push({
      description: `Viral drama: "${viralDrama[0].content}"`,
      severity: 'high',
    });
  }

  // Check for widespread panic
  const panicPosts = recentPosts.filter(p => p.category === 'panic');
  if (panicPosts.length > students.length * 0.4) {
    events.push({
      description: 'Class-wide test anxiety detected',
      severity: 'medium',
    });
  }

  return events;
}

// ============ EXAMPLE 10: Complete Game Integration ============

export interface SocialMediaState {
  phones: Record<string, StudentPhone>;
  posts: StudentPost[];
  lastPostTimes: Record<string, number>;
}

export function processSocialMediaTurn(
  state: SocialMediaState,
  students: Student[],
  currentPhase: GamePhase,
  lessonEngagement: number,
  currentDay: number,
  recentEvent?: string,
  isTestWeek = false
): SocialMediaState {
  // Generate new posts
  const { newPosts, updatedLastPostTimes } = processStudentPosts(
    students,
    currentPhase,
    lessonEngagement,
    currentDay,
    state.lastPostTimes,
    recentEvent,
    isTestWeek
  );

  // Combine with existing posts
  const allPosts = [...state.posts, ...newPosts];

  // Keep only recent posts (last 7 days to prevent memory bloat)
  const recentPosts = allPosts.filter(p => currentDay - p.timestamp <= 7);

  return {
    phones: state.phones,
    posts: recentPosts,
    lastPostTimes: updatedLastPostTimes,
  };
}

// ============ USAGE EXAMPLE ============

export function exampleUsage() {
  // This is a complete example of using the post mechanics engine

  const students: Student[] = []; // Your students array
  const currentDay = 10;
  const currentPhase: GamePhase = 'teaching';
  const lessonEngagement = 35; // Boring lesson!

  // 1. Initialize phones (do this once at game start)
  const phones = initializeAllStudentPhones(students);

  // 2. Process posts for this phase
  const { newPosts, updatedLastPostTimes } = processStudentPosts(
    students,
    currentPhase,
    lessonEngagement,
    currentDay,
    {},
    undefined,
    false
  );

  console.log(`Generated ${newPosts.length} posts during ${currentPhase} phase`);

  // 3. Get trending feed
  const { trendingPosts, trendingHashtags } = getTrendingFeed(newPosts, students);
  console.log('Trending posts:', trendingPosts.length);
  console.log('Trending hashtags:', trendingHashtags);

  // 4. Check for drama
  const dramaEvents = detectDramaEvents(newPosts, students);
  console.log('Drama events detected:', dramaEvents);

  // 5. Get daily summary
  const summary = getDailySummary(students, {
    currentPhase,
    lessonEngagement,
  });
  console.log('Most active posters:', summary.slice(0, 3));
}
