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
import { generateSchoolYear, type SchoolYear } from './calendar';
import { processSocialTurn, calculateFriendshipCompatibility } from '../students/socialEngine';
import { generateDefaultSchedule } from './schedule';
import {
  createTimeTracker,
  updateTimeTracker,
  updatePacing,
  getEarlyFinishOptions,
  getOvertimeOptions,
  handleEarlyFinish,
  handleOvertime,
} from './timeTracking';
import {
  executePivot,
  createLessonStatus,
  getPivotOptions,
} from './lessonPivot';

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
  // Generate school year with current year and random seed
  const schoolYear = generateSchoolYear(new Date().getFullYear());

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
    schoolYear,
    // Schedule system - initialize with default Monday schedule
    currentSchedule: generateDefaultSchedule('monday'),
    currentTimeBlock: null,
    timeTracker: null,
    currentLessonStatus: null,
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

      // Advance school year day
      const nextSchoolDay = state.schoolYear.currentDay + 1;
      const isSchoolYearComplete = nextSchoolDay > state.schoolYear.totalSchoolDays;

      // Generate new schedule for the next day
      const newSchedule = generateDefaultSchedule(nextDay);

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
        schoolYear: {
          ...state.schoolYear,
          currentDay: isSchoolYearComplete ? state.schoolYear.totalSchoolDays : nextSchoolDay,
        },
        // Reset schedule-related state for new day
        currentSchedule: newSchedule,
        currentTimeBlock: null,
        timeTracker: null,
        currentLessonStatus: null,
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

    case 'PROCESS_SOCIAL': {
      // Process social dynamics for the current turn
      const currentDay = state.schoolYear.currentDay;
      const { interactions, cliqueAssignments, popularityScores } = processSocialTurn(
        state.students,
        currentDay
      );

      // Update students with new social data
      const updatedStudents = state.students.map(student => {
        const newPopularity = popularityScores.get(student.id) || student.popularity;
        const newClique = cliqueAssignments.get(student.id) || student.clique;

        // Update friendship strengths based on interactions
        const updatedFriendshipStrengths = { ...student.friendshipStrengths };
        const relevantInteractions = interactions.filter(i =>
          i.participants.includes(student.id)
        );

        for (const interaction of relevantInteractions) {
          // Find the other participant(s)
          const otherParticipants = interaction.participants.filter(id => id !== student.id);

          for (const otherId of otherParticipants) {
            const currentStrength = updatedFriendshipStrengths[otherId] || 0;
            const newStrength = Math.max(-100, Math.min(100,
              currentStrength + interaction.friendshipDelta
            ));
            updatedFriendshipStrengths[otherId] = newStrength;

            // Update friendIds and rivalIds based on strength
            const friendsList = new Set(student.friendIds);
            const rivalsList = new Set(student.rivalIds);

            if (newStrength > 40 && !friendsList.has(otherId)) {
              friendsList.add(otherId);
              rivalsList.delete(otherId); // Can't be both
            } else if (newStrength < -40 && !rivalsList.has(otherId)) {
              rivalsList.add(otherId);
              friendsList.delete(otherId); // Can't be both
            } else if (newStrength >= -20 && newStrength <= 20) {
              // Neutral territory - remove from both if present
              friendsList.delete(otherId);
              rivalsList.delete(otherId);
            }

            student.friendIds = Array.from(friendsList);
            student.rivalIds = Array.from(rivalsList);
          }
        }

        // Update social energy based on personality
        let socialEnergyChange = 0;
        if (student.primaryTrait === 'outgoing' || student.primaryTrait === 'social') {
          // Extroverts gain energy from social interactions
          socialEnergyChange = relevantInteractions.length * 5;
        } else if (student.primaryTrait === 'shy') {
          // Introverts lose energy from social interactions
          socialEnergyChange = -relevantInteractions.length * 3;
        }

        const newSocialEnergy = Math.max(0, Math.min(100,
          student.socialEnergy + socialEnergyChange
        ));

        return {
          ...student,
          popularity: newPopularity,
          clique: newClique,
          socialEnergy: newSocialEnergy,
          friendshipStrengths: updatedFriendshipStrengths,
        };
      });

      return {
        ...state,
        students: updatedStudents,
        classAverage: calculateClassAverage(updatedStudents),
      };
    }

    case 'SET_SCHEDULE': {
      // Set or update the daily schedule
      return {
        ...state,
        currentSchedule: action.payload,
      };
    }

    case 'START_TIME_BLOCK': {
      // Start a time block from the schedule
      const { blockId } = action.payload;

      if (!state.currentSchedule) return state;

      const block = state.currentSchedule.blocks.find(b => b.id === blockId);
      if (!block) return state;

      // Create time tracker for this block
      const tracker = createTimeTracker(block.duration);

      // Update block status to in-progress
      const updatedSchedule = {
        ...state.currentSchedule,
        blocks: state.currentSchedule.blocks.map(b =>
          b.id === blockId ? { ...b, status: 'in-progress' as const } : b
        ),
      };

      return {
        ...state,
        currentSchedule: updatedSchedule,
        currentTimeBlock: block,
        timeTracker: tracker,
      };
    }

    case 'END_TIME_BLOCK': {
      // End a time block and mark as completed
      const { blockId } = action.payload;

      if (!state.currentSchedule) return state;

      const updatedSchedule = {
        ...state.currentSchedule,
        blocks: state.currentSchedule.blocks.map(b =>
          b.id === blockId ? { ...b, status: 'completed' as const } : b
        ),
      };

      return {
        ...state,
        currentSchedule: updatedSchedule,
        currentTimeBlock: null,
        timeTracker: null,
        currentLessonStatus: null,
      };
    }

    case 'UPDATE_TIME_TRACKER': {
      // Update time tracker with elapsed time
      const { elapsedMinutes } = action.payload;

      if (!state.timeTracker) return state;

      const updatedTracker = updateTimeTracker(state.timeTracker, elapsedMinutes);

      return {
        ...state,
        timeTracker: updatedTracker,
      };
    }

    case 'PIVOT_LESSON': {
      // Execute a lesson pivot
      const { pivotOptionId } = action.payload;

      if (!state.currentLessonStatus) return state;

      const pivotOption = state.currentLessonStatus.pivotOptions.find(
        opt => opt.id === pivotOptionId
      );

      if (!pivotOption) return state;

      // Get student personalities for pivot calculation
      const studentPersonalities = state.students
        .filter(s => s.attendanceToday)
        .map(s => ({
          learningStyle: s.learningStyle,
          primaryTrait: s.primaryTrait,
        }));

      // Execute the pivot
      const result = executePivot(
        pivotOption,
        state.currentLessonStatus.engagement,
        state.teacher.energy,
        studentPersonalities
      );

      // Apply results
      const updatedStudents = state.students.map(student => {
        if (!student.attendanceToday) return student;

        return {
          ...student,
          engagement: Math.max(0, Math.min(100, student.engagement + result.engagementChange)),
        };
      });

      const updatedTeacher = {
        ...state.teacher,
        energy: Math.max(0, state.teacher.energy - result.energyCost),
      };

      // Update lesson status with new engagement
      const classEngagement = updatedStudents
        .filter(s => s.attendanceToday)
        .reduce((sum, s) => sum + s.engagement, 0) / updatedStudents.filter(s => s.attendanceToday).length;

      const updatedLessonStatus = {
        ...state.currentLessonStatus,
        engagement: classEngagement,
      };

      return {
        ...state,
        students: updatedStudents,
        teacher: updatedTeacher,
        currentLessonStatus: updatedLessonStatus,
        classAverage: calculateClassAverage(updatedStudents),
      };
    }

    case 'UPDATE_LESSON_STATUS': {
      // Update lesson status (progress, engagement, etc.)
      return {
        ...state,
        currentLessonStatus: action.payload,
      };
    }

    case 'HANDLE_EARLY_FINISH': {
      // Handle early finish of a lesson
      const { optionId } = action.payload;

      if (!state.timeTracker) return state;

      const options = getEarlyFinishOptions();
      const option = options.find(opt => opt.id === optionId);

      if (!option) return state;

      const result = handleEarlyFinish(option, state.timeTracker.remainingMinutes);

      // Apply effects to students
      const updatedStudents = state.students.map(student => {
        if (!student.attendanceToday) return student;

        return {
          ...student,
          engagement: Math.max(0, Math.min(100, student.engagement + result.engagementChange)),
          academicLevel: Math.max(0, Math.min(100, student.academicLevel + result.academicChange)),
          energy: Math.max(0, Math.min(100, student.energy + result.energyRecovery)),
        };
      });

      const updatedTeacher = {
        ...state.teacher,
        energy: Math.max(0, Math.min(100, state.teacher.energy + result.energyRecovery)),
      };

      return {
        ...state,
        students: updatedStudents,
        teacher: updatedTeacher,
        classAverage: calculateClassAverage(updatedStudents),
      };
    }

    case 'HANDLE_OVERTIME': {
      // Handle running out of time
      const { optionId } = action.payload;

      if (!state.currentLessonStatus) return state;

      const options = getOvertimeOptions();
      const option = options.find(opt => opt.id === optionId);

      if (!option) return state;

      const result = handleOvertime(option, state.currentLessonStatus.progress);

      // Apply effects
      const updatedLessonStatus = {
        ...state.currentLessonStatus,
        progress: Math.min(100, state.currentLessonStatus.progress + result.progressChange),
      };

      const updatedTeacher = {
        ...state.teacher,
        energy: Math.max(0, state.teacher.energy - result.stressCost),
      };

      return {
        ...state,
        currentLessonStatus: updatedLessonStatus,
        teacher: updatedTeacher,
      };
    }

    case 'MOVE_TIME_BLOCK': {
      if (!state.currentSchedule) return state;
      const { blockId, newDayOfWeek, newStartTime } = action.payload;
      const updatedBlocks = state.currentSchedule.blocks.map(block =>
        block.id === blockId
          ? { ...block, dayOfWeek: newDayOfWeek, startTime: newStartTime }
          : block
      );
      return {
        ...state,
        currentSchedule: {
          ...state.currentSchedule,
          blocks: updatedBlocks,
        },
      };
    }

    default:
      return state;
  }
}
