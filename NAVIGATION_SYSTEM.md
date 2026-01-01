# Navigation System Documentation

## Overview

The Classroom Simulator uses Next.js App Router for navigation with a persistent sidebar layout. The navigation system provides:

- **URL-based routing**: Each tab corresponds to a unique route
- **Active state tracking**: Sidebar highlights the current page
- **Tab persistence**: Last visited page is saved to localStorage
- **Shared game state**: Game state persists across page navigation

## Architecture

### Route Structure

```
/                   → Dashboard (main game view)
/planning           → Lesson Planning & Scheduling
/schedule           → Weekly Schedule Management
/students           → Student Management (placeholder)
/teaching           → Teaching Resources (placeholder)
/events             → Events Management (placeholder)
/settings           → Game Settings (placeholder)
```

### Key Components

#### 1. AppSidebar (`src/components/layout/AppSidebar.tsx`)

The sidebar manages navigation items and active state detection:

```typescript
const navItems: NavItem[] = [
  { title: "Dashboard", icon: LayoutDashboard, href: "/" },
  { title: "Lesson Planning", icon: ClipboardList, href: "/planning" },
  { title: "Schedule", icon: Calendar, href: "/schedule" },
  // ... more items
];
```

**Active State Logic:**
```typescript
const isActive = (href: string) => {
  if (href === "/") {
    return pathname === "/";  // Exact match for homepage
  }
  return pathname.startsWith(href);  // Prefix match for sub-routes
};
```

#### 2. MainLayout (`src/components/layout/MainLayout.tsx`)

Wraps all pages with:
- Sidebar navigation
- Header with game controls
- Active tab persistence hook

#### 3. useActiveTab Hook (`src/hooks/useActiveTab.ts`)

Automatically persists the current pathname to localStorage:

```typescript
export function useActiveTab() {
  const pathname = usePathname();

  useEffect(() => {
    localStorage.setItem('classroom-sim:last-active-tab', pathname);
  }, [pathname]);

  return pathname;
}
```

## Data Flow

```
User clicks nav item
    ↓
Next.js router navigates to new route
    ↓
usePathname() returns new pathname
    ↓
AppSidebar detects active route via isActive()
    ↓
Sidebar highlights active item
    ↓
useActiveTab() saves pathname to localStorage
    ↓
New page component renders with MainLayout
```

## State Management

### Game State Persistence

The game state (managed by GameContext) persists across navigation:

- **Context Provider**: Wraps the entire app in `layout.tsx`
- **State Access**: All pages can use `useGame()` hook
- **No Reset**: Navigating between pages does NOT reset game state

### Tab State Persistence

- **Storage**: `localStorage['classroom-sim:last-active-tab']`
- **Update**: On every pathname change
- **Restore**: Can be used on app load (not currently implemented)

## Adding New Routes

To add a new navigation route:

### 1. Create the page

```bash
mkdir -p src/app/your-route
touch src/app/your-route/page.tsx
```

### 2. Implement the page component

```typescript
'use client';

import { MainLayout } from '@/components/layout';

export default function YourPage() {
  return (
    <MainLayout>
      {/* Your page content */}
    </MainLayout>
  );
}
```

### 3. Add to sidebar navigation

In `src/components/layout/AppSidebar.tsx`:

```typescript
import { YourIcon } from "lucide-react";

const navItems: NavItem[] = [
  // ... existing items
  { title: "Your Page", icon: YourIcon, href: "/your-route" },
];
```

## Styling & Transitions

### Active State Styling

```typescript
active
  ? "bg-gradient-to-r from-violet-500/20 to-blue-500/10
     text-violet-600 dark:text-violet-400
     font-semibold shadow-sm border-l-2 border-violet-500"
  : "text-sidebar-foreground/70
     hover:text-sidebar-foreground
     hover:bg-sidebar-accent/50"
```

### Hover Effects

- Scale animation: `hover:scale-[1.02]`
- Shadow: `hover:shadow-sm`
- Color transitions: `transition-all duration-200`

## Best Practices

### 1. Use MainLayout Wrapper

Always wrap page content with `MainLayout` to ensure:
- Consistent sidebar navigation
- Header with game controls
- Proper tab tracking

### 2. Maintain Game State Access

Pages that need game state should use:
```typescript
const { state, dispatch } = useGame();
```

### 3. Keep Routes Shallow

Avoid deep nesting. Prefer:
- `/students` over `/classroom/students/list`
- `/planning` over `/teacher/planning/lessons`

### 4. Handle Loading States

Since pages are client-side rendered, handle:
- GameContext availability
- Initial state loading
- Navigation transitions

## Debugging

### Check Active Route

```typescript
// In any component
import { usePathname } from 'next/navigation';

const pathname = usePathname();
console.log('Current route:', pathname);
```

### Verify Tab Persistence

```typescript
// In browser console
localStorage.getItem('classroom-sim:last-active-tab');
```

### Test Navigation

```typescript
// Programmatic navigation
import { useRouter } from 'next/navigation';

const router = useRouter();
router.push('/planning');
```

## Future Enhancements

Potential improvements to the navigation system:

1. **Route Guards**: Check game state before allowing navigation
2. **Breadcrumbs**: Show navigation path for nested routes
3. **Route Transitions**: Add page transition animations
4. **Deep Linking**: Restore game state from URL params
5. **History Management**: Track navigation history for back/forward
6. **Keyboard Shortcuts**: Navigate with keyboard (e.g., Cmd+1 for Dashboard)
7. **Tab Preloading**: Preload adjacent routes for faster navigation

## Related Files

- `/src/components/layout/AppSidebar.tsx` - Sidebar navigation
- `/src/components/layout/MainLayout.tsx` - Layout wrapper
- `/src/components/layout/AppHeader.tsx` - Top header bar
- `/src/hooks/useActiveTab.ts` - Tab persistence hook
- `/src/app/*/page.tsx` - Individual page components
- `/src/lib/game/context.tsx` - Game state provider
