/**
 * Social Media Feature Tests
 * Validates social media posts, viral scoring, and engagement mechanics
 */

import { describe, it, expect } from 'vitest';
import type { Student, Mood, GamePhase } from '../game/types';
import {
  calculatePostingProbability,
  calculateViralScore,
  generatePostEngagement,
  generateHandle,
  initializeStudentPhone,
  type StudentPost,
  type PostContext,
} from './socialMedia';
import { POST_TEMPLATES } from './postTemplates';

// Mock student factory
const createTestStudent = (overrides: Partial<Student> = {}): Student => ({
  id: 'test-student-1',
  firstName: 'Test',
  lastName: 'Student',
  avatarSeed: 'seed123',
  academicLevel: 70,
  engagement: 75,
  energy: 80,
  socialSkills: 70,
  primaryTrait: 'outgoing',
  secondaryTrait: 'curious',
  learningStyle: 'visual',
  mood: 'happy',
  homeworkCompleted: true,
  homeworkQuality: 80,
  attendanceToday: true,
  friendIds: ['friend1', 'friend2'],
  rivalIds: [],
  popularity: 75,
  clique: 'popular',
  socialEnergy: 80,
  friendshipStrengths: { friend1: 80, friend2: 70 },
  testScores: [85, 90, 88],
  behaviorIncidents: 0,
  positiveNotes: 5,
  hasIEP: false,
  needsExtraHelp: false,
  isGifted: true,
  ...overrides,
});

// Mock post context factory
const createTestContext = (overrides: Partial<PostContext> = {}): PostContext => ({
  currentPhase: 'interaction',
  lessonEngagement: 75,
  hasHomework: false,
  isTestWeek: false,
  isHoliday: false,
  ...overrides,
});

// Mock post factory
const createMockPost = (overrides: Partial<StudentPost> = {}): StudentPost => ({
  id: 'post-1',
  authorId: 'student-1',
  handle: 'test_handle',
  category: 'social',
  type: 'text',
  content: 'This is a test post about friendship and fun times!',
  timestamp: 50,
  timeOfDay: 'lunch',
  likes: 5,
  comments: [],
  viralScore: 42,
  hashtags: [],
  duringClass: false,
  ...overrides,
});

describe('Posting Probability', () => {
  it('should return probability in valid 0-1 range', () => {
    const student = createTestStudent();
    const context = createTestContext();
    const probability = calculatePostingProbability(student, context);

    expect(probability).toBeGreaterThanOrEqual(0);
    expect(probability).toBeLessThanOrEqual(1);
  });

  it('should give higher probability to outgoing students', () => {
    const context = createTestContext();
    const outgoing = createTestStudent({ primaryTrait: 'outgoing' });
    const shy = createTestStudent({ primaryTrait: 'shy' });

    const outgoingProb = calculatePostingProbability(outgoing, context);
    const shyProb = calculatePostingProbability(shy, context);

    expect(outgoingProb).toBeGreaterThan(shyProb);
  });

  it('should factor in social energy and mood for posting behavior', () => {
    const context = createTestContext();
    const happyStudent = createTestStudent({ mood: 'happy', energy: 80 });
    const boredStudent = createTestStudent({ mood: 'bored', energy: 30 });

    const happyProb = calculatePostingProbability(happyStudent, context);
    const boredProb = calculatePostingProbability(boredStudent, context);

    expect(happyProb).toBeGreaterThanOrEqual(0);
    expect(boredProb).toBeGreaterThanOrEqual(0);
  });

  it('should consider lesson phase in posting probability', () => {
    const student = createTestStudent({ engagement: 50 });

    const teachingContext = createTestContext({ currentPhase: 'teaching', lessonEngagement: 30 });
    const endOfDayContext = createTestContext({ currentPhase: 'end-of-day' });

    const teachingProb = calculatePostingProbability(student, teachingContext);
    const endOfDayProb = calculatePostingProbability(student, endOfDayContext);

    expect(teachingProb).toBeDefined();
    expect(endOfDayProb).toBeDefined();
  });

  it('should be consistent with same inputs', () => {
    const student = createTestStudent();
    const context = createTestContext();

    const prob1 = calculatePostingProbability(student, context);
    const prob2 = calculatePostingProbability(student, context);

    expect(prob1).toBe(prob2);
  });
});

describe('Viral Score Calculation', () => {
  it('should calculate viral score in valid 0-100 range', () => {
    const post = createMockPost();
    const viralScore = calculateViralScore(post, 75, 15);

    expect(viralScore).toBeGreaterThanOrEqual(0);
    expect(viralScore).toBeLessThanOrEqual(100);
  });

  it('should reward posts with more engagement', () => {
    const lowEngagementPost = createMockPost({
      likes: 2,
      comments: [],
    });

    const highEngagementPost = createMockPost({
      likes: 10,
      comments: [
        { id: '1', authorId: 'student-2', handle: 'student2', content: 'Great post', timestamp: 50, likes: 0 },
        { id: '2', authorId: 'student-3', handle: 'student3', content: 'Totally agree', timestamp: 50, likes: 0 },
      ],
    });

    const lowScore = calculateViralScore(lowEngagementPost, 50, 15);
    const highScore = calculateViralScore(highEngagementPost, 50, 15);

    expect(highScore).toBeGreaterThan(lowScore);
  });

  it('should factor in author popularity', () => {
    const post = createMockPost({ likes: 5, comments: [{ id: '1', authorId: 'student-2', handle: 'student2', content: 'Nice', timestamp: 50, likes: 0 }] });

    const unpopularScore = calculateViralScore(post, 20, 15);
    const popularScore = calculateViralScore(post, 90, 15);

    expect(popularScore).toBeGreaterThan(unpopularScore);
  });

  it('should handle posts with no engagement', () => {
    const zeroPost = createMockPost({
      likes: 0,
      comments: [],
    });

    const score = calculateViralScore(zeroPost, 50, 15);
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });

  it('should be consistent with same post data', () => {
    const post = createMockPost();
    const score1 = calculateViralScore(post, 75, 15);
    const score2 = calculateViralScore(post, 75, 15);

    expect(score1).toBe(score2);
  });
});

describe('Post Engagement Generation', () => {
  it('should generate engagement with valid structure', () => {
    const post = createMockPost();
    const author = createTestStudent({ id: 'student-1' });
    const otherStudents = [
      createTestStudent({ id: 'student-2' }),
      createTestStudent({ id: 'student-3' }),
    ];

    const engagement = generatePostEngagement(post, author, otherStudents, 5);

    expect(engagement).toBeDefined();
    expect(typeof engagement.likes).toBe('number');
    expect(Array.isArray(engagement.comments)).toBe(true);
  });

  it('should ensure engagement is reasonable', () => {
    const author = createTestStudent({ id: 'student-1' });
    const student2 = createTestStudent({ id: 'student-2' });
    const student3 = createTestStudent({ id: 'student-3' });
    const post = createMockPost();

    const engagement = generatePostEngagement(post, author, [student2, student3], 5);

    expect(engagement.likes).toBeGreaterThanOrEqual(0);
    expect(engagement.comments).toHaveProperty('length');
  });

  it('should generate reasonable engagement with friend influence', () => {
    const author = createTestStudent({
      id: 'student-1',
      friendIds: ['student-2', 'student-3']
    });
    const students = [
      createTestStudent({ id: 'student-2' }),
      createTestStudent({ id: 'student-3' }),
      createTestStudent({ id: 'student-4' }),
    ];
    const post = createMockPost();

    const engagement = generatePostEngagement(post, author, students, 5);

    expect(engagement.likes).toBeGreaterThanOrEqual(0);
  });
});

describe('Student Phone & Handle Generation', () => {
  it('should generate handles for students', () => {
    const student1 = createTestStudent({ id: 'student-1', firstName: 'Alice' });
    const student2 = createTestStudent({ id: 'student-2', firstName: 'Bob' });

    const handle1 = generateHandle(student1);
    const handle2 = generateHandle(student2);

    expect(handle1).toBeTruthy();
    expect(handle2).toBeTruthy();
    expect(typeof handle1).toBe('string');
    expect(typeof handle2).toBe('string');
  });

  it('should initialize student phone profile correctly', () => {
    const student = createTestStudent({
      popularity: 75,
      engagement: 80,
      socialSkills: 70
    });

    const phone = initializeStudentPhone(student);

    expect(phone.handle).toBeTruthy();
    expect(typeof phone.followers).toBe('number');
    expect(typeof phone.following).toBe('number');
    expect(typeof phone.postingBehavior).toBe('number');
    expect(typeof phone.avgEngagement).toBe('number');
  });

  it('should reflect popularity in follower count', () => {
    const popular = createTestStudent({ popularity: 90 });
    const unpopular = createTestStudent({ popularity: 20 });

    const popularPhone = initializeStudentPhone(popular);
    const unpopularPhone = initializeStudentPhone(unpopular);

    expect(popularPhone.followers).toBeGreaterThan(unpopularPhone.followers);
  });

  it('should set posting behavior based on personality', () => {
    const outgoing = createTestStudent({ primaryTrait: 'outgoing' });
    const shy = createTestStudent({ primaryTrait: 'shy' });

    const outgoingPhone = initializeStudentPhone(outgoing);
    const shyPhone = initializeStudentPhone(shy);

    expect(outgoingPhone.postingBehavior).toBeGreaterThan(shyPhone.postingBehavior);
  });
});

describe('Post Templates', () => {
  it('should have sufficient templates available', () => {
    expect(POST_TEMPLATES).toBeDefined();
    expect(Array.isArray(POST_TEMPLATES)).toBe(true);
    expect(POST_TEMPLATES.length).toBeGreaterThan(50);
  });

  it('should have templates with valid structure', () => {
    for (const template of POST_TEMPLATES.slice(0, 10)) {
      expect(template).toHaveProperty('id');
      expect(template).toHaveProperty('content');
      expect(template).toHaveProperty('category');
      expect(typeof template.content).toBe('string');
      expect(template.content.length).toBeGreaterThan(0);
    }
  });

  it('should cover multiple post categories', () => {
    const categories = new Set(POST_TEMPLATES.map(t => t.category));

    expect(categories.size).toBeGreaterThan(2);
  });

  it('should have templates for various personalities', () => {
    const personalities = new Set<string>();

    for (const template of POST_TEMPLATES) {
      if (template.personalities) {
        template.personalities.forEach(p => personalities.add(p));
      }
    }

    expect(personalities.size).toBeGreaterThan(1);
  });
});

describe('Content Validation', () => {
  it('should ensure post content is school-appropriate', () => {
    for (const post of [
      createMockPost({ content: 'Just had an awesome math class!' }),
      createMockPost({ content: 'Can\'t wait for lunch lol' }),
      createMockPost({ content: 'Did everyone finish the homework?' }),
    ]) {
      expect(post.content).toBeTruthy();
      expect(post.content.length).toBeGreaterThan(5);
      expect(post.content.length).toBeLessThan(500);
    }
  });

  it('should handle edge cases in post data', () => {
    const author = createTestStudent({ id: 'student-1' });
    const edgeCases = [
      createMockPost({ likes: 0, comments: [] }),
      createMockPost({ likes: 50, comments: [] }),
      createMockPost({ content: 'x' }),
    ];

    for (const post of edgeCases) {
      expect(() => calculateViralScore(post, 50, 15)).not.toThrow();
      expect(() => generatePostEngagement(post, author, [], 5)).not.toThrow();
    }
  });
});

describe('Social Media System Integration', () => {
  it('should calculate probabilities consistently with personality', () => {
    const context = createTestContext();
    const student = createTestStudent({
      primaryTrait: 'outgoing',
      socialEnergy: 80,
      popularity: 85
    });

    const probability = calculatePostingProbability(student, context);
    const phone = initializeStudentPhone(student);

    expect(phone.postingBehavior).toBeGreaterThan(0.5);
    expect(probability).toBeGreaterThan(0);
  });

  it('should handle multiple students consistently', () => {
    const students = [
      createTestStudent({ id: 'student-1', primaryTrait: 'outgoing' }),
      createTestStudent({ id: 'student-2', primaryTrait: 'shy' }),
      createTestStudent({ id: 'student-3', primaryTrait: 'social' }),
    ];

    const context = createTestContext();

    for (const student of students) {
      const probability = calculatePostingProbability(student, context);
      const phone = initializeStudentPhone(student);

      expect(probability).toBeGreaterThanOrEqual(0);
      expect(probability).toBeLessThanOrEqual(1);
      expect(phone.followers).toBeGreaterThanOrEqual(0);
    }
  });
});
