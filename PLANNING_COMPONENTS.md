# Lesson Planning Dashboard Components - Technical Documentation

## Overview

The Lesson Planning Dashboard provides a comprehensive system for teachers to create, manage, and schedule lesson plans. It consists of reusable form and display components built with React, TypeScript, Tailwind CSS, and shadcn UI.

## File Structure

```
src/
├── components/planning/
│   ├── ObjectivesEditor.tsx       # Form component for learning objectives
│   ├── MaterialsList.tsx           # Form component for lesson materials
│   ├── DurationValidator.tsx       # Display component for time validation
│   ├── LessonPlanCard.tsx          # Display card for lesson plans
│   ├── TemplateGallery.tsx         # Display component for templates
│   └── index.ts                    # Barrel export
├── app/planning/
│   └── page.tsx                    # Main planning dashboard page
└── components/ui/
    └── checkbox.tsx                # Custom checkbox component
```

## Components

### 1. ObjectivesEditor.tsx

A form component for managing learning objectives in lesson plans.

**Props:**
```typescript
interface ObjectivesEditorProps {
  objectives: Objective[];
  onObjectivesChange: (objectives: Objective[]) => void;
}

interface Objective {
  id: string;
  text: string;
  standard?: string;
}
```

**Features:**
- Numbered list display (1, 2, 3...)
- Text input for objective description
- Dropdown for learning standards (CCSS, NGSS)
- Add/delete functionality
- Empty state with helpful message

**Usage:**
```typescript
const [objectives, setObjectives] = useState<Objective[]>([]);

<ObjectivesEditor
  objectives={objectives}
  onObjectivesChange={setObjectives}
/>
```

**Styling:**
- Uses Tailwind for responsive layout
- Color-coded list numbers with primary color
- Hover effects on items
- Focus states on inputs

---

### 2. MaterialsList.tsx

A form component for managing lesson materials with checklist functionality.

**Props:**
```typescript
interface MaterialsListProps {
  materials: Material[];
  onMaterialsChange: (materials: Material[]) => void;
}

interface Material {
  id: string;
  name: string;
  quantity: number;
  type: 'consumable' | 'reusable' | 'tech' | 'handout';
  checked: boolean;
}
```

**Features:**
- Checklist with progress tracking
- Material name, quantity, and type inputs
- Color-coded type badges
- Summary bar showing prep progress
- Add/delete functionality
- Responsive grid layout for inputs

**Type Colors:**
- Consumable: Blue
- Reusable: Green
- Technology: Purple
- Handout: Amber

**Usage:**
```typescript
const [materials, setMaterials] = useState<Material[]>([]);

<MaterialsList
  materials={materials}
  onMaterialsChange={setMaterials}
/>
```

---

### 3. DurationValidator.tsx

A display component showing lesson duration validation against a time block.

**Props:**
```typescript
interface DurationValidatorProps {
  actualDuration: number;     // in minutes
  targetDuration?: number;    // defaults to 45
  lessonName?: string;
}
```

**Features:**
- Progress bar with smooth transitions
- Percentage calculation
- Status-based color coding:
  - Green: Fits perfectly (actualDuration <= targetDuration * 0.9)
  - Amber: Tight timing (actualDuration > 0.9 * target && <= target)
  - Red: Too long (actualDuration > targetDuration)
- Detailed status alerts with icons
- Timing tips section

**Status Messages:**
- Good: "Perfect! Fits within the 45-minute block with X minutes to spare."
- Warning: "This fits the block, but with only X minutes remaining. Tight timing!"
- Error: "This lesson runs X minutes over the 45-minute block."

**Usage:**
```typescript
<DurationValidator
  actualDuration={formState.duration}
  targetDuration={45}
  lessonName={formState.name}
/>
```

---

### 4. LessonPlanCard.tsx

A display card component for showing lesson plans in a grid layout.

**Props:**
```typescript
interface LessonPlanCardProps {
  plan: LessonPlan;
  onEdit?: (plan: LessonPlan) => void;
  onDuplicate?: (plan: LessonPlan) => void;
  onDelete?: (id: string) => void;
  onSchedule?: (plan: LessonPlan) => void;
}

interface LessonPlan {
  id: string;
  name: string;
  subject: 'math' | 'reading' | 'science' | 'social-studies' | 'art' | 'pe';
  duration: number;
  activities: number;
  teachingMethod: string;
  description?: string;
}
```

**Features:**
- Subject icon with emoji
- Subject color border with hover effects
- Plan name and teaching method
- Quick stats grid:
  - Duration (clock icon)
  - Activity count (book icon)
  - Engagement level (zap icon)
- Action buttons (Edit, Schedule)
- Dropdown menu (Edit, Duplicate, Schedule, Delete)
- Tooltip support

**Subject Icons:**
- Math: 🔢
- Reading: 📚
- Science: 🔬
- Social Studies: 🌍
- Art: 🎨
- PE: ⚽

**Usage:**
```typescript
<LessonPlanCard
  plan={lessonPlan}
  onEdit={handleEdit}
  onDuplicate={handleDuplicate}
  onDelete={handleDelete}
  onSchedule={handleSchedule}
/>
```

---

### 5. TemplateGallery.tsx

A display component showing a gallery of pre-built lesson templates.

**Props:**
```typescript
interface TemplateGalleryProps {
  templates: Template[];
  onUseTemplate?: (template: Template) => void;
}

interface Template {
  id: string;
  name: string;
  subject: 'math' | 'reading' | 'science' | 'social-studies' | 'art' | 'pe';
  description: string;
  duration: number;
  activities: number;
  difficulty: 1 | 2 | 3;
}
```

**Features:**
- Subject filter buttons
- Responsive grid of template cards
- Template cards display:
  - Subject icon
  - Difficulty badge (Beginner, Intermediate, Advanced)
  - Duration and activity count
  - Description
  - "Use Template" button
- Empty state with filter reset option

**Difficulty Badges:**
- 1 (Beginner): Green
- 2 (Intermediate): Blue
- 3 (Advanced): Red

**Usage:**
```typescript
<TemplateGallery
  templates={mockTemplates}
  onUseTemplate={handleUseTemplate}
/>
```

---

### 6. Planning Dashboard Page (page.tsx)

The main dashboard page that orchestrates all planning components.

**Location:** `/src/app/planning/page.tsx`

**Features:**
- 4 tabbed sections
- Responsive layout with MainLayout
- State management for lesson forms
- Integration of all planning components

**Tab 1: Create New**
- Full form with basic information section
- ObjectivesEditor component
- MaterialsList component
- DurationValidator sidebar
- Create/Reset buttons
- Teaching method selector
- Subject selector

**Tab 2: My Plans**
- Stats cards for:
  - Total lesson plans
  - Math plans count
  - Average duration
  - Available templates
- Grid of LessonPlanCard components
- Delete functionality
- Edit/Schedule action buttons

**Tab 3: Templates**
- TemplateGallery component
- Pre-built template selection
- Auto-populate form when template is used

**Tab 4: Schedule**
- Placeholder for calendar integration
- Placeholder for drag-and-drop scheduling

**State:**
```typescript
interface CreateFormState {
  name: string;
  subject: LessonPlan['subject'];
  teachingMethod: string;
  duration: number;
  objectives: Objective[];
  materials: Material[];
}
```

---

### 7. Checkbox Component

Custom accessible checkbox using Radix UI.

**Location:** `/src/components/ui/checkbox.tsx`

**Features:**
- Accessible with keyboard support
- Check icon from Lucide
- Focus and disabled states
- Dark mode support

**Usage:**
```typescript
<Checkbox
  checked={checked}
  onCheckedChange={setChecked}
/>
```

---

## Styling Patterns

### Responsive Grid Layouts

```typescript
// Default: stacked on mobile, 2 columns on tablet, 3 on desktop
className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
```

### Subject Color System

Each subject has consistent colors across components:

```typescript
const SUBJECT_COLORS: Record<Subject, string> = {
  math: 'border-blue-300 dark:border-blue-700 hover:border-blue-400',
  reading: 'border-purple-300 dark:border-purple-700 hover:border-purple-400',
  science: 'border-green-300 dark:border-green-700 hover:border-green-400',
  'social-studies': 'border-amber-300 dark:border-amber-700 hover:border-amber-400',
  art: 'border-pink-300 dark:border-pink-700 hover:border-pink-400',
  pe: 'border-orange-300 dark:border-orange-700 hover:border-orange-400',
};
```

### Dark Mode Support

All components support dark mode with Tailwind's `dark:` prefix:

```typescript
className="bg-white dark:bg-slate-950 text-black dark:text-white"
```

---

## Accessibility Features

### Keyboard Navigation
- All buttons are keyboard focusable
- Tab order is logical
- Enter/Space to activate buttons

### Screen Readers
- ARIA labels on interactive elements
- `sr-only` class for screen reader only content
- Semantic HTML structure

### Color Contrast
- Text: 4.5:1 minimum contrast ratio
- Large text: 3:1 minimum contrast ratio
- Icons have fallback text labels

### Touch Targets
- Minimum 44x44px for touch targets
- Adequate spacing between interactive elements

---

## Type Safety

All components are fully typed with TypeScript:

```typescript
// Component exports include interfaces
export { ObjectivesEditor, type Objective };
export { MaterialsList, type Material };
export { LessonPlanCard, type LessonPlan };
export { TemplateGallery, type Template };
```

---

## Component Integration

### In Your App

Import and use planning components:

```typescript
import {
  ObjectivesEditor,
  MaterialsList,
  DurationValidator,
  LessonPlanCard,
  TemplateGallery,
  type Objective,
  type Material,
  type LessonPlan,
  type Template,
} from '@/components/planning';
```

### Main Planning Page

The main planning page is accessible at `/planning` route and provides the complete lesson planning experience with all components integrated.

---

## Customization

### Changing Default Duration

Edit DurationValidator:
```typescript
<DurationValidator
  actualDuration={duration}
  targetDuration={50}  // Change from 45 to 50 minutes
/>
```

### Adding More Standards

Edit ObjectivesEditor STANDARDS array:
```typescript
const STANDARDS = [
  'CCSS.MATH.5.NBT.A.1',
  'YOUR.CUSTOM.STANDARD',
  // Add more...
];
```

### Adding More Material Types

Edit MaterialsList MATERIAL_TYPES:
```typescript
const MATERIAL_TYPES: Record<Material['type'], ...> = {
  consumable: { ... },
  reusable: { ... },
  tech: { ... },
  handout: { ... },
  custom: { ... },  // Add new type
};
```

---

## Performance Considerations

- Components use React hooks efficiently
- No unnecessary re-renders with proper memo usage
- Event handlers use useCallback where needed
- Large lists could benefit from virtualization for 100+ items

---

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

---

## Dependencies

- React 18+
- TypeScript 5+
- Tailwind CSS 3+
- shadcn/ui components
- Lucide React (icons)
- Radix UI primitives

---

## Future Enhancements

1. **Persistence**: Add localStorage or database storage
2. **Export**: PDF/Word export functionality
3. **Sharing**: Share lesson plans with colleagues
4. **Templates**: Admin ability to create custom templates
5. **Collaboration**: Real-time collaborative planning
6. **Analytics**: Track which lessons are effective
7. **Reminders**: Setup notifications for lesson prep
8. **Integration**: Sync with school calendar systems
