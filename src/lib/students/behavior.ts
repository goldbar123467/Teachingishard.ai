import type { Student, Lesson, TeachingMethod, HomeworkType, Mood, GamePhase, PersonalityTrait } from '../game/types';
import { PERSONALITY_PROFILES } from './personalities';

// Import emergent behavior systems
import {
  generateEmergentAction,
  generateChainReaction,
  type BehaviorContext,
  type EmergentAction,
} from './emergentBehavior';
import {
  generateGossipContent,
  generateClassroomChatter,
  calculateGroupDynamics,
  type GossipContent,
  type ClassroomChatter,
} from './socialEngine';
import {
  generateTeacherInteraction,
  generateStudentInitiatedInteraction,
  type TeacherActionType,
  type TeacherInteraction,
} from './teacherInteractions';

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

  // Social energy affects engagement for group activities
  // Low social energy = introverts need alone time, struggle in groups
  // High social energy = extroverts thrive in groups but may distract in solo work
  const isGroupMethod = method.id === 'group-discussion' || method.id === 'collaborative' || method.id === 'game-based';
  const isSoloMethod = method.id === 'independent-study' || method.id === 'lecture';

  if (student.socialEnergy !== undefined) {
    if (isGroupMethod) {
      // Low social energy hurts group work, high helps
      if (student.socialEnergy < 30) {
        change -= 8; // Socially drained, struggles in groups
      } else if (student.socialEnergy > 70) {
        change += 5; // Socially energized, thrives in groups
      }
    } else if (isSoloMethod) {
      // Low social energy actually helps solo work (introverts recharge)
      if (student.socialEnergy < 30) {
        change += 3; // Prefers quiet work
      } else if (student.socialEnergy > 80 && (student.primaryTrait === 'social' || student.primaryTrait === 'outgoing')) {
        change -= 5; // Too energized for quiet work
      }
    }
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
  // Academic level now provides a much stronger base
  let quality = student.academicLevel;

  // Perfectionist students do better quality work
  if (student.primaryTrait === 'perfectionist') {
    quality = Math.min(100, quality + 15);
  }

  // Engagement affects homework quality
  if (student.engagement > 70) {
    quality += 8; // Engaged students put more effort in
  } else if (student.engagement < 30) {
    quality -= 5; // Disengaged students rush through
  }

  // Add reduced randomness (was -10 to +10, now -5 to +5)
  // This ensures academic skill is the primary factor
  quality += (Math.random() - 0.5) * 10;

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

// ============ ATTENTION SPAN SYSTEM ============

// Calculate base attention span for a student (in minutes)
export function calculateBaseAttentionSpan(student: Student): number {
  let baseSpan = 25; // Average 5th grader attention span

  // Personality affects base attention
  const profile = PERSONALITY_PROFILES[student.primaryTrait];
  switch (student.primaryTrait) {
    case 'analytical':
    case 'perfectionist':
      baseSpan += 10; // Focused personalities maintain attention longer
      break;
    case 'distracted':
      baseSpan -= 10; // Distracted students struggle
      break;
    case 'curious':
      baseSpan += 5; // Curious students stay engaged
      break;
    case 'creative':
      baseSpan -= 3; // Creative minds wander
      break;
  }

  // Academic level helps attention
  baseSpan += (student.academicLevel - 50) / 10;

  return clamp(baseSpan, 10, 45);
}

// Calculate attention decay over time
export function calculateAttentionDecay(
  student: Student,
  minutesElapsed: number,
  currentAttention: number = 100
): number {
  const baseSpan = calculateBaseAttentionSpan(student);

  // Calculate decay rate (attention drops faster for students with shorter spans)
  let decayRate = minutesElapsed / baseSpan;

  // Energy affects attention maintenance
  if (student.energy < 30) {
    decayRate *= 1.5; // Tired students lose focus faster
  } else if (student.energy > 80) {
    decayRate *= 0.8; // High energy helps maintain focus
  }

  // Mood affects attention
  const moodIndex = getMoodIndex(student.mood);
  if (moodIndex <= 1) {
    decayRate *= 1.3; // Negative moods increase decay (upset, frustrated)
  } else if (moodIndex >= 4) {
    decayRate *= 0.9; // Positive moods reduce decay (happy, excited)
  }

  // Engagement helps maintain attention
  if (student.engagement > 70) {
    decayRate *= 0.7; // Highly engaged students stay focused
  } else if (student.engagement < 30) {
    decayRate *= 1.4; // Disengaged students lose focus quickly
  }

  // Calculate new attention level
  const decayAmount = decayRate * 100;
  const newAttention = currentAttention - decayAmount;

  return clamp(newAttention, 0, 100);
}

// Get attention status description
export function getAttentionStatus(attentionLevel: number): {
  status: 'focused' | 'wavering' | 'distracted' | 'zoned-out';
  description: string;
} {
  if (attentionLevel >= 75) {
    return {
      status: 'focused',
      description: 'Fully engaged and paying attention'
    };
  } else if (attentionLevel >= 50) {
    return {
      status: 'wavering',
      description: 'Attention starting to drift'
    };
  } else if (attentionLevel >= 25) {
    return {
      status: 'distracted',
      description: 'Struggling to focus'
    };
  } else {
    return {
      status: 'zoned-out',
      description: 'Completely lost focus'
    };
  }
}

// ============ IDLE BEHAVIOR GENERATOR ============

interface IdleBehavior {
  action: string;
  severity: 'harmless' | 'minor' | 'disruptive';
  needsRedirection: boolean;
}

// Generate idle behavior based on student personality and state
export function generateIdleBehavior(
  student: Student,
  attentionLevel: number = 50
): IdleBehavior {
  const behaviors: Record<PersonalityTrait, IdleBehavior[]> = {
    creative: [
      { action: 'doodling in notebook', severity: 'harmless', needsRedirection: false },
      { action: 'sketching elaborate designs on paper', severity: 'minor', needsRedirection: false },
      { action: 'daydreaming about art projects', severity: 'minor', needsRedirection: true },
      { action: 'making origami under desk', severity: 'minor', needsRedirection: true },
    ],
    distracted: [
      { action: 'staring out window', severity: 'minor', needsRedirection: true },
      { action: 'playing with pencil', severity: 'harmless', needsRedirection: false },
      { action: 'watching other students', severity: 'minor', needsRedirection: true },
      { action: 'organizing supplies repeatedly', severity: 'minor', needsRedirection: true },
    ],
    perfectionist: [
      { action: 're-reading notes carefully', severity: 'harmless', needsRedirection: false },
      { action: 'erasing and rewriting the same word', severity: 'harmless', needsRedirection: false },
      { action: 'organizing materials meticulously', severity: 'harmless', needsRedirection: false },
      { action: 'reviewing previous work', severity: 'minor', needsRedirection: true },
    ],
    social: [
      { action: 'whispering to neighbor', severity: 'disruptive', needsRedirection: true },
      { action: 'passing notes', severity: 'disruptive', needsRedirection: true },
      { action: 'making eye contact and smiling at friends', severity: 'harmless', needsRedirection: false },
      { action: 'trying to start conversation', severity: 'disruptive', needsRedirection: true },
    ],
    outgoing: [
      { action: 'fidgeting energetically', severity: 'minor', needsRedirection: true },
      { action: 'tapping pencil rhythmically', severity: 'minor', needsRedirection: true },
      { action: 'stretching and moving around', severity: 'minor', needsRedirection: true },
      { action: 'humming quietly', severity: 'minor', needsRedirection: true },
    ],
    shy: [
      { action: 'quietly reading ahead', severity: 'harmless', needsRedirection: false },
      { action: 'observing classmates silently', severity: 'harmless', needsRedirection: false },
      { action: 'hiding behind notebook', severity: 'minor', needsRedirection: false },
      { action: 'staring at desk', severity: 'minor', needsRedirection: true },
    ],
    curious: [
      { action: 'examining classroom posters closely', severity: 'minor', needsRedirection: true },
      { action: 'flipping through textbook to future chapters', severity: 'harmless', needsRedirection: false },
      { action: 'taking apart and reassembling pen', severity: 'minor', needsRedirection: true },
      { action: 'asking self questions out loud', severity: 'minor', needsRedirection: true },
    ],
    analytical: [
      { action: 'working on mental math problems', severity: 'harmless', needsRedirection: false },
      { action: 'analyzing patterns in the classroom', severity: 'harmless', needsRedirection: false },
      { action: 'counting tiles or objects', severity: 'minor', needsRedirection: true },
      { action: 'deep in thought', severity: 'minor', needsRedirection: true },
    ],
  };

  const personalityBehaviors = behaviors[student.primaryTrait];

  // Select behavior based on attention level
  let selectedBehavior: IdleBehavior;

  if (attentionLevel < 25) {
    // Very low attention - more likely to be disruptive or need redirection
    const needsRedirectionBehaviors = personalityBehaviors.filter(b => b.needsRedirection);
    selectedBehavior = needsRedirectionBehaviors[Math.floor(Math.random() * needsRedirectionBehaviors.length)]
      || personalityBehaviors[Math.floor(Math.random() * personalityBehaviors.length)];
  } else if (attentionLevel < 50) {
    // Moderate attention - random behavior
    selectedBehavior = personalityBehaviors[Math.floor(Math.random() * personalityBehaviors.length)];
  } else {
    // Good attention - prefer harmless behaviors
    const harmlessBehaviors = personalityBehaviors.filter(b => b.severity === 'harmless');
    selectedBehavior = harmlessBehaviors[Math.floor(Math.random() * harmlessBehaviors.length)]
      || personalityBehaviors[Math.floor(Math.random() * personalityBehaviors.length)];
  }

  // Energy and mood can intensify behavior
  if (student.energy > 80 && selectedBehavior.severity === 'harmless') {
    selectedBehavior = { ...selectedBehavior, severity: 'minor' };
  }

  if (getMoodIndex(student.mood) <= 1 && !selectedBehavior.needsRedirection) {
    selectedBehavior = { ...selectedBehavior, needsRedirection: true };
  }

  return selectedBehavior;
}

// ============ IMPROVED MOOD SYSTEM ============

// Calculate mood volatility (how easily student's mood changes)
export function calculateMoodVolatility(student: Student): number {
  let volatility = 0.5; // Base volatility (0 = stable, 1 = very volatile)

  // Personality affects volatility
  switch (student.primaryTrait) {
    case 'social':
    case 'outgoing':
      volatility += 0.2; // Extroverts have more mood swings
      break;
    case 'perfectionist':
      volatility += 0.15; // Perfectionists stressed by mistakes
      break;
    case 'creative':
      volatility += 0.1; // Creative minds are more emotional
      break;
    case 'analytical':
    case 'shy':
      volatility -= 0.1; // More emotionally stable
      break;
  }

  // Energy affects stability
  if (student.energy < 30) {
    volatility += 0.2; // Tired students more volatile
  }

  // Academic struggles increase volatility
  if (student.academicLevel < 40) {
    volatility += 0.15;
  }

  return clamp(volatility, 0.2, 0.9);
}

// Mood triggers that can cause sudden mood shifts
export interface MoodTrigger {
  type: 'success' | 'failure' | 'social' | 'praise' | 'criticism' | 'surprise';
  intensity: 'mild' | 'moderate' | 'strong';
}

// Apply mood trigger to student
export function applyMoodTrigger(
  student: Student,
  trigger: MoodTrigger
): Mood {
  const volatility = calculateMoodVolatility(student);
  const currentMoodIndex = getMoodIndex(student.mood);
  let moodShift = 0;

  // Calculate base shift from trigger
  const intensityMultiplier = {
    mild: 1,
    moderate: 2,
    strong: 3,
  }[trigger.intensity];

  switch (trigger.type) {
    case 'success':
      moodShift = 1 * intensityMultiplier;
      // Perfectionists expect success, less impact
      if (student.primaryTrait === 'perfectionist' && trigger.intensity === 'mild') {
        moodShift = 0;
      }
      break;

    case 'failure':
      moodShift = -1 * intensityMultiplier;
      // Perfectionists take failure harder
      if (student.primaryTrait === 'perfectionist') {
        moodShift -= 1;
      }
      break;

    case 'social':
      // Social interactions affect social personalities more
      if (student.primaryTrait === 'social' || student.primaryTrait === 'outgoing') {
        moodShift = 1 * intensityMultiplier;
      } else if (student.primaryTrait === 'shy') {
        moodShift = trigger.intensity === 'strong' ? -1 : 0; // Shy students stressed by attention
      } else {
        moodShift = trigger.intensity === 'strong' ? 1 : 0;
      }
      break;

    case 'praise':
      moodShift = 1 * intensityMultiplier;
      // Shy students may be embarrassed by public praise
      if (student.primaryTrait === 'shy' && trigger.intensity === 'strong') {
        moodShift = 0;
      }
      break;

    case 'criticism':
      moodShift = -1 * intensityMultiplier;
      // Perfectionists and shy students take criticism harder
      if (student.primaryTrait === 'perfectionist' || student.primaryTrait === 'shy') {
        moodShift -= 1;
      }
      break;

    case 'surprise':
      // Curious students love surprises
      if (student.primaryTrait === 'curious') {
        moodShift = 1 * intensityMultiplier;
      } else if (student.primaryTrait === 'analytical') {
        // Analytical students prefer predictability but don't always react negatively
        // Only strong surprises upset them; mild/moderate surprises are neutral
        if (trigger.intensity === 'strong') {
          moodShift = -1; // Only strong surprises are negative
        } else {
          moodShift = 0; // Mild/moderate surprises are neutral
        }
      } else {
        moodShift = 0.5 * intensityMultiplier;
      }
      break;
  }

  // Apply volatility multiplier
  moodShift = Math.round(moodShift * volatility);

  return getMoodFromIndex(currentMoodIndex + moodShift);
}

// Gradual mood drift toward neutral (for natural mood changes)
export function applyMoodDrift(student: Student, timeElapsed: number = 1): Mood {
  const currentIndex = getMoodIndex(student.mood);
  const neutralIndex = 3; // 'neutral' is at index 3

  // Already neutral
  if (currentIndex === neutralIndex) {
    return student.mood;
  }

  // Calculate drift direction
  const driftDirection = currentIndex < neutralIndex ? 1 : -1;

  // Volatility affects drift speed
  const volatility = calculateMoodVolatility(student);
  const driftChance = 0.3 * timeElapsed * volatility;

  // Randomly apply drift
  if (Math.random() < driftChance) {
    return getMoodFromIndex(currentIndex + driftDirection);
  }

  return student.mood;
}

// ============ CLASSROOM PARTICIPATION SYSTEM ============

export interface ParticipationHistory {
  volunteeredCount: number;
  calledOnCount: number;
  correctAnswers: number;
  incorrectAnswers: number;
  lastParticipation: number; // turn/day number
}

// Calculate chance student will volunteer to answer
export function calculateParticipationChance(
  student: Student,
  activityType: 'question' | 'discussion' | 'demonstration' | 'reading-aloud',
  participationHistory?: ParticipationHistory
): number {
  let chance = 0.3; // Base 30% chance

  // Personality strongly affects participation
  switch (student.primaryTrait) {
    case 'outgoing':
    case 'social':
      chance += 0.4; // Love to participate
      break;
    case 'shy':
      chance -= 0.25; // Avoid attention
      break;
    case 'curious':
      chance += 0.3; // Eager to learn and share
      break;
    case 'perfectionist':
      chance += 0.1; // Want to show knowledge, but fear mistakes
      break;
    case 'creative':
      chance += 0.15; // Enjoy sharing ideas
      break;
    case 'analytical':
      chance += 0.05; // Participate when confident
      break;
    case 'distracted':
      chance -= 0.15; // Not paying attention
      break;
  }

  // Engagement affects participation
  if (student.engagement > 70) {
    chance += 0.2;
  } else if (student.engagement < 30) {
    chance -= 0.2;
  }

  // Academic confidence affects participation
  if (student.academicLevel > 75) {
    chance += 0.15; // Confident students participate more
  } else if (student.academicLevel < 40) {
    chance -= 0.15; // Struggling students avoid participation
  }

  // Mood affects willingness
  const moodIndex = getMoodIndex(student.mood);
  if (moodIndex >= 4) {
    chance += 0.1; // Happy/excited students participate more
  } else if (moodIndex <= 1) {
    chance -= 0.15; // Upset/frustrated students withdraw
  }

  // Energy affects participation
  if (student.energy < 30) {
    chance -= 0.1; // Too tired
  }

  // Activity type affects participation
  switch (activityType) {
    case 'reading-aloud':
      if (student.primaryTrait === 'shy') {
        chance -= 0.2; // Shy students hate reading aloud
      }
      if (student.learningStyle === 'auditory') {
        chance += 0.1;
      }
      break;
    case 'demonstration':
      if (student.learningStyle === 'kinesthetic') {
        chance += 0.15;
      }
      if (student.primaryTrait === 'shy') {
        chance -= 0.15;
      }
      break;
    case 'discussion':
      if (student.primaryTrait === 'social' || student.primaryTrait === 'outgoing') {
        chance += 0.2;
      }
      break;
  }

  // Recent participation history
  if (participationHistory) {
    // Recently participated? Less likely to volunteer again
    if (participationHistory.lastParticipation <= 2) {
      chance -= 0.15;
    }

    // String of incorrect answers reduces confidence
    const recentAccuracy = participationHistory.correctAnswers /
      (participationHistory.correctAnswers + participationHistory.incorrectAnswers || 1);
    if (recentAccuracy < 0.4) {
      chance -= 0.2;
    } else if (recentAccuracy > 0.8) {
      chance += 0.1;
    }
  }

  return clamp(chance, 0.05, 0.95);
}

// Determine how well a student performs when called on
export function calculateParticipationQuality(
  student: Student,
  wasVolunteer: boolean
): {
  correctness: number; // 0-100
  confidence: number; // 0-100
  clarity: number; // 0-100
} {
  // Base on academic level
  let correctness = student.academicLevel;
  let confidence = 50;
  let clarity = 50;

  // Volunteers are more prepared
  if (wasVolunteer) {
    correctness += 10;
    confidence += 20;
    clarity += 10;
  } else {
    // Being called on unexpectedly
    if (student.primaryTrait === 'shy' || student.primaryTrait === 'distracted') {
      correctness -= 15;
      confidence -= 25;
      clarity -= 20;
    }
  }

  // Engagement affects quality
  if (student.engagement > 70) {
    correctness += 10;
    clarity += 10;
  } else if (student.engagement < 30) {
    correctness -= 15;
    clarity -= 15;
  }

  // Personality affects delivery
  switch (student.primaryTrait) {
    case 'outgoing':
    case 'social':
      confidence += 20;
      clarity += 10;
      break;
    case 'shy':
      confidence -= 20;
      clarity -= 15;
      break;
    case 'perfectionist':
      correctness += 5;
      confidence -= 10; // Fear of mistakes
      break;
    case 'analytical':
      correctness += 10;
      clarity += 5;
      break;
    case 'creative':
      clarity += 10; // Good at explaining
      break;
  }

  // Mood affects performance
  const moodIndex = getMoodIndex(student.mood);
  if (moodIndex <= 1) {
    confidence -= 15;
    clarity -= 10;
  } else if (moodIndex >= 4) {
    confidence += 10;
    clarity += 5;
  }

  // Energy affects delivery
  if (student.energy < 30) {
    clarity -= 15;
    confidence -= 10;
  }

  return {
    correctness: clamp(Math.round(correctness), 0, 100),
    confidence: clamp(Math.round(confidence), 0, 100),
    clarity: clamp(Math.round(clarity), 0, 100),
  };
}

// Get participation behavior description
export function getParticipationBehavior(student: Student): {
  tendency: 'eager-volunteer' | 'selective-volunteer' | 'reluctant' | 'avoidant';
  description: string;
} {
  const baseChance = calculateParticipationChance(student, 'question');

  if (baseChance >= 0.6) {
    return {
      tendency: 'eager-volunteer',
      description: 'Hand shoots up for every question'
    };
  } else if (baseChance >= 0.4) {
    return {
      tendency: 'selective-volunteer',
      description: 'Volunteers when confident'
    };
  } else if (baseChance >= 0.2) {
    return {
      tendency: 'reluctant',
      description: 'Rarely volunteers, prefers not to be called on'
    };
  } else {
    return {
      tendency: 'avoidant',
      description: 'Avoids eye contact, hopes not to be called on'
    };
  }
}

// ============ DEEP PERSONALITY INTEGRATION ============

/**
 * Get a random quirk for a student based on their personality
 */
export function getRandomQuirk(student: Student): string {
  const profile = PERSONALITY_PROFILES[student.primaryTrait];
  return profile.quirks[Math.floor(Math.random() * profile.quirks.length)];
}

/**
 * Get a random classroom habit for a student
 */
export function getRandomClassroomHabit(student: Student): string {
  const profile = PERSONALITY_PROFILES[student.primaryTrait];
  return profile.classroomHabits[Math.floor(Math.random() * profile.classroomHabits.length)];
}

/**
 * Get a random social behavior for a student
 */
export function getRandomSocialBehavior(student: Student): string {
  const profile = PERSONALITY_PROFILES[student.primaryTrait];
  return profile.socialBehaviors[Math.floor(Math.random() * profile.socialBehaviors.length)];
}

/**
 * Check if a context triggers positive response from student
 */
export function isPositiveTrigger(student: Student, trigger: string): boolean {
  const profile = PERSONALITY_PROFILES[student.primaryTrait];
  return profile.triggers.positive.some(t => t.toLowerCase().includes(trigger.toLowerCase()));
}

/**
 * Check if a context triggers negative response from student
 */
export function isNegativeTrigger(student: Student, trigger: string): boolean {
  const profile = PERSONALITY_PROFILES[student.primaryTrait];
  return profile.triggers.negative.some(t => t.toLowerCase().includes(trigger.toLowerCase()));
}

// ============ BEHAVIOR SNAPSHOT SYSTEM ============

/**
 * Main behavior orchestrator - generates all student behaviors for a turn
 */
export interface BehaviorSnapshot {
  emergentActions: EmergentAction[];
  chatter: ClassroomChatter[];
  teacherInteractions: TeacherInteraction[];
  gossip: GossipContent[];
}

export function generateBehaviorSnapshot(
  students: Student[],
  context: BehaviorContext
): BehaviorSnapshot {
  const emergentActions: EmergentAction[] = [];
  const teacherInteractions: TeacherInteraction[] = [];
  const gossip: GossipContent[] = [];

  // 1. Generate emergent actions for each student
  for (const student of students) {
    const action = generateEmergentAction(student, context);
    if (action) {
      emergentActions.push(action);

      // 2. Check for chain reactions
      if (action.affectsStudents.length > 0) {
        for (const affectedId of action.affectsStudents) {
          const affectedStudent = students.find(s => s.id === affectedId);
          if (affectedStudent) {
            const chainReaction = generateChainReaction(action, affectedStudent, students);
            if (chainReaction) {
              emergentActions.push(chainReaction);
            }
          }
        }
      }
    }
  }

  // 3. Generate classroom chatter
  const activityMapping: Record<typeof context.currentActivity, Parameters<typeof generateClassroomChatter>[1]> = {
    lesson: 'lesson',
    transition: 'transition',
    groupwork: 'groupwork',
    independent: 'independent',
    recess: 'transition',
    test: 'independent',
  };

  const chatter = generateClassroomChatter(students, activityMapping[context.currentActivity]);

  // 4. Generate some student-initiated teacher interactions (10% chance per student)
  for (const student of students) {
    if (Math.random() < 0.1) {
      const reasons: Parameters<typeof generateStudentInitiatedInteraction>[1][] = [
        'question',
        'help',
        'share',
        'off-topic',
      ];
      const reason = reasons[Math.floor(Math.random() * reasons.length)];
      const interaction = generateStudentInitiatedInteraction(student, reason);
      if (interaction) {
        teacherInteractions.push(interaction);
      }
    }
  }

  // 5. Generate gossip (small chance during transitions)
  if (context.currentActivity === 'transition' || context.currentActivity === 'recess') {
    for (const student of students) {
      if (Math.random() < 0.05) {
        // 5% chance
        const subject = students[Math.floor(Math.random() * students.length)];
        if (subject.id !== student.id) {
          const gossipItem = generateGossipContent(student, subject, students);
          gossip.push(gossipItem);
        }
      }
    }
  }

  return {
    emergentActions,
    chatter,
    teacherInteractions,
    gossip,
  };
}

// Re-export types and functions for convenience
export type {
  BehaviorContext,
  EmergentAction,
  GossipContent,
  ClassroomChatter,
  TeacherActionType,
  TeacherInteraction,
};

export {
  generateEmergentAction,
  generateChainReaction,
  generateGossipContent,
  generateClassroomChatter,
  calculateGroupDynamics,
  generateTeacherInteraction,
  generateStudentInitiatedInteraction,
};
