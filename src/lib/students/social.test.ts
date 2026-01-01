import { describe, it, expect } from 'vitest';
import {
  calculateCompatibility,
  generateInitialFriendships,
  assignClique,
  calculatePopularity,
  generateSocialInteraction,
  updateFriendship,
  shouldFormRelationship,
  assignCliques,
  generateFeedPost,
  calculateSocialEnergyDrain,
  calculateSocialEnergyGain,
} from './socialEngine';
import type { Student } from '../game/types';

function createMockStudent(overrides: Partial<Student> = {}): Student {
  return {
    id: 'test-student-1',
    firstName: 'Test',
    lastName: 'Student',
    avatarSeed: 'test-seed',
    primaryTrait: 'curious',
    secondaryTrait: 'shy',
    learningStyle: 'visual',
    academicLevel: 70,
    engagement: 60,
    energy: 80,
    socialSkills: 50,
    mood: 'neutral',
    attendanceToday: true,
    homeworkCompleted: true,
    homeworkQuality: 75,
    hasIEP: false,
    isGifted: false,
    needsExtraHelp: false,
    friendIds: [],
    rivalIds: [],
    testScores: [],
    behaviorIncidents: 0,
    positiveNotes: 0,
    ...overrides,
  };
}

describe('Social Dynamics Engine', () => {
  describe('calculateCompatibility', () => {
    it('should return high compatibility for similar outgoing traits', () => {
      const student1 = createMockStudent({
        id: 'student-1',
        primaryTrait: 'outgoing',
        secondaryTrait: 'social',
      });
      const student2 = createMockStudent({
        id: 'student-2',
        primaryTrait: 'social',
        secondaryTrait: 'outgoing',
      });

      const compatibility = calculateCompatibility(student1, student2);

      expect(compatibility.score).toBeGreaterThan(20);
    });

    it('should return negative compatibility for shy and outgoing traits', () => {
      const student1 = createMockStudent({
        id: 'student-1',
        primaryTrait: 'outgoing',
      });
      const student2 = createMockStudent({
        id: 'student-2',
        primaryTrait: 'shy',
      });

      const compatibility = calculateCompatibility(student1, student2);

      expect(compatibility.score).toBeLessThan(10);
    });
  });

  describe('assignClique', () => {
    it('should assign popular clique for high social skills', () => {
      const student = createMockStudent({
        socialSkills: 85,
      });

      const clique = assignClique(student);

      expect(clique).toBe('popular');
    });

    it('should assign loners clique for low social skills', () => {
      const student = createMockStudent({
        socialSkills: 35,
      });

      const clique = assignClique(student);

      expect(clique).toBe('loners');
    });

    it('should assign nerds clique for smart students', () => {
      const student = createMockStudent({
        primaryTrait: 'curious',
        socialSkills: 60,
      });

      const clique = assignClique(student);

      expect(clique).toBe('nerds');
    });
  });

  describe('calculatePopularity', () => {
    it('should increase with friendships', () => {
      const baseStudent = createMockStudent();
      const withFriends = createMockStudent({
        friendIds: ['friend-1', 'friend-2', 'friend-3'],
      });

      const basePop = calculatePopularity(baseStudent);
      const friendPop = calculatePopularity(withFriends);

      expect(friendPop).toBeGreaterThan(basePop);
    });

    it('should decrease with rivals', () => {
      const baseStudent = createMockStudent();
      const withRivals = createMockStudent({
        rivalIds: ['rival-1', 'rival-2'],
      });

      const basePop = calculatePopularity(baseStudent);
      const rivalPop = calculatePopularity(withRivals);

      expect(rivalPop).toBeLessThan(basePop);
    });
  });

  describe('generateSocialInteraction', () => {
    it('should create interaction between two students', () => {
      const student1 = createMockStudent({ id: 'student-1' });
      const student2 = createMockStudent({ id: 'student-2' });

      const interaction = generateSocialInteraction(student1, student2, 5);

      expect(interaction.id).toBeTruthy();
      expect(interaction.type).toBeTruthy();
      expect(interaction.participants).toEqual(['student-1', 'student-2']);
    });

    it('should favor friendly interactions for friends', () => {
      const student1 = createMockStudent({
        id: 'student-1',
        friendIds: ['student-2'],
      });
      const student2 = createMockStudent({ id: 'student-2' });

      const interaction = generateSocialInteraction(student1, student2, 5);

      expect(['chat', 'help', 'compliment', 'teamwork']).toContain(interaction.type);
    });
  });

  describe('updateFriendship', () => {
    it('should add positive delta', () => {
      const result = updateFriendship(0, 10);
      expect(result).toBe(10);
    });

    it('should clamp to [-100, 100]', () => {
      const tooHigh = updateFriendship(90, 50);
      const tooLow = updateFriendship(-90, -50);
      expect(tooHigh).toBe(100);
      expect(tooLow).toBe(-100);
    });
  });

  describe('shouldFormRelationship', () => {
    it('should create friend relationship for high positive score', () => {
      const result = shouldFormRelationship('s1', 's2', 40, 'positive', 30);
      expect(result).toBe('friend');
    });

    it('should create rival relationship for high negative score', () => {
      const result = shouldFormRelationship('s1', 's2', -40, 'negative', -30);
      expect(result).toBe('rival');
    });
  });

  describe('assignCliques', () => {
    it('should organize students into cliques', () => {
      const students = [
        createMockStudent({
          id: 's1',
          primaryTrait: 'curious',
          socialSkills: 50,
        }),
        createMockStudent({
          id: 's2',
          primaryTrait: 'smart',
          socialSkills: 50,
        }),
      ];

      const cliques = assignCliques(students);

      expect(Array.isArray(cliques)).toBe(true);
    });
  });

  describe('calculateSocialEnergyDrain', () => {
    it('should drain more for introverts on chat', () => {
      const introvertDrain = calculateSocialEnergyDrain('chat', true);
      const extrovertDrain = calculateSocialEnergyDrain('chat', false);

      expect(introvertDrain).toBeGreaterThan(extrovertDrain);
    });
  });

  describe('calculateSocialEnergyGain', () => {
    it('should gain more for extroverts on chat', () => {
      const extrovertGain = calculateSocialEnergyGain('chat', true);
      const introvertGain = calculateSocialEnergyGain('chat', false);

      expect(extrovertGain).toBeGreaterThan(introvertGain);
    });
  });
});
