import type { TeachingMethod, LearningStyle } from '@/lib/game/types';

export const TEACHING_METHODS: TeachingMethod[] = [
  {
    id: 'lecture',
    name: 'Traditional Lecture',
    description: 'Direct instruction with the teacher explaining concepts at the board.',
    bestFor: ['auditory', 'reading'],
    engagementModifier: -5,
    energyCost: 10,
  },
  {
    id: 'discussion',
    name: 'Class Discussion',
    description: 'Interactive discussion where students share ideas and debate topics.',
    bestFor: ['auditory'],
    engagementModifier: 10,
    energyCost: 15,
  },
  {
    id: 'hands-on',
    name: 'Hands-On Activity',
    description: 'Students learn by doing with manipulatives, experiments, or projects.',
    bestFor: ['kinesthetic'],
    engagementModifier: 15,
    energyCost: 20,
  },
  {
    id: 'visual-presentation',
    name: 'Visual Presentation',
    description: 'Using slides, videos, diagrams, and visual aids to teach concepts.',
    bestFor: ['visual'],
    engagementModifier: 5,
    energyCost: 12,
  },
  {
    id: 'group-work',
    name: 'Group Work',
    description: 'Students work together in small groups to complete tasks.',
    bestFor: ['auditory', 'kinesthetic'],
    engagementModifier: 8,
    energyCost: 15,
  },
  {
    id: 'independent-study',
    name: 'Independent Study',
    description: 'Students work alone at their own pace with teacher support.',
    bestFor: ['reading', 'visual'],
    engagementModifier: -3,
    energyCost: 8,
  },
  {
    id: 'game-based',
    name: 'Game-Based Learning',
    description: 'Educational games and competitions to make learning fun.',
    bestFor: ['kinesthetic', 'visual'],
    engagementModifier: 20,
    energyCost: 18,
  },
  {
    id: 'peer-teaching',
    name: 'Peer Teaching',
    description: 'Students teach concepts to each other in pairs or small groups.',
    bestFor: ['auditory', 'kinesthetic'],
    engagementModifier: 12,
    energyCost: 10,
  },
];

export const LEARNING_STYLE_LABELS: Record<LearningStyle, string> = {
  visual: 'Visual',
  auditory: 'Auditory',
  kinesthetic: 'Kinesthetic',
  reading: 'Reading/Writing',
};

export const LEARNING_STYLE_ICONS: Record<LearningStyle, string> = {
  visual: '👁️',
  auditory: '👂',
  kinesthetic: '✋',
  reading: '📖',
};

export const METHOD_ICONS: Record<string, string> = {
  lecture: '🎓',
  discussion: '💬',
  'hands-on': '🔧',
  'visual-presentation': '📺',
  'group-work': '👥',
  'independent-study': '📝',
  'game-based': '🎮',
  'peer-teaching': '🤝',
};

export function getMethodEffectiveness(
  method: TeachingMethod,
  classLearningStyles: LearningStyle[]
): number {
  const matchingStudents = classLearningStyles.filter(style =>
    method.bestFor.includes(style)
  ).length;

  return Math.round((matchingStudents / classLearningStyles.length) * 100);
}
