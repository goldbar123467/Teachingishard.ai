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
