# Post Generation System - Usage Guide

## Overview

The post generation system creates authentic 5th-grade social media posts with realistic teen voice patterns. It includes 79 templates across 6 categories, personality-based voice modulation, and context-aware content generation.

## Quick Start

```typescript
import { generatePost, PostContext } from '@/lib/students/postGenerator';
import { Student } from '@/lib/students/generator';

// Create post context
const context: PostContext = {
  student: myStudent,
  relationships: studentRelationships,
  mood: 'excited',
  energy: 80,
};

// Generate post
const post = generatePost(context);
console.log(post?.content); // "omg Jordan is literally the best friend ever!! 💕💕"
```

## Post Categories

### 1. Social Posts (15 templates)
Friend shoutouts, appreciation, lunch table vibes, new friendships.

**Example outputs:**
- `"shoutout to Jordan for always having my back 🙏"`
- `"lunch table literally has main character energy today fr fr 😎"`
- `"omg Sam is actually so cool?? why didnt we hang out before 👀"`

### 2. Academic Posts (15 templates)
Test reactions, homework complaints, subject opinions, grade flexing.

**Example outputs:**
- `"that test was BRUTAL 😭😭 Ms. Johnson why u do this to us"`
- `"95% on the test!! SLAY 💅✨"`
- `"WHY SO MUCH HOMEWORK?? my hand literally hurts 😩"`

### 3. Humor Posts (15 templates)
Memes, self-deprecation, teacher jokes, chaotic energy.

**Example outputs:**
- `"MY BRAINCELL JUST LEFT THE BUILDING 🧠❌"`
- `"literally me: called the teacher mom in front of everyone 💀"`
- `"running on 2 hours of sleep and a dream 😵"`

### 4. Drama Posts (12 templates)
Subtweets, cryptic messages, callouts, fake friend commentary.

**Example outputs:**
- `"some people really think they can treat others like that 🙄"`
- `"i could say something but i wont. you know who you are."`
- `"the way you were being so rude is NOT it 😒"`

### 5. Personal Posts (12 templates)
Mood updates, gratitude, stress, excitement.

**Example outputs:**
- `"literally having the worst day ever 😔"`
- `"OMG THE WEEKEND IS LITERALLY RIGHT THERE 🎉"`
- `"feeling really blessed today 💕"`

### 6. Event Reaction Posts (10 templates)
Fire drills, surprise quizzes, field trips, assemblies, holidays.

**Example outputs:**
- `"FIRE DRILL?? in the middle of math?? the TIMING 💀💀"`
- `"FIELD TRIP TOMORROW IM HYPED 🎉🎉🎉"`
- `"we have a sub today this gonna be chaotic 😈"`

## Personality Voice Differences

### Outgoing
- High emoji usage (💕🎉✨😊)
- Frequent caps
- Social and humor posts
- Example: `"Jordan is literally the best friend ever!! 💕💕 no cap"`

### Shy
- Minimal emoji (😊...)
- Lowercase text
- Thoughtful, personal posts
- Example: `"jordan is really nice... glad we got paired together today"`

### Dramatic
- Heavy emoji with repeats (😭😭😭💀💀)
- All caps or emotional punctuation
- Drama and personal posts
- Example: `"LITERALLY HAVING THE WORST DAY EVER 😭😭😭"`

### Class Clown
- Meme-style emoji (💀😂🤡)
- Chaotic caps usage
- Humor and event posts
- Example: `"MY BRAINCELL JUST LEFT THE BUILDING 🧠❌ literally cant even rn 💀💀"`

### Studious
- Light emoji (📚📝🤔)
- Normal capitalization
- Academic posts
- Example: `"this book were reading is actually really good 📚"`

### Popular
- Trendy emoji (💅✨😌💕)
- Confident tone
- Social and drama posts
- Example: `"my friend group is literally unmatched 😤✨"`

## Context Parameters

```typescript
interface PostContext {
  student: Student;              // Required - the student posting
  relationships?: SocialRelationship[];  // Friends to mention
  recentEvent?: string;          // Recent event trigger
  teacherName?: string;          // Teacher to reference
  subject?: string;              // Academic subject
  score?: number;                // Test score (60-100)
  mood?: 'happy' | 'sad' | 'excited' | 'angry' | 'tired';
  energy?: number;               // 0-100, affects caps/typos
}
```

## Advanced Usage

### Generate Multiple Posts
```typescript
import { generateMultiplePosts } from '@/lib/students/postGenerator';

const posts = generateMultiplePosts(context, 5);
// Returns array of 5 different posts
```

### Check Posting Probability
```typescript
import { shouldStudentPost } from '@/lib/students/postGenerator';

if (shouldStudentPost(student, 'lunch')) {
  const post = generatePost(context);
  // Student posts during lunch
}
```

### Get Posting Style Info
```typescript
import { getPostingStyle } from '@/lib/students/postGenerator';

const style = getPostingStyle(student);
// {
//   frequency: 'high', // or 'medium', 'low'
//   preferredCategories: ['social', 'humor', 'event']
// }
```

## Voice Modulation System

The teen voice system (`teenVoice.ts`) applies 5 layers:

### 1. Slang Injection
- Weighted by personality
- Examples: "fr fr", "no cap", "lowkey", "literally", "ngl"
- Inserted at start, middle, or end of text

### 2. Typo Generation
- Based on distraction level
- Common substitutions: you → u, your → ur, to → 2
- Example: `"literally having the worst day rn"`

### 3. Capitalization
- **Excited/Angry**: ALL CAPS
- **Tired/Sad**: all lowercase
- **Class Clown**: rAnDoM cApS (rare)
- **Normal**: Standard caps

### 4. Punctuation Style
- **Dramatic**: Double/triple punctuation (!!, ???)
- **Shy**: Often omits end punctuation
- **Class Clown**: Excessive punctuation (!!!)

### 5. Emoji Patterns
- Personality-specific emoji sets
- Frequency varies by personality (20%-90%)
- Some personalities repeat emojis (💀💀💀)

## Integration Example

### In Social Feed Component
```typescript
import { generatePost } from '@/lib/students/postGenerator';
import { useGame } from '@/hooks/useGame';

function SocialFeed() {
  const { state } = useGame();

  // Generate posts for active students
  const posts = state.students
    .filter(student => shouldStudentPost(student, 'lunch'))
    .map(student => {
      const context: PostContext = {
        student,
        relationships: getStudentRelationships(student.id),
        mood: getStudentMood(student),
        energy: getStudentEnergy(student),
        recentEvent: state.recentEvent,
      };
      return generatePost(context);
    })
    .filter(Boolean);

  return (
    <div>
      {posts.map(post => (
        <PostCard key={post.studentId} post={post} />
      ))}
    </div>
  );
}
```

### During Game Events
```typescript
// After a test
const postTestPosts = students.map(student => {
  return generatePost({
    student,
    subject: 'math',
    score: student.testScore,
    mood: student.testScore > 80 ? 'excited' : 'sad',
    energy: 50,
  });
});

// Fire drill event
const fireDrillPosts = students
  .filter(s => s.personality.traits.includes('outgoing'))
  .map(student => generatePost({
    student,
    recentEvent: 'fire_drill',
    subject: currentSubject,
    mood: 'excited',
    energy: 80,
  }));
```

## Template Variables

Templates support dynamic variables:

| Variable | Fills With | Example |
|----------|------------|---------|
| `{{ friend }}` | Random friend from relationships | "Jordan" |
| `{{ teacher }}` | Teacher name from context | "Ms. Johnson" |
| `{{ subject }}` | Subject or random subject | "math" |
| `{{ score }}` | Test score (70-100) | "95" |
| `{{ topic }}` | Subject-specific topic | "fractions" |
| `{{ situation }}` | Random funny situation | "when the teacher says no homework" |
| `{{ embarrassing_thing }}` | Random embarrassment | "tripped" |
| `{{ holiday }}` | Upcoming holiday | "winter" |

## Testing

Run tests to see examples:
```bash
npm test postGenerator.test.ts
```

Output shows:
- Posts from different personalities
- Full day simulation (morning → lunch → after test → end of day)
- Voice difference examples
- Template variable filling

## Files

- **postTemplates.ts** - 79 post templates organized by category
- **teenVoice.ts** - Voice modulation system (slang, emoji, caps, typos)
- **postGenerator.ts** - Main generation logic
- **postGenerator.test.ts** - Examples and tests

## Tips

1. **Variety**: Call `generateMultiplePosts()` to get options, pick the best fit
2. **Context**: More context = better posts (relationships, events, mood)
3. **Personality**: Each personality has weighted category preferences
4. **Energy**: Low energy = lowercase/typos, high energy = CAPS/emoji
5. **Events**: Pass `recentEvent` for event-specific reactions
6. **Frequency**: Use `shouldStudentPost()` to control feed density

## Future Enhancements

- Reply threads between students
- Reaction counts (likes, comments)
- Time-based post scheduling
- Seasonal template variations
- Inside joke memory system
