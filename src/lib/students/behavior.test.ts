import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  shiftMood,
  calculateLearningStyleMatch,
  calculateEngagementChange,
  calculateAcademicGrowth,
  calculateMoodChange,
  calculateEnergyDrain,
  applyTeachingEffects,
  calculateHomeworkCompletionChance,
  simulateHomeworkCompletion,
  calculateOvernightRecovery,
  applyInteractionEffect,
  getStudentsNeedingAttention,
  getClassMorale,
} from './behavior';
import type { Student, Lesson, TeachingMethod, Mood } from '../game/types';

// Mock student factory
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
    popularity: 50,
    clique: null,
    socialEnergy: 65,
    friendshipStrengths: {},
    testScores: [],
    behaviorIncidents: 0,
    positiveNotes: 0,
    ...overrides,
  };
}

// Mock lesson factory
function createMockLesson(overrides: Partial<Lesson> = {}): Lesson {
  return {
    id: 'test-lesson-1',
    name: 'Test Lesson',
    subject: 'math',
    difficulty: 2,
    duration: 'medium',
    requiredEnergy: 10,
    ...overrides,
  };
}

// Mock teaching method factory
function createMockMethod(overrides: Partial<TeachingMethod> = {}): TeachingMethod {
  return {
    id: 'lecture',
    name: 'Lecture',
    description: 'Traditional lecture',
    energyCost: 5,
    engagementModifier: 0,
    bestFor: ['auditory', 'reading'],
    ...overrides,
  };
}

describe('shiftMood', () => {
  it('shifts mood up when delta is positive', () => {
    expect(shiftMood('neutral', 1)).toBe('happy');
    expect(shiftMood('neutral', 2)).toBe('excited');
    expect(shiftMood('bored', 1)).toBe('neutral');
  });

  it('shifts mood down when delta is negative', () => {
    expect(shiftMood('neutral', -1)).toBe('bored');
    expect(shiftMood('neutral', -2)).toBe('frustrated');
    expect(shiftMood('happy', -1)).toBe('neutral');
  });

  it('clamps at minimum mood (upset)', () => {
    expect(shiftMood('upset', -1)).toBe('upset');
    expect(shiftMood('frustrated', -10)).toBe('upset');
  });

  it('clamps at maximum mood (excited)', () => {
    expect(shiftMood('excited', 1)).toBe('excited');
    expect(shiftMood('happy', 10)).toBe('excited');
  });
});

describe('calculateLearningStyleMatch', () => {
  it('returns match with bonus when styles match', () => {
    const student = createMockStudent({ learningStyle: 'visual' });
    const method = createMockMethod({ bestFor: ['visual', 'kinesthetic'] });

    const result = calculateLearningStyleMatch(student, method);

    expect(result.isMatch).toBe(true);
    expect(result.bonus).toBe(15);
  });

  it('returns no match with penalty when styles dont match', () => {
    const student = createMockStudent({ learningStyle: 'visual' });
    const method = createMockMethod({ bestFor: ['auditory', 'reading'] });

    const result = calculateLearningStyleMatch(student, method);

    expect(result.isMatch).toBe(false);
    expect(result.bonus).toBe(-5);
  });
});

describe('calculateEngagementChange', () => {
  it('applies learning style bonus', () => {
    const student = createMockStudent({ learningStyle: 'visual', energy: 50 });
    const lesson = createMockLesson();
    const matchingMethod = createMockMethod({ bestFor: ['visual'], engagementModifier: 0 });
    const nonMatchingMethod = createMockMethod({ bestFor: ['auditory'], engagementModifier: 0 });

    const matchChange = calculateEngagementChange(student, lesson, matchingMethod);
    const nonMatchChange = calculateEngagementChange(student, lesson, nonMatchingMethod);

    expect(matchChange).toBeGreaterThan(nonMatchChange);
  });

  it('curious students get bonus for challenging material', () => {
    const curiousStudent = createMockStudent({ primaryTrait: 'curious', energy: 50 });
    const normalStudent = createMockStudent({ primaryTrait: 'shy', energy: 50 });
    const hardLesson = createMockLesson({ difficulty: 3 });
    const method = createMockMethod({ engagementModifier: 0, bestFor: [] });

    const curiousChange = calculateEngagementChange(curiousStudent, hardLesson, method);
    const normalChange = calculateEngagementChange(normalStudent, hardLesson, method);

    expect(curiousChange).toBeGreaterThan(normalChange);
  });

  it('low energy reduces engagement', () => {
    const tiredStudent = createMockStudent({ energy: 20 });
    const energizedStudent = createMockStudent({ energy: 90 });
    const lesson = createMockLesson();
    const method = createMockMethod({ engagementModifier: 0, bestFor: [] });

    const tiredChange = calculateEngagementChange(tiredStudent, lesson, method);
    const energizedChange = calculateEngagementChange(energizedStudent, lesson, method);

    expect(tiredChange).toBeLessThan(energizedChange);
  });
});

describe('calculateAcademicGrowth', () => {
  it('higher difficulty means more growth potential', () => {
    const student = createMockStudent();
    const easyLesson = createMockLesson({ difficulty: 1 });
    const hardLesson = createMockLesson({ difficulty: 3 });
    const method = createMockMethod({ bestFor: [] });

    const easyGrowth = calculateAcademicGrowth(student, easyLesson, method);
    const hardGrowth = calculateAcademicGrowth(student, hardLesson, method);

    expect(hardGrowth).toBeGreaterThan(easyGrowth);
  });

  it('learning style match increases growth', () => {
    const student = createMockStudent({ learningStyle: 'visual' });
    const lesson = createMockLesson();
    const matchingMethod = createMockMethod({ bestFor: ['visual'] });
    const nonMatchingMethod = createMockMethod({ bestFor: ['auditory'] });

    const matchGrowth = calculateAcademicGrowth(student, lesson, matchingMethod);
    const nonMatchGrowth = calculateAcademicGrowth(student, lesson, nonMatchingMethod);

    expect(matchGrowth).toBeGreaterThan(nonMatchGrowth);
  });

  it('IEP students struggle more with mismatched methods', () => {
    const iepStudent = createMockStudent({ hasIEP: true, learningStyle: 'visual' });
    const regularStudent = createMockStudent({ hasIEP: false, learningStyle: 'visual' });
    const lesson = createMockLesson();
    const mismatchedMethod = createMockMethod({ bestFor: ['auditory'] });

    const iepGrowth = calculateAcademicGrowth(iepStudent, lesson, mismatchedMethod);
    const regularGrowth = calculateAcademicGrowth(regularStudent, lesson, mismatchedMethod);

    expect(iepGrowth).toBeLessThan(regularGrowth);
  });

  it('gifted students get less from easy lessons', () => {
    const giftedStudent = createMockStudent({ isGifted: true });
    const regularStudent = createMockStudent({ isGifted: false });
    const easyLesson = createMockLesson({ difficulty: 1 });
    const method = createMockMethod({ bestFor: [] });

    const giftedGrowth = calculateAcademicGrowth(giftedStudent, easyLesson, method);
    const regularGrowth = calculateAcademicGrowth(regularStudent, easyLesson, method);

    expect(giftedGrowth).toBeLessThan(regularGrowth);
  });
});

describe('calculateEnergyDrain', () => {
  it('longer lessons drain more energy', () => {
    const student = createMockStudent();
    const shortLesson = createMockLesson({ duration: 'short' });
    const longLesson = createMockLesson({ duration: 'long' });
    const method = createMockMethod();

    const shortDrain = calculateEnergyDrain(student, shortLesson, method);
    const longDrain = calculateEnergyDrain(student, longLesson, method);

    expect(longDrain).toBeGreaterThan(shortDrain);
  });

  it('hands-on methods drain more energy', () => {
    const student = createMockStudent();
    const lesson = createMockLesson();
    const handsOnMethod = createMockMethod({ id: 'hands-on' });
    const lectureMethod = createMockMethod({ id: 'lecture' });

    const handsOnDrain = calculateEnergyDrain(student, lesson, handsOnMethod);
    const lectureDrain = calculateEnergyDrain(student, lesson, lectureMethod);

    expect(handsOnDrain).toBeGreaterThan(lectureDrain);
  });

  it('distracted students drain more energy', () => {
    const distractedStudent = createMockStudent({ primaryTrait: 'distracted' });
    const focusedStudent = createMockStudent({ primaryTrait: 'curious' });
    const lesson = createMockLesson();
    const method = createMockMethod();

    const distractedDrain = calculateEnergyDrain(distractedStudent, lesson, method);
    const focusedDrain = calculateEnergyDrain(focusedStudent, lesson, method);

    expect(distractedDrain).toBeGreaterThan(focusedDrain);
  });
});

describe('applyTeachingEffects', () => {
  it('modifies student stats after teaching', () => {
    const student = createMockStudent({ energy: 80, engagement: 50 });
    const lesson = createMockLesson();
    const method = createMockMethod();

    const result = applyTeachingEffects(student, lesson, method);

    // Energy should decrease (drain)
    expect(result.energy).toBeLessThan(student.energy);
    // Other stats should change (actual values depend on calculation)
    expect(result).not.toEqual(student);
  });

  it('clamps values between 0 and 100', () => {
    const lowStudent = createMockStudent({ energy: 5, engagement: 5 });
    const lesson = createMockLesson({ difficulty: 3 });
    const method = createMockMethod();

    const result = applyTeachingEffects(lowStudent, lesson, method);

    expect(result.energy).toBeGreaterThanOrEqual(0);
    expect(result.engagement).toBeGreaterThanOrEqual(0);
    expect(result.academicLevel).toBeLessThanOrEqual(100);
  });
});

describe('calculateHomeworkCompletionChance', () => {
  it('returns 1 (100%) for no homework', () => {
    const student = createMockStudent();
    expect(calculateHomeworkCompletionChance(student, 'none')).toBe(1);
  });

  it('harder homework has lower completion chance', () => {
    const student = createMockStudent();

    const lightChance = calculateHomeworkCompletionChance(student, 'light');
    const moderateChance = calculateHomeworkCompletionChance(student, 'moderate');
    const heavyChance = calculateHomeworkCompletionChance(student, 'heavy');

    expect(lightChance).toBeGreaterThan(moderateChance);
    expect(moderateChance).toBeGreaterThan(heavyChance);
  });

  it('perfectionist students have higher completion chance', () => {
    const perfectionist = createMockStudent({ primaryTrait: 'perfectionist' });
    const distracted = createMockStudent({ primaryTrait: 'distracted' });

    const perfectChance = calculateHomeworkCompletionChance(perfectionist, 'moderate');
    const distractedChance = calculateHomeworkCompletionChance(distracted, 'moderate');

    expect(perfectChance).toBeGreaterThan(distractedChance);
  });

  it('higher academic level increases completion chance', () => {
    const highAcademic = createMockStudent({ academicLevel: 90 });
    const lowAcademic = createMockStudent({ academicLevel: 30 });

    const highChance = calculateHomeworkCompletionChance(highAcademic, 'moderate');
    const lowChance = calculateHomeworkCompletionChance(lowAcademic, 'moderate');

    expect(highChance).toBeGreaterThan(lowChance);
  });
});

describe('simulateHomeworkCompletion', () => {
  beforeEach(() => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5);
  });

  it('returns completed=true when random is below chance', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.1);
    const student = createMockStudent({ academicLevel: 80 });

    const result = simulateHomeworkCompletion(student, 'light');

    expect(result.completed).toBe(true);
    expect(result.quality).toBeGreaterThan(0);
  });

  it('returns completed=false when random is above chance', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.99);
    const student = createMockStudent({ academicLevel: 30 });

    const result = simulateHomeworkCompletion(student, 'heavy');

    expect(result.completed).toBe(false);
    expect(result.quality).toBe(0);
  });
});

describe('calculateOvernightRecovery', () => {
  it('increases energy overnight', () => {
    const tiredStudent = createMockStudent({ energy: 30 });

    const result = calculateOvernightRecovery(tiredStudent);

    expect(result.energy).toBeGreaterThan(tiredStudent.energy);
  });

  it('caps energy at 100', () => {
    const wellRestedStudent = createMockStudent({ energy: 90, mood: 'happy' });

    const result = calculateOvernightRecovery(wellRestedStudent);

    expect(result.energy).toBeLessThanOrEqual(100);
  });

  it('bad moods improve overnight', () => {
    const upsetStudent = createMockStudent({ mood: 'upset' });

    const result = calculateOvernightRecovery(upsetStudent);

    expect(result.mood).not.toBe('upset');
  });
});

describe('applyInteractionEffect', () => {
  it('praise improves mood and engagement', () => {
    const student = createMockStudent({ mood: 'neutral', engagement: 50 });

    const result = applyInteractionEffect(student, 'praise');

    expect(result.mood).toBe('happy');
    expect(result.engagement).toBe(60);
    expect(result.positiveNotes).toBe(1);
  });

  it('help improves academics and calms frustration', () => {
    const frustratedStudent = createMockStudent({ mood: 'frustrated', academicLevel: 50 });

    const result = applyInteractionEffect(frustratedStudent, 'help');

    expect(result.academicLevel).toBe(52);
    expect(result.mood).toBe('neutral');
  });

  it('redirect increases engagement but costs student energy', () => {
    const student = createMockStudent({ engagement: 40, energy: 80 });

    const result = applyInteractionEffect(student, 'redirect');

    expect(result.engagement).toBe(48);
    expect(result.energy).toBe(75);
  });
});

describe('getStudentsNeedingAttention', () => {
  it('identifies students with negative moods', () => {
    const students = [
      createMockStudent({ id: '1', mood: 'happy' }),
      createMockStudent({ id: '2', mood: 'frustrated' }),
      createMockStudent({ id: '3', mood: 'upset' }),
    ];

    const needingAttention = getStudentsNeedingAttention(students);

    expect(needingAttention.map(s => s.id)).toContain('2');
    expect(needingAttention.map(s => s.id)).toContain('3');
    expect(needingAttention.map(s => s.id)).not.toContain('1');
  });

  it('identifies students with low energy', () => {
    const students = [
      createMockStudent({ id: '1', energy: 80 }),
      createMockStudent({ id: '2', energy: 20 }),
    ];

    const needingAttention = getStudentsNeedingAttention(students);

    expect(needingAttention.map(s => s.id)).toContain('2');
    expect(needingAttention.map(s => s.id)).not.toContain('1');
  });

  it('identifies students who didnt complete homework', () => {
    const students = [
      createMockStudent({ id: '1', homeworkCompleted: true }),
      createMockStudent({ id: '2', homeworkCompleted: false }),
    ];

    const needingAttention = getStudentsNeedingAttention(students);

    expect(needingAttention.map(s => s.id)).toContain('2');
  });
});

describe('getClassMorale', () => {
  it('calculates average morale on 0-100 scale', () => {
    const students = [
      createMockStudent({ mood: 'neutral' }),
      createMockStudent({ mood: 'neutral' }),
      createMockStudent({ mood: 'neutral' }),
    ];

    const morale = getClassMorale(students);

    // neutral is index 3, so (3*20) = 60
    expect(morale.average).toBe(60);
  });

  it('tracks mood distribution', () => {
    const students = [
      createMockStudent({ mood: 'happy' }),
      createMockStudent({ mood: 'happy' }),
      createMockStudent({ mood: 'bored' }),
    ];

    const morale = getClassMorale(students);

    expect(morale.distribution.happy).toBe(2);
    expect(morale.distribution.bored).toBe(1);
    expect(morale.distribution.neutral).toBe(0);
  });
});
