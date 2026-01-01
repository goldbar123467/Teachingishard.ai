# Phone UI Components - Usage Guide

Beautiful, authentic phone UI components for viewing student social media posts.

## Components Overview

### 1. PhoneScreen
The main phone interface component with realistic phone frame, tabs, and navigation.

```tsx
import { PhoneScreen } from '@/components/social/PhoneScreen';

function StudentPhoneView() {
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  return (
    <PhoneScreen
      student={selectedStudent}
      posts={feedPosts}
      students={allStudents}
      onClose={() => setSelectedStudent(null)}
      onLike={(postId) => handleLike(postId)}
    />
  );
}
```

**Features:**
- Realistic phone frame with notch and status bar
- Three tabs: Feed, Notifications, Profile
- Smooth tab transitions
- Student profile stats
- Touch-friendly navigation

### 2. SocialPost
Individual post component with modern social media styling.

```tsx
import { SocialPost } from '@/components/social/SocialPost';

function PostList() {
  return (
    <div className="space-y-3">
      {posts.map(post => (
        <SocialPost
          key={post.id}
          post={post}
          students={students}
          viewingStudent={currentStudent}
          onLike={handleLike}
          compact={false} // Set to true for compact view
        />
      ))}
    </div>
  );
}
```

**Features:**
- Author avatar with gradient
- Timestamp ("just now", "2m ago", etc.)
- Like button with heart animation
- Comment count (simulated)
- Share button
- Post type indicators
- Compact mode for profile view

### 3. NotificationBadge
Animated notification badges and dots.

```tsx
import { NotificationBadge, NotificationDot } from '@/components/social/NotificationBadge';

function StudentCard() {
  return (
    <div className="relative">
      <Avatar />
      <NotificationBadge
        count={5}
        animated={true}
        size="md"
        position="top-right"
      />
    </div>
  );
}

// For simple notification dots
function NavItem() {
  return (
    <div className="relative">
      <Icon />
      <NotificationDot
        visible={hasNotifications}
        animated={true}
      />
    </div>
  );
}
```

**Features:**
- Count display (99+ for >99)
- Animated appearance
- Ping animation on new notifications
- Multiple sizes: sm, md, lg
- Four positions: top-right, top-left, bottom-right, bottom-left
- Simple dot variant for minimal indicator

### 4. TrendingSection
Shows trending hashtags and top posts.

```tsx
import { TrendingSection } from '@/components/social/TrendingSection';

function SocialSidebar() {
  return (
    <TrendingSection
      posts={allPosts}
      maxItems={5}
    />
  );
}
```

**Features:**
- Auto-extracts hashtags from posts
- Trending indicators (🔥 hot, 📈 up, # new)
- Top posts preview
- Engagement metrics
- Click to expand functionality

### 5. Enhanced SocialFeed
The main feed component with new phone-style features.

```tsx
import { SocialFeed } from '@/components/social/SocialFeed';

function Dashboard() {
  return (
    <SocialFeed
      posts={posts}
      students={students}
      onLike={handleLike}
      phoneStyle={true}
      selectedStudentId={selectedId}
      onRefresh={() => fetchNewPosts()}
      maxHeight="600px"
    />
  );
}
```

**New Props:**
- `phoneStyle` - Enable phone-style pull-to-refresh
- `selectedStudentId` - Filter posts by specific student
- `onRefresh` - Callback for pull-to-refresh action

## Styling Guide

All components use:
- **Dark mode aesthetic** - Dark backgrounds with light text
- **Gradient accents** - Purple/pink gradients for branding
- **Smooth animations** - Framer Motion for all interactions
- **Realistic timestamps** - "just now", "2m ago", "1h ago", etc.
- **Mobile-first** - Optimized for touch and small screens

## Color Palette

```css
/* Primary gradients */
from-purple-500 to-pink-500  /* Avatars */
from-violet-600 to-purple-600 /* Headers */

/* Dark mode backgrounds */
bg-slate-950  /* Phone screen */
bg-slate-900  /* Cards */
bg-slate-800  /* Hover states */

/* Post type colors */
interaction: blue-500
mood_change: purple-500
achievement: amber-500
drama: red-500
teacher_action: green-500
```

## Example: Student Detail Modal with Phone

```tsx
import { PhoneScreen } from '@/components/social/PhoneScreen';
import { NotificationBadge } from '@/components/social/NotificationBadge';

function StudentDetailModal({ student, onClose }: Props) {
  const [showPhone, setShowPhone] = useState(false);

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <div className="grid grid-cols-2 gap-6">
          {/* Left: Student info */}
          <div>
            <div className="relative w-24 h-24">
              <Avatar student={student} size="xl" />
              <NotificationBadge
                count={student.unreadPosts}
                animated={true}
              />
            </div>
            <h2>{student.firstName} {student.lastName}</h2>
            <Button onClick={() => setShowPhone(true)}>
              View Phone 📱
            </Button>
          </div>

          {/* Right: Phone screen */}
          {showPhone && (
            <PhoneScreen
              student={student}
              posts={posts}
              students={allStudents}
              onClose={() => setShowPhone(false)}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

## Example: Main Dashboard Integration

```tsx
import { SocialFeed, TrendingSection } from '@/components/social';

function MainDashboard() {
  return (
    <div className="grid grid-cols-3 gap-6">
      {/* Left: Student grid */}
      <div className="col-span-2">
        <StudentGrid students={students} />
      </div>

      {/* Right: Social sidebar */}
      <div className="space-y-6">
        <TrendingSection posts={allPosts} />
        <SocialFeed
          posts={allPosts}
          students={students}
          maxHeight="400px"
        />
      </div>
    </div>
  );
}
```

## TypeScript Types

```typescript
interface FeedPostData {
  id: string;
  type: 'interaction' | 'mood_change' | 'achievement' | 'drama' | 'teacher_action';
  author: string; // student ID
  content: string;
  emoji: string;
  timestamp: Date;
  participants: string[];
  sentiment: 'positive' | 'negative' | 'neutral' | 'dramatic';
  likes?: number;
}

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  // ... other student properties
}
```

## Animations

All components use Framer Motion for smooth animations:

- **Initial mount**: Fade in + slide up
- **Like button**: Scale pulse on click
- **Notifications**: Ping + rotate on new
- **Tab switches**: Slide transitions
- **Pull-to-refresh**: Rotate spinner
- **Hover states**: Subtle scale + lift

## Responsive Behavior

- **Desktop**: Full phone frame with all features
- **Tablet**: Compact phone with essential features
- **Mobile**: Native feel, no phone frame (just content)

Use `phoneStyle` prop to enable/disable phone-specific features.

## Performance Notes

- Posts are memoized and sorted efficiently
- Animations use GPU acceleration
- Lazy loading for long post lists
- Touch events only enabled when `phoneStyle={true}`

## Next Steps

1. Add real notification system
2. Implement comment threads
3. Add photo/image posts
4. Create post composer
5. Add DM functionality
