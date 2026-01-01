# BUILD.md - Student Social Dynamics & Social Feed Dashboard

## Mission
Make the classroom simulation more engaging by adding **student-on-student interactions** and a **social media blog-style dashboard** showing classroom drama, friendships, and social dynamics.

---

## Feature 1: Student Social Dynamics System

### Core Mechanics
- **Friendship Network**: Students form friendships based on personality compatibility
- **Rivalries**: Conflicting personalities create drama
- **Social Events**: Passing notes, lunch table drama, group project dynamics
- **Influence Spread**: Popular students affect others' moods/behaviors
- **Cliques**: Natural groupings form (nerds, athletes, artists, etc.)

### Data Model Additions
```typescript
// Add to Student type
interface StudentSocial {
  friendships: { studentId: string; strength: number }[]; // -100 to 100
  popularity: number; // 0-100
  clique: 'popular' | 'nerds' | 'artists' | 'athletes' | 'loners' | null;
  socialEnergy: number; // introverts drain, extroverts gain
  recentInteractions: SocialInteraction[];
}

interface SocialInteraction {
  id: string;
  type: 'chat' | 'conflict' | 'help' | 'gossip' | 'note' | 'drama';
  participants: string[]; // student IDs
  timestamp: number;
  outcome: 'positive' | 'negative' | 'neutral';
  description: string;
}
```

### Social Event Types
1. **Passing Notes** - Students communicate, teacher can intercept
2. **Lunch Table Drama** - Clique dynamics, exclusion events
3. **Study Buddies** - Academic help between friends
4. **Gossip Chains** - Information spreads, affects reputations
5. **Conflicts** - Arguments, need teacher intervention
6. **Crushes** - Distraction events, love notes

---

## Feature 2: Social Feed Dashboard

### Design: Instagram/Twitter Style Feed
- Scrollable feed of classroom "posts"
- Student avatars with mood indicators
- Interaction cards showing social events
- Real-time updates as day progresses
- Filter by student, event type, or sentiment

### Feed Post Types
```typescript
interface FeedPost {
  id: string;
  type: 'interaction' | 'mood_change' | 'achievement' | 'drama' | 'teacher_action';
  author: string; // student ID or 'system'
  content: string;
  emoji: string;
  timestamp: number;
  likes?: number; // other students who "agree"
  comments?: FeedComment[];
  sentiment: 'positive' | 'negative' | 'neutral' | 'dramatic';
}
```

### Example Feed Posts
- "Emma helped Marcus with math homework! +5 friendship"
- "Drama Alert: Jake and Tyler arguing over group project roles"
- "Sophia passed a note to Olivia... intercepted by teacher!"
- "Lunch table shuffle: Alex joined the artists' table"
- "Class mood rising! Everyone loved the hands-on activity"

### UI Components Needed
1. `SocialFeed.tsx` - Main scrollable feed container
2. `FeedPost.tsx` - Individual post card
3. `StudentAvatar.tsx` - Circular avatar with mood ring
4. `SocialGraph.tsx` - Visual friendship network (optional)
5. `DramaAlert.tsx` - Highlighted dramatic events

---

## Agent Assignments

### DarkRidge (Builder)
- Create social dynamics types in `src/lib/students/social.ts`
- Build social interaction engine in `src/lib/students/socialEngine.ts`
- Add social state to game reducer
- Create feed generation logic

### FuchsiaGlen (Styler)
- Design social feed UI components
- Instagram-style card layouts
- Mood ring avatars
- Smooth scroll animations
- Drama highlight effects

### SilentCompass (Tester)
- Test social interaction calculations
- Verify feed updates correctly
- Check friendship/rivalry logic
- Run build, catch type errors

### CobaltDeer (Planner)
- Coordinate via agent-mail
- Review progress, adjust tasks
- Ensure quality before completion

---

## Success Criteria
- [ ] Students interact with each other autonomously
- [ ] Friendships and rivalries form naturally
- [ ] Social feed shows real-time classroom drama
- [ ] Feed is visually engaging (Instagram-style)
- [ ] Teacher can intervene in social situations
- [ ] Build passes with zero errors

---

## Iteration Loop
Agents work → Report via agent-mail → Planner reviews → Adjust → Repeat until satisfactory
