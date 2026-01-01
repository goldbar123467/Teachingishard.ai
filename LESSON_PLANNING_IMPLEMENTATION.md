# Lesson Planning Dashboard Implementation

## Summary

Built the complete data layer and core components for the Lesson Planning Dashboard feature. This enables teachers to create, manage, and sequence custom lesson plans with drag-and-drop activity organization.

## Phase 1: Data Layer ✓

### 1. `/src/lib/game/lessonPlan.ts`
**Types:**
- `LessonPlan` - Main lesson plan structure
- `LessonActivity` - Individual activity within a lesson
- `LearningObjective` - Learning goals for the lesson
- `LessonMaterial` - Required materials/supplies
- `LessonPhase` - intro/main/closing phases
- `GroupingType` - individual/pairs/small-group/whole-class
- `TeachingMethodType` - Six teaching methods

**Constants:**
- `SUBJECT_COLORS` - Color schemes for each subject
- `SUBJECT_ICONS` - Emoji icons for subjects
- `SUBJECT_LABELS` - Display names
- `PHASE_LABELS` - Phase display names
- `GROUPING_LABELS` - Grouping display names
- `METHOD_LABELS` - Teaching method display names

**Helper Functions:**
- `validateLessonFit()` - Validates lesson against time block
- `calculateTotalDuration()` - Sums activity durations
- `groupActivitiesByPhase()` - Organizes activities by phase
- `reorderActivities()` - Handles drag-drop reordering
- `createEmptyLessonPlan()` - Factory for new plans
- `duplicateLessonPlan()` - Clones existing plans

### 2. `/src/data/activities.ts`
**Pre-built Activity Library (20+ activities):**

**Math (6 activities):**
- Number Talk, Guided Practice, Math Stations
- Problem Solving, Math Games, Exit Ticket

**Reading (6 activities):**
- Read Aloud, Guided Reading, Independent Reading
- Literature Circles, Vocabulary Building, Share Out

**Science (6 activities):**
- Science Experiment, Lab Work, Research
- Observation, Discussion, Conclusion

**Social Studies (6 activities):**
- Map Skills, Timeline, Research
- Debate, Group Discussion, Reflection

**Art (5 activities):**
- Drawing, Painting, Sculpture
- Art Appreciation, Gallery Walk

**PE (5 activities):**
- Warm Up, Team Game, Skill Practice
- Cool Down, Fitness Challenge

**Exports:**
- `ACTIVITIES_BY_SUBJECT` - Organized by subject
- `getActivitiesForSubject()` - Lookup helper
- `getActivityById()` - ID lookup

### 3. `/src/data/lesson-templates.ts`
**10 Complete Lesson Templates:**

**Math:**
- Introduction to Fractions (45 min)
- Word Problems Workshop (60 min)

**Reading:**
- Poetry Analysis (45 min)
- Comprehension Skills (50 min)

**Science:**
- Ecosystems Investigation (60 min)
- States of Matter (45 min)

**Social Studies:**
- US Geography (45 min)
- Government Branches (50 min)

**Art:**
- Perspective Drawing (45 min)

**PE:**
- Teamwork Games (45 min)

Each template includes:
- Complete objectives (3-4 per lesson)
- Materials list with quantities
- Sequenced activities with durations
- Proper phase distribution (intro/main/closing)

**Exports:**
- `LESSON_TEMPLATES` - All templates
- `getTemplatesBySubject()` - Filter by subject
- `getTemplateById()` - ID lookup

### 4. `/src/lib/game/types.ts` Updates
**Added:**
- Re-export of lesson plan types
- `lessonPlans: LessonPlan[]` to GameState
- Five new action types:
  - `CREATE_LESSON_PLAN`
  - `UPDATE_LESSON_PLAN`
  - `DELETE_LESSON_PLAN`
  - `DUPLICATE_LESSON_PLAN`
  - `ASSIGN_PLAN_TO_BLOCK`

### 5. `/src/lib/game/reducer.ts` Updates
**Added:**
- Import `duplicateLessonPlan` helper
- Initialize `lessonPlans: []` in createInitialState
- Five reducer cases for lesson plan actions:
  - CREATE: Adds plan to array
  - UPDATE: Updates existing plan
  - DELETE: Removes plan by ID
  - DUPLICATE: Clones plan with new ID
  - ASSIGN: Links plan to time block via lessonId

## Phase 2: Core Components ✓

### 6. `/src/components/planning/ActivitySequencer.tsx`
**Drag-and-Drop Activity Organizer**

**Features:**
- Uses @dnd-kit for smooth drag-drop
- Three phase sections (intro/main/closing)
- Phase duration totals
- Add activity buttons per phase
- Empty state prompts
- Vertical list sorting strategy

**Props:**
- `activities` - Full activity list
- `subject` - For color coding
- `onReorder` - Callback for drag-drop
- `onAddActivity` - Phase-specific adding
- `onEditActivity` - Edit handler
- `onDeleteActivity` - Delete handler

**Implementation:**
- PointerSensor with 8px activation distance
- Closest center collision detection
- Grouped by phase with individual sortable contexts
- Auto-reorder with proper index calculation

### 7. `/src/components/planning/ActivityCard.tsx`
**Individual Activity Display**

**Visual Elements:**
- Drag handle (GripVertical icon)
- Activity name and duration badge
- Phase badge (subject-colored)
- Grouping badge
- Materials count indicator
- Edit/delete action buttons

**Props:**
- `activity` - Activity data
- `subject` - For color theming
- `onEdit` - Optional edit callback
- `onDelete` - Optional delete callback

**Features:**
- useSortable hook integration
- CSS transform animations
- Drag state styling (opacity, ring, shadow)
- Subject color coding from constants
- Accessible action buttons with sr-only labels

### 8. `/src/components/planning/LessonPlanBuilder.tsx`
**Main Lesson Plan Editor**

**Sections:**
1. **Header**
   - Edit/Create title
   - Cancel/Save buttons

2. **Basic Info**
   - Lesson name input
   - Subject select (with icons)
   - Duration input (15-180 min)
   - Teaching method select

3. **Duration Validator**
   - Shows planned vs block duration
   - Error messages (red)
   - Warning messages (amber)
   - Success indicator (green)
   - Uses `validateLessonFit()` helper

4. **Learning Objectives**
   - Add objective input + button
   - Numbered list display
   - Delete per objective
   - Enter key support

5. **Materials**
   - Add material input + button
   - Badge-style display
   - Quantity display support
   - Delete per material
   - Enter key support

6. **Activities**
   - Embedded ActivitySequencer
   - Full drag-drop support
   - Add/Edit/Delete handlers
   - Phase organization

**State Management:**
- Local state for plan editing
- Separate inputs for objectives/materials
- Auto-updates updatedAt timestamp
- Validates on save

**Props:**
- `lessonPlan` - Initial plan data
- `blockDuration` - Optional for validation
- `onSave` - Save callback
- `onCancel` - Cancel callback

### 9. `/src/components/ui/label.tsx`
**Added Missing Shadcn Component**
- Radix UI Label primitive
- Class variance authority integration
- Proper accessibility support
- Installed `@radix-ui/react-label` dependency

### 10. `/src/components/planning/index.ts`
**Barrel Export**
- Exports all three planning components
- Simplifies imports for consumers

## Architecture Patterns

### Subject Color System
Consistent color coding across all components:
- Math: blue-500
- Reading: purple-500
- Science: green-500
- Social Studies: amber-500
- Art: pink-500
- PE: orange-500

### Activity Organization
Three-phase structure:
- **Intro** - Hook, preview, activate prior knowledge
- **Main** - Core instruction, practice, application
- **Closing** - Review, assessment, reflection

### Grouping Types
Four collaboration patterns:
- Individual - Independent work
- Pairs - Partner activities
- Small Group - 3-5 students
- Whole Class - Everyone together

### Teaching Methods
Six research-based approaches:
- Direct Instruction - Teacher-led explicit teaching
- Guided Practice - Scaffolded student practice
- Collaborative Learning - Group work and discussion
- Inquiry-Based - Student-driven investigation
- Differentiated - Tailored to student needs
- Hands-On - Manipulatives and experiments

## Integration Points

### Game State
- `state.lessonPlans` - Array of all created plans
- Time blocks can reference plans via `lessonId`

### Game Actions
- Dispatch CREATE/UPDATE/DELETE for CRUD operations
- DUPLICATE for quick plan variations
- ASSIGN to link plans to schedule blocks

### Validation
- Duration fit checking
- Phase coverage warnings
- Materials requirements
- Objective presence

## Next Steps

### To Complete MVP:
1. **Activity Picker Modal** - Browse/search activity library
2. **Activity Editor Modal** - Create custom activities
3. **Template Browser** - Pick and customize templates
4. **Plan List View** - Browse all saved plans
5. **Schedule Integration** - Assign plans to time blocks
6. **Plan Preview** - Read-only plan display

### Future Enhancements:
- Print-friendly lesson plan format
- Export to PDF/Word
- Share plans with other teachers (multiplayer)
- Standards alignment tagging
- Differentiation notes per activity
- Student work samples upload
- Reflection/notes after teaching

## File Structure

```
src/
├── lib/game/
│   ├── lessonPlan.ts          # Core types and helpers
│   ├── types.ts               # Updated with lesson types
│   └── reducer.ts             # Updated with actions
├── data/
│   ├── activities.ts          # 20+ pre-built activities
│   └── lesson-templates.ts    # 10 complete templates
└── components/
    ├── ui/
    │   └── label.tsx          # Added shadcn component
    └── planning/
        ├── ActivityCard.tsx        # Individual activity display
        ├── ActivitySequencer.tsx   # Drag-drop organizer
        ├── LessonPlanBuilder.tsx   # Main editor
        └── index.ts                # Barrel export
```

## Dependencies Added
- `@radix-ui/react-label` - For Label component
- Existing: `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`

## Build Status
✓ TypeScript compilation successful
✓ No ESLint errors
✓ All components properly typed
✓ Build output verified
