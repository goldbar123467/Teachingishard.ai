/**
 * Teen Voice System
 * Applies authentic 5th-grade voice patterns to posts
 */

import type { Student } from '../game/types';

/**
 * Slang dictionary with weighted usage by personality
 */
export const SLANG_DICTIONARY = {
  // Intensifiers
  literally: { weight: 0.3, personalities: ['dramatic', 'outgoing', 'popular'] },
  actually: { weight: 0.25, personalities: ['thoughtful', 'honest', 'curious'] },
  lowkey: { weight: 0.2, personalities: ['chill', 'honest', 'self_aware'] },
  highkey: { weight: 0.15, personalities: ['outgoing', 'bold', 'confident'] },

  // Affirmations
  'fr fr': { weight: 0.25, personalities: ['outgoing', 'agreeable', 'honest'] },
  'no cap': { weight: 0.2, personalities: ['outgoing', 'bold', 'truthful'] },
  periodt: { weight: 0.15, personalities: ['sassy', 'confident', 'bold'] },
  facts: { weight: 0.2, personalities: ['honest', 'straightforward', 'logical'] },

  // Reactions
  ngl: { weight: 0.3, personalities: ['honest', 'straightforward', 'chill'] },
  tbh: { weight: 0.25, personalities: ['honest', 'thoughtful', 'sincere'] },
  iykyk: { weight: 0.2, personalities: ['mysterious', 'popular', 'insider'] },

  // Expressions
  slay: { weight: 0.2, personalities: ['popular', 'confident', 'supportive'] },
  'its giving': { weight: 0.15, personalities: ['observant', 'trendy', 'popular'] },
  'the way': { weight: 0.25, personalities: ['dramatic', 'observant', 'storyteller'] },
  bro: { weight: 0.3, personalities: ['casual', 'athletic', 'chill'] },

  // Internet speak
  rn: { weight: 0.35, personalities: ['impatient', 'urgent', 'dramatic'] },
  tho: { weight: 0.3, personalities: ['casual', 'chill', 'thoughtful'] },
  nvm: { weight: 0.15, personalities: ['distracted', 'scattered', 'forgetful'] },

  // Texting shortcuts
  omg: { weight: 0.3, personalities: ['dramatic', 'excitable', 'outgoing'] },
  lol: { weight: 0.25, personalities: ['friendly', 'easy_going', 'humorous'] },
  imo: { weight: 0.15, personalities: ['thoughtful', 'opinionated', 'confident'] },
};

/**
 * Emoji patterns by personality type
 */
export const EMOJI_PATTERNS = {
  outgoing: {
    frequency: 0.8, // High emoji usage
    favorites: ['💕', '🎉', '✨', '😊', '😂', '🙌', '💯'],
    multiUse: true, // Uses multiple emojis
  },
  shy: {
    frequency: 0.2, // Minimal emoji usage
    favorites: ['😊', '...', '☺️'],
    multiUse: false,
  },
  dramatic: {
    frequency: 0.9,
    favorites: ['😭', '💀', '😤', '🙄', '😩', '✨'],
    multiUse: true,
    repeats: true, // Uses repeating emojis (💀💀💀)
  },
  class_clown: {
    frequency: 0.85,
    favorites: ['💀', '😂', '🤡', '😎', '🧠', '☠️', '🔥'],
    multiUse: true,
    repeats: true,
  },
  popular: {
    frequency: 0.75,
    favorites: ['💅', '✨', '😌', '💕', '🎀', '👑', '💯'],
    multiUse: true,
  },
  studious: {
    frequency: 0.4,
    favorites: ['📚', '📝', '🤔', '💭', '✏️'],
    multiUse: false,
  },
  athletic: {
    frequency: 0.6,
    favorites: ['🏀', '⚽', '🏃', '💪', '🔥', '🎯'],
    multiUse: false,
  },
  curious: {
    frequency: 0.5,
    favorites: ['🤔', '💭', '🧠', '📖', '❓'],
    multiUse: false,
  },
  rebellious: {
    frequency: 0.7,
    favorites: ['🙄', '😤', '😒', '🚫', '⚠️'],
    multiUse: false,
  },
  anxious: {
    frequency: 0.6,
    favorites: ['😰', '😅', '😬', '🙃', '😵‍💫'],
    multiUse: false,
  },
};

/**
 * Capitalization patterns by mood and personality
 */
export interface CapsPattern {
  allCaps: boolean;
  allLower: boolean;
  normalCaps: boolean;
  randomCaps: boolean;
}

export function getCapsPattern(
  mood: string,
  personality: string,
  energy: number
): CapsPattern {
  // Excited/angry = more caps
  if (mood === 'excited' || mood === 'angry') {
    return { allCaps: true, allLower: false, normalCaps: false, randomCaps: false };
  }

  // Tired/sad = lowercase
  if (mood === 'tired' || mood === 'sad') {
    return { allCaps: false, allLower: true, normalCaps: false, randomCaps: false };
  }

  // Class clowns sometimes do rAnDoM cApS
  if (personality === 'class_clown' && Math.random() < 0.15) {
    return { allCaps: false, allLower: false, normalCaps: false, randomCaps: true };
  }

  // Low energy = lowercase
  if (energy < 30) {
    return { allCaps: false, allLower: true, normalCaps: false, randomCaps: false };
  }

  // High energy = partial caps
  if (energy > 80) {
    return { allCaps: false, allLower: false, normalCaps: true, randomCaps: false };
  }

  // Default = normal
  return { allCaps: false, allLower: false, normalCaps: true, randomCaps: false };
}

/**
 * Apply capitalization pattern to text
 */
export function applyCaps(text: string, pattern: CapsPattern): string {
  if (pattern.allCaps) {
    return text.toUpperCase();
  }

  if (pattern.allLower) {
    return text.toLowerCase();
  }

  if (pattern.randomCaps) {
    return text
      .split('')
      .map(char => Math.random() < 0.5 ? char.toUpperCase() : char.toLowerCase())
      .join('');
  }

  return text; // Normal caps
}

/**
 * Typo generator for distracted/low focus students
 */
export const COMMON_TYPOS: Record<string, string> = {
  'the': 'teh',
  'you': 'u',
  'your': 'ur',
  'are': 'r',
  'to': '2',
  'too': '2',
  'for': '4',
  'be': 'b',
  'see': 'c',
  'why': 'y',
  'okay': 'ok',
  'though': 'tho',
  'because': 'bc',
  'probably': 'prob',
  'definitely': 'def',
  'right': 'rite',
  'night': 'nite',
  'please': 'pls',
  'thanks': 'ty',
};

export function addTypos(text: string, typoChance: number): string {
  if (typoChance <= 0) return text;

  const words = text.split(' ');
  return words.map(word => {
    if (Math.random() < typoChance) {
      const lowerWord = word.toLowerCase();
      if (COMMON_TYPOS[lowerWord]) {
        return COMMON_TYPOS[lowerWord];
      }
    }
    return word;
  }).join(' ');
}

/**
 * Add punctuation variation (or lack thereof)
 */
export function addPunctuationStyle(
  text: string,
  personality: string,
  mood: string
): string {
  // Dramatic personalities add extra punctuation
  if (personality === 'dramatic' || mood === 'excited') {
    text = text.replace(/!/g, '!!');
    text = text.replace(/\?/g, '??');
  }

  // Shy/tired personalities often skip punctuation
  if (personality === 'shy' || mood === 'tired') {
    text = text.replace(/[!?]$/g, '');
  }

  // Class clowns overuse punctuation
  if (personality === 'class_clown') {
    text = text.replace(/!/g, '!!!');
  }

  return text;
}

/**
 * Add emoji to text based on personality
 */
export function addEmoji(text: string, personality: string): string {
  const pattern = EMOJI_PATTERNS[personality as keyof typeof EMOJI_PATTERNS] ||
                  EMOJI_PATTERNS.outgoing;

  // Skip emoji based on frequency
  if (Math.random() > pattern.frequency) {
    return text;
  }

  // Select random emoji from favorites
  const emoji = pattern.favorites[Math.floor(Math.random() * pattern.favorites.length)];

  // Add repeating emojis for dramatic personalities
  const count = (pattern as any).repeats && Math.random() < 0.4 ? 2 + Math.floor(Math.random() * 2) : 1;
  const emojiString = emoji.repeat(count);

  // Add multiple different emojis sometimes
  if (pattern.multiUse && Math.random() < 0.3) {
    const emoji2 = pattern.favorites[Math.floor(Math.random() * pattern.favorites.length)];
    return `${text} ${emojiString}${emoji2}`;
  }

  return `${text} ${emojiString}`;
}

/**
 * Add slang to text based on personality
 */
export function addSlang(text: string, personality: string): string {
  // Get slang that matches this personality
  const matchingSlang = Object.entries(SLANG_DICTIONARY).filter(([_, data]) =>
    data.personalities.some(p => personality.includes(p))
  );

  if (matchingSlang.length === 0) return text;

  // Randomly select slang to add
  for (const [slang, data] of matchingSlang) {
    if (Math.random() < data.weight * 0.3) { // 30% of weight for insertion
      // Insert at start, middle, or end
      const position = Math.random();
      if (position < 0.3) {
        text = `${slang} ${text}`;
      } else if (position < 0.6) {
        text = `${text} ${slang}`;
      } else {
        const words = text.split(' ');
        const midPoint = Math.floor(words.length / 2);
        words.splice(midPoint, 0, slang);
        text = words.join(' ');
      }
    }
  }

  return text;
}

/**
 * Master function: Apply full teen voice to text
 */
export function applyTeenVoice(
  text: string,
  student: Student,
  mood: string,
  energy: number
): string {
  let result = text;

  // 1. Add slang based on personality
  const primaryPersonality = student.primaryTrait || 'outgoing';
  result = addSlang(result, primaryPersonality);

  // 2. Add typos if distracted or low focus
  const typoChance = student.primaryTrait === 'distracted' ? 0.15 : 0.05;
  result = addTypos(result, typoChance);

  // 3. Apply capitalization
  const capsPattern = getCapsPattern(mood, primaryPersonality, energy);
  result = applyCaps(result, capsPattern);

  // 4. Add punctuation style
  result = addPunctuationStyle(result, primaryPersonality, mood);

  // 5. Add emoji
  result = addEmoji(result, primaryPersonality);

  return result;
}

/**
 * Shorten words for texting style (optional layer)
 */
export function applyTextingShorthand(text: string, chance: number = 0.2): string {
  if (Math.random() > chance) return text;

  const shortcuts: Record<string, string> = {
    'right now': 'rn',
    'not gonna lie': 'ngl',
    'to be honest': 'tbh',
    'if you know you know': 'iykyk',
    'for real': 'fr',
    'oh my god': 'omg',
    'laughing out loud': 'lol',
    'in my opinion': 'imo',
  };

  let result = text;
  for (const [phrase, shorthand] of Object.entries(shortcuts)) {
    const regex = new RegExp(phrase, 'gi');
    result = result.replace(regex, shorthand);
  }

  return result;
}
