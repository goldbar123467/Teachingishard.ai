import type { LearningStyle, Mood, PersonalityTrait } from '../game/types';

export interface PersonalityProfile {
  trait: PersonalityTrait;
  description: string;
  baseEngagement: number;
  baseSocialSkills: number;
  preferredLearningStyles: LearningStyle[];
  defaultMood: Mood;
  strengths: string[];
  challenges: string[];

  // Deep personality attributes
  quirks: string[]; // Observable mannerisms and habits
  triggers: {
    positive: string[]; // What makes them happy/engaged
    negative: string[]; // What upsets or frustrates them
  };
  socialBehaviors: string[]; // How they act around others
  classroomHabits: string[]; // Physical and behavioral patterns in class
}

export const PERSONALITY_PROFILES: Record<PersonalityTrait, PersonalityProfile> = {
  shy: {
    trait: 'shy',
    description: 'Quiet and reserved, prefers working alone',
    baseEngagement: 40,
    baseSocialSkills: 35,
    preferredLearningStyles: ['reading', 'visual'],
    defaultMood: 'neutral',
    strengths: ['Deep focus', 'Thoughtful work', 'Good listener'],
    challenges: ['Participation', 'Group work', 'Asking for help'],
    quirks: ['Avoids eye contact', 'Speaks very quietly', 'Fidgets with pencil when nervous', 'Blushes easily'],
    triggers: {
      positive: ['One-on-one attention', 'Written praise', 'Quiet workspace', 'Predictable routine'],
      negative: ['Being called on unexpectedly', 'Group presentations', 'Loud noises', 'Being center of attention'],
    },
    socialBehaviors: ['Sits near the edges', 'Observes before joining', 'Only talks to close friends', 'Avoids conflict'],
    classroomHabits: ['Sits in back or corner', 'Always prepared', 'Rarely raises hand', 'Writes detailed notes'],
  },
  outgoing: {
    trait: 'outgoing',
    description: 'Energetic and social, loves group activities',
    baseEngagement: 75,
    baseSocialSkills: 80,
    preferredLearningStyles: ['auditory', 'kinesthetic'],
    defaultMood: 'happy',
    strengths: ['Class participation', 'Group leadership', 'Presentations'],
    challenges: ['Staying quiet', 'Individual work', 'Patience'],
    quirks: ['Talks with hands', 'Always has a story', 'Infectious laugh', 'Makes friends instantly'],
    triggers: {
      positive: ['Group activities', 'Public recognition', 'Leadership roles', 'Social events'],
      negative: ['Working alone', 'Silent reading time', 'Being ignored', 'Missing social activities'],
    },
    socialBehaviors: ['Initiates conversations', 'Includes everyone', 'Energizes the room', 'Tells jokes'],
    classroomHabits: ['Sits near friends', 'Raises hand eagerly', 'Talks out of turn', 'Volunteers for everything'],
  },
  curious: {
    trait: 'curious',
    description: 'Always asking questions, eager to learn more',
    baseEngagement: 80,
    baseSocialSkills: 60,
    preferredLearningStyles: ['visual', 'kinesthetic'],
    defaultMood: 'excited',
    strengths: ['Research', 'Problem solving', 'Science projects'],
    challenges: ['Staying on topic', 'Following routine', 'Finishing work'],
    quirks: ['Always asking "why?"', 'Interrupts with questions', 'Touches everything', 'Eyes light up learning new things'],
    triggers: {
      positive: ['New topics', 'Experiments', 'Discovery', 'Open-ended questions'],
      negative: ['Rote memorization', 'Being told "just because"', 'Repetitive tasks', 'Unanswered questions'],
    },
    socialBehaviors: ['Shares interesting facts', 'Asks peers questions', 'Shows off discoveries', 'Debates enthusiastically'],
    classroomHabits: ['Sits near materials', 'Hand always up', 'Explores during transitions', 'Reads ahead'],
  },
  distracted: {
    trait: 'distracted',
    description: 'Mind often wanders, needs frequent redirection',
    baseEngagement: 35,
    baseSocialSkills: 55,
    preferredLearningStyles: ['kinesthetic', 'visual'],
    defaultMood: 'bored',
    strengths: ['Creative thinking', 'Quick transitions', 'Flexibility'],
    challenges: ['Attention span', 'Homework completion', 'Following directions'],
    quirks: ['Doodles constantly', 'Stares out window', 'Taps pencil rhythmically', 'Forgets what was just said'],
    triggers: {
      positive: ['Movement breaks', 'Hands-on activities', 'Visual stimulation', 'Novelty'],
      negative: ['Long lectures', 'Sitting still', 'Waiting', 'Repetition'],
    },
    socialBehaviors: ['Easily distracted mid-conversation', 'Changes topics abruptly', 'Daydreams while others talk', 'Forgets social plans'],
    classroomHabits: ['Fidgets constantly', 'Watches clock', 'Asks to use bathroom often', 'Incomplete work on desk'],
  },
  perfectionist: {
    trait: 'perfectionist',
    description: 'High standards, sometimes too hard on themselves',
    baseEngagement: 70,
    baseSocialSkills: 50,
    preferredLearningStyles: ['reading', 'visual'],
    defaultMood: 'neutral',
    strengths: ['Quality work', 'Organization', 'Attention to detail'],
    challenges: ['Time management', 'Accepting mistakes', 'Flexibility'],
    quirks: ['Erases repeatedly', 'Redoes finished work', 'Sighs when frustrated', 'Checks work multiple times'],
    triggers: {
      positive: ['Clear rubrics', 'Extra time', 'Constructive feedback', 'Achievement recognition'],
      negative: ['Mistakes', 'Messy work', 'Rushed deadlines', 'Vague instructions'],
    },
    socialBehaviors: ['Corrects others gently', 'Frustrated by sloppy peers', 'Offers to help organize', 'Anxious about group grades'],
    classroomHabits: ['Desk extremely organized', 'Finishes last (taking time)', 'Asks for clarification often', 'Stays after for help'],
  },
  creative: {
    trait: 'creative',
    description: 'Artistic and imaginative, thinks outside the box',
    baseEngagement: 65,
    baseSocialSkills: 60,
    preferredLearningStyles: ['visual', 'kinesthetic'],
    defaultMood: 'happy',
    strengths: ['Art projects', 'Creative writing', 'Problem solving'],
    challenges: ['Structure', 'Math', 'Following exact instructions'],
    quirks: ['Decorates everything', 'Hums while working', 'Unique clothing choices', 'Adds flair to assignments'],
    triggers: {
      positive: ['Art supplies', 'Creative freedom', 'Imagination encouraged', 'Self-expression'],
      negative: ['Rigid rules', 'One right answer', 'Criticism of style', 'Boring materials'],
    },
    socialBehaviors: ['Compliments others\' creativity', 'Shares art and ideas', 'Nonconformist', 'Inspires peers'],
    classroomHabits: ['Personalizes workspace', 'Colorful notes', 'Works at own pace', 'Lost in creative flow'],
  },
  analytical: {
    trait: 'analytical',
    description: 'Logical thinker, loves puzzles and patterns',
    baseEngagement: 70,
    baseSocialSkills: 45,
    preferredLearningStyles: ['reading', 'visual'],
    defaultMood: 'neutral',
    strengths: ['Math', 'Logic puzzles', 'Science'],
    challenges: ['Creative writing', 'Group activities', 'Emotional topics'],
    quirks: ['Corrects teacher politely', 'Points out inconsistencies', 'Shows work meticulously', 'Asks "how do you know?"'],
    triggers: {
      positive: ['Logic problems', 'Patterns', 'Data', 'Proof and reasoning'],
      negative: ['Illogical explanations', 'Ambiguity', 'Emotions over facts', 'Guessing'],
    },
    socialBehaviors: ['Debates logically', 'Skeptical of claims', 'Prefers intellectual peers', 'Literal in conversation'],
    classroomHabits: ['Sits near front', 'Takes structured notes', 'Challenges assumptions', 'Solves problems efficiently'],
  },
  social: {
    trait: 'social',
    description: 'Friendly and helpful, natural peacemaker',
    baseEngagement: 60,
    baseSocialSkills: 85,
    preferredLearningStyles: ['auditory', 'kinesthetic'],
    defaultMood: 'happy',
    strengths: ['Teamwork', 'Conflict resolution', 'Helping others'],
    challenges: ['Independent work', 'Assertiveness', 'Focus when friends nearby'],
    quirks: ['Remembers everyone\'s name', 'Always smiling', 'Mediates conflicts naturally', 'Checks on quiet classmates'],
    triggers: {
      positive: ['Collaboration', 'Helping others', 'Being included', 'Harmony'],
      negative: ['Exclusion', 'Conflict', 'Working alone', 'Meanness'],
    },
    socialBehaviors: ['Makes everyone feel welcome', 'Shares supplies', 'Notices emotions', 'Creates friend groups'],
    classroomHabits: ['Sits centrally', 'Partners with isolated students', 'Offers to help', 'Disrupted by socializing'],
  },
};

export const ALL_TRAITS: PersonalityTrait[] = Object.keys(PERSONALITY_PROFILES) as PersonalityTrait[];
export const ALL_LEARNING_STYLES: LearningStyle[] = ['visual', 'auditory', 'kinesthetic', 'reading'];

export function getRandomTrait(exclude?: PersonalityTrait): PersonalityTrait {
  const available = exclude ? ALL_TRAITS.filter(t => t !== exclude) : ALL_TRAITS;
  return available[Math.floor(Math.random() * available.length)];
}

export function getRandomLearningStyle(): LearningStyle {
  return ALL_LEARNING_STYLES[Math.floor(Math.random() * ALL_LEARNING_STYLES.length)];
}
