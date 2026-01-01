// ============ CORE ENUMS ============
export type GamePhase = 'morning' | 'teaching' | 'interaction' | 'end-of-day';
export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday';
export type Mood = 'excited' | 'happy' | 'neutral' | 'bored' | 'frustrated' | 'upset';
export type LearningStyle = 'visual' | 'auditory' | 'kinesthetic' | 'reading';
export type PersonalityTrait =
  | 'shy'
  | 'outgoing'
  | 'curious'
  | 'distracted'
  | 'perfectionist'
  | 'creative'
  | 'analytical'
  | 'social';

// ============ STUDENT MODEL ============
export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  avatarSeed: string;

  // Core attributes (0-100 scale)
  academicLevel: number;
  engagement: number;
  energy: number;
  socialSkills: number;

  // Personality
  primaryTrait: PersonalityTrait;
  secondaryTrait: PersonalityTrait;
  learningStyle: LearningStyle;

  // Dynamic state
  mood: Mood;
  homeworkCompleted: boolean;
  homeworkQuality: number;
  attendanceToday: boolean;

  // Relationships
  friendIds: string[];
  rivalIds: string[];

  // Social dynamics (new)
  popularity: number; // 0-100
  clique: 'popular' | 'nerds' | 'artists' | 'athletes' | 'loners' | 'creatives' | null;
  socialEnergy: number; // 0-100, introverts drain, extroverts gain
  friendshipStrengths: Record<string, number>; // studentId -> strength (-100 to 100)

  // History tracking
  testScores: number[];
  behaviorIncidents: number;
  positiveNotes: number;

  // Special flags
  hasIEP: boolean;
  needsExtraHelp: boolean;
  isGifted: boolean;
}

// ============ TEACHER MODEL ============
export interface Teacher {
  energy: number;
  reputation: number;
  parentSatisfaction: number;
  suppliesBudget: number;
}

// ============ TURN/DAY MODEL ============
export interface TurnState {
  week: number;
  dayOfWeek: DayOfWeek;
  phase: GamePhase;

  // Today's choices
  selectedLesson: Lesson | null;
  selectedMethod: TeachingMethod | null;
  selectedActivity: Activity | null;
  homeworkAssigned: HomeworkType | null;

  // Events
  activeEvents: GameEvent[];
  resolvedEvents: string[];
}

// ============ TEACHING OPTIONS ============
export interface Lesson {
  id: string;
  name: string;
  subject: 'math' | 'reading' | 'science' | 'social-studies' | 'art' | 'pe';
  difficulty: 1 | 2 | 3;
  duration: 'short' | 'medium' | 'long';
  requiredEnergy: number;
}

export interface TeachingMethod {
  id: string;
  name: string;
  description: string;
  bestFor: LearningStyle[];
  engagementModifier: number;
  energyCost: number;
}

export interface Activity {
  id: string;
  name: string;
  type: 'individual' | 'pairs' | 'groups' | 'whole-class';
  supplyCost: number;
  funFactor: number;
  learningValue: number;
}

export type HomeworkType = 'none' | 'light' | 'moderate' | 'heavy';

// ============ EVENTS ============
export interface GameEvent {
  id: string;
  type: 'random' | 'scheduled' | 'student-triggered';
  title: string;
  description: string;
  choices: EventChoice[];
  affectedStudentIds?: string[];
}

export interface EventChoice {
  id: string;
  label: string;
  effects: EventEffect[];
}

export interface EventEffect {
  target: 'student' | 'class' | 'teacher';
  studentId?: string;
  attribute: string;
  modifier: number;
}

// ============ SCHOOL YEAR ============
// Re-export calendar types for convenience
export type { SchoolYear, SchoolDay, SchoolBreak, WeatherEvent } from './calendar';

// Re-export schedule types for convenience
export type {
  DailySchedule,
  TimeBlock,
  SubjectType,
  SpecialType,
  BlockStatus,
} from './schedule';

// Re-export lesson pivot types for convenience
export type {
  LessonStatus,
  PivotOption,
  FailureRisk,
  PivotType,
  PivotResult,
} from './lessonPivot';

// Re-export time tracking types for convenience
export type {
  TimeTracker,
  PacingStatus,
  TimeAlert,
  EarlyFinishOption,
  OvertimeOption,
} from './timeTracking';

// Re-export lesson plan types for convenience
export type {
  LessonPlan,
  LessonActivity,
  LearningObjective,
  LessonMaterial,
  LessonPhase,
  GroupingType,
  TeachingMethodType,
} from './lessonPlan';

// ============ GAME STATE ============
export interface GameState {
  saveId: string;
  createdAt: string;
  lastSavedAt: string;

  students: Student[];
  teacher: Teacher;
  turn: TurnState;
  schoolYear: import('./calendar').SchoolYear;

  // Schedule system
  currentSchedule: import('./schedule').DailySchedule | null;
  currentTimeBlock: import('./schedule').TimeBlock | null;
  timeTracker: import('./timeTracking').TimeTracker | null;

  // Lesson tracking
  currentLessonStatus: import('./lessonPivot').LessonStatus | null;

  classAverage: number;

  difficulty: 'easy' | 'normal' | 'hard';
  autoSaveEnabled: boolean;
}

// ============ ACTIONS ============
export type GameAction =
  | { type: 'ADVANCE_PHASE' }
  | { type: 'ADVANCE_DAY' }
  | { type: 'SELECT_LESSON'; payload: Lesson }
  | { type: 'SELECT_METHOD'; payload: TeachingMethod }
  | { type: 'SELECT_ACTIVITY'; payload: Activity }
  | { type: 'ASSIGN_HOMEWORK'; payload: HomeworkType }
  | { type: 'RESOLVE_EVENT'; payload: { eventId: string; choiceId: string } }
  | { type: 'INTERACT_STUDENT'; payload: { studentId: string; action: string } }
  | { type: 'LOAD_GAME'; payload: GameState }
  | { type: 'NEW_GAME'; payload: { difficulty: GameState['difficulty'] } }
  | { type: 'TICK_STUDENT_STATE' }
  | { type: 'RANDOM_EVENT_CHECK' }
  | { type: 'PROCESS_SOCIAL' }
  // Schedule actions
  | { type: 'SET_SCHEDULE'; payload: import('./schedule').DailySchedule }
  | { type: 'START_TIME_BLOCK'; payload: { blockId: string } }
  | { type: 'END_TIME_BLOCK'; payload: { blockId: string } }
  | { type: 'UPDATE_TIME_TRACKER'; payload: { elapsedMinutes: number } }
  // Lesson pivot actions
  | { type: 'PIVOT_LESSON'; payload: { pivotOptionId: string } }
  | { type: 'UPDATE_LESSON_STATUS'; payload: import('./lessonPivot').LessonStatus }
  // Time management actions
  | { type: 'HANDLE_EARLY_FINISH'; payload: { optionId: string } }
  | { type: 'HANDLE_OVERTIME'; payload: { optionId: string } }
  | { type: 'MOVE_TIME_BLOCK'; payload: { blockId: string; newDayOfWeek: number; newStartTime: string } };
