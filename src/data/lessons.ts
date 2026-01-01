import type { Lesson } from '@/lib/game/types';

export const LESSONS: Lesson[] = [
  // Math
  {
    id: 'math-fractions',
    name: 'Fractions & Decimals',
    subject: 'math',
    difficulty: 2,
    duration: 'medium',
    requiredEnergy: 15,
  },
  {
    id: 'math-geometry',
    name: 'Basic Geometry',
    subject: 'math',
    difficulty: 2,
    duration: 'medium',
    requiredEnergy: 15,
  },
  {
    id: 'math-word-problems',
    name: 'Word Problems',
    subject: 'math',
    difficulty: 3,
    duration: 'long',
    requiredEnergy: 20,
  },
  {
    id: 'math-multiplication',
    name: 'Multiplication Review',
    subject: 'math',
    difficulty: 1,
    duration: 'short',
    requiredEnergy: 10,
  },

  // Reading
  {
    id: 'reading-comprehension',
    name: 'Reading Comprehension',
    subject: 'reading',
    difficulty: 2,
    duration: 'medium',
    requiredEnergy: 12,
  },
  {
    id: 'reading-vocabulary',
    name: 'Vocabulary Building',
    subject: 'reading',
    difficulty: 1,
    duration: 'short',
    requiredEnergy: 10,
  },
  {
    id: 'reading-poetry',
    name: 'Poetry Analysis',
    subject: 'reading',
    difficulty: 3,
    duration: 'medium',
    requiredEnergy: 18,
  },
  {
    id: 'reading-creative-writing',
    name: 'Creative Writing',
    subject: 'reading',
    difficulty: 2,
    duration: 'long',
    requiredEnergy: 15,
  },

  // Science
  {
    id: 'science-ecosystem',
    name: 'Ecosystems',
    subject: 'science',
    difficulty: 2,
    duration: 'medium',
    requiredEnergy: 15,
  },
  {
    id: 'science-solar-system',
    name: 'Solar System',
    subject: 'science',
    difficulty: 2,
    duration: 'medium',
    requiredEnergy: 15,
  },
  {
    id: 'science-experiment',
    name: 'Science Experiment',
    subject: 'science',
    difficulty: 3,
    duration: 'long',
    requiredEnergy: 25,
  },
  {
    id: 'science-weather',
    name: 'Weather Patterns',
    subject: 'science',
    difficulty: 1,
    duration: 'short',
    requiredEnergy: 10,
  },

  // Social Studies
  {
    id: 'social-geography',
    name: 'US Geography',
    subject: 'social-studies',
    difficulty: 2,
    duration: 'medium',
    requiredEnergy: 12,
  },
  {
    id: 'social-history',
    name: 'American History',
    subject: 'social-studies',
    difficulty: 2,
    duration: 'medium',
    requiredEnergy: 15,
  },
  {
    id: 'social-civics',
    name: 'Civics & Government',
    subject: 'social-studies',
    difficulty: 3,
    duration: 'medium',
    requiredEnergy: 18,
  },

  // Art
  {
    id: 'art-drawing',
    name: 'Drawing Techniques',
    subject: 'art',
    difficulty: 1,
    duration: 'medium',
    requiredEnergy: 8,
  },
  {
    id: 'art-painting',
    name: 'Painting Project',
    subject: 'art',
    difficulty: 2,
    duration: 'long',
    requiredEnergy: 12,
  },

  // PE
  {
    id: 'pe-team-sports',
    name: 'Team Sports',
    subject: 'pe',
    difficulty: 1,
    duration: 'medium',
    requiredEnergy: 10,
  },
  {
    id: 'pe-fitness',
    name: 'Fitness Activities',
    subject: 'pe',
    difficulty: 2,
    duration: 'short',
    requiredEnergy: 8,
  },
];

export const SUBJECT_LABELS: Record<Lesson['subject'], string> = {
  math: 'Math',
  reading: 'Reading & Writing',
  science: 'Science',
  'social-studies': 'Social Studies',
  art: 'Art',
  pe: 'PE',
};

export const SUBJECT_ICONS: Record<Lesson['subject'], string> = {
  math: '🔢',
  reading: '📚',
  science: '🔬',
  'social-studies': '🌍',
  art: '🎨',
  pe: '⚽',
};

export const SUBJECT_COLORS: Record<Lesson['subject'], string> = {
  math: 'bg-blue-100 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300',
  reading: 'bg-purple-100 dark:bg-purple-900/30 border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300',
  science: 'bg-green-100 dark:bg-green-900/30 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300',
  'social-studies': 'bg-amber-100 dark:bg-amber-900/30 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300',
  art: 'bg-pink-100 dark:bg-pink-900/30 border-pink-200 dark:border-pink-800 text-pink-700 dark:text-pink-300',
  pe: 'bg-orange-100 dark:bg-orange-900/30 border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-300',
};

export function getLessonsBySubject(subject: Lesson['subject']): Lesson[] {
  return LESSONS.filter(l => l.subject === subject);
}

export function getDifficultyStars(difficulty: 1 | 2 | 3): string {
  return '★'.repeat(difficulty) + '☆'.repeat(3 - difficulty);
}
