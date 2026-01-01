# Social Feed Dashboard Components - Usage Guide

## Overview

A complete Instagram-style social feed system for the TeacherSim classroom simulator. Four beautifully animated components with Tailwind CSS, Framer Motion, and full dark mode support.

---

## Components

### 1. StudentAvatar

Circular avatar with mood-based colored rings and emoji indicators.

```tsx
import { StudentAvatar } from '@/components/social/StudentAvatar';
import type { Student } from '@/lib/game/types';

export function MyComponent({ student }: { student: Student }) {
  return (
    <StudentAvatar
      student={student}
      size="md"
      showMood={true}
    />
  );
}
```

**Sizes:** `'sm'` (8x8) | `'md'` (12x12) | `'lg'` (16x16) | `'xl'` (24x24)

**Features:**
- Mood-based colored rings (green/happy, yellow/neutral, orange/frustrated, red/upset)
- Animated background glow
- Mood emoji badge (customizable)
- Initials fallback
- Responsive sizing

---

### 2. FeedPost

Individual social feed post card with Instagram styling.

```tsx
import { FeedPost, type FeedPostData } from '@/components/social/FeedPost';
import type { Student } from '@/lib/game/types';

interface MyProps {
  posts: FeedPostData[];
  students: Student[];
}

export function MyComponent({ posts, students }: MyProps) {
  return (
    <div className="space-y-3">
      {posts.map((post) => (
        <FeedPost
          key={post.id}
          post={post}
          students={students}
          onLike={(postId) => console.log('Liked:', postId)}
        />
      ))}
    </div>
  );
}
```

**Post Object:**

```ts
interface FeedPostData {
  id: string;
  type: 'interaction' | 'mood_change' | 'achievement' | 'drama' | 'teacher_action';
  author: string; // student ID or 'system'
  content: string;
  emoji: string; // e.g., '💬', '🏆', '⚡'
  timestamp: Date;
  participants: string[]; // student IDs involved
  sentiment: 'positive' | 'negative' | 'neutral' | 'dramatic';
  likes?: number;
}
```

**Features:**
- 4px left border with sentiment colors
- Pulsing glow for dramatic posts
- Author avatar + name + type badge
- Participant avatar stacking
- Like button with animation
- Reply/Share buttons
- Scroll-triggered fade-in

---

### 3. SocialFeed

Main scrollable feed container with filter tabs.

```tsx
import { SocialFeed } from '@/components/social/SocialFeed';
import type { Student } from '@/lib/game/types';

interface MyProps {
  posts: FeedPostData[];
  students: Student[];
}

export function Dashboard({ posts, students }: MyProps) {
  return (
    <SocialFeed
      posts={posts}
      students={students}
      onLike={(postId) => {
        // Handle like
      }}
      maxHeight="600px"
      emptyStateEmoji="🤐"
      emptyStateText="No posts yet. Check back later!"
    />
  );
}
```

**Filter Tabs:**
- **All** - Every post
- **Drama** - `sentiment='dramatic'` OR `type='drama'`
- **Friendships** - `sentiment='positive'` + interaction/achievement types
- **Academic** - `achievement` and `teacher_action` types

**Features:**
- Sticky filter tabs
- Staggered post animations
- Empty state with animated emoji
- Typing indicator at bottom
- Post count badge
- Smooth transitions with AnimatePresence

---

### 4. DramaAlert

Attention-grabbing alert for high-priority classroom events.

```tsx
import { DramaAlert, DramaAlertList, type DramaAlertData } from '@/components/social/DramaAlert';
import type { Student } from '@/lib/game/types';

// Single alert
export function Alert({ alert, students }: {
  alert: DramaAlertData;
  students: Student[];
}) {
  return (
    <DramaAlert
      alert={alert}
      students={students}
      onDismiss={(alertId) => console.log('Dismissed:', alertId)}
      onAction={(alertId) => console.log('Action taken:', alertId)}
    />
  );
}

// Multiple alerts
export function AlertPanel({ alerts, students }: {
  alerts: DramaAlertData[];
  students: Student[];
}) {
  return (
    <DramaAlertList
      alerts={alerts}
      students={students}
      onDismiss={(id) => {}}
      onAction={(id) => {}}
      maxHeight="300px"
    />
  );
}
```

**Alert Object:**

```ts
interface DramaAlertData {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  studentIds: string[];
  actionRequired?: boolean;
  onResolve?: () => void;
  timestamp: Date;
}
```

**Severity Levels:**
- **low** (blue) - Informational
- **medium** (yellow) - Caution
- **high** (orange) - Important
- **critical** (red) - Urgent

**Features:**
- Pulsing border animation (severity-color matched)
- Expandable details panel
- Animated icon + ALERT badge
- Student involvement with avatars/moods
- Optional "Take Action" button
- Auto-sorts by severity + timestamp

---

## Example: Complete Feed Page

```tsx
'use client';

import { useState } from 'react';
import { SocialFeed } from '@/components/social/SocialFeed';
import { DramaAlertList } from '@/components/social/DramaAlert';
import type { Student } from '@/lib/game/types';
import type { FeedPostData } from '@/components/social/FeedPost';
import type { DramaAlertData } from '@/components/social/DramaAlert';

export default function SocialPage({
  students,
  posts,
  alerts,
}: {
  students: Student[];
  posts: FeedPostData[];
  alerts: DramaAlertData[];
}) {
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(
    new Set()
  );

  const activeAlerts = alerts.filter((a) => !dismissedAlerts.has(a.id));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
      {/* Main feed (2 columns) */}
      <div className="lg:col-span-2">
        <SocialFeed posts={posts} students={students} maxHeight="800px" />
      </div>

      {/* Alerts sidebar (1 column) */}
      <div>
        <h2 className="font-bold mb-4">Drama Alerts</h2>
        <DramaAlertList
          alerts={activeAlerts}
          students={students}
          onDismiss={(id) => setDismissedAlerts((prev) => new Set([...prev, id]))}
          onAction={(id) => console.log('Take action on:', id)}
          maxHeight="800px"
        />
      </div>
    </div>
  );
}
```

---

## Styling Notes

### Tailwind Classes Used

```tsx
// Mood rings (StudentAvatar)
'ring-green-400 shadow-lg shadow-green-400/30'  // Happy
'ring-yellow-400 shadow-lg shadow-yellow-400/30' // Neutral
'ring-orange-500 shadow-lg shadow-orange-500/30' // Frustrated
'ring-red-500 shadow-lg shadow-red-500/30'       // Upset

// Post sentiment (FeedPost)
'border-l-green-500'     // Positive
'border-l-red-500'       // Negative
'border-l-slate-400'     // Neutral
'border-l-orange-500'    // Dramatic

// Alert severity (DramaAlert)
'border-blue-500'    // Low
'border-yellow-500'  // Medium
'border-orange-500'  // High
'border-red-500'     // Critical
```

### Dark Mode

All components have full dark mode support using `dark:` prefix variants:

```tsx
// Example from StudentAvatar
'dark:from-green-950 dark:to-emerald-950'  // Dark mode gradient
'dark:text-green-400'                      // Dark mode text
'dark:bg-slate-800'                        // Dark mode background
```

---

## Animation Details

### Framer Motion

```tsx
// Scroll-triggered fade-in (FeedPost)
initial={{ opacity: 0, y: 20 }}
whileInView={{ opacity: 1, y: 0 }}
viewport={{ once: true, margin: '-50px' }}

// Continuous animations (DramaAlert, SocialFeed)
animate={{ scale: [1, 1.05, 1] }}
transition={{ duration: 2, repeat: Infinity }}

// Button interactions
whileHover={{ scale: 1.05 }}
whileTap={{ scale: 0.95 }}
transition={{ type: 'spring', stiffness: 300 }}
```

---

## Integration Checklist

- [x] Import components where needed
- [x] Prepare `Student[]` array from game state
- [x] Create `FeedPostData[]` from game events
- [x] Create `DramaAlertData[]` from critical events
- [x] Handle callbacks: `onLike`, `onDismiss`, `onAction`
- [x] Test dark mode toggle
- [x] Test mobile responsiveness
- [x] Verify Framer Motion animations work

---

## Performance Tips

1. **Memoize students array** - Pass as dependency
2. **Lazy load posts** - Only render visible posts with `whileInView`
3. **Limit feed size** - Show last 20-30 posts, paginate older
4. **Debounce alerts** - Don't create too many simultaneously
5. **Use key properly** - Always use unique `post.id` as React key

---

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari 14+, Chrome Mobile)

---

## Accessibility

- ✅ Semantic HTML structure
- ✅ ARIA labels on interactive elements
- ✅ Keyboard navigation (Tab, Enter, Space)
- ✅ Focus visible states
- ✅ Color + text indicators (not color alone)
- ✅ Touch targets 44px minimum

---

## Troubleshooting

**Issue:** Avatar emojis not showing

**Solution:** Ensure browser supports emoji. Use fallback initials (automatic).

**Issue:** Animations stuttering on mobile

**Solution:** Reduce animation complexity or disable with `prefers-reduced-motion`:

```tsx
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.3 }}
```

**Issue:** Dark mode colors wrong

**Solution:** Clear Tailwind cache: `rm -rf .next` and rebuild.

---

## Resources

- [Framer Motion Docs](https://www.framer.com/motion/)
- [Tailwind CSS Docs](https://tailwindcss.com/)
- [shadcn/ui Components](https://ui.shadcn.com/)
- [DiceBear Avatars](https://www.dicebear.com/)
