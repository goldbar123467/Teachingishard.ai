# Grading System and Enhanced Time Management

## Overview

This document describes the comprehensive grading system and enhanced time management features implemented for the teacher simulation game.

## 📚 Grading System

### Features

#### 1. Assignment Types
- **Homework**: Daily assignments with completion and effort tracking
- **Quiz**: Short assessments focusing on content knowledge
- **Test**: Comprehensive evaluations with multiple criteria
- **Project**: Long-term assignments with creativity and presentation
- **Participation**: Classroom engagement tracking
- **Presentation**: Student presentations with delivery evaluation
- **Classwork**: In-class work assignments

#### 2. Rubric-Based Grading
- Customizable grading criteria for each assignment
- Weighted scoring system
- Visual rubric interface for easy grading
- Auto-generated default rubrics for each assignment type

#### 3. Grade Calculation
- Letter grades (A+ through F)
- Percentage-based scoring
- Weighted category system
- Overall grade calculation with breakdown by category

#### 4. Gradebook Features
- Two view modes: By Student and By Assignment
- Grade distribution visualization
- Class average tracking
- Late submission tracking
- Assignment excusal system

### Implementation

#### Core Files

**`src/lib/game/grading.ts`**
- Complete grading logic and calculations
- Grade conversion algorithms
- Rubric generation
- Auto-grading based on student attributes

**`src/components/grading/Gradebook.tsx`**
- Full gradebook UI with filtering
- Student and assignment views
- Grade distribution charts
- Interactive grade cells

**`src/components/grading/AssignmentGrader.tsx`**
- Individual assignment grading interface
- Rubric-based scoring with sliders
- Manual points entry option
- Feedback template system

### Usage Examples

#### Creating an Assignment
```typescript
import { createDefaultRubric } from '@/lib/game/grading';

const assignment: Assignment = {
  id: crypto.randomUUID(),
  name: 'Math Quiz 1',
  type: 'quiz',
  subject: 'math',
  dueDate: '2024-01-15',
  assignedDate: '2024-01-10',
  maxPoints: 100,
  weight: 1.0,
  rubric: createDefaultRubric('quiz'),
  instructions: 'Complete problems 1-20',
  difficulty: 2,
};

dispatch({ type: 'CREATE_ASSIGNMENT', payload: assignment });
```

#### Auto-Grading Assignments
```typescript
// Auto-grade all students for an assignment
dispatch({
  type: 'AUTO_GRADE_ASSIGNMENTS',
  payload: { assignmentId: assignment.id }
});

// Auto-grade specific students
dispatch({
  type: 'AUTO_GRADE_ASSIGNMENTS',
  payload: {
    assignmentId: assignment.id,
    studentIds: ['student1', 'student2']
  }
});
```

#### Manual Grading
```typescript
const grade: StudentGrade = {
  id: crypto.randomUUID(),
  studentId: student.id,
  assignmentId: assignment.id,
  pointsEarned: 85,
  maxPoints: 100,
  percentageScore: 85,
  letterGrade: 'B',
  feedback: 'Good work! Review fraction concepts.',
  gradedDate: new Date().toISOString(),
  submitted: true,
  lateSubmission: false,
  excused: false,
};

dispatch({ type: 'GRADE_ASSIGNMENT', payload: grade });
```

### Auto-Grading Algorithm

The auto-grading system considers:
- Student academic level (base score)
- Assignment difficulty (±10-15%)
- Student personality traits (perfectionist +5%, distracted -10%)
- Current energy level (low energy -10%, high energy +5%)
- Student mood (upset -12%, excited +5%)
- Late submission penalty (-15%)

## ⏱️ Enhanced Time Management

### Features

#### 1. Pacing Modes

**Normal Mode**
- Standard teaching pace
- 100% content coverage
- 1.0x comprehension multiplier
- 1.0x energy drain

**Rushing Mode**
- Fast teaching pace to cover more ground
- 140% content coverage
- 0.65x comprehension multiplier (students understand less)
- 1.5x energy drain on teacher
- Students may become disengaged

**Deep Dive Mode**
- Slow, thorough exploration
- 60% content coverage (cover less but better)
- 1.5x comprehension multiplier (much better understanding)
- 1.3x energy drain
- Long-term academic benefits

#### 2. Time Pressure Events

Random events that disrupt lesson timing:
- **Fire Drill**: 15 minutes lost, cannot recover
- **Assembly**: 25 minutes lost, cannot recover
- **Tech Issue**: 8 minutes lost, can recover
- **Interruption**: 10 minutes lost, can recover
- **Early Dismissal**: 20 minutes lost, cannot recover

#### 3. Time Management Mechanics

**Rushing**
- Skip ahead when behind schedule
- Save time but lose comprehension
- Higher teacher stress
- Some students (perfectionist, analytical) hate it

**Deep Dive**
- Spend extra time on important topics
- Better retention and mastery
- Requires sufficient teacher energy
- Curious and analytical students love it

### Implementation

#### Core Files

**`src/lib/game/timeManagement.ts`**
- Pacing mode logic
- Rushing and deep dive calculations
- Time pressure event system
- Student personality interactions with pacing

### Usage Examples

#### Setting Pacing Mode
```typescript
// Switch to rushing mode
dispatch({
  type: 'SET_PACING_MODE',
  payload: { mode: 'rushing' }
});

// Return to normal pace
dispatch({
  type: 'SET_PACING_MODE',
  payload: { mode: 'normal' }
});
```

#### Applying Rushing
```typescript
// Rush to 100% completion
dispatch({
  type: 'APPLY_RUSHING',
  payload: { targetProgress: 100 }
});
```

#### Applying Deep Dive
```typescript
// Deep dive on a specific topic
dispatch({
  type: 'APPLY_DEEP_DIVE',
  payload: { topic: 'Photosynthesis' }
});
```

#### Triggering Time Pressure Events
```typescript
import {
  createTimePressureEvent,
  shouldTriggerTimePressure,
  selectRandomTimePressure
} from '@/lib/game/timeManagement';

// Check if event should occur
if (shouldTriggerTimePressure(difficulty, currentMinute)) {
  const eventType = selectRandomTimePressure();
  const event = createTimePressureEvent(eventType, currentMinute);

  dispatch({
    type: 'TRIGGER_TIME_PRESSURE',
    payload: event
  });
}
```

### Pacing Mode Effects on Students

Different student personalities react differently to pacing:

**Rushing Mode**
- Perfectionist: -40% engagement (hate rushing)
- Analytical: -40% engagement (need time to think)
- Distracted: +10% engagement (keeps pace better)

**Deep Dive Mode**
- Curious: +30% engagement (love depth)
- Analytical: +30% engagement (appreciate thoroughness)
- Distracted: -30% engagement (lose focus)

## 🎮 Game Integration

### State Management

The grading and time management systems are fully integrated into the game reducer:

```typescript
interface GameState {
  // ... existing state ...

  // Grading system
  gradebook: Gradebook;

  // Time management
  currentPacingMode: PacingMode;
  activePacingState: TimePacingState | null;
  activeTimePressure: TimePressureEvent | null;
}
```

### Action Types

**Grading Actions**
- `CREATE_ASSIGNMENT`
- `UPDATE_ASSIGNMENT`
- `DELETE_ASSIGNMENT`
- `GRADE_ASSIGNMENT`
- `UPDATE_GRADE`
- `AUTO_GRADE_ASSIGNMENTS`
- `UPDATE_GRADE_WEIGHTS`

**Time Management Actions**
- `SET_PACING_MODE`
- `APPLY_RUSHING`
- `APPLY_DEEP_DIVE`
- `TRIGGER_TIME_PRESSURE`
- `RESOLVE_TIME_PRESSURE`

## 📊 UI Components

### Gradebook Component

```tsx
<Gradebook
  gradebook={state.gradebook}
  students={state.students}
  onGradeClick={(studentId, assignmentId) => {
    // Open grader for specific student/assignment
  }}
  onAssignmentClick={(assignmentId) => {
    // View assignment details
  }}
/>
```

Features:
- Tabbed interface (By Student / By Assignment)
- Student filtering
- Assignment filtering
- Grade distribution visualization
- Category weight display

### AssignmentGrader Component

```tsx
<AssignmentGrader
  assignment={assignment}
  student={student}
  existingGrade={existingGrade}
  onSaveGrade={(grade) => {
    dispatch({ type: 'GRADE_ASSIGNMENT', payload: grade });
  }}
  onCancel={() => {
    // Close grader
  }}
/>
```

Features:
- Rubric-based scoring with sliders
- Manual points entry
- Feedback templates
- Late/excused status toggles
- Real-time grade calculation
- Visual progress indicators

## 🧪 Testing

To test the grading system:

1. Create assignments with different types
2. Auto-grade to see how student attributes affect scores
3. Manually grade using rubrics
4. View gradebook in both student and assignment modes
5. Check overall grade calculations

To test time management:

1. Start a lesson with time tracking
2. Switch between pacing modes
3. Trigger time pressure events
4. Apply rushing when behind schedule
5. Use deep dive when ahead
6. Observe different student reactions

## 🔄 Future Enhancements

### Grading
- Grade curve tool
- Standards-based grading
- Parent notification system
- Grade import/export
- Historical grade trends

### Time Management
- Adaptive pacing suggestions based on AI
- Time banking system (save time from one lesson to use later)
- Lesson replay/catch-up mechanics
- Student-specific time accommodations

## 📝 Notes

- All grading calculations are deterministic based on input
- Auto-grading includes randomness (±5%) for realism
- Time pressure events have weighted probabilities
- Pacing effects stack with teaching method effects
- Grade weights must total 100% for accurate calculations
