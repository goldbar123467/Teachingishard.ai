'use client';

import { motion, AnimatePresence } from 'framer-motion';
import type { Student, Mood, PersonalityTrait } from '@/lib/game/types';
import { cn } from '@/lib/utils';

interface ThoughtBubbleProps {
  student: Student;
  visible?: boolean;
  className?: string;
}

// Map student states to contextual thoughts
const MOOD_THOUGHTS: Record<Mood, string[]> = {
  excited: [
    "💭 This is so cool!",
    "💭 I can't wait to learn more!",
    "💭 Ooh, I love this!",
  ],
  happy: [
    "💭 This is fun!",
    "💭 I get it now!",
    "💭 Today's going well!",
  ],
  neutral: [
    "💭 Hmm...",
    "💭 I wonder what's next",
    "💭 Just another day",
  ],
  bored: [
    "💭 I'm so bored...",
    "💭 When is this over?",
    "💭 😴 So sleepy...",
  ],
  frustrated: [
    "💭 This doesn't make sense!",
    "💭 Why is this so hard?",
    "💭 Ugh, I don't get it",
  ],
  upset: [
    "💭 I don't want to be here",
    "💭 😢 Everything is wrong",
    "💭 Leave me alone...",
  ],
};

const PERSONALITY_THOUGHTS: Record<PersonalityTrait, string[]> = {
  curious: [
    "💭 But how does that work?",
    "💭 What if we tried...",
    "💭 I have a question!",
  ],
  shy: [
    "💭 I hope nobody notices me",
    "💭 Should I raise my hand?",
    "💭 Too nervous to ask...",
  ],
  outgoing: [
    "✋ Pick me! Pick me!",
    "💭 I want to share!",
    "💭 Can I tell everyone?",
  ],
  distracted: [
    "💭 Is that a bird outside?",
    "💭 What was I thinking about?",
    "💭 Ooh, shiny!",
  ],
  perfectionist: [
    "💭 Is this perfect enough?",
    "💭 I need to check again",
    "💭 What if I made a mistake?",
  ],
  creative: [
    "💭 I have an idea!",
    "💭 What if we made it colorful?",
    "💭 Can I draw this?",
  ],
  analytical: [
    "💭 Let me think this through",
    "💭 There must be a pattern",
    "💭 Is there a formula?",
  ],
  social: [
    "💭 I wonder what they're thinking",
    "💭 Want to work together?",
    "💭 Let's be partners!",
  ],
};

// Energy-based thoughts
function getEnergyThought(energy: number): string | null {
  if (energy < 20) return "😴 So tired...";
  if (energy < 40) return "💭 Need a break...";
  if (energy > 90) return "⚡ Full of energy!";
  return null;
}

// Homework status thoughts
function getHomeworkThought(completed: boolean): string | null {
  if (!completed) return "📝 Forgot my homework...";
  return null;
}

// Engagement thoughts
function getEngagementThought(engagement: number): string | null {
  if (engagement < 20) return "💭 Not interested...";
  if (engagement > 90) return "🌟 This is amazing!";
  return null;
}

// Get a thought based on student's current state
function getThought(student: Student): string {
  // Priority order: special states > mood > personality

  // Check special states first
  const energyThought = getEnergyThought(student.energy);
  if (energyThought && student.energy < 30) return energyThought;

  const homeworkThought = getHomeworkThought(student.homeworkCompleted);
  if (homeworkThought && Math.random() < 0.3) return homeworkThought;

  const engagementThought = getEngagementThought(student.engagement);
  if (engagementThought) return engagementThought;

  // Mood-based thoughts (70% chance)
  if (Math.random() < 0.7) {
    const moodThoughts = MOOD_THOUGHTS[student.mood];
    return moodThoughts[Math.floor(Math.random() * moodThoughts.length)];
  }

  // Personality-based thoughts (30% chance)
  const personalityThoughts = PERSONALITY_THOUGHTS[student.primaryTrait];
  return personalityThoughts[Math.floor(Math.random() * personalityThoughts.length)];
}

export function ThoughtBubble({ student, visible = true, className }: ThoughtBubbleProps) {
  if (!student.attendanceToday) return null;

  const thought = getThought(student);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.8 }}
          transition={{
            type: 'spring',
            stiffness: 400,
            damping: 20,
            duration: 0.3,
          }}
          className={cn(
            'absolute -top-12 left-1/2 -translate-x-1/2 z-10',
            'pointer-events-none select-none',
            className
          )}
        >
          {/* Speech bubble */}
          <div className="relative">
            <div
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap',
                'bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700',
                'backdrop-blur-sm bg-white/95 dark:bg-gray-800/95'
              )}
            >
              {thought}
            </div>
            {/* Bubble tail */}
            <div
              className={cn(
                'absolute -bottom-1.5 left-1/2 -translate-x-1/2',
                'w-3 h-3 rotate-45',
                'bg-white dark:bg-gray-800 border-r border-b border-gray-200 dark:border-gray-700'
              )}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Variant that shows on hover only
export function HoverThoughtBubble({ student, className }: Omit<ThoughtBubbleProps, 'visible'>) {
  return (
    <div className="group relative">
      <ThoughtBubble
        student={student}
        visible={false}
        className={cn('group-hover:opacity-100 opacity-0 transition-opacity', className)}
      />
    </div>
  );
}
