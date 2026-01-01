'use client';

import { createContext, useReducer, useCallback, type ReactNode, type Dispatch } from 'react';
import type { GameState, GameAction, Lesson, TeachingMethod, Activity, HomeworkType } from './types';
import type { LessonPlan } from './lessonPlan';
import { gameReducer, createInitialState } from './reducer';
import * as actions from './actions';

interface GameContextValue {
  state: GameState;
  dispatch: Dispatch<GameAction>;

  // Convenience methods
  newGame: (difficulty: GameState['difficulty']) => void;
  loadGame: (state: GameState) => void;
  advancePhase: () => void;
  advanceDay: () => void;
  selectLesson: (lesson: Lesson) => void;
  selectMethod: (method: TeachingMethod) => void;
  selectActivity: (activity: Activity) => void;
  assignHomework: (homework: HomeworkType) => void;
  interactWithStudent: (studentId: string, action: string) => void;
  resolveEvent: (eventId: string, choiceId: string) => void;
  checkForRandomEvents: () => void;

  // Lesson Plan methods
  createLessonPlan: (lessonPlan: LessonPlan) => void;
  updateLessonPlan: (lessonPlan: LessonPlan) => void;
  deleteLessonPlan: (planId: string) => void;
  duplicateLessonPlan: (planId: string) => void;

  // Computed helpers
  canAdvancePhase: boolean;
  canAdvanceDay: boolean;
}

export const GameContext = createContext<GameContextValue | null>(null);

interface GameProviderProps {
  children: ReactNode;
}

export function GameProvider({ children }: GameProviderProps) {
  const [state, dispatch] = useReducer(gameReducer, undefined, () => createInitialState('normal'));

  // Memoized action dispatchers
  const newGame = useCallback((difficulty: GameState['difficulty']) => {
    dispatch(actions.newGame(difficulty));
  }, []);

  const loadGame = useCallback((gameState: GameState) => {
    dispatch(actions.loadGame(gameState));
  }, []);

  const advancePhase = useCallback(() => {
    dispatch(actions.advancePhase());
  }, []);

  const advanceDay = useCallback(() => {
    dispatch(actions.advanceDay());
  }, []);

  const selectLesson = useCallback((lesson: Lesson) => {
    dispatch(actions.selectLesson(lesson));
  }, []);

  const selectMethod = useCallback((method: TeachingMethod) => {
    dispatch(actions.selectMethod(method));
  }, []);

  const selectActivity = useCallback((activity: Activity) => {
    dispatch(actions.selectActivity(activity));
  }, []);

  const assignHomework = useCallback((homework: HomeworkType) => {
    dispatch(actions.assignHomework(homework));
  }, []);

  const interactWithStudent = useCallback((studentId: string, action: string) => {
    dispatch(actions.interactWithStudent(studentId, action));
  }, []);

  const resolveEvent = useCallback((eventId: string, choiceId: string) => {
    dispatch(actions.resolveEvent(eventId, choiceId));
  }, []);

  const checkForRandomEvents = useCallback(() => {
    dispatch(actions.checkForRandomEvent());
  }, []);

  // Lesson Plan methods
  const createLessonPlan = useCallback((lessonPlan: LessonPlan) => {
    dispatch(actions.createLessonPlan(lessonPlan));
  }, []);

  const updateLessonPlan = useCallback((lessonPlan: LessonPlan) => {
    dispatch(actions.updateLessonPlan(lessonPlan));
  }, []);

  const deleteLessonPlan = useCallback((planId: string) => {
    dispatch(actions.deleteLessonPlan(planId));
  }, []);

  const duplicateLessonPlanAction = useCallback((planId: string) => {
    dispatch(actions.duplicateLessonPlan(planId));
  }, []);

  // Computed state
  const canAdvancePhase = (() => {
    switch (state.turn.phase) {
      case 'morning':
        return true; // Can always advance from morning
      case 'teaching':
        // Must select lesson and method to advance
        return state.turn.selectedLesson !== null && state.turn.selectedMethod !== null;
      case 'interaction':
        return true; // Can skip interaction phase
      case 'end-of-day':
        return false; // Must use advanceDay instead
      default:
        return false;
    }
  })();

  const canAdvanceDay = state.turn.phase === 'end-of-day';

  const value: GameContextValue = {
    state,
    dispatch,
    newGame,
    loadGame,
    advancePhase,
    advanceDay,
    selectLesson,
    selectMethod,
    selectActivity,
    assignHomework,
    interactWithStudent,
    resolveEvent,
    checkForRandomEvents,
    createLessonPlan,
    updateLessonPlan,
    deleteLessonPlan,
    duplicateLessonPlan: duplicateLessonPlanAction,
    canAdvancePhase,
    canAdvanceDay,
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
}
