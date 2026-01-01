/**
 * Post Generator Tests & Examples
 * Shows how the authentic teen voice system works
 */

import { describe, it, expect } from 'vitest';
import { generatePost, generateMultiplePosts, PostContext } from './postGenerator';
import type { Student } from '../game/types';
import type { SocialInteraction } from './social';

// Mock student for testing
const createMockStudent = (primaryTrait: string): Student => ({
  id: 'student-1',
  firstName: 'Alex',
  lastName: 'Smith',
  avatarSeed: 'seed123',
  academicLevel: 75,
  engagement: 80,
  energy: 80,
  socialSkills: 70,
  primaryTrait: primaryTrait as any,
  secondaryTrait: 'friendly' as any,
  learningStyle: 'visual',
  mood: 'happy',
  homeworkCompleted: true,
  homeworkQuality: 80,
  attendanceToday: true,
  friendIds: ['student-2', 'student-3'],
  rivalIds: [],
  popularity: 75,
  clique: 'popular',
  socialEnergy: 80,
  friendshipStrengths: { 'student-2': 80, 'student-3': 70 },
  testScores: [85, 90, 88],
  behaviorIncidents: 0,
  positiveNotes: 5,
  hasIEP: false,
  needsExtraHelp: false,
  isGifted: true,
});

// Mock relationships
const mockRelationships: SocialInteraction[] = [
  {
    id: 'interaction-1',
    type: 'chat',
    participants: ['student-1', 'student-2'],
    timestamp: 5,
    outcome: 'positive',
    description: 'Had fun with Jordan',
    friendshipDelta: 10,
    wasObserved: false,
  },
  {
    id: 'interaction-2',
    type: 'teamwork',
    participants: ['student-1', 'student-3'],
    timestamp: 4,
    outcome: 'positive',
    description: 'Worked on project with Sam',
    friendshipDelta: 8,
    wasObserved: true,
  },
];

describe('Post Generator', () => {
  it('should generate social posts for outgoing students', () => {
    const student = createMockStudent('outgoing');
    const context: PostContext = {
      student,
      relationships: mockRelationships,
      mood: 'happy',
      energy: 80,
    };

    const post = generatePost(context);
    expect(post).toBeTruthy();
    expect(post?.content).toBeTruthy();
    console.log('Outgoing social post:', post?.content);
  });

  it('should generate academic posts for studious students', () => {
    const student = createMockStudent('studious');
    const context: PostContext = {
      student,
      subject: 'math',
      score: 95,
      mood: 'excited',
      energy: 70,
    };

    const post = generatePost(context);
    expect(post).toBeTruthy();
    expect(post?.template.category).toBe('academic');
    console.log('Studious academic post:', post?.content);
  });

  it('should generate dramatic posts with proper voice', () => {
    const student = createMockStudent('dramatic');
    const context: PostContext = {
      student,
      mood: 'sad',
      energy: 30,
    };

    const post = generatePost(context);
    expect(post).toBeTruthy();
    console.log('Dramatic post:', post?.content);
  });

  it('should generate humor posts for class clowns', () => {
    const student = createMockStudent('class_clown');
    const context: PostContext = {
      student,
      teacherName: 'Ms. Johnson',
      mood: 'excited',
      energy: 90,
    };

    const post = generatePost(context);
    expect(post).toBeTruthy();
    console.log('Class clown humor post:', post?.content);
  });

  it('should generate shy student posts with minimal emoji', () => {
    const student = createMockStudent('shy');
    const context: PostContext = {
      student,
      mood: 'happy',
      energy: 50,
    };

    const post = generatePost(context);
    expect(post).toBeTruthy();
    // Shy students should use fewer emojis
    const emojiCount = (post?.content.match(/[\u{1F300}-\u{1F9FF}]/gu) || []).length;
    expect(emojiCount).toBeLessThanOrEqual(2);
    console.log('Shy student post:', post?.content);
  });

  it('should generate event reaction posts', () => {
    const student = createMockStudent('outgoing');
    const context: PostContext = {
      student,
      recentEvent: 'fire_drill',
      subject: 'math',
      mood: 'excited',
      energy: 75,
    };

    const post = generatePost(context);
    expect(post).toBeTruthy();
    console.log('Event reaction post:', post?.content);
  });

  it('should generate multiple varied posts', () => {
    const student = createMockStudent('popular');
    const context: PostContext = {
      student,
      relationships: mockRelationships,
      mood: 'happy',
      energy: 80,
    };

    const posts = generateMultiplePosts(context, 5);
    expect(posts.length).toBeGreaterThan(0);
    expect(posts.length).toBeLessThanOrEqual(5);

    console.log('\nMultiple posts from popular student:');
    posts.forEach((post, i) => {
      console.log(`${i + 1}. ${post.content}`);
    });
  });

  it('should apply proper caps for different moods', () => {
    const student = createMockStudent('outgoing');

    // Excited = caps
    const excitedPost = generatePost({
      student,
      mood: 'excited',
      energy: 90,
    });
    console.log('Excited (CAPS):', excitedPost?.content);

    // Tired = lowercase
    const tiredPost = generatePost({
      student,
      mood: 'tired',
      energy: 20,
    });
    console.log('Tired (lowercase):', tiredPost?.content);
  });

  it('should fill template variables correctly', () => {
    const student = createMockStudent('outgoing');
    const context: PostContext = {
      student,
      relationships: mockRelationships,
      teacherName: 'Mr. Smith',
      subject: 'science',
      score: 88,
      mood: 'happy',
      energy: 70,
    };

    const post = generatePost(context);
    expect(post).toBeTruthy();

    // Check that variables were replaced (no more {{ }} in output)
    expect(post?.content).not.toContain('{{');
    expect(post?.content).not.toContain('}}');

    console.log('Post with filled variables:', post?.content);
  });
});

/**
 * Example: Generate a full day of posts from different students
 */
describe('Full Day Simulation', () => {
  it('should generate realistic posts throughout a school day', () => {
    const students = [
      { student: createMockStudent('outgoing'), name: 'Emma' },
      { student: createMockStudent('shy'), name: 'Liam' },
      { student: createMockStudent('class_clown'), name: 'Olivia' },
      { student: createMockStudent('studious'), name: 'Noah' },
      { student: createMockStudent('dramatic'), name: 'Ava' },
    ];

    console.log('\n=== SCHOOL DAY SOCIAL FEED ===\n');

    // Morning posts
    console.log('--- MORNING (8:00 AM) ---');
    students.forEach(({ student, name }) => {
      const post = generatePost({
        student,
        mood: 'tired',
        energy: 40,
      });
      if (post) console.log(`${name}: ${post.content}`);
    });

    // Lunchtime posts
    console.log('\n--- LUNCH (12:00 PM) ---');
    students.forEach(({ student, name }) => {
      const post = generatePost({
        student,
        relationships: mockRelationships,
        mood: 'happy',
        energy: 70,
      });
      if (post) console.log(`${name}: ${post.content}`);
    });

    // After test posts
    console.log('\n--- AFTER TEST (2:00 PM) ---');
    students.forEach(({ student, name }) => {
      const post = generatePost({
        student,
        subject: 'math',
        score: Math.floor(Math.random() * 40) + 60,
        mood: Math.random() > 0.5 ? 'excited' : 'sad',
        energy: 60,
      });
      if (post) console.log(`${name}: ${post.content}`);
    });

    // End of day posts
    console.log('\n--- END OF DAY (3:30 PM) ---');
    students.forEach(({ student, name }) => {
      const post = generatePost({
        student,
        mood: 'excited',
        energy: 80,
      });
      if (post) console.log(`${name}: ${post.content}`);
    });
  });
});

/**
 * Example: Show personality differences in posts
 */
describe('Personality Voice Differences', () => {
  it('should show distinct voices for each personality', () => {
    const personalities = [
      'outgoing',
      'shy',
      'dramatic',
      'class_clown',
      'studious',
      'popular',
      'rebellious',
      'curious',
    ];

    console.log('\n=== PERSONALITY VOICE SAMPLES ===\n');

    personalities.forEach(personality => {
      const student = createMockStudent(personality);
      const posts = generateMultiplePosts(
        {
          student,
          relationships: mockRelationships,
          mood: 'happy',
          energy: 70,
        },
        3
      );

      console.log(`--- ${personality.toUpperCase()} ---`);
      posts.forEach(post => {
        console.log(`  ${post.content}`);
      });
      console.log('');
    });
  });
});
