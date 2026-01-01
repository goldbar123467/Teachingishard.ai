import type { GameAction, GameState, Lesson, TeachingMethod, Activity, HomeworkType } from './types';

// Action creators for type safety and convenience

export function newGame(difficulty: GameState['difficulty']): GameAction {
  return { type: 'NEW_GAME', payload: { difficulty } };
}

export function loadGame(state: GameState): GameAction {
  return { type: 'LOAD_GAME', payload: state };
}

export function advancePhase(): GameAction {
  return { type: 'ADVANCE_PHASE' };
}

export function advanceDay(): GameAction {
  return { type: 'ADVANCE_DAY' };
}

export function selectLesson(lesson: Lesson): GameAction {
  return { type: 'SELECT_LESSON', payload: lesson };
}

export function selectMethod(method: TeachingMethod): GameAction {
  return { type: 'SELECT_METHOD', payload: method };
}

export function selectActivity(activity: Activity): GameAction {
  return { type: 'SELECT_ACTIVITY', payload: activity };
}

export function assignHomework(homework: HomeworkType): GameAction {
  return { type: 'ASSIGN_HOMEWORK', payload: homework };
}

export function interactWithStudent(studentId: string, action: string): GameAction {
  return { type: 'INTERACT_STUDENT', payload: { studentId, action } };
}

export function resolveEvent(eventId: string, choiceId: string): GameAction {
  return { type: 'RESOLVE_EVENT', payload: { eventId, choiceId } };
}

export function tickStudentState(): GameAction {
  return { type: 'TICK_STUDENT_STATE' };
}

export function checkForRandomEvent(): GameAction {
  return { type: 'RANDOM_EVENT_CHECK' };
}
