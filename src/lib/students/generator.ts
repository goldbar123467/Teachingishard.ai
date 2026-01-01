import type { Mood, Student } from '../game/types';
import { getRandomName } from './names';
import {
  getRandomLearningStyle,
  getRandomTrait,
  PERSONALITY_PROFILES,
} from './personalities';

function randomInRange(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateAvatarSeed(): string {
  return Math.random().toString(36).substring(2, 10);
}

function generateStudent(usedNames: Set<string>): Student {
  const { firstName, lastName } = getRandomName(usedNames);
  const primaryTrait = getRandomTrait();
  const secondaryTrait = getRandomTrait(primaryTrait);
  const profile = PERSONALITY_PROFILES[primaryTrait];

  // Base stats influenced by personality
  const academicLevel = randomInRange(30, 90);
  const engagement = Math.min(100, Math.max(0, profile.baseEngagement + randomInRange(-15, 15)));
  const socialSkills = Math.min(100, Math.max(0, profile.baseSocialSkills + randomInRange(-15, 15)));
  const energy = randomInRange(60, 100);

  // Special flags (roughly 10-15% chance each)
  const hasIEP = Math.random() < 0.12;
  const isGifted = !hasIEP && Math.random() < 0.1;
  const needsExtraHelp = hasIEP || (academicLevel < 45 && Math.random() < 0.5);

  const student: Student = {
    id: crypto.randomUUID(),
    firstName,
    lastName,
    avatarSeed: generateAvatarSeed(),

    academicLevel,
    engagement,
    energy,
    socialSkills,

    primaryTrait,
    secondaryTrait,
    learningStyle: getRandomLearningStyle(),

    mood: profile.defaultMood,
    homeworkCompleted: true,
    homeworkQuality: 0,
    attendanceToday: true,

    friendIds: [],
    rivalIds: [],

    testScores: [],
    behaviorIncidents: 0,
    positiveNotes: 0,

    hasIEP,
    needsExtraHelp,
    isGifted,
  };

  return student;
}

function generateFriendships(students: Student[]): void {
  // Each student gets 1-3 friends
  for (const student of students) {
    const numFriends = randomInRange(1, 3);
    const potentialFriends = students.filter(
      s => s.id !== student.id && !student.friendIds.includes(s.id)
    );

    // Prefer students with similar traits or social skills
    const sorted = potentialFriends.sort((a, b) => {
      const aMatch = a.primaryTrait === student.primaryTrait ? 20 : 0;
      const bMatch = b.primaryTrait === student.primaryTrait ? 20 : 0;
      const aSocial = Math.abs(a.socialSkills - student.socialSkills);
      const bSocial = Math.abs(b.socialSkills - student.socialSkills);
      return (bMatch - bSocial) - (aMatch - aSocial);
    });

    const friends = sorted.slice(0, numFriends);
    for (const friend of friends) {
      if (!student.friendIds.includes(friend.id)) {
        student.friendIds.push(friend.id);
      }
      // Friendship is mutual
      if (!friend.friendIds.includes(student.id)) {
        friend.friendIds.push(student.id);
      }
    }
  }

  // Some students have 0-1 rivals (10% chance per pair)
  for (let i = 0; i < students.length; i++) {
    for (let j = i + 1; j < students.length; j++) {
      if (Math.random() < 0.05) {
        students[i].rivalIds.push(students[j].id);
        students[j].rivalIds.push(students[i].id);
      }
    }
  }
}

export function generateStudents(count: number = 15): Student[] {
  const usedNames = new Set<string>();
  const students: Student[] = [];

  for (let i = 0; i < count; i++) {
    students.push(generateStudent(usedNames));
  }

  generateFriendships(students);

  return students;
}

export function getStudentFullName(student: Student): string {
  return `${student.firstName} ${student.lastName}`;
}

export function getStudentInitials(student: Student): string {
  return `${student.firstName[0]}${student.lastName[0]}`;
}
