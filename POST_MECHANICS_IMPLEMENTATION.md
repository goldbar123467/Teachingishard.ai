# Post Mechanics Engine - Implementation Complete

## Summary

Successfully implemented a comprehensive student social media post mechanics engine with realistic behavior patterns, organic engagement, and viral mechanics.

## Files Created

### Core Mechanics (3 files)

1. **`src/lib/students/socialMedia.ts`** (318 lines)
   - Core interfaces: `StudentPhone`, `StudentPost`, `PostComment`, `PostContext`
   - Post categories: complaint, celebration, social, boredom, help, random, panic, gossip
   - Post types: text, poll, photo, meme
   - Functions:
     - `calculatePostingProbability()` - Based on mood, engagement, personality
     - `calculateViralScore()` - 0-100 score based on likes, comments, author popularity
     - `generatePostEngagement()` - Organic likes/comments from friends, cliques
     - `generateHandle()` - Personality-based social media handles
     - `initializeStudentPhone()` - Create student profiles

2. **`src/lib/students/postFrequency.ts`** (329 lines)
   - Posting frequency by personality (shy: 0-1/day, outgoing: 3-5/day)
   - Time-of-day modifiers (lunch: 2.5x, afterschool: 2.0x)
   - Event triggers (drama: 3.0x, test announced: 2.0x, snow day: 2.2x)
   - Boredom multiplier (low engagement = 3.0x posting)
   - Functions:
     - `getExpectedPostsPerDay()` - Calculate daily posting frequency
     - `getBoredomMultiplier()` - Engagement-based posting boost
     - `getEventMultiplier()` - Event-based posting spikes
     - `getCategoryDistribution()` - Context-aware category selection
     - `canPostNow()` - Cooldown enforcement

3. **`src/lib/students/viralMechanics.ts`** (473 lines)
   - Trending post detection with velocity calculation
   - Hashtag trending analysis with sentiment
   - Viral thresholds (60% likes, 30% comments, 70+ score)
   - Exponential engagement boosts for popular posts
   - Functions:
     - `getTrendingPosts()` - Ranked by viral score + velocity
     - `calculateTrendingHashtags()` - Most used tags with sentiment
     - `generateLikesAndComments()` - Organic engagement over time
     - `calculateEngagementStats()` - Analytics across all posts
     - `isViralPost()` - Detect viral threshold
     - `applyViralBoost()` - Exponential growth for popular posts

### Support Files

4. **`src/lib/students/postMechanics.ts`** (65 lines)
   - Barrel export file for clean imports
   - Re-exports all types and functions

5. **`POST_MECHANICS.md`** (Documentation)
   - Complete API reference
   - Usage examples
   - Integration guide
   - Performance tips

6. **`src/lib/students/postMechanics.test.ts`** (438 lines)
   - 28 comprehensive tests (all passing ✓)
   - Tests for all major functions
   - Edge case coverage

## Key Features

### Realistic Behavior

#### Personality-Based Posting
- **Outgoing**: 3-5 posts/day, very active
- **Social**: 2-4 posts/day, active
- **Shy**: 0-1 posts/day, very rare
- **Analytical**: 0-1 posts/day, careful
- **Distracted**: 2-5 posts/day, posts when bored

#### Mood Effects
- Bored: 2.0x posting rate
- Frustrated: 1.8x posting rate
- Excited: 1.5x posting rate
- Happy: 1.2x posting rate

#### Context Awareness
- Boring lesson (engagement < 40%): 2.0x posting
- Test week: 1.5x posting, panic category spikes
- During teaching: 0.5x base rate (but boredom can override)
- Lunch time: 2.5x posting (peak social)

### Organic Engagement

#### Friend Mechanics
- Friends: +30% engagement probability
- Rivals: -80% engagement probability (0.2x)
- Same clique: +15% engagement

#### Popular Student Boost
- More followers = more engagement
- Popular authors get wider reach
- Social/outgoing students engage more

### Viral Mechanics

#### Trending Algorithm
- Viral score: likes (35pts) + comments (45pts) + popularity (10pts) + category bonus
- Trend velocity: (likes + comments × 2) / post age
- Trending score: 70% viral + 30% velocity

#### Viral Thresholds
- 30% class engagement: Small boost
- 50% class engagement: Medium boost
- 70% class engagement: VIRAL (large boost)

#### Category Viral Potential
- Gossip: +15 points
- Drama: +15 points
- Social: +12 points
- Panic: +10 points
- Complaint: +5 points

### Time Dynamics

#### Time of Day
| Period      | Multiplier | When                    |
|-------------|------------|-------------------------|
| Morning     | 0.7x       | Arrival (low activity)  |
| Lunch       | 2.5x       | PEAK social time        |
| Afternoon   | 0.8x       | In-class (moderate)     |
| Afterschool | 2.0x       | Release (high activity) |
| Evening     | 1.5x       | Homework time           |

#### Cooldowns
- Prevents spam posting
- Outgoing: 15min between posts
- Shy: 120min between posts

### Event Triggers

Posts spike during dramatic events:
- **Drama**: 3.0x (gossip explodes)
- **Fight**: 2.5x (everyone talking about it)
- **Snow Day**: 2.2x (celebration posts)
- **Test Announced**: 2.0x (panic increases)
- **Field Trip**: 1.8x (excitement)

## Integration Example

### Add to GameState

```typescript
export interface GameState {
  // ... existing fields
  studentPhones: Record<string, StudentPhone>;
  socialPosts: StudentPost[];
  lastPostTimes: Record<string, number>;
}
```

### Initialize on New Game

```typescript
case 'NEW_GAME': {
  const studentPhones: Record<string, StudentPhone> = {};
  for (const student of students) {
    studentPhones[student.id] = initializeStudentPhone(student);
  }

  return {
    ...state,
    studentPhones,
    socialPosts: [],
    lastPostTimes: {},
  };
}
```

### Process Social Media Each Phase

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
  const currentTime = getCurrentMinute(state);

  for (const student of state.students) {
    // Check cooldown
    const lastTime = state.lastPostTimes[student.id] ?? 0;
    if (!canPostNow(student, lastTime, currentTime)) continue;

    // Check probability
    const prob = calculatePostingProbability(student, context);
    if (Math.random() < prob) {
      // Generate post
      const distribution = getCategoryDistribution(student, context);
      const category = selectPostCategory(distribution);
      const post = createPost(student, category, context, state.turn.week);

      // Generate engagement
      const { likes, comments } = generatePostEngagement(
        post,
        student,
        state.students,
        state.turn.week
      );

      post.likes = likes;
      post.comments = comments;
      post.viralScore = calculateViralScore(
        post,
        student.popularity,
        state.students.length
      );

      newPosts.push(post);
      state.lastPostTimes[student.id] = currentTime;
    }
  }

  return {
    ...state,
    socialPosts: [...state.socialPosts, ...newPosts],
  };
}
```

### Get Trending Feed

```typescript
import { getTrendingPosts, calculateTrendingHashtags } from '@/lib/students/postMechanics';

// Get top 10 trending posts from last 3 days
const trendingPosts = getTrendingPosts(state.socialPosts, state.students, 10, 3);

// Get top 5 hashtags
const trendingTags = calculateTrendingHashtags(state.socialPosts, 5, 3);
```

## Usage Statistics

### Functions Exported: 23
- 5 from socialMedia.ts
- 13 from postFrequency.ts
- 8 from viralMechanics.ts

### Types Exported: 12
- StudentPhone, StudentPost, PostComment, PostContext
- PostCategory, PostType
- TimeOfDayModifier, PostingEventTrigger, PostingWindow
- TrendingPost, TrendingHashtag, EngagementStats

### Constants Exported: 4
- PERSONALITY_POST_FREQUENCY (8 personality types)
- TIME_OF_DAY_MODIFIERS (5 time periods)
- EVENT_TRIGGERS (9 event types)
- PHASE_POSTING_WINDOWS (4 game phases)
- POSTING_COOLDOWN (8 personality types)

## Test Coverage

✓ All 28 tests passing
- Initialize student phones
- Calculate posting probability (multiple contexts)
- Expected posts per day
- Generate engagement (likes/comments)
- Viral score calculation
- Category distribution
- Trending posts ranking
- Hashtag trending
- Viral post detection
- Handle generation

## Performance Considerations

### Optimizations
- Cooldowns prevent spam (1 check per student per phase)
- Trending limited to recent posts (3-day window)
- Engagement calculated once at post creation
- Batch processing during PROCESS_SOCIAL action

### Expected Load
For 15 students:
- Morning: ~2 posts (0.7x time modifier)
- Teaching: ~3-5 posts (varies by lesson engagement)
- Lunch: ~8-10 posts (2.5x peak time)
- Afterschool: ~5-7 posts (2.0x high activity)
- Evening: ~4-6 posts (1.5x homework time)

**Total per day**: ~25-30 posts
**With events**: Can spike to 50+ posts (drama, test, snow day)

## Next Steps

### Recommended Enhancements

1. **Post Content Generation**
   - Add template system for post content
   - Generate contextual text based on category
   - Include student name references in social posts

2. **Teacher Visibility**
   - Flag posts made during class
   - Allow teacher to see posts (privacy toggle)
   - Detect concerning content (bullying, stress)

3. **UI Components**
   - Social feed component
   - Trending sidebar
   - Student profile with posts
   - Hashtag cloud

4. **Analytics Dashboard**
   - Engagement graphs over time
   - Most active students
   - Sentiment analysis
   - Drama detection

5. **Game Integration**
   - Posts affect student mood
   - Viral drama creates events
   - Teacher can intervene on problematic posts
   - Social media breaks during boring lessons

## Files Summary

| File | Lines | Purpose |
|------|-------|---------|
| socialMedia.ts | 318 | Core mechanics, posting probability |
| postFrequency.ts | 329 | Frequency, time, event triggers |
| viralMechanics.ts | 473 | Trending, viral detection, analytics |
| postMechanics.ts | 65 | Barrel export |
| postMechanics.test.ts | 438 | Test suite (28 tests) |
| POST_MECHANICS.md | - | Documentation |
| **Total** | **1,623** | **Complete system** |

## Testing

All tests pass:
```bash
npm test -- src/lib/students/postMechanics.test.ts
# ✓ 28 tests passed
```

## Type Safety

Full TypeScript support:
```bash
npx tsc --noEmit src/lib/students/socialMedia.ts
npx tsc --noEmit src/lib/students/postFrequency.ts
npx tsc --noEmit src/lib/students/viralMechanics.ts
# No errors
```

## Conclusion

The post mechanics engine is **complete and production-ready**:

✅ Realistic personality-based behavior
✅ Organic engagement patterns
✅ Viral mechanics with exponential growth
✅ Context-aware posting (mood, time, events)
✅ Comprehensive test coverage
✅ Full TypeScript support
✅ Performance optimized
✅ Well documented

Ready for integration into the game reducer and UI components!
