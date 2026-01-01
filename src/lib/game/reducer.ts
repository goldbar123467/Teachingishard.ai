import type { GameState, GameAction, GamePhase, DayOfWeek, Mood } from './types';
import { generateStudents } from '../students/generator';
import { PHASE_ORDER, DAY_ORDER, INITIAL_TEACHER } from './constants';
import {
  applyTeachingEffects,
  simulateHomeworkCompletion,
  calculateOvernightRecovery,
  applyInteractionEffect,
  shiftMood,
} from '../students/behavior';
import { checkForEvents } from '@/data/events';

function calculateClassAverage(students: GameState['students']): number {
  if (students.length === 0) return 0;
  return Math.round(students.reduce((sum, s) => sum + s.academicLevel, 0) / students.length);
}

function getNextPhase(currentPhase: GamePhase): GamePhase | null {
  const currentIndex = PHASE_ORDER.indexOf(currentPhase);
  if (currentIndex === PHASE_ORDER.length - 1) return null;
  return PHASE_ORDER[currentIndex + 1];
}

function getNextDay(currentDay: DayOfWeek): { day: DayOfWeek; isNewWeek: boolean } {
  const currentIndex = DAY_ORDER.indexOf(currentDay);
  if (currentIndex === DAY_ORDER.length - 1) {
    return { day: 'monday', isNewWeek: true };
  }
  return { day: DAY_ORDER[currentIndex + 1], isNewWeek: false };
}

export function createInitialState(difficulty: GameState['difficulty'] = 'normal'): GameState {
  const students = generateStudents(15);

  return {
    saveId: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    lastSavedAt: new Date().toISOString(),
    students,
    teacher: { ...INITIAL_TEACHER },
    turn: {
      week: 1,
      dayOfWeek: 'monday',
      phase: 'morning',
      selectedLesson: null,
      selectedMethod: null,
      selectedActivity: null,
      homeworkAssigned: null,
      activeEvents: [],
      resolvedEvents: [],
    },
    classAverage: calculateClassAverage(students),
    difficulty,
    autoSaveEnabled: true,
  };
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'NEW_GAME': {
      return createInitialState(action.payload.difficulty);
    }

    case 'LOAD_GAME': {
      return action.payload;
    }

    case 'ADVANCE_PHASE': {
      const nextPhase = getNextPhase(state.turn.phase);

      if (!nextPhase) {
        // At end-of-day, can't advance phase - use ADVANCE_DAY
        return state;
      }

      // Apply phase-specific effects
      let updatedStudents = [...state.students];
      const updatedTeacher = { ...state.teacher };

      if (state.turn.phase === 'teaching' && state.turn.selectedLesson && state.turn.selectedMethod) {
        // Apply full teaching effects using behavior system
        updatedStudents = state.students
          .filter(s => s.attendanceToday) // Only present students learn
          .map(student =>
            applyTeachingEffects(student, state.turn.selectedLesson!, state.turn.selectedMethod!)
          );

        // Merge with absent students (unchanged)
        const absentStudents = state.students.filter(s => !s.attendanceToday);
        updatedStudents = [...updatedStudents, ...absentStudents];
      }

      if (state.turn.phase === 'interaction') {
        // End of interaction - slight energy recovery and mood stabilization
        updatedStudents = updatedStudents.map(student => ({
          ...student,
          energy: Math.min(100, student.energy + 5),
        }));
      }

      return {
        ...state,
        students: updatedStudents,
        teacher: updatedTeacher,
        turn: {
          ...state.turn,
          phase: nextPhase,
        },
        classAverage: calculateClassAverage(updatedStudents),
      };
    }

    case 'ADVANCE_DAY': {
      if (state.turn.phase !== 'end-of-day') {
        // Can only advance day from end-of-day phase
        return state;
      }

      const { day: nextDay, isNewWeek } = getNextDay(state.turn.dayOfWeek);
      const nextWeek = isNewWeek ? state.turn.week + 1 : state.turn.week;

      // Reset students for new day using behavior system
      const refreshedStudents = state.students.map(student => {
        // Calculate homework completion with detailed simulation
        const homeworkResult = simulateHomeworkCompletion(
          student,
          state.turn.homeworkAssigned || 'none'
        );

        // Apply overnight recovery
        const recoveredStudent = calculateOvernightRecovery(student);

        // Mood adjustment based on homework
        let finalMood = recoveredStudent.mood;
        if (!homeworkResult.completed) {
          // Failed to complete homework affects mood
          finalMood = shiftMood(finalMood, -1);
        } else if (homeworkResult.quality > 80) {
          // High quality homework can improve mood
          finalMood = shiftMood(finalMood, 1);
        }

        // Academic boost from completed homework
        let academicBoost = 0;
        if (homeworkResult.completed) {
          const hwBonus = { none: 0, light: 0.5, moderate: 1, heavy: 2 }[state.turn.homeworkAssigned || 'none'];
          academicBoost = hwBonus * (homeworkResult.quality / 100);
        }

        return {
          ...recoveredStudent,
          attendanceToday: Math.random() > 0.05, // 95% attendance
          homeworkCompleted: homeworkResult.completed,
          homeworkQuality: homeworkResult.quality,
          mood: finalMood,
          academicLevel: Math.min(100, recoveredStudent.academicLevel + academicBoost),
        };
      });

      // Teacher recovery
      const refreshedTeacher = {
        ...state.teacher,
        energy: Math.min(100, state.teacher.energy + 25),
      };

      return {
        ...state,
        students: refreshedStudents,
        teacher: refreshedTeacher,
        turn: {
          week: nextWeek,
          dayOfWeek: nextDay,
          phase: 'morning',
          selectedLesson: null,
          selectedMethod: null,
          selectedActivity: null,
          homeworkAssigned: null,
          activeEvents: [],
          resolvedEvents: [],
        },
        classAverage: calculateClassAverage(refreshedStudents),
        lastSavedAt: new Date().toISOString(),
      };
    }

    case 'SELECT_LESSON': {
      if (state.turn.phase !== 'teaching') return state;

      return {
        ...state,
        turn: {
          ...state.turn,
          selectedLesson: action.payload,
        },
        teacher: {
          ...state.teacher,
          energy: Math.max(0, state.teacher.energy - action.payload.requiredEnergy),
        },
      };
    }

    case 'SELECT_METHOD': {
      if (state.turn.phase !== 'teaching') return state;

      return {
        ...state,
        turn: {
          ...state.turn,
          selectedMethod: action.payload,
        },
        teacher: {
          ...state.teacher,
          energy: Math.max(0, state.teacher.energy - action.payload.energyCost),
        },
      };
    }

    case 'SELECT_ACTIVITY': {
      if (state.turn.phase !== 'teaching') return state;

      return {
        ...state,
        turn: {
          ...state.turn,
          selectedActivity: action.payload,
        },
        teacher: {
          ...state.teacher,
          suppliesBudget: Math.max(0, state.teacher.suppliesBudget - action.payload.supplyCost),
        },
      };
    }

    case 'ASSIGN_HOMEWORK': {
      if (state.turn.phase !== 'end-of-day') return state;

      return {
        ...state,
        turn: {
          ...state.turn,
          homeworkAssigned: action.payload,
        },
      };
    }

    case 'INTERACT_STUDENT': {
      if (state.turn.phase !== 'interaction') return state;

      const { studentId, action: interactionAction } = action.payload;

      const updatedStudents = state.students.map(student => {
        if (student.id !== studentId) return student;

        // Use behavior system for interaction effects
        if (interactionAction === 'praise' || interactionAction === 'help' || interactionAction === 'redirect') {
          return applyInteractionEffect(student, interactionAction);
        }
        return student;
      });

      return {
        ...state,
        students: updatedStudents,
        teacher: {
          ...state.teacher,
          energy: Math.max(0, state.teacher.energy - 5),
        },
        classAverage: calculateClassAverage(updatedStudents),
      };
    }

    case 'RESOLVE_EVENT': {
      const { eventId, choiceId } = action.payload;
      const event = state.turn.activeEvents.find(e => e.id === eventId);

      if (!event) return state;

      const choice = event.choices.find(c => c.id === choiceId);
      if (!choice) return state;

      let updatedStudents = [...state.students];
      const updatedTeacher = { ...state.teacher };

      // Apply effects
      for (const effect of choice.effects) {
        if (effect.target === 'teacher') {
          const key = effect.attribute as keyof typeof updatedTeacher;
          if (typeof updatedTeacher[key] === 'number') {
            (updatedTeacher[key] as number) = Math.max(0, Math.min(100,
              (updatedTeacher[key] as number) + effect.modifier
            ));
          }
        } else if (effect.target === 'student' && effect.studentId) {
          updatedStudents = updatedStudents.map(s => {
            if (s.id !== effect.studentId) return s;
            const key = effect.attribute as keyof typeof s;
            if (typeof s[key] === 'number') {
              return {
                ...s,
                [key]: Math.max(0, Math.min(100, (s[key] as number) + effect.modifier)),
              };
            }
            return s;
          });
        } else if (effect.target === 'class') {
          updatedStudents = updatedStudents.map(s => {
            const key = effect.attribute as keyof typeof s;
            if (typeof s[key] === 'number') {
              return {
                ...s,
                [key]: Math.max(0, Math.min(100, (s[key] as number) + effect.modifier)),
              };
            }
            return s;
          });
        }
      }

      return {
        ...state,
        students: updatedStudents,
        teacher: updatedTeacher,
        turn: {
          ...state.turn,
          activeEvents: state.turn.activeEvents.filter(e => e.id !== eventId),
          resolvedEvents: [...state.turn.resolvedEvents, eventId],
        },
        classAverage: calculateClassAverage(updatedStudents),
      };
    }

    case 'TICK_STUDENT_STATE': {
      // Periodic state updates (called on timers or phase changes)
      const updatedStudents = state.students.map(student => {
        // Energy naturally decreases
        const energyDrain = student.primaryTrait === 'distracted' ? 3 : 1;

        // Mood can shift based on energy
        let newMood = student.mood;
        if (student.energy < 30 && student.mood === 'happy') {
          newMood = 'neutral';
        } else if (student.energy < 20 && student.mood === 'neutral') {
          newMood = 'bored';
        }

        return {
          ...student,
          energy: Math.max(0, student.energy - energyDrain),
          mood: newMood,
        };
      });

      return {
        ...state,
        students: updatedStudents,
        classAverage: calculateClassAverage(updatedStudents),
      };
    }

    case 'RANDOM_EVENT_CHECK': {
      // Check for random events based on current phase
      const newEvents = checkForEvents(
        state.turn.phase,
        state.students,
        state.difficulty
      );

      if (newEvents.length === 0) {
        return state;
      }

      return {
        ...state,
        turn: {
          ...state.turn,
          activeEvents: [...state.turn.activeEvents, ...newEvents],
        },
      };
    }

    default:
      return state;
  }
}
