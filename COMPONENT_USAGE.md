# Lesson Planning Components - Usage Guide

## Quick Start

```tsx
import { LessonPlanBuilder } from '@/components/planning';
import { createEmptyLessonPlan } from '@/lib/game/lessonPlan';

function PlanningPage() {
  const [plan, setPlan] = useState(createEmptyLessonPlan('math'));

  return (
    <LessonPlanBuilder
      lessonPlan={plan}
      blockDuration={45}
      onSave={(updatedPlan) => {
        // Dispatch CREATE_LESSON_PLAN action
        console.log('Save plan:', updatedPlan);
      }}
      onCancel={() => {
        // Navigate back or close modal
      }}
    />
  );
}
```

## Component Hierarchy

```
LessonPlanBuilder
├── Card (Header)
│   ├── Input (Name)
│   ├── Select (Subject)
│   ├── Input (Duration)
│   └── Select (Teaching Method)
├── Card (Objectives)
│   └── List of objectives
├── Card (Materials)
│   └── Badge list
└── Card (Activities)
    └── ActivitySequencer
        ├── Card (Intro Phase)
        │   └── ActivityCard[]
        ├── Card (Main Phase)
        │   └── ActivityCard[]
        └── Card (Closing Phase)
            └── ActivityCard[]
```

## Using with Game State

### Creating a New Plan

```tsx
import { useGameContext } from '@/contexts/GameContext';
import { createEmptyLessonPlan } from '@/lib/game/lessonPlan';

function NewPlanButton() {
  const { dispatch } = useGameContext();

  const handleCreate = () => {
    const newPlan = createEmptyLessonPlan('math');
    newPlan.name = 'My New Lesson';
    
    dispatch({
      type: 'CREATE_LESSON_PLAN',
      payload: newPlan,
    });
  };

  return <Button onClick={handleCreate}>New Plan</Button>;
}
```

### Updating an Existing Plan

```tsx
function EditPlanModal({ planId }: { planId: string }) {
  const { state, dispatch } = useGameContext();
  const plan = state.lessonPlans.find(p => p.id === planId);

  if (!plan) return null;

  return (
    <LessonPlanBuilder
      lessonPlan={plan}
      onSave={(updatedPlan) => {
        dispatch({
          type: 'UPDATE_LESSON_PLAN',
          payload: updatedPlan,
        });
      }}
      onCancel={() => {
        // Close modal
      }}
    />
  );
}
```

### Duplicating a Plan

```tsx
function PlanListItem({ planId }: { planId: string }) {
  const { dispatch } = useGameContext();

  const handleDuplicate = () => {
    dispatch({
      type: 'DUPLICATE_LESSON_PLAN',
      payload: { planId },
    });
  };

  return (
    <Button onClick={handleDuplicate}>
      Duplicate Plan
    </Button>
  );
}
```

### Assigning to Schedule

```tsx
function ScheduleBlock({ blockId }: { blockId: string }) {
  const { state, dispatch } = useGameContext();

  const handleAssign = (planId: string) => {
    dispatch({
      type: 'ASSIGN_PLAN_TO_BLOCK',
      payload: { planId, blockId },
    });
  };

  return (
    <Select onValueChange={handleAssign}>
      <SelectTrigger>
        <SelectValue placeholder="Select lesson plan" />
      </SelectTrigger>
      <SelectContent>
        {state.lessonPlans.map(plan => (
          <SelectItem key={plan.id} value={plan.id}>
            {plan.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
```

## Using Pre-built Templates

```tsx
import { LESSON_TEMPLATES, getTemplatesBySubject } from '@/data/lesson-templates';
import { duplicateLessonPlan } from '@/lib/game/lessonPlan';

function TemplateGallery() {
  const { dispatch } = useGameContext();
  const mathTemplates = getTemplatesBySubject('math');

  const handleUseTemplate = (template: LessonPlan) => {
    // Duplicate to get fresh IDs
    const newPlan = duplicateLessonPlan(template);
    
    dispatch({
      type: 'CREATE_LESSON_PLAN',
      payload: newPlan,
    });
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      {mathTemplates.map(template => (
        <Card key={template.id}>
          <CardHeader>
            <CardTitle>{template.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={() => handleUseTemplate(template)}>
              Use Template
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
```

## Using Activity Library

```tsx
import { getActivitiesForSubject } from '@/data/activities';

function ActivityPicker({ subject, onSelect }: {
  subject: Lesson['subject'];
  onSelect: (activity: LessonActivity) => void;
}) {
  const activities = getActivitiesForSubject(subject);

  return (
    <div className="space-y-2">
      {activities.map(activity => (
        <ActivityCard
          key={activity.id}
          activity={activity}
          subject={subject}
          onEdit={() => {
            // Clone and customize
            const customActivity = { ...activity, id: crypto.randomUUID() };
            onSelect(customActivity);
          }}
        />
      ))}
    </div>
  );
}
```

## Validation Examples

### Check if Plan Fits Block

```tsx
import { validateLessonFit, calculateTotalDuration } from '@/lib/game/lessonPlan';

function DurationCheck({ plan, blockDuration }: {
  plan: LessonPlan;
  blockDuration: number;
}) {
  const validation = validateLessonFit(plan, blockDuration);
  const total = calculateTotalDuration(plan);

  return (
    <div>
      <p>Total: {total} min / {blockDuration} min</p>
      
      {!validation.isValid && (
        <Alert variant="destructive">
          {validation.errors.map((err, i) => (
            <p key={i}>{err}</p>
          ))}
        </Alert>
      )}

      {validation.warnings.length > 0 && (
        <Alert>
          {validation.warnings.map((warn, i) => (
            <p key={i}>{warn}</p>
          ))}
        </Alert>
      )}
    </div>
  );
}
```

## Styling Customization

### Subject Colors

The components automatically apply subject colors from `SUBJECT_COLORS`:

```tsx
// Defined in lessonPlan.ts
const SUBJECT_COLORS = {
  math: 'bg-blue-500 dark:bg-blue-600',
  reading: 'bg-purple-500 dark:bg-purple-600',
  science: 'bg-green-500 dark:bg-green-600',
  'social-studies': 'bg-amber-500 dark:bg-amber-600',
  art: 'bg-pink-500 dark:bg-pink-600',
  pe: 'bg-orange-500 dark:bg-orange-600',
};
```

To customize, override in your CSS:

```css
.activity-card.math {
  /* Custom math styling */
}

.activity-phase-group.intro {
  /* Custom intro phase styling */
}
```

## Accessibility

All components include:
- Semantic HTML structure
- ARIA labels where needed
- Keyboard navigation support
- Screen reader text (sr-only)
- Focus management for drag-drop

Example:
```tsx
<Button className="h-8 w-8 p-0">
  <Pencil className="h-4 w-4" />
  <span className="sr-only">Edit activity</span>
</Button>
```

## TypeScript Support

All components are fully typed:

```tsx
import type {
  LessonPlan,
  LessonActivity,
  LearningObjective,
  LessonMaterial,
  LessonPhase,
  GroupingType,
  TeachingMethodType,
} from '@/lib/game/lessonPlan';

// Type-safe callbacks
const handleSave = (plan: LessonPlan) => {
  // plan is fully typed
};

const handleReorder = (activities: LessonActivity[]) => {
  // activities array is typed
};
```

## Performance Considerations

### Drag-Drop Optimization

The ActivitySequencer uses:
- PointerSensor with activation constraint (8px distance)
- Prevents accidental drags on click
- Smooth animations via CSS transforms

### Memoization Opportunities

```tsx
import { useMemo } from 'react';

function OptimizedSequencer({ activities, ...props }) {
  const groupedActivities = useMemo(
    () => groupActivitiesByPhase(activities),
    [activities]
  );

  // Use groupedActivities instead of calculating each render
}
```

## Common Patterns

### Modal-Based Editor

```tsx
import { Dialog, DialogContent } from '@/components/ui/dialog';

function PlanEditorModal({ planId, open, onClose }) {
  const { state, dispatch } = useGameContext();
  const plan = state.lessonPlans.find(p => p.id === planId);

  if (!plan) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <LessonPlanBuilder
          lessonPlan={plan}
          onSave={(updated) => {
            dispatch({ type: 'UPDATE_LESSON_PLAN', payload: updated });
            onClose();
          }}
          onCancel={onClose}
        />
      </DialogContent>
    </Dialog>
  );
}
```

### Plan List with Actions

```tsx
function PlansList() {
  const { state, dispatch } = useGameContext();

  return (
    <div className="space-y-2">
      {state.lessonPlans.map(plan => (
        <Card key={plan.id}>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>{plan.name}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {SUBJECT_LABELS[plan.subject]} • {calculateTotalDuration(plan)} min
                </p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => {/* Edit */}}>Edit</Button>
                <Button size="sm" onClick={() => {
                  dispatch({ type: 'DUPLICATE_LESSON_PLAN', payload: { planId: plan.id } });
                }}>Duplicate</Button>
                <Button size="sm" variant="destructive" onClick={() => {
                  dispatch({ type: 'DELETE_LESSON_PLAN', payload: { planId: plan.id } });
                }}>Delete</Button>
              </div>
            </div>
          </CardHeader>
        </Card>
      ))}
    </div>
  );
}
```
