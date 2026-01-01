import type { GameEvent, Student } from '@/lib/game/types';

// Event template - events are generated with actual student IDs at runtime
export interface EventTemplate {
  id: string;
  type: 'random' | 'scheduled' | 'student-triggered';
  title: string;
  description: string | ((student?: Student) => string);
  probability: number; // 0-1, chance of occurring per phase
  phase: 'morning' | 'teaching' | 'interaction' | 'end-of-day' | 'any';
  requiresStudent: boolean; // Whether this event needs a specific student
  studentFilter?: (student: Student) => boolean; // Filter for which students can trigger this
  choices: {
    id: string;
    label: string;
    effects: {
      target: 'student' | 'class' | 'teacher';
      attribute: string;
      modifier: number;
    }[];
  }[];
}

// Morning events
export const MORNING_EVENTS: EventTemplate[] = [
  {
    id: 'late-arrival',
    type: 'random',
    title: 'Late Arrival',
    description: (student) => `${student?.firstName} arrives late to class, looking flustered.`,
    probability: 0.15,
    phase: 'morning',
    requiresStudent: true,
    studentFilter: (s) => s.attendanceToday,
    choices: [
      {
        id: 'welcome',
        label: 'Welcome them warmly',
        effects: [
          { target: 'student', attribute: 'mood', modifier: 1 },
          { target: 'student', attribute: 'engagement', modifier: 5 },
        ],
      },
      {
        id: 'strict',
        label: 'Mark tardy, remind about punctuality',
        effects: [
          { target: 'student', attribute: 'mood', modifier: -1 },
          { target: 'class', attribute: 'engagement', modifier: 2 },
        ],
      },
      {
        id: 'ignore',
        label: 'Let them slip in quietly',
        effects: [
          { target: 'teacher', attribute: 'energy', modifier: -2 },
        ],
      },
    ],
  },
  {
    id: 'homework-excuse',
    type: 'student-triggered',
    title: 'The Dog Ate My Homework',
    description: (student) => `${student?.firstName} claims they couldn't complete their homework due to a family emergency.`,
    probability: 0.1,
    phase: 'morning',
    requiresStudent: true,
    studentFilter: (s) => !s.homeworkCompleted && s.attendanceToday,
    choices: [
      {
        id: 'believe',
        label: 'Give them an extension',
        effects: [
          { target: 'student', attribute: 'mood', modifier: 2 },
          { target: 'student', attribute: 'engagement', modifier: -5 },
        ],
      },
      {
        id: 'partial',
        label: 'Accept late work for partial credit',
        effects: [
          { target: 'student', attribute: 'mood', modifier: 0 },
          { target: 'student', attribute: 'academicLevel', modifier: 1 },
        ],
      },
      {
        id: 'strict',
        label: 'Apply standard late policy',
        effects: [
          { target: 'student', attribute: 'mood', modifier: -2 },
          { target: 'class', attribute: 'engagement', modifier: 3 },
        ],
      },
    ],
  },
  {
    id: 'excited-student',
    type: 'random',
    title: 'Exciting News!',
    description: (student) => `${student?.firstName} is bursting with excitement about something that happened over the weekend.`,
    probability: 0.12,
    phase: 'morning',
    requiresStudent: true,
    studentFilter: (s) => s.mood === 'happy' || s.mood === 'excited',
    choices: [
      {
        id: 'share',
        label: 'Let them share with the class (2 min)',
        effects: [
          { target: 'student', attribute: 'mood', modifier: 1 },
          { target: 'class', attribute: 'energy', modifier: 5 },
          { target: 'teacher', attribute: 'energy', modifier: -3 },
        ],
      },
      {
        id: 'later',
        label: 'Promise to listen during break',
        effects: [
          { target: 'student', attribute: 'mood', modifier: 0 },
        ],
      },
      {
        id: 'redirect',
        label: 'Gently redirect to focus on class',
        effects: [
          { target: 'student', attribute: 'mood', modifier: -1 },
          { target: 'student', attribute: 'engagement', modifier: 5 },
        ],
      },
    ],
  },
];

// Teaching phase events
export const TEACHING_EVENTS: EventTemplate[] = [
  {
    id: 'great-question',
    type: 'random',
    title: 'Excellent Question!',
    description: (student) => `${student?.firstName} asks a surprisingly insightful question that shows deep understanding.`,
    probability: 0.1,
    phase: 'teaching',
    requiresStudent: true,
    studentFilter: (s) => s.engagement > 60 && s.attendanceToday,
    choices: [
      {
        id: 'elaborate',
        label: 'Take time to explore the question',
        effects: [
          { target: 'student', attribute: 'academicLevel', modifier: 3 },
          { target: 'student', attribute: 'mood', modifier: 1 },
          { target: 'class', attribute: 'engagement', modifier: 5 },
          { target: 'teacher', attribute: 'energy', modifier: -5 },
        ],
      },
      {
        id: 'acknowledge',
        label: 'Praise and note for later discussion',
        effects: [
          { target: 'student', attribute: 'mood', modifier: 1 },
          { target: 'student', attribute: 'academicLevel', modifier: 1 },
        ],
      },
    ],
  },
  {
    id: 'confused-student',
    type: 'student-triggered',
    title: 'Lost and Confused',
    description: (student) => `${student?.firstName} looks completely lost and is starting to shut down.`,
    probability: 0.15,
    phase: 'teaching',
    requiresStudent: true,
    studentFilter: (s) => s.academicLevel < 50 && s.attendanceToday,
    choices: [
      {
        id: 'individual-help',
        label: 'Pause to help them individually',
        effects: [
          { target: 'student', attribute: 'academicLevel', modifier: 5 },
          { target: 'student', attribute: 'mood', modifier: 2 },
          { target: 'class', attribute: 'engagement', modifier: -5 },
          { target: 'teacher', attribute: 'energy', modifier: -8 },
        ],
      },
      {
        id: 'peer-help',
        label: 'Pair them with a stronger student',
        effects: [
          { target: 'student', attribute: 'academicLevel', modifier: 3 },
          { target: 'student', attribute: 'socialSkills', modifier: 2 },
        ],
      },
      {
        id: 'continue',
        label: 'Note it and continue (help later)',
        effects: [
          { target: 'student', attribute: 'mood', modifier: -2 },
          { target: 'student', attribute: 'engagement', modifier: -10 },
        ],
      },
    ],
  },
  {
    id: 'disruption',
    type: 'random',
    title: 'Class Disruption',
    description: (student) => `${student?.firstName} is being disruptive and distracting nearby students.`,
    probability: 0.12,
    phase: 'teaching',
    requiresStudent: true,
    studentFilter: (s) => s.energy > 70 && (s.primaryTrait === 'distracted' || s.mood === 'bored'),
    choices: [
      {
        id: 'proximity',
        label: 'Move closer while teaching',
        effects: [
          { target: 'student', attribute: 'engagement', modifier: 10 },
          { target: 'teacher', attribute: 'energy', modifier: -3 },
        ],
      },
      {
        id: 'redirect',
        label: 'Give them a special task',
        effects: [
          { target: 'student', attribute: 'engagement', modifier: 15 },
          { target: 'student', attribute: 'mood', modifier: 1 },
          { target: 'teacher', attribute: 'energy', modifier: -5 },
        ],
      },
      {
        id: 'warning',
        label: 'Issue a verbal warning',
        effects: [
          { target: 'student', attribute: 'mood', modifier: -2 },
          { target: 'student', attribute: 'engagement', modifier: 5 },
          { target: 'class', attribute: 'engagement', modifier: 3 },
        ],
      },
    ],
  },
  {
    id: 'aha-moment',
    type: 'random',
    title: 'Breakthrough!',
    description: (student) => `${student?.firstName}'s face lights up - they finally understand a concept they've been struggling with!`,
    probability: 0.08,
    phase: 'teaching',
    requiresStudent: true,
    studentFilter: (s) => s.needsExtraHelp && s.attendanceToday,
    choices: [
      {
        id: 'celebrate',
        label: 'Celebrate the breakthrough',
        effects: [
          { target: 'student', attribute: 'mood', modifier: 2 },
          { target: 'student', attribute: 'academicLevel', modifier: 5 },
          { target: 'student', attribute: 'engagement', modifier: 10 },
          { target: 'class', attribute: 'mood', modifier: 1 },
        ],
      },
      {
        id: 'build',
        label: 'Build on the momentum quietly',
        effects: [
          { target: 'student', attribute: 'academicLevel', modifier: 3 },
          { target: 'student', attribute: 'engagement', modifier: 5 },
        ],
      },
    ],
  },
];

// Interaction phase events
export const INTERACTION_EVENTS: EventTemplate[] = [
  {
    id: 'conflict',
    type: 'random',
    title: 'Student Conflict',
    description: 'Two students are having a heated disagreement.',
    probability: 0.1,
    phase: 'interaction',
    requiresStudent: false,
    choices: [
      {
        id: 'mediate',
        label: 'Mediate the conflict',
        effects: [
          { target: 'class', attribute: 'socialSkills', modifier: 2 },
          { target: 'teacher', attribute: 'energy', modifier: -10 },
        ],
      },
      {
        id: 'separate',
        label: 'Separate them immediately',
        effects: [
          { target: 'class', attribute: 'mood', modifier: -1 },
          { target: 'teacher', attribute: 'energy', modifier: -5 },
        ],
      },
      {
        id: 'ignore',
        label: 'Let them work it out',
        effects: [
          { target: 'class', attribute: 'energy', modifier: -5 },
        ],
      },
    ],
  },
  {
    id: 'shy-student',
    type: 'student-triggered',
    title: 'Coming Out of Their Shell',
    description: (student) => `${student?.firstName}, usually quiet, seems to want to participate today.`,
    probability: 0.1,
    phase: 'interaction',
    requiresStudent: true,
    studentFilter: (s) => s.primaryTrait === 'shy' && s.mood !== 'upset',
    choices: [
      {
        id: 'encourage',
        label: 'Gently encourage them to share',
        effects: [
          { target: 'student', attribute: 'socialSkills', modifier: 5 },
          { target: 'student', attribute: 'mood', modifier: 1 },
          { target: 'student', attribute: 'engagement', modifier: 10 },
        ],
      },
      {
        id: 'small-group',
        label: 'Create a small group activity',
        effects: [
          { target: 'student', attribute: 'socialSkills', modifier: 3 },
          { target: 'class', attribute: 'engagement', modifier: 5 },
          { target: 'teacher', attribute: 'energy', modifier: -5 },
        ],
      },
      {
        id: 'wait',
        label: 'Give them space to join naturally',
        effects: [
          { target: 'student', attribute: 'mood', modifier: 1 },
        ],
      },
    ],
  },
  {
    id: 'helping-peer',
    type: 'random',
    title: 'Peer Tutoring',
    description: (student) => `${student?.firstName} is spontaneously helping a struggling classmate.`,
    probability: 0.12,
    phase: 'interaction',
    requiresStudent: true,
    studentFilter: (s) => s.academicLevel > 70 && s.socialSkills > 50,
    choices: [
      {
        id: 'praise',
        label: 'Praise and encourage the behavior',
        effects: [
          { target: 'student', attribute: 'mood', modifier: 2 },
          { target: 'student', attribute: 'socialSkills', modifier: 3 },
          { target: 'class', attribute: 'academicLevel', modifier: 2 },
        ],
      },
      {
        id: 'formalize',
        label: 'Make them an official helper',
        effects: [
          { target: 'student', attribute: 'engagement', modifier: 10 },
          { target: 'student', attribute: 'mood', modifier: 1 },
          { target: 'class', attribute: 'academicLevel', modifier: 3 },
        ],
      },
    ],
  },
];

// End of day events
export const END_OF_DAY_EVENTS: EventTemplate[] = [
  {
    id: 'parent-call',
    type: 'random',
    title: 'Parent Phone Call',
    description: 'A parent wants to discuss their child\'s progress.',
    probability: 0.08,
    phase: 'end-of-day',
    requiresStudent: false,
    choices: [
      {
        id: 'take-call',
        label: 'Take the call now',
        effects: [
          { target: 'teacher', attribute: 'energy', modifier: -15 },
          { target: 'teacher', attribute: 'reputation', modifier: 5 },
        ],
      },
      {
        id: 'schedule',
        label: 'Schedule for tomorrow',
        effects: [
          { target: 'teacher', attribute: 'energy', modifier: -2 },
        ],
      },
    ],
  },
  {
    id: 'tired-class',
    type: 'random',
    title: 'Exhausted Class',
    description: 'The whole class seems particularly tired today.',
    probability: 0.1,
    phase: 'end-of-day',
    requiresStudent: false,
    choices: [
      {
        id: 'light-homework',
        label: 'Assign lighter homework tonight',
        effects: [
          { target: 'class', attribute: 'mood', modifier: 2 },
          { target: 'class', attribute: 'energy', modifier: 5 },
        ],
      },
      {
        id: 'stick-plan',
        label: 'Stick to the planned homework',
        effects: [
          { target: 'class', attribute: 'mood', modifier: -1 },
          { target: 'class', attribute: 'academicLevel', modifier: 2 },
        ],
      },
    ],
  },
  {
    id: 'great-day',
    type: 'random',
    title: 'Successful Day!',
    description: 'Today went exceptionally well. The class was engaged and productive.',
    probability: 0.1,
    phase: 'end-of-day',
    requiresStudent: false,
    choices: [
      {
        id: 'celebrate',
        label: 'Share your appreciation with the class',
        effects: [
          { target: 'class', attribute: 'mood', modifier: 2 },
          { target: 'teacher', attribute: 'energy', modifier: 5 },
        ],
      },
      {
        id: 'reward',
        label: 'Promise a fun activity tomorrow',
        effects: [
          { target: 'class', attribute: 'mood', modifier: 3 },
          { target: 'class', attribute: 'engagement', modifier: 10 },
        ],
      },
    ],
  },
];

// All events by phase
export const ALL_EVENTS: Record<string, EventTemplate[]> = {
  morning: MORNING_EVENTS,
  teaching: TEACHING_EVENTS,
  interaction: INTERACTION_EVENTS,
  'end-of-day': END_OF_DAY_EVENTS,
};

// Generate a concrete event from a template
export function generateEvent(
  template: EventTemplate,
  students: Student[]
): GameEvent | null {
  let targetStudent: Student | undefined;

  if (template.requiresStudent) {
    const eligibleStudents = students.filter(
      (s) => template.studentFilter?.(s) ?? true
    );
    if (eligibleStudents.length === 0) return null;
    targetStudent = eligibleStudents[Math.floor(Math.random() * eligibleStudents.length)];
  }

  const description =
    typeof template.description === 'function'
      ? template.description(targetStudent)
      : template.description;

  return {
    id: `${template.id}-${Date.now()}`,
    type: template.type,
    title: template.title,
    description,
    choices: template.choices.map((choice) => ({
      ...choice,
      effects: choice.effects.map((effect) => ({
        ...effect,
        studentId: effect.target === 'student' ? targetStudent?.id : undefined,
      })),
    })),
    affectedStudentIds: targetStudent ? [targetStudent.id] : undefined,
  };
}

// Check for random events based on current phase
export function checkForEvents(
  phase: string,
  students: Student[],
  difficulty: 'easy' | 'normal' | 'hard'
): GameEvent[] {
  const phaseEvents = ALL_EVENTS[phase] || [];
  const events: GameEvent[] = [];

  // Difficulty modifies event probability
  const difficultyModifier = {
    easy: 0.7,
    normal: 1.0,
    hard: 1.3,
  }[difficulty];

  for (const template of phaseEvents) {
    const adjustedProbability = template.probability * difficultyModifier;
    if (Math.random() < adjustedProbability) {
      const event = generateEvent(template, students);
      if (event) {
        events.push(event);
        // Only one event per phase check
        break;
      }
    }
  }

  return events;
}
