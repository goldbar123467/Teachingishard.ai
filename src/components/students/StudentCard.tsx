'use client';

import { motion } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import type { Student } from '@/lib/game/types';
import { getStudentFullName, getStudentInitials } from '@/lib/students/generator';
import { cn } from '@/lib/utils';
import { MoodIndicator } from './MoodIndicator';
import { PerformanceBar } from './PerformanceBar';
import { ThoughtBubble } from './ThoughtBubble';
import { CompactStatusIndicators } from './StatusIndicators';
import { StudentInteractionBadge, StudentInteractionIndicator } from './InteractionIndicators';
import { useState } from 'react';

interface StudentCardProps {
  student: Student;
  onClick?: () => void;
  compact?: boolean;
}

function getDiceBearUrl(seed: string): string {
  return `https://api.dicebear.com/7.x/adventurer/svg?seed=${seed}`;
}

// Gradient colors for traits - enhanced for dark theme
const TRAIT_GRADIENTS: Record<string, { border: string; glow: string; ring: string; hoverGlow: string }> = {
  curious: {
    border: 'from-blue-400 to-cyan-400',
    glow: 'hover:shadow-blue-500/30 dark:hover:shadow-blue-500/40',
    ring: 'ring-blue-400/30 group-hover:ring-blue-400/70',
    hoverGlow: 'hover:shadow-[0_0_20px_rgba(96,165,250,0.3)]',
  },
  shy: {
    border: 'from-violet-400 to-purple-400',
    glow: 'hover:shadow-violet-500/30 dark:hover:shadow-violet-500/40',
    ring: 'ring-violet-400/30 group-hover:ring-violet-400/70',
    hoverGlow: 'hover:shadow-[0_0_20px_rgba(167,139,250,0.3)]',
  },
  outgoing: {
    border: 'from-amber-400 to-yellow-400',
    glow: 'hover:shadow-amber-500/30 dark:hover:shadow-amber-500/40',
    ring: 'ring-amber-400/30 group-hover:ring-amber-400/70',
    hoverGlow: 'hover:shadow-[0_0_20px_rgba(251,191,36,0.3)]',
  },
  distracted: {
    border: 'from-orange-400 to-red-400',
    glow: 'hover:shadow-orange-500/30 dark:hover:shadow-orange-500/40',
    ring: 'ring-orange-400/30 group-hover:ring-orange-400/70',
    hoverGlow: 'hover:shadow-[0_0_20px_rgba(251,146,60,0.3)]',
  },
  perfectionist: {
    border: 'from-emerald-400 to-green-400',
    glow: 'hover:shadow-emerald-500/30 dark:hover:shadow-emerald-500/40',
    ring: 'ring-emerald-400/30 group-hover:ring-emerald-400/70',
    hoverGlow: 'hover:shadow-[0_0_20px_rgba(52,211,153,0.3)]',
  },
  creative: {
    border: 'from-pink-400 to-rose-400',
    glow: 'hover:shadow-pink-500/30 dark:hover:shadow-pink-500/40',
    ring: 'ring-pink-400/30 group-hover:ring-pink-400/70',
    hoverGlow: 'hover:shadow-[0_0_20px_rgba(244,114,182,0.3)]',
  },
  analytical: {
    border: 'from-cyan-400 to-teal-400',
    glow: 'hover:shadow-cyan-500/30 dark:hover:shadow-cyan-500/40',
    ring: 'ring-cyan-400/30 group-hover:ring-cyan-400/70',
    hoverGlow: 'hover:shadow-[0_0_20px_rgba(34,211,238,0.3)]',
  },
  athletic: {
    border: 'from-lime-400 to-green-400',
    glow: 'hover:shadow-lime-500/30 dark:hover:shadow-lime-500/40',
    ring: 'ring-lime-400/30 group-hover:ring-lime-400/70',
    hoverGlow: 'hover:shadow-[0_0_20px_rgba(163,230,53,0.3)]',
  },
  leader: {
    border: 'from-yellow-400 to-amber-400',
    glow: 'hover:shadow-yellow-500/30 dark:hover:shadow-yellow-500/40',
    ring: 'ring-yellow-400/30 group-hover:ring-yellow-400/70',
    hoverGlow: 'hover:shadow-[0_0_20px_rgba(250,204,21,0.3)]',
  },
  helper: {
    border: 'from-rose-400 to-pink-400',
    glow: 'hover:shadow-rose-500/30 dark:hover:shadow-rose-500/40',
    ring: 'ring-rose-400/30 group-hover:ring-rose-400/70',
    hoverGlow: 'hover:shadow-[0_0_20px_rgba(251,113,133,0.3)]',
  },
  social: {
    border: 'from-fuchsia-400 to-purple-400',
    glow: 'hover:shadow-fuchsia-500/30 dark:hover:shadow-fuchsia-500/40',
    ring: 'ring-fuchsia-400/30 group-hover:ring-fuchsia-400/70',
    hoverGlow: 'hover:shadow-[0_0_20px_rgba(232,121,249,0.3)]',
  },
};

const DEFAULT_GRADIENT = {
  border: 'from-gray-400 to-slate-400',
  glow: 'hover:shadow-gray-500/20 dark:hover:shadow-gray-500/30',
  ring: 'ring-gray-400/30 group-hover:ring-gray-400/60',
  hoverGlow: 'hover:shadow-[0_0_20px_rgba(148,163,184,0.2)]',
};

// Animation variants based on student state
function getIdleAnimation(student: Student) {
  // Distracted - fidgeting animation
  if (student.engagement < 30 || student.primaryTrait === 'distracted') {
    return {
      x: [0, -1, 1, -1, 0],
      y: [0, -0.5, 0.5, -0.5, 0],
      transition: {
        duration: 2,
        repeat: Infinity,
        repeatType: 'loop' as const,
      },
    };
  }

  // Low energy - sleepy bob
  if (student.energy < 30) {
    return {
      y: [0, 3, 0],
      transition: {
        duration: 3,
        repeat: Infinity,
        repeatType: 'loop' as const,
      },
    };
  }

  // Excited - bounce
  if (student.mood === 'excited' || student.engagement > 90) {
    return {
      y: [0, -4, 0],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        repeatType: 'loop' as const,
      },
    };
  }

  // Happy - gentle sway
  if (student.mood === 'happy') {
    return {
      rotate: [0, 1, 0, -1, 0],
      transition: {
        duration: 4,
        repeat: Infinity,
        repeatType: 'loop' as const,
      },
    };
  }

  // Frustrated - shake
  if (student.mood === 'frustrated') {
    return {
      rotate: [0, -2, 2, -2, 0],
      transition: {
        duration: 0.5,
        repeat: Infinity,
        repeatDelay: 3,
        repeatType: 'loop' as const,
      },
    };
  }

  // Default - no animation
  return {};
}

export function StudentCard({ student, onClick, compact = false }: StudentCardProps) {
  const traitStyle = TRAIT_GRADIENTS[student.primaryTrait] || DEFAULT_GRADIENT;
  const [showThought, setShowThought] = useState(false);
  const idleAnimation = getIdleAnimation(student);

  if (compact) {
    return (
      <motion.div
        className={cn(
          'relative group',
          onClick && 'cursor-pointer',
          !student.attendanceToday && 'opacity-50'
        )}
        style={{ cursor: onClick ? 'pointer' : 'default' }} // Immediate cursor feedback
        onClick={onClick}
        onHoverStart={() => setShowThought(true)}
        onHoverEnd={() => setShowThought(false)}
        animate={idleAnimation}
      >
        {/* Thought bubble on hover */}
        <ThoughtBubble student={student} visible={showThought} />

        {/* Interaction indicators */}
        <StudentInteractionBadge student={student} position="top-right" />

        {/* Gradient border effect - only show when student is present */}
        {student.attendanceToday && (
          <div className={cn(
            'absolute -inset-[1px] rounded-xl bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm',
            traitStyle.border
          )} />
        )}
        <Card className={cn(
          'relative border-0 bg-card/90 backdrop-blur-sm',
          'dark:bg-slate-800/80 dark:border dark:border-slate-700/50',
          // Only apply hover effects when student is present
          student.attendanceToday && 'hover:scale-[1.02] active:scale-[0.98]',
          student.attendanceToday && traitStyle.glow,
          student.attendanceToday && traitStyle.hoverGlow,
          'transition-all duration-300 ease-out'
        )}>
          <CardContent className="p-3">
            <div className="flex items-center gap-3">
              <Avatar className={cn(
                'h-10 w-10 ring-2 ring-offset-2 ring-offset-background shadow-sm transition-all duration-300',
                traitStyle.ring
              )}>
                <AvatarImage src={getDiceBearUrl(student.avatarSeed)} alt={student.firstName} />
                <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-medium">
                  {getStudentInitials(student)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium truncate">{student.firstName}</span>
                  <MoodIndicator mood={student.mood} size="sm" />
                </div>
                <PerformanceBar value={student.academicLevel} size="sm" />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      className={cn(
        'relative group',
        onClick && 'cursor-pointer',
        !student.attendanceToday && 'opacity-50'
      )}
      style={{ cursor: onClick ? 'pointer' : 'default' }} // Immediate cursor feedback
      onClick={onClick}
      onHoverStart={() => setShowThought(true)}
      onHoverEnd={() => setShowThought(false)}
      animate={idleAnimation}
    >
      {/* Thought bubble on hover */}
      <ThoughtBubble student={student} visible={showThought} />

      {/* Interaction indicators */}
      <StudentInteractionBadge student={student} position="top-left" />
      <StudentInteractionIndicator student={student} />

      {/* Gradient glow effect - only show when student is present */}
      {student.attendanceToday && (
        <div className={cn(
          'absolute -inset-[2px] rounded-xl bg-gradient-to-r opacity-0 group-hover:opacity-70 transition-all duration-300',
          traitStyle.border,
          'blur-md'
        )} />
      )}

      {/* Gradient border - only show when student is present */}
      {student.attendanceToday && (
        <div className={cn(
          'absolute -inset-[1px] rounded-xl bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-300',
          traitStyle.border
        )} />
      )}

      <Card className={cn(
        'relative border-0 bg-card/95 backdrop-blur-sm overflow-hidden',
        'dark:bg-slate-800/90 dark:border dark:border-slate-700/50',
        // Only apply hover effects when student is present
        student.attendanceToday && 'hover:scale-[1.01] active:scale-[0.99]',
        student.attendanceToday && traitStyle.glow,
        student.attendanceToday && traitStyle.hoverGlow,
        'transition-all duration-300 ease-out'
      )}>
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/[0.02] dark:to-white/[0.02] pointer-events-none" />

        <CardContent className="p-4 relative">
          <div className="flex flex-col items-center text-center gap-3">
            {/* Avatar with gradient ring */}
            <div className="relative">
              <div className={cn(
                'absolute -inset-1 rounded-full bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm',
                traitStyle.border
              )} />
              <Avatar className={cn(
                'relative h-16 w-16 ring-2 ring-offset-2 ring-offset-background shadow-lg transition-all duration-300',
                traitStyle.ring
              )}>
                <AvatarImage
                  src={getDiceBearUrl(student.avatarSeed)}
                  alt={getStudentFullName(student)}
                  className="group-hover:scale-105 transition-transform duration-300"
                />
                <AvatarFallback className="text-lg bg-gradient-to-br from-primary/30 to-primary/10 text-primary font-semibold">
                  {getStudentInitials(student)}
                </AvatarFallback>
              </Avatar>
              {!student.attendanceToday && (
                <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center text-white text-[10px] font-bold shadow-sm ring-2 ring-background">
                  X
                </span>
              )}
            </div>

            {/* Name and trait */}
            <div>
              <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                {getStudentFullName(student)}
              </h3>
              <p className={cn(
                'text-xs capitalize tracking-wide bg-gradient-to-r bg-clip-text text-transparent',
                traitStyle.border
              )}>
                {student.primaryTrait}
              </p>
            </div>

            {/* Mood */}
            <MoodIndicator mood={student.mood} size="md" />

            {/* Stats with gradient fills */}
            <div className="w-full space-y-2.5">
              <PerformanceBar
                value={student.academicLevel}
                label="Academics"
                showValue
                size="sm"
                variant="academic"
              />
              <PerformanceBar
                value={student.energy}
                label="Energy"
                showValue
                size="sm"
                variant="energy"
              />
            </div>

            {/* Status Indicators */}
            <div className="flex flex-col gap-2 w-full">
              <CompactStatusIndicators student={student} />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
