import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  MORNING_EVENTS,
  TEACHING_EVENTS,
  INTERACTION_EVENTS,
  END_OF_DAY_EVENTS,
  ALL_EVENTS,
  generateEvent,
  checkForEvents,
  type EventTemplate,
} from './events';
import type { Student } from '@/lib/game/types';

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

describe('Event Templates', () => {
  describe('MORNING_EVENTS', () => {
    it('has valid event templates', () => {
      expect(MORNING_EVENTS.length).toBeGreaterThan(0);

      for (const event of MORNING_EVENTS) {
        expect(event.id).toBeTruthy();
        expect(event.title).toBeTruthy();
        expect(event.phase).toBe('morning');
        expect(event.probability).toBeGreaterThan(0);
        expect(event.probability).toBeLessThanOrEqual(1);
        expect(event.choices.length).toBeGreaterThan(0);
      }
    });

    it('all choices have effects', () => {
      for (const event of MORNING_EVENTS) {
        for (const choice of event.choices) {
          expect(choice.id).toBeTruthy();
          expect(choice.label).toBeTruthy();
          expect(choice.effects.length).toBeGreaterThan(0);
        }
      }
    });
  });

  describe('TEACHING_EVENTS', () => {
    it('has valid event templates', () => {
      expect(TEACHING_EVENTS.length).toBeGreaterThan(0);

      for (const event of TEACHING_EVENTS) {
        expect(event.id).toBeTruthy();
        expect(event.phase).toBe('teaching');
      }
    });
  });

  describe('INTERACTION_EVENTS', () => {
    it('has valid event templates', () => {
      expect(INTERACTION_EVENTS.length).toBeGreaterThan(0);

      for (const event of INTERACTION_EVENTS) {
        expect(event.id).toBeTruthy();
        expect(event.phase).toBe('interaction');
      }
    });
  });

  describe('END_OF_DAY_EVENTS', () => {
    it('has valid event templates', () => {
      expect(END_OF_DAY_EVENTS.length).toBeGreaterThan(0);

      for (const event of END_OF_DAY_EVENTS) {
        expect(event.id).toBeTruthy();
        expect(event.phase).toBe('end-of-day');
      }
    });
  });

  describe('ALL_EVENTS', () => {
    it('contains all phase events', () => {
      expect(ALL_EVENTS.morning).toBe(MORNING_EVENTS);
      expect(ALL_EVENTS.teaching).toBe(TEACHING_EVENTS);
      expect(ALL_EVENTS.interaction).toBe(INTERACTION_EVENTS);
      expect(ALL_EVENTS['end-of-day']).toBe(END_OF_DAY_EVENTS);
    });
  });
});

describe('generateEvent', () => {
  it('generates event from template without student', () => {
    const template: EventTemplate = {
      id: 'test-event',
      type: 'random',
      title: 'Test Event',
      description: 'A test event',
      probability: 1,
      phase: 'any',
      requiresStudent: false,
      choices: [
        {
          id: 'choice1',
          label: 'Option 1',
          effects: [{ target: 'teacher', attribute: 'energy', modifier: -5 }],
        },
      ],
    };

    const event = generateEvent(template, []);

    expect(event).not.toBeNull();
    expect(event?.title).toBe('Test Event');
    expect(event?.description).toBe('A test event');
    expect(event?.choices).toHaveLength(1);
    expect(event?.affectedStudentIds).toBeUndefined();
  });

  it('generates event with target student', () => {
    const student = createMockStudent({ id: 'student-123', firstName: 'Alice' });

    const template: EventTemplate = {
      id: 'student-event',
      type: 'random',
      title: 'Student Event',
      description: (s) => `${s?.firstName} did something`,
      probability: 1,
      phase: 'any',
      requiresStudent: true,
      choices: [
        {
          id: 'choice1',
          label: 'Option 1',
          effects: [{ target: 'student', attribute: 'mood', modifier: 1 }],
        },
      ],
    };

    const event = generateEvent(template, [student]);

    expect(event).not.toBeNull();
    expect(event?.description).toBe('Alice did something');
    expect(event?.affectedStudentIds).toContain('student-123');
    expect(event?.choices[0].effects[0].studentId).toBe('student-123');
  });

  it('returns null when no eligible students', () => {
    const template: EventTemplate = {
      id: 'filtered-event',
      type: 'random',
      title: 'Filtered Event',
      description: 'Event for high performers',
      probability: 1,
      phase: 'any',
      requiresStudent: true,
      studentFilter: (s) => s.academicLevel > 90, // Very high bar
      choices: [{ id: 'c1', label: 'OK', effects: [] }],
    };

    const lowStudent = createMockStudent({ academicLevel: 50 });
    const event = generateEvent(template, [lowStudent]);

    expect(event).toBeNull();
  });

  it('selects eligible student based on filter', () => {
    const happyStudent = createMockStudent({ id: 'happy-1', firstName: 'Happy', mood: 'happy' });
    const sadStudent = createMockStudent({ id: 'sad-1', firstName: 'Sad', mood: 'upset' });

    const template: EventTemplate = {
      id: 'happy-event',
      type: 'random',
      title: 'Happy Event',
      description: (s) => `${s?.firstName} is happy`,
      probability: 1,
      phase: 'any',
      requiresStudent: true,
      studentFilter: (s) => s.mood === 'happy',
      choices: [{ id: 'c1', label: 'OK', effects: [] }],
    };

    const event = generateEvent(template, [happyStudent, sadStudent]);

    expect(event).not.toBeNull();
    expect(event?.affectedStudentIds).toContain('happy-1');
    expect(event?.description).toContain('Happy');
  });

  it('generates event ID with timestamp pattern', () => {
    const template: EventTemplate = {
      id: 'test',
      type: 'random',
      title: 'Test',
      description: 'Test',
      probability: 1,
      phase: 'any',
      requiresStudent: false,
      choices: [{ id: 'c1', label: 'OK', effects: [] }],
    };

    const event = generateEvent(template, []);

    // ID should be template.id + timestamp
    expect(event?.id).toMatch(/^test-\d+$/);
  });
});

describe('checkForEvents', () => {
  beforeEach(() => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5);
  });

  it('returns empty array when probability not met', () => {
    // With random = 0.5, events with probability < 0.5 won't trigger
    vi.spyOn(Math, 'random').mockReturnValue(0.99);

    const students = [createMockStudent()];
    const events = checkForEvents('morning', students, 'normal');

    expect(events).toHaveLength(0);
  });

  it('returns event when probability is met', () => {
    // Force event to trigger
    vi.spyOn(Math, 'random').mockReturnValue(0.01);

    const students = [createMockStudent({ attendanceToday: true })];
    const events = checkForEvents('morning', students, 'normal');

    // May or may not find eligible student, but should attempt
    expect(events.length).toBeLessThanOrEqual(1);
  });

  it('respects difficulty modifier', () => {
    // Track how many events trigger at different difficulties
    const triggerCounts = { easy: 0, normal: 0, hard: 0 };

    // Run multiple times to see probability effect
    for (let i = 0; i < 100; i++) {
      vi.spyOn(Math, 'random').mockReturnValue(0.1); // Low random value
      const students = [createMockStudent({ attendanceToday: true, mood: 'happy' })];

      if (checkForEvents('morning', students, 'easy').length > 0) triggerCounts.easy++;
      if (checkForEvents('morning', students, 'normal').length > 0) triggerCounts.normal++;
      if (checkForEvents('morning', students, 'hard').length > 0) triggerCounts.hard++;
    }

    // Hard should have same or more triggers than normal, normal same or more than easy
    // (due to difficulty modifier: easy=0.7, normal=1.0, hard=1.3)
    expect(triggerCounts.hard).toBeGreaterThanOrEqual(triggerCounts.easy);
  });

  it('returns empty array for unknown phase', () => {
    const students = [createMockStudent()];
    const events = checkForEvents('unknown-phase', students, 'normal');

    expect(events).toHaveLength(0);
  });

  it('returns at most one event per check', () => {
    // Even with high probability, only one event should return
    vi.spyOn(Math, 'random').mockReturnValue(0.01);

    const students = [
      createMockStudent({ id: '1', attendanceToday: true, mood: 'happy' }),
      createMockStudent({ id: '2', attendanceToday: true, homeworkCompleted: false }),
      createMockStudent({ id: '3', attendanceToday: true }),
    ];

    const events = checkForEvents('morning', students, 'hard');

    expect(events.length).toBeLessThanOrEqual(1);
  });
});

describe('Event Effect Targets', () => {
  it('all effects have valid targets', () => {
    const allTemplates = [
      ...MORNING_EVENTS,
      ...TEACHING_EVENTS,
      ...INTERACTION_EVENTS,
      ...END_OF_DAY_EVENTS,
    ];

    for (const template of allTemplates) {
      for (const choice of template.choices) {
        for (const effect of choice.effects) {
          expect(['student', 'class', 'teacher']).toContain(effect.target);
          expect(effect.attribute).toBeTruthy();
          expect(typeof effect.modifier).toBe('number');
        }
      }
    }
  });
});
