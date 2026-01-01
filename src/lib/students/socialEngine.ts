/**
 * Social Dynamics Engine
 */

import type { SocialInteraction, SocialInteractionType, SocialOutcome, CompatibilityScore, Clique, CliqueType, FeedPost } from './social';
import type { Student } from '../game/types';

const TRAIT_COMPATIBILITY: Record<string, Record<string, number>> = {
  outgoing: { outgoing: 30, shy: -20, social: 40, introverted: -15, curious: 25, lazy: -10, talkative: 50, quiet: -5 },
  social: { social: 35, outgoing: 40, introverted: -15, shy: 20, quiet: 10, curious: 30 },
  talkative: { talkative: 25, outgoing: 50, social: 40, quiet: -30, shy: -25, thoughtful: 10 },
  shy: { shy: 25, outgoing: -20, introverted: 35, social: 20, quiet: 40, thoughtful: 35, curious: 15 },
  quiet: { quiet: 30, shy: 40, introverted: 35, talkative: -30, outgoing: -5, thoughtful: 40, curious: 20 },
  introverted: { introverted: 30, shy: 35, quiet: 35, outgoing: -15, social: -15, creative: 25 },
  curious: { curious: 45, smart: 40, thoughtful: 35, lazy: -40, outgoing: 25, shy: 15 },
  smart: { smart: 35, curious: 40, thoughtful: 35, lazy: -50, fun: 10 },
  thoughtful: { thoughtful: 40, quiet: 40, shy: 35, curious: 35, smart: 35, lazy: -20 },
  creative: { creative: 35, artistic: 40, introverted: 25, thoughtful: 30, quiet: 25 },
  artistic: { artistic: 35, creative: 40, free_spirited: 30, methodical: -10 },
  fun: { fun: 40, outgoing: 30, social: 30, lazy: 15, smart: 10 },
  playful: { playful: 40, fun: 35, outgoing: 30, serious: -20 },
  lazy: { lazy: -5, curious: -40, smart: -50, hardworking: -50, fun: 15, thoughtful: -20 },
  serious: { serious: 30, thoughtful: 25, playful: -20, fun: -10 },
  default: { default: 10 },
};

export function calculateCompatibility(student1: Student, student2: Student): CompatibilityScore {
  const traits1 = [student1.primaryTrait, student1.secondaryTrait];
  const traits2 = [student2.primaryTrait, student2.secondaryTrait];
  let totalScore = 0, comparisonsCount = 0;
  for (const trait1 of traits1) {
    for (const trait2 of traits2) {
      const matrix = TRAIT_COMPATIBILITY[trait1] || TRAIT_COMPATIBILITY.default;
      const score = matrix[trait2] ?? matrix.default ?? 10;
      totalScore += score; comparisonsCount++;
    }
  }
  const avgScore = comparisonsCount > 0 ? totalScore / comparisonsCount : 0;
  const clampedScore = Math.max(-50, Math.min(50, Math.round(avgScore)));
  return { trait1: traits1.join('/'), trait2: traits2.join('/'), score: clampedScore, reason: 'Compatible' };
}

export function generateInitialFriendships(student: Student, otherStudents: Student[], friendshipChancePerStudent: number = 0.15): string[] {
  const friends: string[] = [];
  for (const other of otherStudents) {
    if (other.id === student.id) continue;
    const compatibility = calculateCompatibility(student, other);
    const friendshipProbability = (compatibility.score + 50) / 100 * friendshipChancePerStudent;
    if (Math.random() < friendshipProbability) friends.push(other.id);
  }
  return friends;
}

export function assignClique(student: Student): CliqueType | null {
  const traits = [student.primaryTrait.toLowerCase(), student.secondaryTrait.toLowerCase()];
  const socialSkills = student.socialSkills;
  if (socialSkills >= 80) return 'popular';
  if (socialSkills <= 40) return 'loners';
  if (traits.some(t => t.includes('nerd') || t.includes('smart') || t.includes('curious'))) return 'nerds';
  if (traits.some(t => t.includes('athletic') || t.includes('sport'))) return 'athletes';
  if (traits.some(t => t.includes('artist') || t.includes('creative') || t.includes('artistic'))) return 'artists';
  if (traits.some(t => t.includes('creative') || t.includes('free'))) return 'creatives';
  return null;
}

export function calculatePopularity(student: Student): number {
  let popularity = 50;
  popularity += Math.min(student.friendIds.length * 5, 20);
  popularity -= Math.min(student.rivalIds.length * 3, 15);
  popularity += (student.socialSkills / 100) * 15;
  popularity += (student.engagement / 100) * 10;
  popularity += student.positiveNotes * 2;
  popularity -= student.behaviorIncidents * 3;
  if (student.testScores.length > 0) {
    const avgScore = student.testScores.reduce((a, b) => a + b, 0) / student.testScores.length;
    popularity += (avgScore / 100) * 10;
  }
  return Math.max(0, Math.min(100, Math.round(popularity)));
}

export function generateSocialInteraction(student1: Student, student2: Student, currentDay: number): SocialInteraction {
  const id = 'interaction-' + student1.id + '-' + student2.id + '-' + Date.now();
  const types: SocialInteractionType[] = ['chat', 'conflict', 'help', 'gossip', 'note', 'drama'];
  let type: SocialInteractionType = types[Math.floor(Math.random() * types.length)];
  const isFriend = student1.friendIds.includes(student2.id);
  const isRival = student1.rivalIds.includes(student2.id);
  if (isFriend) type = ['chat', 'help', 'compliment', 'teamwork'][Math.floor(Math.random() * 4)] as SocialInteractionType;
  else if (isRival) type = ['conflict', 'gossip', 'drama', 'exclude'][Math.floor(Math.random() * 4)] as SocialInteractionType;
  const outcomeRoll = Math.random();
  let outcome: SocialOutcome = 'neutral', friendshipDelta = 0, description = '';
  switch (type) {
    case 'chat': outcome = outcomeRoll < 0.7 ? 'positive' : 'neutral'; friendshipDelta = 5; description = student1.firstName + ' and ' + student2.firstName + ' had a friendly chat.'; break;
    case 'conflict': outcome = outcomeRoll < 0.6 ? 'negative' : 'neutral'; friendshipDelta = -15; description = student1.firstName + ' and ' + student2.firstName + ' had a disagreement.'; break;
    case 'help': outcome = 'positive'; friendshipDelta = 10; description = student1.firstName + ' helped ' + student2.firstName + ' with schoolwork.'; break;
    case 'gossip': outcome = outcomeRoll < 0.4 ? 'positive' : 'negative'; friendshipDelta = outcome === 'positive' ? 3 : -8; description = student1.firstName + ' shared information about ' + student2.firstName + '.'; break;
    case 'note': outcome = outcomeRoll < 0.5 ? 'positive' : 'neutral'; friendshipDelta = 4; description = student1.firstName + ' passed a note to ' + student2.firstName + '.'; break;
    case 'drama': outcome = 'negative'; friendshipDelta = -20; description = student1.firstName + ' and ' + student2.firstName + ' had significant drama.'; break;
    case 'compliment': outcome = 'positive'; friendshipDelta = 8; description = student1.firstName + ' complimented ' + student2.firstName + '.'; break;
    case 'exclude': outcome = 'negative'; friendshipDelta = -12; description = student2.firstName + ' felt excluded by ' + student1.firstName + '.'; break;
    case 'teamwork': outcome = 'positive'; friendshipDelta = 12; description = student1.firstName + ' and ' + student2.firstName + ' worked well together.'; break;
  }
  return { id, type, participants: [student1.id, student2.id], timestamp: currentDay, outcome, description, friendshipDelta, wasObserved: Math.random() < 0.3 };
}

export function updateFriendship(currentScore: number, delta: number): number {
  const newScore = currentScore + delta;
  return Math.max(-100, Math.min(100, newScore));
}

export function shouldFormRelationship(student1Id: string, student2Id: string, compatibility: number, interactionOutcome: SocialOutcome, currentFriendship: number): 'friend' | 'rival' | 'none' {
  let scoreThreshold = 0;
  if (interactionOutcome === 'positive') scoreThreshold = 25 + compatibility / 5;
  else if (interactionOutcome === 'negative') scoreThreshold = -35 - compatibility / 5;
  const friendshipScore = currentFriendship + scoreThreshold;
  if (friendshipScore >= 50) return 'friend';
  else if (friendshipScore <= -50) return 'rival';
  return 'none';
}

export function assignCliques(students: Student[]): Clique[] {
  const cliques: Map<CliqueType, string[]> = new Map();
  for (const student of students) {
    const cliqueType = assignClique(student);
    if (cliqueType) {
      if (!cliques.has(cliqueType)) cliques.set(cliqueType, []);
      cliques.get(cliqueType)!.push(student.id);
    }
  }
  const result: Clique[] = [];
  for (const [type, members] of cliques) {
    const memberObjects = members.map(id => students.find(s => s.id === id)!).filter(Boolean);
    let totalCompatibility = 0, comparisons = 0;
    for (let i = 0; i < memberObjects.length; i++) {
      for (let j = i + 1; j < memberObjects.length; j++) {
        const compat = calculateCompatibility(memberObjects[i], memberObjects[j]);
        totalCompatibility += compat.score; comparisons++;
      }
    }
    const avgCompatibility = comparisons > 0 ? totalCompatibility / comparisons : 0;
    const cohesion = Math.max(0, Math.min(100, 50 + avgCompatibility * 1.5));
    let leader: string | undefined;
    if (memberObjects.length > 0) {
      const allPopularities = memberObjects.map(m => ({ id: m.id, popularity: m.socialSkills }));
      leader = allPopularities.sort((a, b) => b.popularity - a.popularity)[0]?.id;
    }
    result.push({ type, members, leader, cohesion: Math.round(cohesion) });
  }
  return result;
}

export function generateFeedPost(interaction: SocialInteraction, students: Student[]): FeedPost {
  const student1 = students.find(s => s.id === interaction.participants[0]);
  const student2 = students.find(s => s.id === interaction.participants[1]);
  if (!student1 || !student2) throw new Error('Students not found for interaction');
  let type: FeedPost['type'] = 'interaction', emoji = '📝', sentiment: FeedPost['sentiment'] = 'neutral';
  if (interaction.outcome === 'positive') sentiment = 'positive';
  else if (interaction.outcome === 'negative') sentiment = interaction.type === 'drama' ? 'dramatic' : 'negative';
  switch (interaction.type) {
    case 'gossip': emoji = '👀'; type = 'drama'; break;
    case 'conflict': emoji = '⚡'; type = 'drama'; break;
    case 'help': emoji = '🤝'; type = 'achievement'; sentiment = 'positive'; break;
    case 'compliment': emoji = '👍'; type = 'mood_change'; sentiment = 'positive'; break;
    case 'drama': emoji = '🎭'; type = 'drama'; sentiment = 'dramatic'; break;
  }
  return { id: 'post-' + interaction.id, type, author: student1.id, content: interaction.description, emoji, timestamp: interaction.timestamp, sentiment, interactionId: interaction.id };
}

export function calculateSocialEnergyDrain(interactionType: SocialInteractionType, isIntrovert: boolean): number {
  const baseEnergy = interactionType === 'chat' || interactionType === 'gossip' ? 10 : 5;
  return isIntrovert ? baseEnergy * 1.5 : baseEnergy;
}

export function calculateSocialEnergyGain(interactionType: SocialInteractionType, isExtrovert: boolean): number {
  const baseEnergy = interactionType === 'chat' || interactionType === 'gossip' ? 5 : 2;
  return isExtrovert ? baseEnergy * 2 : baseEnergy;
}

export function processSocialTurn(students: Student[], currentDay: number) {
  const interactions: SocialInteraction[] = [];
  const cliqueAssignments = new Map<string, CliqueType | null>();
  const popularityScores = new Map<string, number>();
  const interactionCount = Math.floor(Math.random() * 3) + 2;
  for (let i = 0; i < interactionCount && students.length >= 2; i++) {
    const student1 = students[Math.floor(Math.random() * students.length)];
    let student2 = students[Math.floor(Math.random() * students.length)];
    while (student2.id === student1.id) student2 = students[Math.floor(Math.random() * students.length)];
    const interaction = generateSocialInteraction(student1, student2, currentDay);
    interactions.push(interaction);
  }
  const cliques = assignCliques(students);
  for (const student of students) {
    cliqueAssignments.set(student.id, student.clique || null);
    popularityScores.set(student.id, calculatePopularity(student));
  }
  return { interactions, cliqueAssignments, popularityScores };
}

export function calculateFriendshipCompatibility(student1: Student, student2: Student): number {
  return calculateCompatibility(student1, student2).score;
}
