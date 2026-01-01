import type { DayOfWeek, GamePhase, Mood } from './types';

export const PHASE_ORDER: GamePhase[] = ['morning', 'teaching', 'interaction', 'end-of-day'];
export const DAY_ORDER: DayOfWeek[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];

export const PHASE_LABELS: Record<GamePhase, string> = {
  morning: 'Morning Check-In',
  teaching: 'Teaching Time',
  interaction: 'Student Interaction',
  'end-of-day': 'End of Day',
};

export const DAY_LABELS: Record<DayOfWeek, string> = {
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
};

export const MOOD_EMOJI: Record<Mood, string> = {
  excited: '🤩',
  happy: '😊',
  neutral: '😐',
  bored: '😴',
  frustrated: '😤',
  upset: '😢',
};

export const MOOD_COLORS: Record<Mood, string> = {
  excited: 'text-yellow-500',
  happy: 'text-green-500',
  neutral: 'text-gray-500',
  bored: 'text-blue-400',
  frustrated: 'text-orange-500',
  upset: 'text-red-500',
};

export const INITIAL_TEACHER = {
  energy: 100,
  reputation: 50,
  parentSatisfaction: 50,
  suppliesBudget: 500,
};

export const SCHOOL_YEAR_WEEKS = 36;
export const STUDENTS_COUNT = 15;

export const ACADEMIC_LEVEL_COLORS = {
  low: 'bg-red-500',
  medium: 'bg-yellow-500',
  high: 'bg-green-500',
};

export function getAcademicLevelColor(level: number): string {
  if (level < 40) return ACADEMIC_LEVEL_COLORS.low;
  if (level < 70) return ACADEMIC_LEVEL_COLORS.medium;
  return ACADEMIC_LEVEL_COLORS.high;
}
