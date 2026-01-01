/**
 * Student-to-Teacher Interaction System
 * Generates personality-driven interactions with the teacher
 */

import type { Student } from '../game/types';
import { PERSONALITY_PROFILES } from './personalities';

export type TeacherActionType =
  | 'ask_question'
  | 'call_on_student'
  | 'give_praise'
  | 'give_correction'
  | 'assign_task'
  | 'ask_for_help'
  | 'start_lesson'
  | 'give_instruction'
  | 'announce_test'
  | 'assign_groups';

export interface TeacherInteraction {
  studentId: string;
  interactionType: 'response' | 'initiated' | 'reaction';
  action: string;
  dialogue?: string; // What the student says/does
  isVerbal: boolean;
  isDisruptive: boolean;
  engagementChange: number; // -10 to +10
  moodChange: number; // -10 to +10
  teacherReputationImpact: number; // -5 to +5
}

/**
 * Generate how a student interacts with teacher based on action and personality
 */
export function generateTeacherInteraction(
  student: Student,
  teacherAction: TeacherActionType,
  context?: { topic?: string; isPublic?: boolean }
): TeacherInteraction {
  const profile = PERSONALITY_PROFILES[student.primaryTrait];
  const quirks = profile.quirks;
  const socialBehaviors = profile.socialBehaviors;

  switch (teacherAction) {
    case 'call_on_student':
      return handleBeingCalledOn(student, profile, context?.isPublic || true);

    case 'give_praise':
      return handlePraise(student, profile, context?.isPublic || true);

    case 'give_correction':
      return handleCorrection(student, profile, context?.isPublic || true);

    case 'start_lesson':
      return handleLessonStart(student, profile, context?.topic);

    case 'ask_question':
      return handleTeacherQuestion(student, profile, context?.isPublic || false);

    case 'assign_groups':
      return handleGroupAssignment(student, profile);

    case 'announce_test':
      return handleTestAnnouncement(student, profile);

    case 'give_instruction':
      return handleInstruction(student, profile);

    default:
      return {
        studentId: student.id,
        interactionType: 'reaction',
        action: 'listen',
        isVerbal: false,
        isDisruptive: false,
        engagementChange: 0,
        moodChange: 0,
        teacherReputationImpact: 0,
      };
  }
}

/**
 * Student raises hand or initiates interaction with teacher
 */
export function generateStudentInitiatedInteraction(
  student: Student,
  reason: 'question' | 'help' | 'share' | 'complaint' | 'bathroom' | 'off-topic'
): TeacherInteraction | null {
  const profile = PERSONALITY_PROFILES[student.primaryTrait];

  // Shy students rarely initiate
  if (student.primaryTrait === 'shy' && Math.random() > 0.2) {
    return null;
  }

  // Outgoing and curious students initiate more
  const initiationChance =
    student.primaryTrait === 'outgoing' || student.primaryTrait === 'curious' ? 0.7 : 0.4;

  if (Math.random() > initiationChance) {
    return null;
  }

  let action = '';
  let dialogue = '';
  let isDisruptive = false;
  let engagementChange = 0;
  let moodChange = 0;

  switch (reason) {
    case 'question':
      if (student.primaryTrait === 'curious') {
        action = 'ask_enthusiastic_question';
        dialogue = `${student.firstName} raises hand eagerly: "Why does that happen?"`;
        engagementChange = 5;
        moodChange = 3;
      } else if (student.primaryTrait === 'analytical') {
        action = 'ask_clarifying_question';
        dialogue = `${student.firstName} ${profile.quirks[0]?.toLowerCase() || 'raises hand'}: "Can you explain the logic behind that?"`;
        engagementChange = 3;
        moodChange = 2;
      } else {
        action = 'ask_question';
        dialogue = `${student.firstName} raises hand with a question.`;
        engagementChange = 2;
        moodChange = 1;
      }
      break;

    case 'help':
      if (student.primaryTrait === 'shy') {
        action = 'quietly_approach';
        dialogue = `${student.firstName} ${profile.quirks[0]?.toLowerCase() || 'quietly approaches'} the teacher's desk.`;
        engagementChange = -2;
        moodChange = -1;
      } else if (student.primaryTrait === 'perfectionist') {
        action = 'ask_for_clarification';
        dialogue = `${student.firstName} ${profile.classroomHabits[2]?.toLowerCase() || 'asks'}: "I want to make sure I understand this correctly..."`;
        engagementChange = 3;
        moodChange = 2;
      } else {
        action = 'ask_for_help';
        dialogue = `${student.firstName}: "I don't understand this part."`;
        engagementChange = 1;
        moodChange = -1;
      }
      break;

    case 'share':
      if (student.primaryTrait === 'outgoing') {
        action = 'share_story';
        dialogue = `${student.firstName} ${profile.quirks[1]?.toLowerCase() || 'excitedly shares'}: "This reminds me of..."`;
        engagementChange = 4;
        moodChange = 5;
        isDisruptive = true;
      } else if (student.primaryTrait === 'creative') {
        action = 'share_idea';
        dialogue = `${student.firstName} raises hand: "I have a different way to think about this!"`;
        engagementChange = 5;
        moodChange = 4;
      } else {
        return null; // Other types don't share as much
      }
      break;

    case 'off-topic':
      if (student.primaryTrait === 'distracted') {
        action = 'off_topic_question';
        dialogue = `${student.firstName} blurts out: "Can we talk about [something unrelated]?"`;
        engagementChange = -3;
        moodChange = 0;
        isDisruptive = true;
      } else if (student.primaryTrait === 'curious') {
        action = 'tangent_question';
        dialogue = `${student.firstName}: "This is related, but what about...?"`;
        engagementChange = 2;
        moodChange = 2;
        isDisruptive = true;
      } else {
        return null;
      }
      break;

    case 'complaint':
      if (student.primaryTrait === 'perfectionist') {
        action = 'point_out_issue';
        dialogue = `${student.firstName} ${profile.quirks[2]?.toLowerCase() || 'raises hand'}: "I think there's a mistake here..."`;
        engagementChange = 0;
        moodChange = -2;
      } else if (student.primaryTrait === 'analytical') {
        action = 'correct_teacher';
        dialogue = `${student.firstName} ${profile.quirks[0]?.toLowerCase() || 'politely corrects'}: "Actually, I think it should be..."`;
        engagementChange = 2;
        moodChange = 0;
      } else {
        return null;
      }
      break;

    case 'bathroom':
      action = 'ask_bathroom';
      dialogue = `${student.firstName} raises hand: "Can I use the bathroom?"`;
      engagementChange = -1;
      moodChange = 0;
      break;
  }

  return {
    studentId: student.id,
    interactionType: 'initiated',
    action,
    dialogue,
    isVerbal: true,
    isDisruptive,
    engagementChange,
    moodChange,
    teacherReputationImpact: isDisruptive ? -1 : 1,
  };
}

// ============ HANDLER FUNCTIONS ============

function handleBeingCalledOn(
  student: Student,
  profile: typeof PERSONALITY_PROFILES[keyof typeof PERSONALITY_PROFILES],
  isPublic: boolean
): TeacherInteraction {
  const quirks = profile.quirks;

  switch (student.primaryTrait) {
    case 'shy':
      return {
        studentId: student.id,
        interactionType: 'response',
        action: 'answer_nervously',
        dialogue: `${student.firstName} ${quirks[0]?.toLowerCase() || 'looks down'} and speaks very quietly.`,
        isVerbal: true,
        isDisruptive: false,
        engagementChange: -3,
        moodChange: -5,
        teacherReputationImpact: -1,
      };

    case 'outgoing':
      return {
        studentId: student.id,
        interactionType: 'response',
        action: 'answer_confidently',
        dialogue: `${student.firstName} jumps at the chance: "Oh! I know this one!"`,
        isVerbal: true,
        isDisruptive: false,
        engagementChange: 5,
        moodChange: 4,
        teacherReputationImpact: 2,
      };

    case 'analytical':
      return {
        studentId: student.id,
        interactionType: 'response',
        action: 'answer_precisely',
        dialogue: `${student.firstName} ${quirks[2]?.toLowerCase() || 'thinks carefully'} before giving a detailed answer.`,
        isVerbal: true,
        isDisruptive: false,
        engagementChange: 3,
        moodChange: 2,
        teacherReputationImpact: 2,
      };

    case 'distracted':
      return {
        studentId: student.id,
        interactionType: 'response',
        action: 'caught_off_guard',
        dialogue: `${student.firstName} ${quirks[3]?.toLowerCase() || 'looks confused'}: "Wait, what was the question?"`,
        isVerbal: true,
        isDisruptive: false,
        engagementChange: -2,
        moodChange: -3,
        teacherReputationImpact: -1,
      };

    case 'perfectionist':
      return {
        studentId: student.id,
        interactionType: 'response',
        action: 'answer_carefully',
        dialogue: `${student.firstName} ${quirks[3]?.toLowerCase() || 'double-checks mentally'} before answering cautiously.`,
        isVerbal: true,
        isDisruptive: false,
        engagementChange: 2,
        moodChange: -1,
        teacherReputationImpact: 1,
      };

    default:
      return {
        studentId: student.id,
        interactionType: 'response',
        action: 'answer',
        dialogue: `${student.firstName} answers the question.`,
        isVerbal: true,
        isDisruptive: false,
        engagementChange: 1,
        moodChange: 0,
        teacherReputationImpact: 1,
      };
  }
}

function handlePraise(
  student: Student,
  profile: typeof PERSONALITY_PROFILES[keyof typeof PERSONALITY_PROFILES],
  isPublic: boolean
): TeacherInteraction {
  const quirks = profile.quirks;

  switch (student.primaryTrait) {
    case 'shy':
      return {
        studentId: student.id,
        interactionType: 'reaction',
        action: 'blush',
        dialogue: `${student.firstName} ${quirks[3]?.toLowerCase() || 'blushes'} and smiles shyly.`,
        isVerbal: false,
        isDisruptive: false,
        engagementChange: 3,
        moodChange: 5,
        teacherReputationImpact: 2,
      };

    case 'outgoing':
      return {
        studentId: student.id,
        interactionType: 'reaction',
        action: 'beam_with_pride',
        dialogue: `${student.firstName} beams and says "Thank you!" enthusiastically.`,
        isVerbal: true,
        isDisruptive: false,
        engagementChange: 5,
        moodChange: 7,
        teacherReputationImpact: 3,
      };

    case 'perfectionist':
      return {
        studentId: student.id,
        interactionType: 'reaction',
        action: 'feel_validated',
        dialogue: `${student.firstName} looks relieved and nods, all their hard work paying off.`,
        isVerbal: false,
        isDisruptive: false,
        engagementChange: 4,
        moodChange: 6,
        teacherReputationImpact: 2,
      };

    default:
      return {
        studentId: student.id,
        interactionType: 'reaction',
        action: 'smile',
        dialogue: `${student.firstName} smiles, feeling proud.`,
        isVerbal: false,
        isDisruptive: false,
        engagementChange: 3,
        moodChange: 4,
        teacherReputationImpact: 2,
      };
  }
}

function handleCorrection(
  student: Student,
  profile: typeof PERSONALITY_PROFILES[keyof typeof PERSONALITY_PROFILES],
  isPublic: boolean
): TeacherInteraction {
  const quirks = profile.quirks;

  switch (student.primaryTrait) {
    case 'perfectionist':
      return {
        studentId: student.id,
        interactionType: 'reaction',
        action: 'take_hard',
        dialogue: `${student.firstName} ${quirks[2]?.toLowerCase() || 'sighs'}, clearly disappointed in themselves.`,
        isVerbal: false,
        isDisruptive: false,
        engagementChange: -2,
        moodChange: -6,
        teacherReputationImpact: 0,
      };

    case 'analytical':
      return {
        studentId: student.id,
        interactionType: 'reaction',
        action: 'analyze_mistake',
        dialogue: `${student.firstName} nods thoughtfully: "I see where I went wrong."`,
        isVerbal: true,
        isDisruptive: false,
        engagementChange: 1,
        moodChange: -1,
        teacherReputationImpact: 1,
      };

    case 'outgoing':
      return {
        studentId: student.id,
        interactionType: 'reaction',
        action: 'shrug_it_off',
        dialogue: `${student.firstName} shrugs: "Oops! I'll get it next time!"`,
        isVerbal: true,
        isDisruptive: false,
        engagementChange: 0,
        moodChange: -1,
        teacherReputationImpact: 1,
      };

    case 'shy':
      return {
        studentId: student.id,
        interactionType: 'reaction',
        action: 'shrink_back',
        dialogue: `${student.firstName} ${quirks[0]?.toLowerCase() || 'looks down'}, feeling embarrassed.`,
        isVerbal: false,
        isDisruptive: false,
        engagementChange: -3,
        moodChange: -4,
        teacherReputationImpact: -1,
      };

    default:
      return {
        studentId: student.id,
        interactionType: 'reaction',
        action: 'accept_correction',
        dialogue: `${student.firstName} nods and tries again.`,
        isVerbal: false,
        isDisruptive: false,
        engagementChange: -1,
        moodChange: -2,
        teacherReputationImpact: 0,
      };
  }
}

function handleLessonStart(
  student: Student,
  profile: typeof PERSONALITY_PROFILES[keyof typeof PERSONALITY_PROFILES],
  topic?: string
): TeacherInteraction {
  switch (student.primaryTrait) {
    case 'curious':
      return {
        studentId: student.id,
        interactionType: 'reaction',
        action: 'lean_forward',
        dialogue: `${student.firstName}'s ${profile.quirks[3]?.toLowerCase() || 'eyes light up'} at the new topic.`,
        isVerbal: false,
        isDisruptive: false,
        engagementChange: 7,
        moodChange: 5,
        teacherReputationImpact: 2,
      };

    case 'distracted':
      return {
        studentId: student.id,
        interactionType: 'reaction',
        action: 'already_distracted',
        dialogue: `${student.firstName} ${profile.quirks[1]?.toLowerCase() || 'stares out the window'} as the lesson begins.`,
        isVerbal: false,
        isDisruptive: false,
        engagementChange: -3,
        moodChange: -2,
        teacherReputationImpact: -1,
      };

    case 'analytical':
      return {
        studentId: student.id,
        interactionType: 'reaction',
        action: 'prepare_to_learn',
        dialogue: `${student.firstName} ${profile.classroomHabits[1]?.toLowerCase() || 'prepares notes'} systematically.`,
        isVerbal: false,
        isDisruptive: false,
        engagementChange: 4,
        moodChange: 2,
        teacherReputationImpact: 1,
      };

    default:
      return {
        studentId: student.id,
        interactionType: 'reaction',
        action: 'pay_attention',
        dialogue: `${student.firstName} settles in to listen.`,
        isVerbal: false,
        isDisruptive: false,
        engagementChange: 2,
        moodChange: 0,
        teacherReputationImpact: 0,
      };
  }
}

function handleTeacherQuestion(
  student: Student,
  profile: typeof PERSONALITY_PROFILES[keyof typeof PERSONALITY_PROFILES],
  isDirected: boolean
): TeacherInteraction {
  if (isDirected) {
    return handleBeingCalledOn(student, profile, true);
  }

  // Open question to class
  const raiseHandChance =
    student.primaryTrait === 'outgoing' || student.primaryTrait === 'curious'
      ? 0.7
      : student.primaryTrait === 'shy'
        ? 0.1
        : 0.4;

  if (Math.random() < raiseHandChance) {
    return {
      studentId: student.id,
      interactionType: 'initiated',
      action: 'raise_hand',
      dialogue: `${student.firstName} ${profile.classroomHabits[1]?.toLowerCase() || 'raises hand'}.`,
      isVerbal: false,
      isDisruptive: false,
      engagementChange: 3,
      moodChange: 2,
      teacherReputationImpact: 1,
    };
  }

  return {
    studentId: student.id,
    interactionType: 'reaction',
    action: 'wait',
    isVerbal: false,
    isDisruptive: false,
    engagementChange: 0,
    moodChange: 0,
    teacherReputationImpact: 0,
  };
}

function handleGroupAssignment(
  student: Student,
  profile: typeof PERSONALITY_PROFILES[keyof typeof PERSONALITY_PROFILES]
): TeacherInteraction {
  switch (student.primaryTrait) {
    case 'outgoing':
    case 'social':
      return {
        studentId: student.id,
        interactionType: 'reaction',
        action: 'excited_for_groups',
        dialogue: `${student.firstName} immediately looks around for partners excitedly.`,
        isVerbal: false,
        isDisruptive: false,
        engagementChange: 6,
        moodChange: 7,
        teacherReputationImpact: 1,
      };

    case 'shy':
    case 'analytical':
      return {
        studentId: student.id,
        interactionType: 'reaction',
        action: 'anxious_about_groups',
        dialogue: `${student.firstName} ${profile.quirks[0]?.toLowerCase() || 'looks nervous'} about group work.`,
        isVerbal: false,
        isDisruptive: false,
        engagementChange: -2,
        moodChange: -3,
        teacherReputationImpact: 0,
      };

    default:
      return {
        studentId: student.id,
        interactionType: 'reaction',
        action: 'neutral_groups',
        dialogue: `${student.firstName} looks for a partner.`,
        isVerbal: false,
        isDisruptive: false,
        engagementChange: 1,
        moodChange: 0,
        teacherReputationImpact: 0,
      };
  }
}

function handleTestAnnouncement(
  student: Student,
  profile: typeof PERSONALITY_PROFILES[keyof typeof PERSONALITY_PROFILES]
): TeacherInteraction {
  switch (student.primaryTrait) {
    case 'perfectionist':
      return {
        studentId: student.id,
        interactionType: 'reaction',
        action: 'test_anxiety',
        dialogue: `${student.firstName} ${profile.quirks[2]?.toLowerCase() || 'sighs with stress'}, already worried.`,
        isVerbal: false,
        isDisruptive: false,
        engagementChange: 0,
        moodChange: -4,
        teacherReputationImpact: 0,
      };

    case 'analytical':
      return {
        studentId: student.id,
        interactionType: 'reaction',
        action: 'prepare_mentally',
        dialogue: `${student.firstName} ${profile.classroomHabits[2]?.toLowerCase() || 'starts planning study time'}.`,
        isVerbal: false,
        isDisruptive: false,
        engagementChange: 3,
        moodChange: 0,
        teacherReputationImpact: 1,
      };

    case 'distracted':
      return {
        studentId: student.id,
        interactionType: 'reaction',
        action: 'groan',
        dialogue: `${student.firstName} groans quietly, not looking forward to it.`,
        isVerbal: false,
        isDisruptive: false,
        engagementChange: -2,
        moodChange: -3,
        teacherReputationImpact: -1,
      };

    default:
      return {
        studentId: student.id,
        interactionType: 'reaction',
        action: 'acknowledge_test',
        dialogue: `${student.firstName} nods, mentally noting the test date.`,
        isVerbal: false,
        isDisruptive: false,
        engagementChange: 0,
        moodChange: -1,
        teacherReputationImpact: 0,
      };
  }
}

function handleInstruction(
  student: Student,
  profile: typeof PERSONALITY_PROFILES[keyof typeof PERSONALITY_PROFILES]
): TeacherInteraction {
  switch (student.primaryTrait) {
    case 'perfectionist':
      return {
        studentId: student.id,
        interactionType: 'reaction',
        action: 'listen_intently',
        dialogue: `${student.firstName} ${profile.classroomHabits[2]?.toLowerCase() || 'listens carefully'}, not wanting to miss anything.`,
        isVerbal: false,
        isDisruptive: false,
        engagementChange: 4,
        moodChange: 1,
        teacherReputationImpact: 1,
      };

    case 'distracted':
      return {
        studentId: student.id,
        interactionType: 'reaction',
        action: 'miss_instruction',
        dialogue: `${student.firstName} ${profile.quirks[3]?.toLowerCase() || 'zones out'} partway through.`,
        isVerbal: false,
        isDisruptive: false,
        engagementChange: -3,
        moodChange: 0,
        teacherReputationImpact: -1,
      };

    default:
      return {
        studentId: student.id,
        interactionType: 'reaction',
        action: 'listen',
        dialogue: `${student.firstName} listens to the instructions.`,
        isVerbal: false,
        isDisruptive: false,
        engagementChange: 1,
        moodChange: 0,
        teacherReputationImpact: 0,
      };
  }
}
