/**
 * Parent Interaction Events
 * Parent emails, PTA meetings, complaints, and appreciation
 */

import type { Student } from '@/lib/game/types';

export interface ParentEvent {
  id: string;
  type: 'email' | 'phone_call' | 'meeting' | 'pta' | 'appreciation';
  studentId?: string;
  parentName: string;
  subject: string;
  message: string;
  tone: 'concerned' | 'angry' | 'appreciative' | 'questioning' | 'supportive';
  urgency: 'low' | 'medium' | 'high' | 'critical';
  timestamp: number;
  requiresResponse: boolean;
  responses?: ParentResponse[];
}

export interface ParentResponse {
  id: string;
  label: string;
  tone: 'professional' | 'empathetic' | 'defensive' | 'collaborative';
  effects: {
    reputation?: number;
    parentSatisfaction?: number;
    studentMood?: number;
    teacherEnergy?: number;
  };
}

// Parent concern triggers
export function shouldTriggerParentConcern(student: Student): {
  triggered: boolean;
  reason?: string;
  severity: 'low' | 'medium' | 'high';
} {
  // Academic concerns
  if (student.academicLevel < 40 && Math.random() < 0.15) {
    return { triggered: true, reason: 'academic_struggle', severity: 'high' };
  }

  // Behavior concerns
  if (student.behaviorIncidents >= 3 && Math.random() < 0.2) {
    return { triggered: true, reason: 'behavior_issues', severity: 'high' };
  }

  // Homework concerns
  if (!student.homeworkCompleted && Math.random() < 0.1) {
    return { triggered: true, reason: 'homework_incomplete', severity: 'medium' };
  }

  // Social concerns
  if (student.friendIds.length === 0 && student.socialSkills < 30 && Math.random() < 0.08) {
    return { triggered: true, reason: 'social_isolation', severity: 'medium' };
  }

  // Mood concerns
  if ((student.mood === 'upset' || student.mood === 'frustrated') && Math.random() < 0.12) {
    return { triggered: true, reason: 'emotional_wellbeing', severity: 'medium' };
  }

  return { triggered: false, severity: 'low' };
}

// Parent appreciation triggers
export function shouldTriggerParentAppreciation(student: Student): boolean {
  // Academic improvement
  if (student.academicLevel > 80 && Math.random() < 0.1) return true;

  // Positive notes
  if (student.positiveNotes >= 3 && Math.random() < 0.15) return true;

  // Good behavior
  if (student.engagement > 75 && student.mood === 'happy' && Math.random() < 0.08) return true;

  return false;
}

// Generate parent concern email
export function generateParentConcernEvent(
  student: Student,
  reason: string,
  severity: 'low' | 'medium' | 'high'
): ParentEvent {
  const parentNames = [
    `${student.lastName} Family`,
    `Mrs. ${student.lastName}`,
    `Mr. ${student.lastName}`,
    `Dr. ${student.lastName}`,
  ];
  const parentName = parentNames[Math.floor(Math.random() * parentNames.length)];

  let subject = '';
  let message = '';
  let tone: ParentEvent['tone'] = 'concerned';
  let urgency: ParentEvent['urgency'] = 'medium';

  switch (reason) {
    case 'academic_struggle':
      subject = `Concerned about ${student.firstName}'s Academic Progress`;
      message = `Dear Teacher,\n\nI'm writing because I'm concerned about ${student.firstName}'s recent academic performance. Their grades seem to be slipping, and I'm worried they're falling behind. Can we schedule a time to discuss what support they might need?\n\nThank you,\n${parentName}`;
      tone = 'concerned';
      urgency = 'high';
      break;

    case 'behavior_issues':
      subject = `Behavior Concerns - ${student.firstName} ${student.lastName}`;
      message = `Hello,\n\nI received a note home about ${student.firstName}'s behavior in class. This is unusual for them at home. Can you provide more details about what's been happening? I want to make sure we're addressing this together.\n\nRegards,\n${parentName}`;
      tone = 'questioning';
      urgency = 'high';
      break;

    case 'homework_incomplete':
      subject = `Question about ${student.firstName}'s Homework`;
      message = `Good afternoon,\n\n${student.firstName} mentioned they didn't complete their homework last night. Is this becoming a pattern? I want to make sure we're on the same page about expectations.\n\nBest,\n${parentName}`;
      tone = 'questioning';
      urgency = 'medium';
      break;

    case 'social_isolation':
      subject = `Social Concerns for ${student.firstName}`;
      message = `Dear Teacher,\n\n${student.firstName} has mentioned feeling lonely at school. I'm worried they're having trouble making friends. Have you noticed this in class? What can we do to help?\n\nSincerely,\n${parentName}`;
      tone = 'concerned';
      urgency = 'medium';
      break;

    case 'emotional_wellbeing':
      subject = `${student.firstName} Seems Upset Lately`;
      message = `Hi,\n\nI've noticed ${student.firstName} seems more upset than usual when coming home from school. Has anything happened in class that I should know about? I want to understand what's going on.\n\nThank you,\n${parentName}`;
      tone = 'concerned';
      urgency = 'medium';
      break;
  }

  return {
    id: `parent-concern-${student.id}-${Date.now()}`,
    type: 'email',
    studentId: student.id,
    parentName,
    subject,
    message,
    tone,
    urgency,
    timestamp: Date.now(),
    requiresResponse: true,
    responses: generateConcernResponses(student, reason)
  };
}

// Generate response options for parent concerns
function generateConcernResponses(student: Student, reason: string): ParentResponse[] {
  const baseResponses: ParentResponse[] = [
    {
      id: 'professional',
      label: 'Send professional, detailed response',
      tone: 'professional',
      effects: {
        reputation: 5,
        parentSatisfaction: 15,
        teacherEnergy: -10
      }
    },
    {
      id: 'empathetic',
      label: 'Respond with empathy and schedule meeting',
      tone: 'empathetic',
      effects: {
        reputation: 8,
        parentSatisfaction: 20,
        studentMood: 1,
        teacherEnergy: -15
      }
    },
    {
      id: 'collaborative',
      label: 'Propose collaborative action plan',
      tone: 'collaborative',
      effects: {
        reputation: 10,
        parentSatisfaction: 25,
        studentMood: 1,
        teacherEnergy: -20
      }
    },
    {
      id: 'brief',
      label: 'Send brief acknowledgment',
      tone: 'professional',
      effects: {
        reputation: 2,
        parentSatisfaction: 5,
        teacherEnergy: -3
      }
    }
  ];

  return baseResponses;
}

// Generate parent appreciation email
export function generateParentAppreciationEvent(student: Student): ParentEvent {
  const parentNames = [
    `${student.lastName} Family`,
    `Mrs. ${student.lastName}`,
    `Mr. ${student.lastName}`,
  ];
  const parentName = parentNames[Math.floor(Math.random() * parentNames.length)];

  const appreciationMessages = [
    `Dear Teacher,\n\nI just wanted to say thank you for all your hard work with ${student.firstName}. They come home excited about learning every day! Your dedication really shows.\n\nGratefully,\n${parentName}`,

    `Hello,\n\nI'm so pleased with ${student.firstName}'s progress this year. They're more engaged and confident than ever. Thank you for creating such a positive learning environment!\n\nWarm regards,\n${parentName}`,

    `Hi,\n\n${student.firstName} won't stop talking about your class! Thank you for making learning fun and engaging. We really appreciate everything you do.\n\nBest wishes,\n${parentName}`,
  ];

  return {
    id: `parent-appreciation-${student.id}-${Date.now()}`,
    type: 'email',
    studentId: student.id,
    parentName,
    subject: `Thank You from the ${student.lastName} Family`,
    message: appreciationMessages[Math.floor(Math.random() * appreciationMessages.length)],
    tone: 'appreciative',
    urgency: 'low',
    timestamp: Date.now(),
    requiresResponse: false,
    responses: [
      {
        id: 'gracious',
        label: 'Send gracious thank you reply',
        tone: 'professional',
        effects: {
          reputation: 3,
          parentSatisfaction: 10,
          teacherEnergy: 5 // Positive emails energize!
        }
      },
      {
        id: 'acknowledge',
        label: 'Acknowledge briefly',
        tone: 'professional',
        effects: {
          reputation: 1,
          teacherEnergy: 2
        }
      }
    ]
  };
}

// PTA Meeting Event
export interface PTAMeetingEvent {
  id: string;
  type: 'pta';
  topic: string;
  description: string;
  attendees: number;
  controversialLevel: 'low' | 'medium' | 'high';
  choices: {
    id: string;
    label: string;
    effects: {
      reputation?: number;
      communitySupport?: number;
      teacherEnergy?: number;
    };
  }[];
}

export function generatePTAMeeting(): PTAMeetingEvent {
  const topics = [
    {
      topic: 'Homework Policy Discussion',
      description: 'Parents are debating whether current homework levels are appropriate. Some feel it\'s too much, others want more rigorous assignments.',
      controversialLevel: 'medium' as const,
      choices: [
        {
          id: 'defend',
          label: 'Defend current homework policy with research',
          effects: { reputation: 5, teacherEnergy: -15 }
        },
        {
          id: 'compromise',
          label: 'Propose a compromise with parent input',
          effects: { reputation: 8, communitySupport: 10, teacherEnergy: -20 }
        },
        {
          id: 'reduce',
          label: 'Agree to reduce homework load',
          effects: { communitySupport: 15, teacherEnergy: -5 }
        }
      ]
    },
    {
      topic: 'Classroom Technology Use',
      description: 'Discussion about screen time and technology in the classroom. Parents have mixed feelings about digital learning tools.',
      controversialLevel: 'low' as const,
      choices: [
        {
          id: 'educate',
          label: 'Educate parents on educational technology benefits',
          effects: { reputation: 7, communitySupport: 8, teacherEnergy: -10 }
        },
        {
          id: 'balance',
          label: 'Present balanced approach to tech use',
          effects: { reputation: 10, communitySupport: 12, teacherEnergy: -12 }
        },
        {
          id: 'limit',
          label: 'Agree to limit technology use',
          effects: { communitySupport: 10, teacherEnergy: -5 }
        }
      ]
    },
    {
      topic: 'Field Trip Safety Concerns',
      description: 'Parents are concerned about upcoming field trip safety protocols and supervision ratios.',
      controversialLevel: 'high' as const,
      choices: [
        {
          id: 'reassure',
          label: 'Provide detailed safety plan to reassure parents',
          effects: { reputation: 10, communitySupport: 15, teacherEnergy: -15 }
        },
        {
          id: 'volunteers',
          label: 'Request additional parent volunteers',
          effects: { communitySupport: 20, teacherEnergy: -10 }
        },
        {
          id: 'cancel',
          label: 'Cancel field trip to avoid conflict',
          effects: { communitySupport: -10, teacherEnergy: -5 }
        }
      ]
    }
  ];

  const selected = topics[Math.floor(Math.random() * topics.length)];

  return {
    id: `pta-meeting-${Date.now()}`,
    type: 'pta',
    topic: selected.topic,
    description: selected.description,
    attendees: Math.floor(Math.random() * 20) + 15,
    controversialLevel: selected.controversialLevel,
    choices: selected.choices
  };
}

// Check for parent events this turn
export function checkForParentEvents(
  students: Student[],
  currentDay: number,
  difficulty: 'easy' | 'normal' | 'hard'
): (ParentEvent | PTAMeetingEvent)[] {
  const events: (ParentEvent | PTAMeetingEvent)[] = [];

  // Difficulty affects frequency
  const concernMultiplier = { easy: 0.5, normal: 1.0, hard: 1.5 }[difficulty];

  // Check for parent concerns
  for (const student of students) {
    const concern = shouldTriggerParentConcern(student);
    if (concern.triggered && concern.reason && Math.random() < concernMultiplier) {
      events.push(generateParentConcernEvent(student, concern.reason, concern.severity));
    }

    // Check for appreciation (rarer)
    if (shouldTriggerParentAppreciation(student) && Math.random() < 0.5) {
      events.push(generateParentAppreciationEvent(student));
    }
  }

  // PTA meetings happen occasionally
  if (currentDay % 15 === 0 && Math.random() < 0.3) {
    events.push(generatePTAMeeting());
  }

  return events;
}
