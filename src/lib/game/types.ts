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

// ============ GAME STATE ============
export interface GameState {
  saveId: string;
  createdAt: string;
  lastSavedAt: string;

  students: Student[];
  teacher: Teacher;
  turn: TurnState;

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
  | { type: 'RANDOM_EVENT_CHECK' };
