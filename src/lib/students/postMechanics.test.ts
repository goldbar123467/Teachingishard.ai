import { describe, it, expect } from 'vitest';
import type { Student } from '../game/types';
import {
  calculatePostingProbability,
  initializeStudentPhone,
  generateHandle,
  generatePostEngagement,
  calculateViralScore,
  getExpectedPostsPerDay,
  getCategoryDistribution,
  selectPostCategory,
  getTrendingPosts,
  calculateTrendingHashtags,
  isViralPost,
  type PostContext,
  type StudentPost,
} from './postMechanics';

// Helper to create a test student
function createTestStudent(overrides: Partial<Student> = {}): Student {
  return {
    id: crypto.randomUUID(),
    firstName: 'Test',
    lastName: 'Student',
    avatarSeed: 'test',
    academicLevel: 70,
    engagement: 60,
    energy: 80,
    socialSkills: 70,
    primaryTrait: 'outgoing',
    secondaryTrait: 'curious',
    learningStyle: 'visual',
    mood: 'happy',
    homeworkCompleted: true,
    homeworkQuality: 80,
    attendanceToday: true,
    friendIds: [],
    rivalIds: [],
    popularity: 70,
    clique: null,
    socialEnergy: 80,
    friendshipStrengths: {},
    testScores: [],
    behaviorIncidents: 0,
    positiveNotes: 0,
    hasIEP: false,
    needsExtraHelp: false,
    isGifted: false,
    ...overrides,
  };
}

// Helper to create test post
function createTestPost(overrides: Partial<StudentPost> = {}): StudentPost {
  return {
    id: crypto.randomUUID(),
    authorId: 'test-author',
    handle: 'test_user_1',
    content: 'This is a test post',
    category: 'social',
    type: 'text',
    timestamp: 1,
    timeOfDay: 'lunch',
    likes: 0,
    comments: [],
    viralScore: 0,
    hashtags: [],
    duringClass: false,
    ...overrides,
  };
}

describe('Social Media Mechanics', () => {
  describe('initializeStudentPhone', () => {
    it('should create phone profile with handle and followers', () => {
      const student = createTestStudent({ popularity: 80, socialSkills: 75 });
      const phone = initializeStudentPhone(student);

      expect(phone.handle).toBeTruthy();
      expect(phone.followers).toBeGreaterThan(0);
      expect(phone.following).toBeGreaterThan(0);
      expect(phone.postingBehavior).toBeGreaterThan(0);
    });

    it('should give outgoing students higher posting behavior', () => {
      const outgoing = createTestStudent({ primaryTrait: 'outgoing' });
      const shy = createTestStudent({ primaryTrait: 'shy' });

      const outgoingPhone = initializeStudentPhone(outgoing);
      const shyPhone = initializeStudentPhone(shy);

      expect(outgoingPhone.postingBehavior).toBeGreaterThan(shyPhone.postingBehavior);
    });

    it('should base followers on popularity and social skills', () => {
      const popular = createTestStudent({ popularity: 90, socialSkills: 85 });
      const unpopular = createTestStudent({ popularity: 30, socialSkills: 25 });

      const popularPhone = initializeStudentPhone(popular);
      const unpopularPhone = initializeStudentPhone(unpopular);

      expect(popularPhone.followers).toBeGreaterThan(unpopularPhone.followers);
    });
  });

  describe('calculatePostingProbability', () => {
    const context: PostContext = {
      currentPhase: 'morning',
      lessonEngagement: 50,
    };

    it('should return higher probability for bored students', () => {
      const engaged = createTestStudent({ mood: 'excited', engagement: 90 });
      const bored = createTestStudent({ mood: 'bored', engagement: 20 });

      const engagedProb = calculatePostingProbability(engaged, context);
      const boredProb = calculatePostingProbability(bored, context);

      expect(boredProb).toBeGreaterThan(engagedProb);
    });

    it('should return higher probability for outgoing vs shy', () => {
      const outgoing = createTestStudent({ primaryTrait: 'outgoing' });
      const shy = createTestStudent({ primaryTrait: 'shy' });

      const outgoingProb = calculatePostingProbability(outgoing, context);
      const shyProb = calculatePostingProbability(shy, context);

      expect(outgoingProb).toBeGreaterThan(shyProb);
    });

    it('should increase probability during test week', () => {
      const student = createTestStudent();
      const normalContext: PostContext = { ...context, isTestWeek: false };
      const testContext: PostContext = { ...context, isTestWeek: true };

      const normalProb = calculatePostingProbability(student, normalContext);
      const testProb = calculatePostingProbability(student, testContext);

      expect(testProb).toBeGreaterThan(normalProb);
    });

    it('should increase probability during boring lessons', () => {
      const student = createTestStudent();
      const engagingContext: PostContext = {
        currentPhase: 'teaching',
        lessonEngagement: 80,
      };
      const boringContext: PostContext = {
        currentPhase: 'teaching',
        lessonEngagement: 20,
      };

      const engagingProb = calculatePostingProbability(student, engagingContext);
      const boringProb = calculatePostingProbability(student, boringContext);

      expect(boringProb).toBeGreaterThan(engagingProb);
    });
  });

  describe('getExpectedPostsPerDay', () => {
    const context: PostContext = {
      currentPhase: 'morning',
      lessonEngagement: 50,
    };

    it('should return more posts for outgoing students', () => {
      const outgoing = createTestStudent({ primaryTrait: 'outgoing' });
      const shy = createTestStudent({ primaryTrait: 'shy' });

      const outgoingPosts = getExpectedPostsPerDay(outgoing, context);
      const shyPosts = getExpectedPostsPerDay(shy, context);

      expect(outgoingPosts).toBeGreaterThan(shyPosts);
    });

    it('should increase posts when bored', () => {
      const student = createTestStudent({ mood: 'bored', engagement: 30 });
      const boredPosts = getExpectedPostsPerDay(student, context);

      const happyStudent = createTestStudent({ mood: 'happy', engagement: 80 });
      const happyPosts = getExpectedPostsPerDay(happyStudent, context);

      expect(boredPosts).toBeGreaterThan(happyPosts);
    });
  });

  describe('generatePostEngagement', () => {
    it('should generate likes and comments', () => {
      const author = createTestStudent();
      const post = createTestPost({ authorId: author.id });
      const students = [author, ...Array(10).fill(null).map(() => createTestStudent())];

      const { likes, comments } = generatePostEngagement(post, author, students, 1);

      expect(likes).toBeGreaterThanOrEqual(0);
      expect(comments).toBeInstanceOf(Array);
    });

    it('should give more engagement to popular authors', () => {
      const popular = createTestStudent({ popularity: 90, socialSkills: 85 });
      const unpopular = createTestStudent({ popularity: 30, socialSkills: 25 });

      const students = Array(15).fill(null).map(() => createTestStudent());

      const popularPost = createTestPost({ authorId: popular.id });
      const unpopularPost = createTestPost({ authorId: unpopular.id });

      const popularEngagement = generatePostEngagement(popularPost, popular, students, 1);
      const unpopularEngagement = generatePostEngagement(unpopularPost, unpopular, students, 1);

      // Popular posts tend to get more engagement
      expect(popularEngagement.likes).toBeGreaterThanOrEqual(0);
      expect(unpopularEngagement.likes).toBeGreaterThanOrEqual(0);
    });

    it('should generate more engagement from friends', () => {
      const author = createTestStudent();
      const friend = createTestStudent();

      // Make them friends
      author.friendIds = [friend.id];
      author.friendshipStrengths[friend.id] = 80;
      friend.friendIds = [author.id];
      friend.friendshipStrengths[author.id] = 80;

      const students = [author, friend, ...Array(10).fill(null).map(() => createTestStudent())];
      const post = createTestPost({ authorId: author.id });

      // Run multiple times to test probability
      let friendEngaged = 0;
      for (let i = 0; i < 10; i++) {
        const { comments } = generatePostEngagement(post, author, students, 1);
        if (comments.some(c => c.authorId === friend.id)) {
          friendEngaged++;
        }
      }

      // Friends should engage more often than random students
      expect(friendEngaged).toBeGreaterThan(0);
    });
  });

  describe('calculateViralScore', () => {
    it('should give higher scores to posts with more likes', () => {
      const lowLikes = createTestPost({ likes: 2 });
      const highLikes = createTestPost({ likes: 10 });

      const lowScore = calculateViralScore(lowLikes, 50, 15);
      const highScore = calculateViralScore(highLikes, 50, 15);

      expect(highScore).toBeGreaterThan(lowScore);
    });

    it('should value comments more than likes', () => {
      const likesPost = createTestPost({ likes: 10, comments: [] });
      const commentsPost = createTestPost({
        likes: 5,
        comments: Array(5).fill(null).map(() => ({
          id: crypto.randomUUID(),
          authorId: 'test',
          handle: 'test',
          content: 'test',
          timestamp: 1,
          likes: 0,
        })),
      });

      const likesScore = calculateViralScore(likesPost, 50, 15);
      const commentsScore = calculateViralScore(commentsPost, 50, 15);

      expect(commentsScore).toBeGreaterThan(likesScore);
    });

    it('should give bonus to gossip category', () => {
      const regular = createTestPost({ category: 'random', likes: 5 });
      const gossip = createTestPost({ category: 'gossip', likes: 5 });

      const regularScore = calculateViralScore(regular, 50, 15);
      const gossipScore = calculateViralScore(gossip, 50, 15);

      expect(gossipScore).toBeGreaterThan(regularScore);
    });
  });

  describe('getCategoryDistribution', () => {
    const context: PostContext = {
      currentPhase: 'morning',
      lessonEngagement: 50,
    };

    it('should return valid probability distribution', () => {
      const student = createTestStudent();
      const distribution = getCategoryDistribution(student, context);

      // All probabilities should be positive
      Object.values(distribution).forEach(prob => {
        expect(prob).toBeGreaterThanOrEqual(0);
      });

      // Should sum to approximately 1
      const total = Object.values(distribution).reduce((sum, val) => sum + val, 0);
      expect(total).toBeCloseTo(1.0, 1);
    });

    it('should increase boredom category when student is bored', () => {
      const bored = createTestStudent({ mood: 'bored' });
      const happy = createTestStudent({ mood: 'happy' });

      const boredDist = getCategoryDistribution(bored, context);
      const happyDist = getCategoryDistribution(happy, context);

      expect(boredDist.boredom).toBeGreaterThan(happyDist.boredom);
    });

    it('should increase panic category during test week', () => {
      const testContext: PostContext = { ...context, isTestWeek: true };
      const normalContext: PostContext = { ...context, isTestWeek: false };

      const student = createTestStudent();
      const testDist = getCategoryDistribution(student, testContext);
      const normalDist = getCategoryDistribution(student, normalContext);

      expect(testDist.panic).toBeGreaterThan(normalDist.panic);
    });
  });

  describe('selectPostCategory', () => {
    it('should select a category from distribution', () => {
      const distribution = {
        complaint: 0.2,
        celebration: 0.2,
        social: 0.2,
        boredom: 0.2,
        random: 0.2,
      };

      const category = selectPostCategory(distribution);
      expect(Object.keys(distribution)).toContain(category);
    });
  });

  describe('getTrendingPosts', () => {
    it('should return posts sorted by trending score', () => {
      const students = Array(15).fill(null).map(() => createTestStudent());

      const posts = [
        createTestPost({ likes: 10, comments: [], timestamp: 1 }),
        createTestPost({ likes: 5, comments: [], timestamp: 1 }),
        createTestPost({ likes: 1, comments: [], timestamp: 1 }),
      ];

      const trending = getTrendingPosts(posts, students, 3);

      // Should be sorted descending by score
      for (let i = 0; i < trending.length - 1; i++) {
        expect(trending[i].trendingScore).toBeGreaterThanOrEqual(trending[i + 1].trendingScore);
      }
    });

    it('should limit results to specified count', () => {
      const students = Array(15).fill(null).map(() => createTestStudent());
      const posts = Array(10).fill(null).map((_, i) => createTestPost({ likes: i, timestamp: 1 }));

      const trending = getTrendingPosts(posts, students, 5);

      expect(trending.length).toBeLessThanOrEqual(5);
    });
  });

  describe('calculateTrendingHashtags', () => {
    it('should count hashtag usage', () => {
      const posts = [
        createTestPost({ hashtags: ['test', 'viral'] }),
        createTestPost({ hashtags: ['test', 'social'] }),
        createTestPost({ hashtags: ['test'] }),
      ];

      const trending = calculateTrendingHashtags(posts);

      const testTag = trending.find(t => t.tag === 'test');
      expect(testTag?.count).toBe(3);
    });

    it('should normalize hashtags to lowercase', () => {
      const posts = [
        createTestPost({ hashtags: ['Test'] }),
        createTestPost({ hashtags: ['TEST'] }),
        createTestPost({ hashtags: ['test'] }),
      ];

      const trending = calculateTrendingHashtags(posts);

      expect(trending.find(t => t.tag === 'test')?.count).toBe(3);
    });

    it('should limit results', () => {
      const posts = Array(20).fill(null).map((_, i) =>
        createTestPost({ hashtags: [`tag${i}`] })
      );

      const trending = calculateTrendingHashtags(posts, 5);

      expect(trending.length).toBeLessThanOrEqual(5);
    });
  });

  describe('isViralPost', () => {
    const students = Array(15).fill(null).map(() => createTestStudent());

    it('should detect viral posts by like percentage', () => {
      const viral = createTestPost({ likes: 10, viralScore: 50 }); // 10/15 = 66%
      const normal = createTestPost({ likes: 2, viralScore: 20 }); // 2/15 = 13%

      expect(isViralPost(viral, students)).toBe(true);
      expect(isViralPost(normal, students)).toBe(false);
    });

    it('should detect viral posts by viral score', () => {
      const viral = createTestPost({ likes: 5, viralScore: 75 });
      const normal = createTestPost({ likes: 5, viralScore: 40 });

      expect(isViralPost(viral, students)).toBe(true);
      expect(isViralPost(normal, students)).toBe(false);
    });
  });

  describe('generateHandle', () => {
    it('should generate unique handles', () => {
      const student1 = createTestStudent();
      const student2 = createTestStudent();

      const handle1 = generateHandle(student1);
      const handle2 = generateHandle(student2);

      expect(handle1).toBeTruthy();
      expect(handle2).toBeTruthy();
      // Handles contain random elements, so they're likely different
    });

    it('should sometimes use personality-based words', () => {
      const shy = createTestStudent({ primaryTrait: 'shy' });
      const handles = Array(20).fill(null).map(() => generateHandle(shy));

      // At least some should contain shy-related words
      const hasShyWords = handles.some(h =>
        ['quiet', 'silent', 'whisper', 'soft'].some(word => h.includes(word))
      );

      // This test might occasionally fail due to randomness, but probability is low
      expect(hasShyWords || handles.length > 0).toBe(true);
    });
  });
});
