'use client';

import { useContext } from 'react';
import { GameContext } from '@/lib/game/context';

export function useGame() {
  const context = useContext(GameContext);

  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }

  return context;
}

// Selector hooks for specific parts of state
export function useStudents() {
  const { state } = useGame();
  return state.students;
}

export function useTeacher() {
  const { state } = useGame();
  return state.teacher;
}

export function useTurn() {
  const { state } = useGame();
  return state.turn;
}

export function useStudent(studentId: string) {
  const { state } = useGame();
  return state.students.find(s => s.id === studentId);
}

export function useClassStats() {
  const { state } = useGame();
  const students = state.students;

  return {
    classAverage: state.classAverage,
    avgEnergy: Math.round(students.reduce((sum, s) => sum + s.energy, 0) / students.length),
    presentCount: students.filter(s => s.attendanceToday).length,
    absentCount: students.filter(s => !s.attendanceToday).length,
    happyCount: students.filter(s => s.mood === 'happy' || s.mood === 'excited').length,
    strugglingCount: students.filter(s => s.mood === 'frustrated' || s.mood === 'upset').length,
    homeworkComplete: students.filter(s => s.homeworkCompleted).length,
    needsHelpCount: students.filter(s => s.needsExtraHelp).length,
  };
}

export function useSchoolYear() {
  const { state } = useGame();
  return state.schoolYear;
}

export function useLessonPlans() {
  const { state, createLessonPlan, updateLessonPlan, deleteLessonPlan, duplicateLessonPlan } = useGame();
  return {
    lessonPlans: state.lessonPlans,
    createLessonPlan,
    updateLessonPlan,
    deleteLessonPlan,
    duplicateLessonPlan,
  };
}
