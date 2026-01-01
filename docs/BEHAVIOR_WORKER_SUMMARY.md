# Behavior Worker Summary

## Mission Complete

The Behavior Worker has successfully deepened student personalities and created emergent classroom dynamics.

## Deliverables

### 1. Expanded Personality System (`personalities.ts`)

Enhanced all 8 personality profiles with deep attributes:

**New Fields:**
- `quirks: string[]` - Observable mannerisms (4 per personality)
- `triggers: { positive, negative }` - Context-based emotional responses
- `socialBehaviors: string[]` - How they act around peers
- `classroomHabits: string[]` - Physical and behavioral patterns

**Example - Shy Student:**
```typescript
quirks: ['Avoids eye contact', 'Speaks very quietly', 'Fidgets with pencil when nervous', 'Blushes easily']
triggers: {
  positive: ['One-on-one attention', 'Written praise', 'Quiet workspace'],
  negative: ['Being called on unexpectedly', 'Group presentations', 'Loud noises']
}
socialBehaviors: ['Sits near the edges', 'Observes before joining', 'Only talks to close friends']
classroomHabits: ['Sits in back or corner', 'Always prepared', 'Rarely raises hand']
```

### 2. Emergent Behavior Engine (`emergentBehavior.ts`)

**Core Functions:**
- `generateEmergentAction(student, context)` - Context-aware actions based on:
  - Current activity (lesson, transition, groupwork, etc.)
  - Nearby students
  - Recent events
  - Time of day
  - Teacher attention level

**Features:**
- Trigger-based responses (positive/negative contexts)
- Personality-driven spontaneous actions
- Chain reactions (one student's action triggers another's)
- Low energy + negative mood = disruptive behavior

**Example Chain Reaction:**
```typescript
// Outgoing student makes a joke
triggeringAction = { action: 'tell_joke', studentId: 'outgoing-kid' }

// Other outgoing/social students join the laughter
chainReaction = {
  action: 'join_laughter',
  description: 'Sarah laughs along with Mike'
}

// Analytical students get annoyed by the disruption
chainReaction = {
  action: 'show_annoyance',
  description: 'Alex shoots an annoyed look at Mike'
}
```

### 3. Gossip & Chatter System (`socialEngine.ts`)

**Gossip Content Generation:**
```typescript
generateGossipContent(gossiper, subject, allStudents)
```

**Topics Include:**
- Crushes (juiciness: 9)
- Test scores (juiciness: 3-7)
- Behavior incidents (juiciness: 8)
- Friendships (juiciness: 6)
- Homework status (juiciness: 3-6)

**Gossip Spreading:**
- High juiciness = spreads to 3 friends
- Medium juiciness = spreads to 2 friends
- Low juiciness = spreads to 1 friend

**Classroom Chatter:**
```typescript
generateClassroomChatter(students, currentActivity)
```

**Chatter Types:**
- Academic: Nerds discussing homework
- Social: Planning lunch seating
- Gossip: Whispering about classmates
- Jokes: Outgoing students cracking jokes
- Planning: Organizing recess games

**Group Dynamics:**
```typescript
calculateGroupDynamics(students)
// Returns: Map<leaderId, friendClusterMembers[]>
```

### 4. Teacher Interaction Patterns (`teacherInteractions.ts`)

**Teacher Action Types:**
- `call_on_student` - Being called on unexpectedly
- `give_praise` - Public or private recognition
- `give_correction` - Being corrected
- `start_lesson` - Beginning of instruction
- `ask_question` - Open question to class
- `assign_groups` - Group work assignment
- `announce_test` - Test announcement

**Student-Initiated Interactions:**
```typescript
generateStudentInitiatedInteraction(student, reason)
```

**Reasons:**
- `question` - Asking a question
- `help` - Requesting assistance
- `share` - Sharing an idea or story
- `off-topic` - Off-topic interruption
- `complaint` - Pointing out an issue
- `bathroom` - Asking to use restroom

**Example Responses:**

**Shy Student Called On:**
```typescript
{
  action: 'answer_nervously',
  dialogue: 'Emma avoids eye contact and speaks very quietly.',
  moodChange: -5,
  engagementChange: -3
}
```

**Curious Student Asking Question:**
```typescript
{
  action: 'ask_enthusiastic_question',
  dialogue: 'Jake raises hand eagerly: "Why does that happen?"',
  moodChange: +3,
  engagementChange: +5
}
```

### 5. Unified Behavior System (`behavior.ts`)

**Main Orchestrator:**
```typescript
generateBehaviorSnapshot(students, context): BehaviorSnapshot
```

**Returns:**
```typescript
{
  emergentActions: EmergentAction[],      // Context-aware behaviors
  chatter: ClassroomChatter[],            // Background social noise
  teacherInteractions: TeacherInteraction[], // Student-teacher dynamics
  gossip: GossipContent[]                 // Spreading rumors
}
```

**Helper Functions:**
- `getRandomQuirk(student)` - Pull a random quirk
- `getRandomClassroomHabit(student)` - Pull a random habit
- `getRandomSocialBehavior(student)` - Pull a random social behavior
- `isPositiveTrigger(student, trigger)` - Check if context triggers positive response
- `isNegativeTrigger(student, trigger)` - Check if context triggers negative response

## Integration Points

### Game Loop Integration
```typescript
// During each turn/phase
const behaviorContext: BehaviorContext = {
  currentActivity: 'lesson',
  nearbyStudents: getStudentsNearby(student),
  recentEvents: ['test_announced', 'group_formed'],
  timeOfDay: 'midday',
  teacherAttention: 'focused'
};

const snapshot = generateBehaviorSnapshot(state.students, behaviorContext);

// Use snapshot data:
// - Display emergent actions as events
// - Show chatter in classroom feed
// - Process teacher interactions for engagement changes
// - Spread gossip through friendship networks
```

### UI Integration
```typescript
// Student card displays
<StudentCard student={student}>
  <QuirkDisplay quirk={getRandomQuirk(student)} />
  <HabitDisplay habit={getRandomClassroomHabit(student)} />
  <BehaviorIndicator action={emergentAction} />
</StudentCard>

// Classroom feed
<ClassroomFeed>
  {snapshot.chatter.map(c => <ChatterBubble {...c} />)}
  {snapshot.gossip.map(g => <GossipPost {...g} />)}
</ClassroomFeed>
```

## Files Created

1. `/src/lib/students/emergentBehavior.ts` - Emergent action generation
2. `/src/lib/students/teacherInteractions.ts` - Teacher interaction patterns

## Files Modified

1. `/src/lib/students/personalities.ts` - Added deep personality attributes
2. `/src/lib/students/socialEngine.ts` - Added gossip and chatter systems
3. `/src/lib/students/behavior.ts` - Integrated all systems + unified API

## Impact

**Before:**
- Students had basic personality traits
- Interactions were generic
- No context-aware behaviors
- Static social dynamics

**After:**
- Students have unique quirks, triggers, and habits
- Interactions are personality-driven with actual dialogue
- Context-aware emergent behaviors create dynamic classroom
- Gossip spreads through networks, chatter varies by activity
- Chain reactions create unpredictable classroom moments
- Teacher interactions feel authentic (shy kids freeze, outgoing beam)

**Example Emergent Scenario:**

1. Teacher announces a test (context trigger)
2. Perfectionist student shows anxiety (negative trigger: "rushed deadlines")
3. Outgoing student shrugs it off (quirk: "always has a story")
4. Curious student asks clarifying questions (habit: "hand always up")
5. During transition, gossip spreads about who's worried about the test
6. Social student notices anxious perfectionist and offers help (social behavior: "notices emotions")
7. Chain reaction: Other students in friend group also offer support

**Result:** Classroom feels alive with interconnected student behaviors.

## Next Steps for Game Integration

1. **Event System Integration**: Trigger teacher actions that students respond to
2. **UI Components**: Display quirks, chatter, and emergent actions
3. **Feedback Loops**: Student behaviors affect teacher reputation, class morale
4. **Memory System**: Track which students frequently interact, who gossips most
5. **Social Feed**: Display gossip and chatter as in-game social media posts

## Usage Example

```typescript
import {
  generateBehaviorSnapshot,
  generateTeacherInteraction,
  getRandomQuirk
} from '@/lib/students/behavior';

// During teaching phase
const teacherAction = 'start_lesson';
students.forEach(student => {
  const interaction = generateTeacherInteraction(student, teacherAction, {
    topic: 'fractions',
    isPublic: true
  });

  // Display quirk-based reaction
  if (interaction.dialogue) {
    addToFeed(interaction.dialogue);
  }

  // Update student state
  student.engagement += interaction.engagementChange;
  student.mood = applyMoodChange(student.mood, interaction.moodChange);
});

// During transition
const context: BehaviorContext = {
  currentActivity: 'transition',
  nearbyStudents: [],
  recentEvents: [],
  timeOfDay: 'afternoon',
  teacherAttention: 'distracted'
};

const snapshot = generateBehaviorSnapshot(students, context);

// Lots of chatter during transitions
snapshot.chatter.forEach(chatter => {
  if (chatter.isDisruptive) {
    // Teacher might need to quiet the class
    showClassroomManagementOption();
  }
  addToChatterFeed(chatter.snippet);
});

// Gossip spreads
snapshot.gossip.forEach(gossip => {
  gossip.spreadsTo.forEach(studentId => {
    // Student hears the gossip, might react
    const student = findStudent(studentId);
    if (gossip.sentiment === 'negative' && studentId === gossip.subject) {
      student.mood = shiftMood(student.mood, -1);
    }
  });
});
```

## Testing Recommendations

1. Test each personality's quirks appear correctly
2. Verify triggers activate in appropriate contexts
3. Ensure chain reactions cascade properly
4. Check gossip spreads through friendship networks
5. Validate teacher interactions match personality types
6. Test that emergent actions respect current activity type

---

**Status:** COMPLETE
**Commit:** `fec84da` - "Add deep personality system with emergent behaviors"
**Lines of Code:** ~1,500+ across 5 files
**Personality Depth:** 8 personalities × (4 quirks + 8 triggers + 4 behaviors + 4 habits) = 160+ unique attributes
