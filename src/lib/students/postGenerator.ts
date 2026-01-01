/**
 * Post Generator
 * Creates authentic social media posts for students
 */

import type { Student } from '../game/types';
import type { SocialInteraction } from './social';
import {
  POST_TEMPLATES,
  PostTemplate,
  getTemplatesByPersonalityAndMood,
  getRandomTemplate,
} from './postTemplates';
import { applyTeenVoice, applyTextingShorthand } from './teenVoice';

export interface PostContext {
  student: Student;
  relationships?: SocialInteraction[];
  recentEvent?: string; // e.g., "test", "fire_drill", "field_trip"
  teacherName?: string;
  subject?: string;
  score?: number;
  mood?: 'happy' | 'sad' | 'excited' | 'angry' | 'tired';
  energy?: number; // 0-100
}

export interface GeneratedPost {
  content: string;
  template: PostTemplate;
  timestamp: Date;
  studentId: string;
}

/**
 * Select template based on personality, mood, and context
 */
export function selectTemplate(context: PostContext): PostTemplate | null {
  const { student, mood, recentEvent } = context;
  const primaryPersonality = student.primaryTrait || 'outgoing';

  // Priority 1: Event-specific templates if there's a recent event
  if (recentEvent) {
    const eventTemplates = POST_TEMPLATES.filter(t => {
      return t.category === 'event' && t.content.includes(recentEvent);
    });
    if (eventTemplates.length > 0) {
      return getRandomTemplate(eventTemplates);
    }
  }

  // Priority 2: Match personality and mood
  const personalityTemplates = getTemplatesByPersonalityAndMood(
    primaryPersonality,
    mood
  );

  if (personalityTemplates.length > 0) {
    // Weight by category based on personality
    const weightedTemplates = weightTemplatesByPersonality(
      personalityTemplates,
      primaryPersonality
    );
    return selectWeightedTemplate(weightedTemplates);
  }

  // Fallback: Any template matching mood
  if (mood) {
    const moodTemplates = POST_TEMPLATES.filter(t =>
      !t.moodRequired || t.moodRequired === mood
    );
    return getRandomTemplate(moodTemplates);
  }

  // Last resort: Random template
  return getRandomTemplate(POST_TEMPLATES);
}

/**
 * Weight templates by personality preferences
 */
function weightTemplatesByPersonality(
  templates: PostTemplate[],
  personality: string
): Array<{ template: PostTemplate; weight: number }> {
  return templates.map(template => {
    let weight = 1.0;

    // Adjust weights based on personality-category affinity
    if (personality === 'dramatic' && template.category === 'drama') {
      weight = 3.0;
    } else if (personality === 'class_clown' && template.category === 'humor') {
      weight = 3.0;
    } else if (personality === 'studious' && template.category === 'academic') {
      weight = 2.5;
    } else if (personality === 'outgoing' && template.category === 'social') {
      weight = 2.5;
    } else if (personality === 'shy' && template.category === 'personal') {
      weight = 2.0;
    }

    return { template, weight };
  });
}

/**
 * Select template using weighted random selection
 */
function selectWeightedTemplate(
  weighted: Array<{ template: PostTemplate; weight: number }>
): PostTemplate | null {
  if (weighted.length === 0) return null;

  const totalWeight = weighted.reduce((sum, item) => sum + item.weight, 0);
  let random = Math.random() * totalWeight;

  for (const item of weighted) {
    random -= item.weight;
    if (random <= 0) {
      return item.template;
    }
  }

  return weighted[0].template;
}

/**
 * Fill template variables with context data
 */
export function fillTemplateVariables(
  template: PostTemplate,
  context: PostContext
): string {
  let content = template.content;

  // Replace {{ friend }} with actual friend name
  if (content.includes('{{ friend }}')) {
    const friend = selectFriend(context);
    content = content.replace(/\{\{ friend \}\}/g, friend);
  }

  // Replace {{ teacher }}
  if (content.includes('{{ teacher }}')) {
    const teacher = context.teacherName || 'the teacher';
    content = content.replace(/\{\{ teacher \}\}/g, teacher);
  }

  // Replace {{ subject }}
  if (content.includes('{{ subject }}')) {
    const subject = context.subject || selectRandomSubject();
    content = content.replace(/\{\{ subject \}\}/g, subject);
  }

  // Replace {{ score }}
  if (content.includes('{{ score }}')) {
    const score = context.score || Math.floor(Math.random() * 30) + 70;
    content = content.replace(/\{\{ score \}\}/g, score.toString());
  }

  // Replace {{ topic }}
  if (content.includes('{{ topic }}')) {
    const topic = selectRandomTopic(context.subject);
    content = content.replace(/\{\{ topic \}\}/g, topic);
  }

  // Replace {{ situation }}
  if (content.includes('{{ situation }}')) {
    const situation = selectRandomSituation();
    content = content.replace(/\{\{ situation \}\}/g, situation);
  }

  // Replace {{ embarrassing_thing }}
  if (content.includes('{{ embarrassing_thing }}')) {
    const thing = selectEmbarrassingThing();
    content = content.replace(/\{\{ embarrassing_thing \}\}/g, thing);
  }

  // Replace {{ random_thing }}
  if (content.includes('{{ random_thing }}')) {
    const thing = selectRandomThing();
    content = content.replace(/\{\{ random_thing \}\}/g, thing);
  }

  // Replace {{ thing }} (generic)
  if (content.includes('{{ thing }}')) {
    const thing = selectRandomThing();
    content = content.replace(/\{\{ thing \}\}/g, thing);
  }

  // Replace {{ holiday }}
  if (content.includes('{{ holiday }}')) {
    const holiday = selectUpcomingHoliday();
    content = content.replace(/\{\{ holiday \}\}/g, holiday);
  }

  // Replace {{ days }}
  if (content.includes('{{ days }}')) {
    const days = Math.floor(Math.random() * 30) + 1;
    content = content.replace(/\{\{ days \}\}/g, days.toString());
  }

  return content;
}

/**
 * Select a friend from relationships
 */
function selectFriend(context: PostContext): string {
  if (!context.relationships || context.relationships.length === 0) {
    return 'my friend';
  }

  // Prefer positive interactions over negative ones
  const positiveInteractions = context.relationships.filter(r => r.outcome === 'positive');
  const pool = positiveInteractions.length > 0 ? positiveInteractions : context.relationships;

  const relationship = pool[Math.floor(Math.random() * pool.length)];
  // Get participant names from the interaction
  return relationship.description || 'my friend';
}

/**
 * Select random subject
 */
function selectRandomSubject(): string {
  const subjects = ['math', 'science', 'reading', 'social studies', 'writing', 'art', 'PE'];
  return subjects[Math.floor(Math.random() * subjects.length)];
}

/**
 * Select random topic based on subject
 */
function selectRandomTopic(subject?: string): string {
  const topics: Record<string, string[]> = {
    math: ['fractions', 'decimals', 'multiplication', 'division', 'word problems'],
    science: ['photosynthesis', 'the water cycle', 'ecosystems', 'magnets', 'states of matter'],
    reading: ['theme', 'main idea', 'character development', 'plot structure'],
    writing: ['persuasive essays', 'narrative writing', 'grammar rules'],
    history: ['the Revolutionary War', 'westward expansion', 'Native Americans'],
  };

  const subjectTopics = subject ? topics[subject.toLowerCase()] : undefined;
  if (subjectTopics && subjectTopics.length > 0) {
    return subjectTopics[Math.floor(Math.random() * subjectTopics.length)];
  }

  return 'this lesson';
}

/**
 * Select random embarrassing situation
 */
function selectEmbarrassingThing(): string {
  const things = [
    'tripped',
    'said the wrong answer out loud',
    'forgot my pencil',
    'spilled my lunch',
    'called the teacher mom',
    'raised my hand then forgot what to say',
    'got called on when i wasnt paying attention',
    'sneezed super loud',
  ];
  return things[Math.floor(Math.random() * things.length)];
}

/**
 * Select random humorous situation
 */
function selectRandomSituation(): string {
  const situations = [
    'when the teacher says no homework',
    'when its almost the weekend',
    'when someone asks a question right before the bell',
    'when you remember you have a test',
    'when the substitute cant figure out the projector',
    'when someone brings birthday cupcakes',
    'when the fire alarm goes off during a test',
  ];
  return situations[Math.floor(Math.random() * situations.length)];
}

/**
 * Select random thing to question
 */
function selectRandomThing(): string {
  const things = [
    'homework on weekends',
    'cafeteria pizza',
    'group projects',
    'early dismissal days',
    'standardized testing',
    'dress codes',
    'pop quizzes',
  ];
  return things[Math.floor(Math.random() * things.length)];
}

/**
 * Select upcoming holiday
 */
function selectUpcomingHoliday(): string {
  const holidays = [
    'winter',
    'spring',
    'summer',
    'Thanksgiving',
    'Christmas',
    'Halloween',
  ];
  return holidays[Math.floor(Math.random() * holidays.length)];
}

/**
 * Main function: Generate a complete post
 */
export function generatePost(context: PostContext): GeneratedPost | null {
  // Select appropriate template
  const template = selectTemplate(context);
  if (!template) {
    return null;
  }

  // Fill in template variables
  let content = fillTemplateVariables(template, context);

  // Apply texting shorthand (sometimes)
  content = applyTextingShorthand(content, 0.3);

  // Apply teen voice (slang, emoji, caps, etc.)
  const mood = context.mood || 'happy';
  const energy = context.energy || 50;
  content = applyTeenVoice(content, context.student, mood, energy);

  return {
    content,
    template,
    timestamp: new Date(),
    studentId: context.student.id,
  };
}

/**
 * Generate multiple posts for variety
 */
export function generateMultiplePosts(
  context: PostContext,
  count: number = 3
): GeneratedPost[] {
  const posts: GeneratedPost[] = [];

  for (let i = 0; i < count; i++) {
    const post = generatePost(context);
    if (post) {
      posts.push(post);
    }
  }

  return posts;
}

/**
 * Determine if student should post (based on personality)
 */
export function shouldStudentPost(student: Student, timeOfDay: string): boolean {
  const primaryPersonality = student.primaryTrait || 'outgoing';

  // Posting frequency by personality
  const postingFrequency: Record<string, number> = {
    outgoing: 0.7,
    popular: 0.8,
    dramatic: 0.75,
    class_clown: 0.7,
    shy: 0.2,
    studious: 0.4,
    athletic: 0.5,
    curious: 0.45,
    rebellious: 0.6,
  };

  const baseChance = postingFrequency[primaryPersonality] || 0.5;

  // Increase chance during lunch/recess
  const timeMultiplier = timeOfDay === 'lunch' || timeOfDay === 'recess' ? 1.5 : 1.0;

  return Math.random() < (baseChance * timeMultiplier);
}

/**
 * Get post frequency category
 */
export function getPostingStyle(student: Student): {
  frequency: 'high' | 'medium' | 'low';
  preferredCategories: string[];
} {
  const primaryPersonality = student.primaryTrait || 'outgoing';

  const styles: Record<string, { frequency: 'high' | 'medium' | 'low'; preferredCategories: string[] }> = {
    outgoing: { frequency: 'high', preferredCategories: ['social', 'humor', 'event'] },
    popular: { frequency: 'high', preferredCategories: ['social', 'drama', 'personal'] },
    dramatic: { frequency: 'high', preferredCategories: ['drama', 'personal', 'event'] },
    class_clown: { frequency: 'high', preferredCategories: ['humor', 'social', 'event'] },
    shy: { frequency: 'low', preferredCategories: ['personal', 'academic'] },
    studious: { frequency: 'medium', preferredCategories: ['academic', 'personal', 'social'] },
    athletic: { frequency: 'medium', preferredCategories: ['social', 'event', 'humor'] },
    curious: { frequency: 'medium', preferredCategories: ['academic', 'personal', 'social'] },
    rebellious: { frequency: 'medium', preferredCategories: ['humor', 'drama', 'academic'] },
  };

  return styles[primaryPersonality] || {
    frequency: 'medium',
    preferredCategories: ['social', 'personal'],
  };
}
