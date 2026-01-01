import { describe, it, expect, beforeEach } from 'vitest';
import { gameReducer, createInitialState } from './reducer';
import type { GameState, Lesson, TeachingMethod, HomeworkType, GamePhase, DayOfWeek } from './types';

// Helper to create a state with a specific phase
function stateWithPhase(state: GameState, phase: GamePhase): GameState {
  return {
    ...state,
    turn: { ...state.turn, phase },
  };
}

// Helper to create a state with a specific day
function stateWithDay(state: GameState, dayOfWeek: DayOfWeek): GameState {
  return {
    ...state,
    turn: { ...state.turn, dayOfWeek },
  };
}

describe('gameReducer', () => {
  let initialState: GameState;

  beforeEach(() => {
    initialState = createInitialState('normal');
  });

  describe('createInitialState', () => {
    it('creates a valid initial state', () => {
      expect(initialState.students).toHaveLength(15);
      expect(initialState.turn.phase).toBe('morning');
      expect(initialState.turn.week).toBe(1);
      expect(initialState.turn.dayOfWeek).toBe('monday');
      expect(initialState.teacher.energy).toBe(100);
    });

    it('generates unique student IDs', () => {
      const ids = initialState.students.map(s => s.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(15);
    });
  });

  describe('NEW_GAME action', () => {
    it('resets game state with specified difficulty', () => {
      const modifiedState: GameState = {
        ...initialState,
        turn: { ...initialState.turn, week: 5 },
      };

      const newState = gameReducer(modifiedState, {
        type: 'NEW_GAME',
        payload: { difficulty: 'hard' },
      });

      expect(newState.turn.week).toBe(1);
      expect(newState.difficulty).toBe('hard');
    });
  });

  describe('LOAD_GAME action', () => {
    it('replaces state with loaded state', () => {
      const savedState: GameState = { ...initialState, turn: { ...initialState.turn, week: 10 } };

      const newState = gameReducer(initialState, {
        type: 'LOAD_GAME',
        payload: savedState,
      });

      expect(newState.turn.week).toBe(10);
    });
  });

  describe('ADVANCE_PHASE action', () => {
    it('advances from morning to teaching', () => {
      const newState = gameReducer(initialState, { type: 'ADVANCE_PHASE' });
      expect(newState.turn.phase).toBe('teaching');
    });

    it('advances from teaching to interaction when lesson and method selected', () => {
      const mockLesson: Lesson = {
        id: 'math-1',
        name: 'Basic Addition',
        subject: 'math',
        difficulty: 1,
        duration: 'medium',
        requiredEnergy: 10,
      };
      const mockMethod: TeachingMethod = {
        id: 'lecture',
        name: 'Lecture',
        description: 'Traditional lecture',
        energyCost: 5,
        engagementModifier: -5,
        bestFor: ['auditory', 'reading'],
      };

      let state = gameReducer(initialState, { type: 'ADVANCE_PHASE' }); // to teaching
      state = gameReducer(state, { type: 'SELECT_LESSON', payload: mockLesson });
      state = gameReducer(state, { type: 'SELECT_METHOD', payload: mockMethod });
      state = gameReducer(state, { type: 'ADVANCE_PHASE' }); // to interaction

      expect(state.turn.phase).toBe('interaction');
    });

    it('advances from interaction to end-of-day', () => {
      const state = stateWithPhase(initialState, 'interaction');
      const newState = gameReducer(state, { type: 'ADVANCE_PHASE' });
      expect(newState.turn.phase).toBe('end-of-day');
    });

    it('does not advance from end-of-day (use ADVANCE_DAY instead)', () => {
      const state = stateWithPhase(initialState, 'end-of-day');
      const newState = gameReducer(state, { type: 'ADVANCE_PHASE' });
      expect(newState.turn.phase).toBe('end-of-day');
    });
  });

  describe('ADVANCE_DAY action', () => {
    it('advances to next day from end-of-day phase', () => {
      const state = stateWithPhase(initialState, 'end-of-day');
      const newState = gameReducer(state, { type: 'ADVANCE_DAY' });

      expect(newState.turn.dayOfWeek).toBe('tuesday');
      expect(newState.turn.phase).toBe('morning');
    });

    it('advances to next week after friday', () => {
      let state = stateWithPhase(initialState, 'end-of-day');
      state = stateWithDay(state, 'friday');
      const newState = gameReducer(state, { type: 'ADVANCE_DAY' });

      expect(newState.turn.dayOfWeek).toBe('monday');
      expect(newState.turn.week).toBe(2);
    });

    it('resets daily state on day advance', () => {
      const mockLesson: Lesson = {
        id: 'math-1',
        name: 'Basic Addition',
        subject: 'math',
        difficulty: 1,
        duration: 'medium',
        requiredEnergy: 10,
      };

      let state = stateWithPhase(initialState, 'end-of-day');
      state = {
        ...state,
        turn: {
          ...state.turn,
          selectedLesson: mockLesson,
          homeworkAssigned: 'light' as HomeworkType,
        },
      };
      const newState = gameReducer(state, { type: 'ADVANCE_DAY' });

      expect(newState.turn.selectedLesson).toBeNull();
      expect(newState.turn.selectedMethod).toBeNull();
      expect(newState.turn.homeworkAssigned).toBeNull();
    });

    it('does nothing if not in end-of-day phase', () => {
      const state = gameReducer(initialState, { type: 'ADVANCE_DAY' });
      expect(state.turn.dayOfWeek).toBe('monday');
      expect(state.turn.week).toBe(1);
    });
  });

  describe('SELECT_LESSON action', () => {
    it('sets the selected lesson during teaching phase', () => {
      const mockLesson: Lesson = {
        id: 'science-1',
        name: 'Photosynthesis',
        subject: 'science',
        difficulty: 2,
        duration: 'long',
        requiredEnergy: 15,
      };

      const state = stateWithPhase(initialState, 'teaching');
      const newState = gameReducer(state, { type: 'SELECT_LESSON', payload: mockLesson });

      expect(newState.turn.selectedLesson).toEqual(mockLesson);
    });

    it('deducts energy cost when selecting lesson', () => {
      const mockLesson: Lesson = {
        id: 'science-1',
        name: 'Photosynthesis',
        subject: 'science',
        difficulty: 2,
        duration: 'long',
        requiredEnergy: 15,
      };

      const state = stateWithPhase(initialState, 'teaching');
      const initialEnergy = state.teacher.energy;
      const newState = gameReducer(state, { type: 'SELECT_LESSON', payload: mockLesson });

      expect(newState.teacher.energy).toBe(initialEnergy - 15);
    });

    it('does nothing if not in teaching phase', () => {
      const mockLesson: Lesson = {
        id: 'science-1',
        name: 'Photosynthesis',
        subject: 'science',
        difficulty: 2,
        duration: 'long',
        requiredEnergy: 15,
      };

      const state = gameReducer(initialState, { type: 'SELECT_LESSON', payload: mockLesson });
      expect(state.turn.selectedLesson).toBeNull();
    });
  });

  describe('SELECT_METHOD action', () => {
    it('sets the selected method during teaching phase', () => {
      const mockMethod: TeachingMethod = {
        id: 'group-work',
        name: 'Group Work',
        description: 'Collaborative learning',
        energyCost: 8,
        engagementModifier: 10,
        bestFor: ['kinesthetic'],
      };

      const state = stateWithPhase(initialState, 'teaching');
      const newState = gameReducer(state, { type: 'SELECT_METHOD', payload: mockMethod });

      expect(newState.turn.selectedMethod).toEqual(mockMethod);
    });

    it('deducts energy cost when selecting method', () => {
      const mockMethod: TeachingMethod = {
        id: 'group-work',
        name: 'Group Work',
        description: 'Collaborative learning',
        energyCost: 8,
        engagementModifier: 10,
        bestFor: ['kinesthetic'],
      };

      const state = stateWithPhase(initialState, 'teaching');
      const initialEnergy = state.teacher.energy;
      const newState = gameReducer(state, { type: 'SELECT_METHOD', payload: mockMethod });

      expect(newState.teacher.energy).toBe(initialEnergy - 8);
    });
  });

  describe('ASSIGN_HOMEWORK action', () => {
    it('sets homework assignment during end-of-day phase', () => {
      const state = stateWithPhase(initialState, 'end-of-day');
      const newState = gameReducer(state, { type: 'ASSIGN_HOMEWORK', payload: 'moderate' });

      expect(newState.turn.homeworkAssigned).toBe('moderate');
    });

    it('does nothing if not in end-of-day phase', () => {
      const state = gameReducer(initialState, { type: 'ASSIGN_HOMEWORK', payload: 'heavy' });
      expect(state.turn.homeworkAssigned).toBeNull();
    });
  });

  describe('INTERACT_STUDENT action', () => {
    it('applies praise interaction during interaction phase', () => {
      const state = stateWithPhase(initialState, 'interaction');
      const studentId = state.students[0].id;
      const initialEngagement = state.students[0].engagement;

      const newState = gameReducer(state, {
        type: 'INTERACT_STUDENT',
        payload: { studentId, action: 'praise' },
      });

      const student = newState.students.find(s => s.id === studentId);
      expect(student?.engagement).toBeGreaterThanOrEqual(initialEngagement);
      expect(student?.positiveNotes).toBe(1);
    });

    it('deducts teacher energy on interaction', () => {
      const state = stateWithPhase(initialState, 'interaction');
      const initialEnergy = state.teacher.energy;
      const studentId = state.students[0].id;

      const newState = gameReducer(state, {
        type: 'INTERACT_STUDENT',
        payload: { studentId, action: 'help' },
      });

      expect(newState.teacher.energy).toBe(initialEnergy - 5);
    });

    it('does nothing if not in interaction phase', () => {
      const studentId = initialState.students[0].id;
      const state = gameReducer(initialState, {
        type: 'INTERACT_STUDENT',
        payload: { studentId, action: 'praise' },
      });

      expect(state.students[0].positiveNotes).toBe(0);
    });
  });

  describe('School Year Calendar Integration', () => {
    it('initializes with a valid school year', () => {
      expect(initialState.schoolYear).toBeDefined();
      expect(initialState.schoolYear.currentDay).toBe(1);
      expect(initialState.schoolYear.totalSchoolDays).toBe(180);
      expect(initialState.schoolYear.days.length).toBeGreaterThan(0);
    });

    it('school year has valid breaks array', () => {
      expect(initialState.schoolYear.breaks).toHaveLength(3);

      const breakNames = initialState.schoolYear.breaks.map(b => b.name);
      expect(breakNames).toContain('Fall Break');
      expect(breakNames).toContain('Winter Break');
      expect(breakNames).toContain('Spring Break');
    });

    it('school year starts in August', () => {
      expect(initialState.schoolYear.startDate.getMonth()).toBe(7); // August
      expect(initialState.schoolYear.startDate.getDate()).toBe(15);
    });

    it('ADVANCE_DAY increments schoolYear.currentDay', () => {
      const state = stateWithPhase(initialState, 'end-of-day');
      const initialDay = state.schoolYear.currentDay;

      const newState = gameReducer(state, { type: 'ADVANCE_DAY' });

      expect(newState.schoolYear.currentDay).toBe(initialDay + 1);
    });

    it('ADVANCE_DAY stops incrementing at day 180', () => {
      let state = stateWithPhase(initialState, 'end-of-day');
      state = {
        ...state,
        schoolYear: {
          ...state.schoolYear,
          currentDay: 180,
        },
      };

      const newState = gameReducer(state, { type: 'ADVANCE_DAY' });

      // Should not exceed 180
      expect(newState.schoolYear.currentDay).toBe(180);
    });

    it('school year persists through LOAD_GAME', () => {
      const savedState: GameState = {
        ...initialState,
        schoolYear: {
          ...initialState.schoolYear,
          currentDay: 42,
          snowDaysUsed: 2,
        },
      };

      const newState = gameReducer(initialState, {
        type: 'LOAD_GAME',
        payload: savedState,
      });

      expect(newState.schoolYear.currentDay).toBe(42);
      expect(newState.schoolYear.snowDaysUsed).toBe(2);
    });

    it('NEW_GAME generates fresh school year', () => {
      let state = stateWithPhase(initialState, 'end-of-day');
      state = {
        ...state,
        schoolYear: {
          ...state.schoolYear,
          currentDay: 100,
        },
      };

      const newState = gameReducer(state, {
        type: 'NEW_GAME',
        payload: { difficulty: 'normal' },
      });

      expect(newState.schoolYear.currentDay).toBe(1);
      expect(newState.schoolYear.totalSchoolDays).toBe(180);
    });

    it('school year weather properties are preserved', () => {
      // Verify weather-related fields exist and are valid
      expect(typeof initialState.schoolYear.snowDaysUsed).toBe('number');
      expect(typeof initialState.schoolYear.blizzardOccurred).toBe('boolean');
      expect(initialState.schoolYear.snowDaysUsed).toBeGreaterThanOrEqual(0);
    });

    it('school year days array contains correct structure', () => {
      const firstDay = initialState.schoolYear.days[0];

      expect(firstDay).toHaveProperty('date');
      expect(firstDay).toHaveProperty('dayNumber');
      expect(firstDay).toHaveProperty('isSchoolDay');
      expect(firstDay).toHaveProperty('isWeekend');
      expect(firstDay).toHaveProperty('isBreak');
      expect(firstDay).toHaveProperty('isSnowDay');
      expect(firstDay).toHaveProperty('isBlizzard');
      expect(firstDay).toHaveProperty('month');
      expect(firstDay).toHaveProperty('weekOfYear');
    });
  });
});
