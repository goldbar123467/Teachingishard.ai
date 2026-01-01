# TEACHER_PHASE.md - Teacher Planning & Teaching Phase Expansion

## Mission
Expand the teacher planning and teaching phases to include realistic scheduling, lesson pivoting mechanics, and time management challenges.

---

## Feature 1: Daily Schedule System

### Time Blocks (Required)
| Subject | Min Duration | Notes |
|---------|--------------|-------|
| Reading/ELA | 90 mins | Core requirement |
| Math | 60 mins | Core requirement |
| Specials/Related Arts | 45 mins | Rotating: Art, Gym, Music, Library, STEM Lab |

### Schedule Data Model
```typescript
interface DailySchedule {
  blocks: TimeBlock[];
  totalMinutes: number; // Should equal ~360 mins (6 hour day)
}

interface TimeBlock {
  id: string;
  subject: SubjectType;
  startTime: string; // "8:30 AM"
  duration: number; // minutes
  lesson?: Lesson;
  status: 'planned' | 'in-progress' | 'completed' | 'skipped';
}

type SubjectType =
  | 'reading' | 'math' | 'science' | 'social-studies'
  | 'art' | 'gym' | 'music' | 'library' | 'stem-lab';

type SpecialType = 'art' | 'gym' | 'music' | 'library' | 'stem-lab';
```

### Specials Rotation
- Monday: Art
- Tuesday: Gym
- Wednesday: Music
- Thursday: Library
- Friday: STEM/Computer Lab

---

## Feature 2: Lesson Pivoting System

### Why Lessons Fail
1. **Student Disengagement** - Class average engagement drops below 30%
2. **Too Difficult** - >50% students confused/frustrated
3. **Too Easy** - Gifted students bored, others finish early
4. **Disruption** - Behavior event interrupts lesson
5. **Technical Issues** - Supplies missing, tech failure

### Pivot Mechanics
```typescript
interface LessonStatus {
  progress: number; // 0-100%
  engagement: number; // class average
  failureRisk: 'low' | 'medium' | 'high' | 'critical';
  canPivot: boolean;
  pivotOptions: PivotOption[];
}

interface PivotOption {
  id: string;
  name: string;
  description: string;
  energyCost: number; // teacher energy to pivot
  successChance: number; // 0-100%
  engagementBoost: number;
}
```

### Pivot Types
1. **Activity Switch** - Change from lecture to hands-on (low cost)
2. **Group Work** - Split into small groups (medium cost)
3. **Game-Based** - Turn lesson into competition (medium cost)
4. **One-on-One** - Focus on struggling students (high cost)
5. **Abandon Lesson** - Cut losses, move to next subject (emergency)

---

## Feature 3: Time Management

### Running Out of Time
- Warning at 10 mins remaining
- Choice: Rush through, skip content, or extend into next block
- Extending affects next subject's time

### Finishing Early
- Bonus time options:
  - Free reading (engagement boost)
  - Review game (academic boost)
  - Brain break (energy recovery)
  - Start next subject early

### Time Tracking
```typescript
interface TimeTracker {
  blockStartTime: Date;
  elapsedMinutes: number;
  remainingMinutes: number;
  pacing: 'behind' | 'on-track' | 'ahead';
  alerts: TimeAlert[];
}
```

---

## Feature 4: Navigation & UI

### New Navigation Tabs
```
[Dashboard] [Schedule] [Lesson Planning] [Teaching] [Students] [Reports]
```

### Schedule View
- Weekly calendar grid
- Drag-drop time blocks
- Color-coded by subject
- Conflict warnings

### Lesson Planning View
- Select subject/time block
- Choose lesson from library
- Set teaching method
- Preview student fit analysis

### Teaching Phase View
- Current lesson progress bar
- Real-time engagement meter
- Pivot button (when available)
- Time remaining display
- Quick student status cards

---

## Agent Assignments

### DarkRidge (Builder) - Use `sonnet`
Files to create/modify:
- `src/lib/game/schedule.ts` - Schedule types and logic
- `src/lib/game/lessonPivot.ts` - Pivot mechanics
- `src/lib/game/timeTracking.ts` - Time management
- `src/lib/game/types.ts` - Add new types
- `src/lib/game/reducer.ts` - Add schedule actions

### FuchsiaGlen (Styler) - Use `haiku`
Files to create/modify:
- `src/components/schedule/WeeklyCalendar.tsx` - Schedule grid
- `src/components/schedule/TimeBlock.tsx` - Draggable block
- `src/components/teaching/LessonProgress.tsx` - Progress bar + pivot
- `src/components/teaching/TimeTracker.tsx` - Countdown display
- `src/app/schedule/page.tsx` - Schedule route
- Update navigation tabs in layout

### SilentCompass (Tester) - Use `haiku`
- Test schedule validation (min times met)
- Test pivot mechanics
- Test time tracking
- Verify build passes

---

## Success Criteria
- [ ] Teachers must plan daily schedule before starting
- [ ] Reading block >= 90 mins, Math >= 60 mins, Specials = 45 mins
- [ ] Lessons can fail and trigger pivot options
- [ ] Time tracking shows pacing status
- [ ] Early finish and overtime have consequences
- [ ] Navigation includes Schedule and Lesson Planning tabs
- [ ] Build passes with zero errors

---

## Example Gameplay Flow

1. **Morning**: Teacher views schedule, assigns lessons to blocks
2. **Reading Block**: Start lesson, monitor engagement
3. **Lesson Failing**: Engagement drops, pivot options appear
4. **Pivot**: Choose "Group Work", spend energy, engagement recovers
5. **Time Warning**: 10 mins left, behind on content
6. **Decision**: Rush through or extend into math time
7. **Math Block**: Shortened due to reading overflow
8. **Specials**: Students go to Art (no teacher input needed)
9. **End of Day**: Review schedule adherence, plan tomorrow
