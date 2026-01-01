# Student Social Media Post Mechanics

## Overview

The post mechanics engine simulates realistic student social media behavior within the classroom simulator. Students post based on personality, mood, engagement, and context, with organic viral mechanics and engagement patterns.

## Core Components

### 1. Social Media (`socialMedia.ts`)

#### StudentPhone Interface
Represents each student's social media profile:
```typescript
{
  handle: string;           // e.g., "cool_kid_22"
  followers: number;        // Based on popularity
  following: number;
  postingBehavior: number;  // Multiplier (0.4-1.5)
  avgEngagement: number;    // Average likes per post
}
```

#### StudentPost Interface
Individual posts with full metadata:
```typescript
{
  id: string;
  authorId: string;
  handle: string;
  content: string;
  category: PostCategory;   // complaint, celebration, social, etc.
  type: PostType;           // text, poll, photo, meme
  timestamp: number;
  timeOfDay: string;
  likes: number;
  comments: PostComment[];
  viralScore: number;       // 0-100
  hashtags: string[];
  duringClass: boolean;
}
```

#### Post Categories
- **complaint**: Homework, school complaints
- **celebration**: Achievements, good news
- **social**: Friend interactions, drama
- **boredom**: Posted when bored in class
- **help**: Asking for academic help
- **random**: Memes, random thoughts
- **panic**: Test stress, deadlines
- **gossip**: Rumors, social news

#### Key Functions

**calculatePostingProbability(student, context)**
- Returns 0-1 probability of posting
- Factors:
  - Mood (bored = 2x, excited = 1.5x)
  - Engagement (inverse: low engagement = more posting)
  - Personality (outgoing = 1.8x, shy = 0.3x)
  - Context (boring lesson = 2x)
  - Test week = 1.5x

**generatePostEngagement(post, author, students)**
- Simulates organic likes and comments
- Factors:
  - Friendship strength (up to +30% engagement)
  - Rival penalty (0.2x engagement)
  - Clique affinity (+15% same clique)
  - Personality compatibility
  - Post category interest

**calculateViralScore(post, popularity, totalStudents)**
- Returns 0-100 viral score
- Factors:
  - Like ratio (max 40 points)
  - Comment ratio (max 50 points)
  - Author popularity (max 10 points)
  - Category viral potential (gossip +15, drama +15)

### 2. Post Frequency (`postFrequency.ts`)

#### Posts Per Day by Personality

| Personality   | Min/Day | Max/Day | Behavior              |
|---------------|---------|---------|------------------------|
| Outgoing      | 3       | 5       | Very active           |
| Social        | 2       | 4       | Active                |
| Creative      | 2       | 4       | Shares art/ideas      |
| Distracted    | 2       | 5       | Posts when bored      |
| Curious       | 1       | 3       | Shares discoveries    |
| Perfectionist | 0       | 2       | Careful, infrequent   |
| Analytical    | 0       | 1       | Rarely posts          |
| Shy           | 0       | 1       | Very rare             |

#### Time of Day Modifiers

| Period      | Modifier | Description                    |
|-------------|----------|--------------------------------|
| Morning     | 0.7x     | Arriving, low activity         |
| Lunch       | 2.5x     | PEAK social time               |
| Afternoon   | 0.8x     | In class, moderate             |
| Afterschool | 2.0x     | Just released, high activity   |
| Evening     | 1.5x     | Homework time, moderate-high   |

#### Event Triggers

Events that spike posting activity:

| Event             | Multiplier | Affected Categories          |
|-------------------|------------|------------------------------|
| Drama             | 3.0x       | gossip, social               |
| Test Announced    | 2.0x       | panic, complaint, help       |
| Snow Day          | 2.2x       | celebration, random          |
| Fight             | 2.5x       | gossip, social               |
| Field Trip        | 1.8x       | celebration, social          |
| Heavy Homework    | 1.7x       | complaint, panic, help       |

#### Boredom Multiplier

During teaching phase, student engagement affects posting:

| Engagement Level | Multiplier | Effect                 |
|------------------|------------|------------------------|
| < 30%            | 3.0x       | Very bored, lots of posts |
| 30-50%           | 2.0x       | Bored, more posting    |
| 50-70%           | 1.2x       | Moderate increase      |
| > 70%            | 0.6x       | Engaged, less posting  |

#### Posting Cooldown

Minimum time between posts (prevents spam):

- Outgoing: 15 minutes
- Social/Creative: 20 minutes
- Distracted: 25 minutes
- Curious: 30 minutes
- Perfectionist/Analytical: 60 minutes
- Shy: 120 minutes

### 3. Viral Mechanics (`viralMechanics.ts`)

#### getTrendingPosts(posts, students, limit, timeWindow)

Returns top trending posts ranked by:
- Viral score (70%)
- Trend velocity (30%)

Velocity = (likes + comments × 2) / post age

#### calculateTrendingHashtags(posts, limit, timeWindow)

Analyzes all posts to find trending hashtags:
- Counts usage frequency
- Tracks associated posts
- Determines sentiment (positive/negative/neutral)

#### isViralPost(post, students, thresholds)

Detects viral posts based on:
- Like percentage (default: 60% of class)
- Comment percentage (default: 30% of class)
- Viral score (default: 70+)

#### applyViralBoost(post, students)

Exponential engagement for popular posts:
- 30% threshold: +10% likes, +1 comment
- 50% threshold: +15% likes, +2 comments
- 70% threshold: +20% likes, +3 comments (going viral!)

#### calculateEngagementStats(posts, students)

Returns analytics:
- Total likes/comments
- Average per post
- Most engaged student
- Least engaged student

## Usage Examples

### Initialize Student Phones

```typescript
import { initializeStudentPhone } from '@/lib/students/postMechanics';

for (const student of students) {
  const phone = initializeStudentPhone(student);
  // Store phone data with student
}
```

### Check Posting Probability

```typescript
import { calculatePostingProbability } from '@/lib/students/postMechanics';

const context = {
  currentPhase: 'teaching',
  lessonEngagement: 35, // Boring lesson
  isTestWeek: false,
  hasHomework: true,
};

const probability = calculatePostingProbability(student, context);
if (Math.random() < probability) {
  // Student posts!
}
```

### Generate a Post

```typescript
import {
  getCategoryDistribution,
  selectPostCategory,
  generateHandle
} from '@/lib/students/postMechanics';

// Get category based on context
const distribution = getCategoryDistribution(student, context);
const category = selectPostCategory(distribution);

// Create post
const post: StudentPost = {
  id: crypto.randomUUID(),
  authorId: student.id,
  handle: generateHandle(student),
  content: generatePostContent(category), // Your content generator
  category,
  type: 'text',
  timestamp: currentDay,
  timeOfDay: 'afternoon',
  likes: 0,
  comments: [],
  viralScore: 0,
  hashtags: extractHashtags(content),
  duringClass: context.currentPhase === 'teaching',
};
```

### Generate Engagement

```typescript
import {
  generatePostEngagement,
  calculateViralScore
} from '@/lib/students/postMechanics';

const author = students.find(s => s.id === post.authorId)!;
const { likes, comments } = generatePostEngagement(
  post,
  author,
  allStudents,
  currentDay
);

post.likes = likes;
post.comments = comments;
post.viralScore = calculateViralScore(post, author.popularity, students.length);
```

### Get Trending Posts

```typescript
import { getTrendingPosts, calculateTrendingHashtags } from '@/lib/students/postMechanics';

// Get top 5 trending posts from last 3 days
const trending = getTrendingPosts(allPosts, students, 5, 3);

// Get top 10 hashtags
const trendingTags = calculateTrendingHashtags(allPosts, 10);
```

### Check Expected Posts Per Day

```typescript
import { getExpectedPostsPerDay } from '@/lib/students/postMechanics';

const expected = getExpectedPostsPerDay(student, context);
// Returns: 2.3 (for example)
// This student will likely post 2-3 times today
```

## Integration with Game Reducer

### Add to GameState

```typescript
export interface GameState {
  // ... existing fields
  studentPhones: Record<string, StudentPhone>;
  socialPosts: StudentPost[];
  lastPostTimes: Record<string, number>; // studentId -> timestamp
}
```

### Add PROCESS_SOCIAL Action Handler

```typescript
case 'PROCESS_SOCIAL': {
  const context: PostContext = {
    currentPhase: state.turn.phase,
    lessonEngagement: calculateClassEngagement(state),
    recentEvent: state.turn.activeEvents[0]?.type,
    isTestWeek: isTestWeek(state.turn.week),
    hasHomework: state.turn.homeworkAssigned !== 'none',
  };

  const newPosts: StudentPost[] = [];

  for (const student of state.students) {
    // Check if student can post (cooldown)
    const lastPostTime = state.lastPostTimes[student.id] ?? 0;
    if (!canPostNow(student, lastPostTime, getCurrentTime(state))) {
      continue;
    }

    // Check if student will post
    const probability = calculatePostingProbability(student, context);
    if (Math.random() < probability) {
      // Generate post
      const post = generatePost(student, context, state);

      // Generate engagement
      const { likes, comments } = generatePostEngagement(
        post,
        student,
        state.students,
        state.turn.week
      );

      post.likes = likes;
      post.comments = comments;
      post.viralScore = calculateViralScore(post, student.popularity, state.students.length);

      newPosts.push(post);
      state.lastPostTimes[student.id] = getCurrentTime(state);
    }
  }

  return {
    ...state,
    socialPosts: [...state.socialPosts, ...newPosts],
  };
}
```

## Realism Features

### Organic Behavior
- Introverts (shy, analytical) post rarely (0-1/day)
- Extroverts (outgoing, social) post frequently (3-5/day)
- Bored students post MORE (inverse engagement)
- Popular students get more engagement

### Social Dynamics
- Friends like/comment more often
- Rivals rarely engage
- Same clique = +15% engagement
- Gossip spreads through popular kids

### Contextual Posting
- Lunch time = 2.5x posting (peak social)
- Boring lesson = 2x posting
- Test week = 1.5x panic posts
- Drama events = 3x gossip spike

### Viral Mechanics
- Exponential engagement growth
- Trending hashtags emerge organically
- Popular posts get boosted
- Category affects viral potential

## Performance Considerations

- Use cooldowns to prevent spam
- Batch process social updates per phase
- Limit trending calculations to recent posts (3-day window)
- Cap viral boosts to prevent runaway growth

## Testing

```bash
npm run test -- src/lib/students/postMechanics.test.ts
```

See test file for comprehensive examples of all mechanics.
