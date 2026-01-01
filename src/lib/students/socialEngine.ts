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

// ============ GOSSIP & CHATTER SYSTEM ============

export interface GossipContent {
  topic: string;
  content: string;
  juiciness: number; // 1-10, how interesting is this gossip?
  spreadsTo: string[]; // Student IDs who will hear it
  sentiment: 'positive' | 'negative' | 'neutral';
}

/**
 * Generate actual gossip content between students
 */
export function generateGossipContent(
  gossiper: Student,
  subject: Student,
  allStudents: Student[]
): GossipContent {
  const topics = [
    'crush',
    'test_score',
    'behavior',
    'fashion',
    'lunch',
    'recess',
    'teacher',
    'friendship',
    'homework',
    'talent',
  ];

  const topic = topics[Math.floor(Math.random() * topics.length)];
  let content = '';
  let juiciness = 5;
  let sentiment: GossipContent['sentiment'] = 'neutral';

  switch (topic) {
    case 'crush':
      const randomStudent = allStudents[Math.floor(Math.random() * allStudents.length)];
      content = `Did you know ${subject.firstName} likes ${randomStudent.firstName}?`;
      juiciness = 9;
      sentiment = 'neutral';
      break;

    case 'test_score':
      const score = subject.testScores[subject.testScores.length - 1] || 85;
      if (score >= 90) {
        content = `${subject.firstName} got a ${score} on the test! So smart!`;
        sentiment = 'positive';
        juiciness = 6;
      } else if (score < 70) {
        content = `I heard ${subject.firstName} didn't do well on the test...`;
        sentiment = 'negative';
        juiciness = 7;
      } else {
        content = `${subject.firstName} got an okay score on the test.`;
        sentiment = 'neutral';
        juiciness = 3;
      }
      break;

    case 'behavior':
      if (subject.behaviorIncidents > 0) {
        content = `${subject.firstName} got in trouble again today.`;
        sentiment = 'negative';
        juiciness = 8;
      } else if (subject.positiveNotes > 2) {
        content = `${subject.firstName} is always so well-behaved!`;
        sentiment = 'positive';
        juiciness = 4;
      } else {
        content = `${subject.firstName} was being silly in class.`;
        sentiment = 'neutral';
        juiciness = 5;
      }
      break;

    case 'fashion':
      content = `${subject.firstName} wore the coolest shirt today!`;
      sentiment = 'positive';
      juiciness = 4;
      break;

    case 'lunch':
      const lunches = ['pizza', 'mystery meat', 'chicken nuggets', 'salad', 'PB&J'];
      content = `${subject.firstName} brought ${lunches[Math.floor(Math.random() * lunches.length)]} for lunch.`;
      sentiment = 'neutral';
      juiciness = 2;
      break;

    case 'recess':
      content = `${subject.firstName} was amazing at kickball during recess!`;
      sentiment = 'positive';
      juiciness = 5;
      break;

    case 'teacher':
      content = `${subject.firstName} stayed after to help the teacher.`;
      sentiment = 'positive';
      juiciness = 4;
      break;

    case 'friendship':
      const friend = allStudents.find(s => subject.friendIds.includes(s.id));
      if (friend) {
        content = `${subject.firstName} and ${friend.firstName} are best friends now!`;
        sentiment = 'positive';
        juiciness = 6;
      } else {
        content = `${subject.firstName} seems lonely lately.`;
        sentiment = 'negative';
        juiciness = 5;
      }
      break;

    case 'homework':
      if (subject.homeworkCompleted) {
        content = `${subject.firstName} always does their homework perfectly.`;
        sentiment = 'positive';
        juiciness = 3;
      } else {
        content = `${subject.firstName} forgot their homework again!`;
        sentiment = 'negative';
        juiciness = 6;
      }
      break;

    case 'talent':
      const talents = ['drawing', 'singing', 'sports', 'math', 'reading'];
      content = `${subject.firstName} is really good at ${talents[Math.floor(Math.random() * talents.length)]}!`;
      sentiment = 'positive';
      juiciness = 5;
      break;
  }

  // Determine who the gossip spreads to based on friendship networks
  const spreadsTo: string[] = [];
  const gossiperFriends = allStudents.filter(s => gossiper.friendIds.includes(s.id));

  // Gossip spreads to 1-3 friends depending on juiciness
  const spreadCount = Math.min(juiciness >= 7 ? 3 : juiciness >= 5 ? 2 : 1, gossiperFriends.length);
  for (let i = 0; i < spreadCount; i++) {
    const friend = gossiperFriends[Math.floor(Math.random() * gossiperFriends.length)];
    if (friend && !spreadsTo.includes(friend.id)) {
      spreadsTo.push(friend.id);
    }
  }

  return {
    topic,
    content,
    juiciness,
    spreadsTo,
    sentiment,
  };
}

/**
 * Calculate group dynamics - who clusters with who
 */
export function calculateGroupDynamics(students: Student[]): Map<string, string[]> {
  const clusters = new Map<string, string[]>();

  for (const student of students) {
    // Get all friends
    const friendGroup = [student.id, ...student.friendIds];

    // Check if this student already belongs to a cluster
    let existingCluster: string[] | null = null;
    for (const [leaderId, members] of clusters.entries()) {
      if (members.some(id => friendGroup.includes(id))) {
        existingCluster = members;
        break;
      }
    }

    if (existingCluster) {
      // Add to existing cluster
      for (const friendId of friendGroup) {
        if (!existingCluster.includes(friendId)) {
          existingCluster.push(friendId);
        }
      }
    } else {
      // Create new cluster
      clusters.set(student.id, friendGroup);
    }
  }

  return clusters;
}

/**
 * Generate background classroom chatter
 */
export interface ClassroomChatter {
  id: string;
  participants: string[]; // Student IDs involved
  chatterType: 'academic' | 'social' | 'gossip' | 'joke' | 'planning';
  snippet: string; // What they're chatting about
  volume: 'whisper' | 'normal' | 'loud';
  isDisruptive: boolean;
}

export function generateClassroomChatter(
  students: Student[],
  currentActivity: 'lesson' | 'groupwork' | 'transition' | 'independent'
): ClassroomChatter[] {
  const chatter: ClassroomChatter[] = [];

  // More chatter during transitions and group work
  const chatterProbability = currentActivity === 'transition' ? 0.6 : currentActivity === 'groupwork' ? 0.5 : 0.2;

  const groupDynamics = calculateGroupDynamics(students);

  for (const [leaderId, members] of groupDynamics.entries()) {
    if (Math.random() > chatterProbability) continue;
    if (members.length < 2) continue;

    // Pick 2-3 students from this cluster to chat
    const chattingStudents = members
      .map(id => students.find(s => s.id === id))
      .filter(Boolean)
      .slice(0, Math.floor(Math.random() * 2) + 2) as Student[];

    if (chattingStudents.length < 2) continue;

    const student1 = chattingStudents[0];
    const student2 = chattingStudents[1];

    // Determine chatter type based on clique and personalities
    let chatterType: ClassroomChatter['chatterType'] = 'social';
    let snippet = '';
    let volume: ClassroomChatter['volume'] = 'whisper';
    let isDisruptive = false;

    if (student1.clique === 'nerds' || student2.clique === 'nerds') {
      chatterType = 'academic';
      snippet = `${student1.firstName}: "Did you understand the homework?" ${student2.firstName}: "Yeah, problem 5 was tricky..."`;
      volume = 'whisper';
    } else if (student1.primaryTrait === 'outgoing' || student2.primaryTrait === 'outgoing') {
      chatterType = 'joke';
      snippet = `${student1.firstName} tells a joke and both students giggle.`;
      volume = 'normal';
      isDisruptive = currentActivity === 'lesson' || currentActivity === 'independent';
    } else if (student1.primaryTrait === 'social' || student2.primaryTrait === 'social') {
      chatterType = 'social';
      snippet = `${student1.firstName}: "Want to sit together at lunch?" ${student2.firstName}: "Sure!"`;
      volume = 'whisper';
    } else if (Math.random() < 0.3) {
      chatterType = 'gossip';
      const gossipSubject = students[Math.floor(Math.random() * students.length)];
      const gossip = generateGossipContent(student1, gossipSubject, students);
      snippet = `${student1.firstName} whispers: "${gossip.content}"`;
      volume = 'whisper';
    } else {
      chatterType = 'planning';
      snippet = `${student1.firstName} and ${student2.firstName} quietly plan their recess game.`;
      volume = 'whisper';
    }

    chatter.push({
      id: `chatter-${student1.id}-${student2.id}-${Date.now()}`,
      participants: chattingStudents.map(s => s.id),
      chatterType,
      snippet,
      volume,
      isDisruptive,
    });
  }

  return chatter;
}
