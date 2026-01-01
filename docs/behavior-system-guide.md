# Enhanced Behavior System - Implementation Guide

## Overview
The enhanced behavior system adds depth to student simulation through personality-based behaviors, parent interactions, consequences/rewards, and special events.

## Components

### 1. Advanced Student Behaviors (`src/lib/students/advancedBehavior.ts`)

#### Personality Patterns
- **Class Clown (outgoing)**: Disruptions, jokes, entertainment
- **Perfectionist**: Stress, anxiety, excellence
- **Social Butterfly (social)**: Gossip, mediation, drama
- **Shy Student**: Withdrawal, breakthrough moments, progression

#### Usage Example
```typescript
import { generatePersonalityBehaviors, applyBehaviorEffects } from '@/lib/students/advancedBehavior';

// Generate behaviors for a student
const behaviorEvents = generatePersonalityBehaviors(student);

// Apply effects
for (const event of behaviorEvents) {
  student = applyBehaviorEffects(student, event);
}
```

#### Stress Tracking
```typescript
import { calculateStressLevel } from '@/lib/students/advancedBehavior';

const stressLevel = calculateStressLevel(student); // 0-100
```

### 2. Parent Events (`src/data/parentEvents.ts`)

#### Event Types
- **Concerned Parent Emails**: Academic, behavior, homework, social, emotional
- **Parent Appreciation**: Thank you emails for good work
- **PTA Meetings**: Homework policy, technology, safety concerns

#### Triggers
```typescript
import { checkForParentEvents } from '@/data/parentEvents';

const events = checkForParentEvents(students, currentDay, difficulty);
```

#### Example Parent Email
```
Subject: Concerned about Emma's Academic Progress
From: Mrs. Johnson

Dear Teacher,

I'm writing because I'm concerned about Emma's recent academic
performance. Their grades seem to be slipping, and I'm worried
they're falling behind. Can we schedule a time to discuss what
support they might need?

Thank you,
Mrs. Johnson
```

### 3. Consequence System (`src/lib/game/consequences.ts`)

#### Consequence Types
- **Warning**: Minor reminder
- **Detention**: Escalated consequence
- **Parent Contact**: Serious incidents

#### Escalation Levels
- 1 incident → Warning
- 3 incidents → Detention
- 5 incidents → Parent contact
- 7 incidents → Probation

#### Usage Example
```typescript
import { shouldIssueConsequence, issueConsequence, applyConsequence } from '@/lib/game/consequences';

if (shouldIssueConsequence(student, 'disruption', 'high')) {
  const consequence = issueConsequence(student, 'disruption', 'high', 'Disrupted class');
  student = applyConsequence(student, consequence);
}
```

#### Rewards System
```typescript
import { shouldIssueReward, issueReward, applyReward } from '@/lib/game/consequences';

if (shouldIssueReward(student, 'academic')) {
  const reward = issueReward(student, 'academic', 'Excellent test score!');
  student = applyReward(student, reward);
}
```

#### Reward Types
- **Sticker**: Small recognition
- **Praise**: Verbal recognition
- **Privilege**: Special responsibilities
- **Certificate**: Formal recognition
- **Class Helper**: Leadership role

### 4. Special Events (`src/data/specialEvents.ts`)

#### Event Categories
- **Drills**: Fire drill, lockdown drill
- **Substitute Teacher**: Sub day, sub chaos
- **Class Pet**: Arrival, escape, sick
- **Holidays**: Halloween, winter, Valentine's Day
- **Weather**: Snow day, power outage
- **Technology**: Tech failure, virtual guest
- **Surprises**: Mystery reader, principal visit

#### Usage Example
```typescript
import { checkForSpecialEvents } from '@/data/specialEvents';

const events = checkForSpecialEvents(currentDay, difficulty, 'fall');
```

#### Event Structure
```typescript
{
  id: 'fire-drill',
  type: 'drill',
  title: 'Fire Drill',
  description: 'The fire alarm goes off...',
  icon: '🚨',
  choices: [
    {
      id: 'calm',
      label: 'Stay calm and lead students out',
      effects: [
        { target: 'class', mood: 0, engagement: 5 },
        { target: 'teacher', energy: -8 }
      ]
    }
  ]
}
```

## Integration

### Full Event Processing
```typescript
import { processPhaseEvents, initializeEventSystem } from '@/lib/game/eventIntegration';

// Initialize
const eventState = initializeEventSystem();

// Process all events for a phase
const result = processPhaseEvents(
  'teaching',
  students,
  currentDay,
  'normal',
  eventState,
  'fall'
);

// Result includes:
// - updatedStudents: Students with all effects applied
// - events: All events that occurred
// - consequences: New consequences issued
// - rewards: New rewards given
// - notifications: UI notifications
```

### Event State Tracking
```typescript
export interface EventSystemState {
  activeConsequences: Consequence[];
  activeRewards: Reward[];
  behaviorHistory: BehaviorEvent[];
  parentEventLog: any[];
  specialEventLog: any[];
}
```

## Behavior Scenarios

### 1. Class Clown Disruption
```
Event: "Alex is making jokes and disrupting the lesson"
Type: disruption (high severity)
→ Issues detention
→ Student mood: -2
→ Engagement: -10
→ Behavior modifier: +15 (deterrent effect)
```

### 2. Perfectionist Stress
```
Event: "Sarah is visibly stressed about not meeting standards"
Type: stress (high severity)
→ Mood: -2, Stress: +20, Energy: -10
→ Teacher can:
  - Provide reassurance
  - Adjust expectations
  - Connect with counselor
```

### 3. Shy Student Breakthrough
```
Event: "Timmy voluntarily participates - a huge step!"
Type: breakthrough
→ Social skills: +8
→ Mood: +2
→ Engagement: +10
→ Issues reward (praise)
```

### 4. Social Butterfly Drama
```
Event: "Jessica is spreading gossip during class"
Type: social (high severity)
→ Engagement: -10
→ Social skills: -3
→ May trigger consequence if repeated
```

## Parent Event Scenarios

### 1. Academic Concern
```
Trigger: Student academic level < 40
Urgency: High
Response Options:
- Professional detailed response (+15 parent satisfaction, -10 energy)
- Empathetic + meeting (+20 satisfaction, -15 energy, +1 student mood)
- Collaborative action plan (+25 satisfaction, -20 energy)
```

### 2. Behavior Concern
```
Trigger: Student has 3+ behavior incidents
Tone: Questioning
→ Parent wants details
→ Teacher must explain approach
→ Affects reputation and parent relationship
```

### 3. Appreciation Email
```
Trigger: Student academic level > 80 OR 3+ positive notes
Effect: +5 teacher energy (morale boost!)
→ Optional gracious reply (+10 parent satisfaction)
```

## Special Event Scenarios

### 1. Fire Drill
```
Disrupts lesson plan
Class energy: -10, engagement: -15

Teacher choices:
- Stay calm and efficient (best practice)
- Make it a teachable moment (+learning, -more time)
- Rush through it (quick but stressful)
```

### 2. Class Pet Escape
```
High engagement disruption
Creates exciting problem-solving opportunity

Choices:
- Organize systematic search (leadership)
- Set trap and continue (practical)
- Turn into detective game (creative, +learning)
```

### 3. Substitute Teacher Day
```
Teacher gets rest (+50 energy)
Class loses engagement (-20)

Preparation matters:
- Detailed plans: Better class outcome, more prep time
- Basic plans: Medium outcome
- Movie day: Happy class, less learning
```

## Game Balance

### Difficulty Scaling
- **Easy**: 0.5x event frequency, fewer consequences
- **Normal**: 1.0x baseline
- **Hard**: 1.5x event frequency, more parent emails

### Consequence Escalation
Prevents spam while maintaining impact:
- Warnings for first incidents
- Detention after pattern forms
- Parent contact for serious/repeated issues
- Probation system for chronic problems

### Reward Balance
Rewards are rarer than consequences:
- 8-15% chance for various achievements
- Multiple reward types prevent repetition
- Positive reinforcement without diminishing impact

## UI Integration Suggestions

### 1. Behavior Event Notifications
```typescript
// Show floating notification
"🎭 Class Clown Behavior: Alex is making jokes..."

// With action buttons
[Redirect] [Warning] [Special Task]
```

### 2. Parent Email Interface
```typescript
// Email inbox view
📧 New Email from Mrs. Johnson
Subject: Concerned about Emma's Progress
Urgency: ⚠️ High

[Read Email] [Respond]
```

### 3. Consequence Tracking
```typescript
// Student profile
⚠️ Warnings: 2
🚫 Detentions: 1
📞 Parent Contacts: 0

Behavior Trend: ↗️ Improving
```

### 4. Special Event Cards
```typescript
// Large modal card
🚨 FIRE DRILL
The alarm has sounded! Time to evacuate.

Current lesson will be interrupted.
This will test your classroom management.

[Choose Response]
```

## Best Practices

### 1. Event Timing
- Check parent events at end of day only
- Special events can happen any phase
- Behavior events check every turn
- Consequences evaluate after behavior events

### 2. State Management
- Track all consequences/rewards in EventSystemState
- Maintain behavior history for trend analysis
- Log parent interactions for relationship tracking

### 3. Student Impact
- Apply multiple effects atomically
- Update mood, engagement, stress together
- Track cumulative effects over time

### 4. Teacher Feedback
- Notifications for important events
- Summary reports at day end
- Trend indicators for intervention needs

## Future Enhancements

### Potential Additions
1. **Field Trip Events**: Permission slips, bus drama, learning opportunities
2. **School Assembly**: Schedule disruptions, inspiration moments
3. **Report Card Period**: Stress, parent conferences, grade calculations
4. **Student Transfers**: New students, departing students
5. **Peer Mediation**: Student-led conflict resolution
6. **Classroom Jobs**: Responsibility system, leadership opportunities
7. **Parent Volunteers**: Classroom helpers, cultural sharing
8. **School Counselor**: Intervention support, IEP meetings

### Data Tracking
1. **Behavior Analytics**: Pattern recognition, early warning system
2. **Parent Relationship Score**: Track satisfaction over time
3. **Consequence Effectiveness**: Track behavior improvement rates
4. **Reward Impact Analysis**: Measure motivation changes

---

## Quick Reference

### Import Paths
```typescript
// Behaviors
import { generatePersonalityBehaviors, applyBehaviorEffects, calculateStressLevel } from '@/lib/students/advancedBehavior';

// Parent Events
import { checkForParentEvents } from '@/data/parentEvents';

// Consequences
import { shouldIssueConsequence, issueConsequence, applyConsequence, shouldIssueReward, issueReward, applyReward } from '@/lib/game/consequences';

// Special Events
import { checkForSpecialEvents } from '@/data/specialEvents';

// Integration
import { processPhaseEvents, initializeEventSystem } from '@/lib/game/eventIntegration';
```

### Key Functions
- `generatePersonalityBehaviors(student)` - Get behavior events
- `checkForParentEvents(students, day, difficulty)` - Get parent events
- `checkForSpecialEvents(day, difficulty, season)` - Get special events
- `processPhaseEvents(...)` - Process all events at once
- `issueConsequence(student, type, severity, reason)` - Create consequence
- `issueReward(student, type, reason)` - Create reward

---

**Version**: 1.0
**Last Updated**: 2026-01-01
**Compatibility**: Next.js 16.1.1, TypeScript 5.x
