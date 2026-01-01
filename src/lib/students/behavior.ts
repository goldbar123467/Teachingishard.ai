import type { Student, Lesson, TeachingMethod, HomeworkType, Mood, GamePhase } from '../game/types';
import { PERSONALITY_PROFILES } from './personalities';

// Mood transition weights
const MOOD_ORDER: Mood[] = ['upset', 'frustrated', 'bored', 'neutral', 'happy', 'excited'];

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function getMoodIndex(mood: Mood): number {
  return MOOD_ORDER.indexOf(mood);
}

function getMoodFromIndex(index: number): Mood {
  return MOOD_ORDER[clamp(index, 0, MOOD_ORDER.length - 1)];
}

export function shiftMood(currentMood: Mood, delta: number): Mood {
  const currentIndex = getMoodIndex(currentMood);
  const newIndex = clamp(currentIndex + delta, 0, MOOD_ORDER.length - 1);
  return getMoodFromIndex(newIndex);
}

// Calculate how well a teaching method matches a student's learning style
export function calculateLearningStyleMatch(
  student: Student,
  method: TeachingMethod
): { isMatch: boolean; bonus: number } {
  const isMatch = method.bestFor.includes(student.learningStyle);
  const bonus = isMatch ? 15 : -5;
  return { isMatch, bonus };
}

// Calculate engagement change from a teaching session
export function calculateEngagementChange(
  student: Student,
  lesson: Lesson,
  method: TeachingMethod
): number {
  const profile = PERSONALITY_PROFILES[student.primaryTrait];
  const { bonus: styleBonus } = calculateLearningStyleMatch(student, method);

  // Base change from method
  let change = method.engagementModifier;

  // Style match bonus
  change += styleBonus;

  // Personality factors
  if (student.primaryTrait === 'curious' && lesson.difficulty >= 2) {
    change += 5; // Curious students like challenging material
  }
  if (student.primaryTrait === 'distracted') {
    change -= 5; // Distracted students lose focus
  }
  if (student.primaryTrait === 'perfectionist' && lesson.difficulty === 3) {
    change += 3; // Perfectionists enjoy challenging work
  }

  // Energy affects engagement
  if (student.energy < 30) {
    change -= 10; // Too tired to engage
  } else if (student.energy > 80) {
    change += 5; // High energy boosts engagement
  }

  // Mood affects engagement
  const moodFactor = getMoodIndex(student.mood) - 2; // -2 to +3
  change += moodFactor * 2;

  return change;
}

// Calculate academic growth from a teaching session
export function calculateAcademicGrowth(
  student: Student,
  lesson: Lesson,
  method: TeachingMethod
): number {
  const { isMatch } = calculateLearningStyleMatch(student, method);

  // Base growth
  let growth = 1;

  // Difficulty factor - harder lessons = more potential growth
  growth += (lesson.difficulty - 1) * 0.5;

  // Style match bonus
  if (isMatch) {
    growth += 1;
  }

  // Engagement factor
  if (student.engagement > 70) {
    growth += 1;
  } else if (student.engagement < 30) {
    growth -= 0.5;
  }

  // Special needs considerations
  if (student.hasIEP && !isMatch) {
    growth *= 0.5; // IEP students struggle more with mismatched methods
  }
  if (student.isGifted && lesson.difficulty < 2) {
    growth *= 0.7; // Gifted students get less from easy lessons
  }

  return Math.max(0, growth);
}

// Calculate mood change from a teaching session
export function calculateMoodChange(
  student: Student,
  lesson: Lesson,
  method: TeachingMethod
): number {
  const { isMatch } = calculateLearningStyleMatch(student, method);

  let moodDelta = 0;

  // Style match affects mood
  if (isMatch) {
    moodDelta += 1;
  } else {
    moodDelta -= 1;
  }

  // Fun methods improve mood
  if (method.id === 'game-based') {
    moodDelta += 1;
  }
  if (method.id === 'hands-on') {
    moodDelta += 1;
  }

  // Difficult lessons can frustrate some students
  if (lesson.difficulty === 3 && student.academicLevel < 50) {
    moodDelta -= 1;
  }

  // Energy affects mood resilience
  if (student.energy < 20) {
    moodDelta -= 1;
  }

  return moodDelta;
}

// Calculate energy drain from activities
export function calculateEnergyDrain(
  student: Student,
  lesson: Lesson,
  method: TeachingMethod
): number {
  let drain = 10; // Base drain

  // Lesson duration affects drain
  const durationFactor = { short: 0.7, medium: 1.0, long: 1.3 }[lesson.duration];
  drain *= durationFactor;

  // Active methods drain more energy
  if (method.id === 'hands-on' || method.id === 'game-based') {
    drain += 5;
  }
  if (method.id === 'independent-study') {
    drain -= 3;
  }

  // Personality affects energy consumption
  if (student.primaryTrait === 'distracted') {
    drain += 5; // Fighting distraction is tiring
  }
  if (student.primaryTrait === 'outgoing' && method.id === 'independent-study') {
    drain += 5; // Outgoing students find solo work draining
  }

  return Math.round(drain);
}

// Apply teaching session effects to a student
export function applyTeachingEffects(
  student: Student,
  lesson: Lesson,
  method: TeachingMethod
): Student {
  const engagementChange = calculateEngagementChange(student, lesson, method);
  const academicGrowth = calculateAcademicGrowth(student, lesson, method);
  const moodChange = calculateMoodChange(student, lesson, method);
  const energyDrain = calculateEnergyDrain(student, lesson, method);

  return {
    ...student,
    engagement: clamp(student.engagement + engagementChange, 0, 100),
    academicLevel: clamp(student.academicLevel + academicGrowth, 0, 100),
    mood: shiftMood(student.mood, moodChange),
    energy: clamp(student.energy - energyDrain, 0, 100),
  };
}

// Calculate homework completion probability
export function calculateHomeworkCompletionChance(
  student: Student,
  homeworkType: HomeworkType
): number {
  if (homeworkType === 'none') return 1;

  const baseDifficulty = { light: 0.1, moderate: 0.25, heavy: 0.4, none: 0 }[homeworkType];

  // Academic level helps completion
  let chance = 0.5 + (student.academicLevel / 200);

  // Engagement affects motivation
  chance += (student.engagement - 50) / 200;

  // Personality factors
  if (student.primaryTrait === 'perfectionist') {
    chance += 0.15; // Always does homework
  }
  if (student.primaryTrait === 'distracted') {
    chance -= 0.15; // Often forgets
  }

  // Reduce by homework difficulty
  chance -= baseDifficulty;

  return clamp(chance, 0.1, 0.98);
}

// Simulate homework completion
export function simulateHomeworkCompletion(
  student: Student,
  homeworkType: HomeworkType
): { completed: boolean; quality: number } {
  const chance = calculateHomeworkCompletionChance(student, homeworkType);
  const completed = Math.random() < chance;

  if (!completed) {
    return { completed: false, quality: 0 };
  }

  // Calculate quality based on academic level and effort
  let quality = student.academicLevel;

  // Perfectionist students do better quality work
  if (student.primaryTrait === 'perfectionist') {
    quality = Math.min(100, quality + 15);
  }

  // Add some randomness
  quality += (Math.random() - 0.5) * 20;

  return { completed: true, quality: clamp(Math.round(quality), 30, 100) };
}

// Calculate overnight recovery
export function calculateOvernightRecovery(student: Student): Student {
  // Energy recovery
  let energyRecovery = 35;
  if (student.mood === 'happy' || student.mood === 'excited') {
    energyRecovery += 10; // Good mood = better sleep
  }
  if (student.mood === 'upset' || student.mood === 'frustrated') {
    energyRecovery -= 10; // Bad mood = worse sleep
  }

  // Mood tends toward neutral overnight
  let newMood = student.mood;
  const moodIndex = getMoodIndex(student.mood);
  if (moodIndex < 3) {
    newMood = shiftMood(student.mood, 1); // Bad moods improve
  } else if (moodIndex > 3 && Math.random() > 0.5) {
    newMood = shiftMood(student.mood, -1); // Good moods might fade
  }

  return {
    ...student,
    energy: clamp(student.energy + energyRecovery, 0, 100),
    mood: newMood,
  };
}

// Calculate interaction effects
export function applyInteractionEffect(
  student: Student,
  action: 'praise' | 'help' | 'redirect'
): Student {
  switch (action) {
    case 'praise':
      return {
        ...student,
        mood: shiftMood(student.mood, 1),
        engagement: clamp(student.engagement + 10, 0, 100),
        positiveNotes: student.positiveNotes + 1,
      };

    case 'help':
      return {
        ...student,
        academicLevel: clamp(student.academicLevel + 2, 0, 100),
        mood: student.mood === 'frustrated' ? 'neutral' : student.mood,
        engagement: clamp(student.engagement + 5, 0, 100),
      };

    case 'redirect':
      return {
        ...student,
        engagement: clamp(student.engagement + 8, 0, 100),
        energy: clamp(student.energy - 5, 0, 100),
      };

    default:
      return student;
  }
}

// Get students who need attention
export function getStudentsNeedingAttention(students: Student[]): Student[] {
  return students.filter(s =>
    s.mood === 'frustrated' ||
    s.mood === 'upset' ||
    s.energy < 25 ||
    s.engagement < 30 ||
    !s.homeworkCompleted
  );
}

// Get class morale summary
export function getClassMorale(students: Student[]): {
  average: number;
  distribution: Record<Mood, number>;
} {
  const distribution: Record<Mood, number> = {
    excited: 0, happy: 0, neutral: 0, bored: 0, frustrated: 0, upset: 0
  };

  let totalScore = 0;
  for (const student of students) {
    distribution[student.mood]++;
    totalScore += getMoodIndex(student.mood);
  }

  return {
    average: Math.round((totalScore / students.length) * 20), // 0-100 scale
    distribution,
  };
}
