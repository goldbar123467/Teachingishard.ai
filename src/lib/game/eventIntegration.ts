/**
 * Event Integration System
 * Coordinates all event types: standard, parent, special, behavior, consequences
 */

import type { Student, GameEvent } from './types';
import { checkForAllEvents } from '@/data/events';
import { generatePersonalityBehaviors, applyBehaviorEffects } from '../students/advancedBehavior';
import { shouldIssueConsequence, issueConsequence, shouldIssueReward, issueReward, applyConsequence, applyReward } from './consequences';
import type { BehaviorEvent } from '../students/advancedBehavior';
import type { Consequence, Reward } from './consequences';
import type { ParentEvent, PTAMeetingEvent } from '@/data/parentEvents';
import type { SpecialEvent } from '@/data/specialEvents';

// Union type for all event types
export type AnyEvent = GameEvent | ParentEvent | PTAMeetingEvent | SpecialEvent | BehaviorEvent;

export interface EventSystemState {
  activeConsequences: Consequence[];
  activeRewards: Reward[];
  behaviorHistory: BehaviorEvent[];
  parentEventLog: (ParentEvent | PTAMeetingEvent)[];
  specialEventLog: SpecialEvent[];
}

/**
 * Process all events for a game phase
 */
export function processPhaseEvents(
  phase: string,
  students: Student[],
  currentDay: number,
  difficulty: 'easy' | 'normal' | 'hard',
  eventState: EventSystemState,
  seasonalContext?: string
): {
  updatedStudents: Student[];
  events: AnyEvent[];
  consequences: Consequence[];
  rewards: Reward[];
  notifications: string[];
} {
  const updatedStudents = [...students];
  const allEvents: AnyEvent[] = [];
  const newConsequences: Consequence[] = [];
  const newRewards: Reward[] = [];
  const notifications: string[] = [];

  // 1. Check for standard, parent, and special events
  const { gameEvents, parentEvents, specialEvents } = checkForAllEvents(
    phase,
    students,
    currentDay,
    difficulty,
    seasonalContext
  );

  allEvents.push(...gameEvents, ...parentEvents, ...specialEvents);

  // 2. Generate personality-based behavior events for each student
  for (let i = 0; i < updatedStudents.length; i++) {
    const student = updatedStudents[i];
    const behaviorEvents = generatePersonalityBehaviors(student);

    for (const behaviorEvent of behaviorEvents) {
      // Apply behavior effects
      updatedStudents[i] = applyBehaviorEffects(updatedStudents[i], behaviorEvent);
      allEvents.push(behaviorEvent);
      eventState.behaviorHistory.push(behaviorEvent);

      // Check if behavior warrants consequences
      if (behaviorEvent.type === 'disruption' && behaviorEvent.severity === 'high') {
        const shouldConsequence = shouldIssueConsequence(
          updatedStudents[i],
          'disruption',
          'major' // high severity maps to major
        );

        if (shouldConsequence) {
          const consequence = issueConsequence(
            updatedStudents[i],
            'disruption',
            'major',
            behaviorEvent.description
          );

          updatedStudents[i] = applyConsequence(updatedStudents[i], consequence);
          newConsequences.push(consequence);
          eventState.activeConsequences.push(consequence);
          notifications.push(`${student.firstName} received ${consequence.type}: ${consequence.reason}`);
        }
      }

      // Check if behavior warrants rewards
      if (behaviorEvent.type === 'breakthrough' || behaviorEvent.severity === 'low') {
        if (shouldIssueReward(updatedStudents[i], 'improvement')) {
          const reward = issueReward(
            updatedStudents[i],
            'improvement',
            behaviorEvent.description
          );

          updatedStudents[i] = applyReward(updatedStudents[i], reward);
          newRewards.push(reward);
          eventState.activeRewards.push(reward);
          notifications.push(`${student.firstName} earned a ${reward.type}!`);
        }
      }
    }
  }

  // 3. Check for academic/behavior-based consequences and rewards
  for (let i = 0; i < updatedStudents.length; i++) {
    const student = updatedStudents[i];

    // Homework consequences
    if (!student.homeworkCompleted && Math.random() < 0.1) {
      const shouldConsequence = shouldIssueConsequence(student, 'homework', 'minor');
      if (shouldConsequence) {
        const consequence = issueConsequence(
          student,
          'homework',
          'minor',
          `${student.firstName} did not complete homework`
        );
        updatedStudents[i] = applyConsequence(updatedStudents[i], consequence);
        newConsequences.push(consequence);
        eventState.activeConsequences.push(consequence);
      }
    }

    // Academic rewards
    if (shouldIssueReward(student, 'academic')) {
      const reward = issueReward(
        student,
        'academic',
        `Excellent academic performance!`
      );
      updatedStudents[i] = applyReward(updatedStudents[i], reward);
      newRewards.push(reward);
      eventState.activeRewards.push(reward);
      notifications.push(`${student.firstName} earned academic recognition!`);
    }

    // Participation rewards
    if (shouldIssueReward(student, 'participation')) {
      const reward = issueReward(
        student,
        'participation',
        `Outstanding class participation`
      );
      updatedStudents[i] = applyReward(updatedStudents[i], reward);
      newRewards.push(reward);
      eventState.activeRewards.push(reward);
    }
  }

  return {
    updatedStudents,
    events: allEvents,
    consequences: newConsequences,
    rewards: newRewards,
    notifications
  };
}

/**
 * Initialize event system state
 */
export function initializeEventSystem(): EventSystemState {
  return {
    activeConsequences: [],
    activeRewards: [],
    behaviorHistory: [],
    parentEventLog: [],
    specialEventLog: []
  };
}

/**
 * Get event summary for reporting
 */
export function getEventSummary(eventState: EventSystemState, currentDay: number): {
  recentConsequences: number;
  recentRewards: number;
  recentBehaviorEvents: number;
  recentParentEvents: number;
} {
  const dayThreshold = currentDay - 7; // Last 7 days

  return {
    recentConsequences: eventState.activeConsequences.filter(c => c.date > dayThreshold).length,
    recentRewards: eventState.activeRewards.filter(r => r.date > dayThreshold).length,
    recentBehaviorEvents: eventState.behaviorHistory.filter(b => b.timestamp > dayThreshold).length,
    recentParentEvents: eventState.parentEventLog.filter(p => 'timestamp' in p && p.timestamp > dayThreshold).length
  };
}
