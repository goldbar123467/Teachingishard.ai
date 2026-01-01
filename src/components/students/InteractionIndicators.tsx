'use client';

import { motion, AnimatePresence } from 'framer-motion';
import type { Student } from '@/lib/game/types';
import { cn } from '@/lib/utils';

interface InteractionIndicatorsProps {
  students: Student[];
  showConnections?: boolean;
}

interface ConnectionLineProps {
  from: { x: number; y: number };
  to: { x: number; y: number };
  type: 'friend' | 'rival';
  strength: number;
}

function ConnectionLine({ from, to, type, strength }: ConnectionLineProps) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  const angle = Math.atan2(dy, dx) * (180 / Math.PI);

  const color = type === 'friend' ? 'bg-green-500' : 'bg-red-500';
  const opacity = Math.min(Math.abs(strength) / 100, 0.6);

  return (
    <motion.div
      initial={{ scaleX: 0, opacity: 0 }}
      animate={{ scaleX: 1, opacity }}
      exit={{ scaleX: 0, opacity: 0 }}
      transition={{ duration: 0.3 }}
      className={cn('absolute h-0.5 origin-left pointer-events-none', color)}
      style={{
        left: from.x,
        top: from.y,
        width: distance,
        transform: `rotate(${angle}deg)`,
      }}
    >
      {/* Animated particles along the line */}
      <motion.div
        className={cn('absolute w-1 h-1 rounded-full', color)}
        animate={{
          x: [0, distance, 0],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
    </motion.div>
  );
}

interface PassingNoteProps {
  from: { x: number; y: number };
  to: { x: number; y: number };
}

function PassingNote({ from, to }: PassingNoteProps) {
  return (
    <motion.div
      className="absolute w-4 h-3 pointer-events-none z-20"
      initial={{ x: from.x, y: from.y, opacity: 0, scale: 0 }}
      animate={{
        x: to.x,
        y: to.y,
        opacity: [0, 1, 1, 0],
        scale: [0, 1, 1, 0],
        rotate: [0, 360],
      }}
      transition={{
        duration: 1.5,
        ease: 'easeInOut',
      }}
    >
      📝
    </motion.div>
  );
}

interface StudentInteractionBadgeProps {
  student: Student;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

export function StudentInteractionBadge({
  student,
  position = 'top-right',
}: StudentInteractionBadgeProps) {
  const friendCount = student.friendIds.length;
  const rivalCount = student.rivalIds.length;

  const positionClasses = {
    'top-left': 'top-2 left-2',
    'top-right': 'top-2 right-2',
    'bottom-left': 'bottom-2 left-2',
    'bottom-right': 'bottom-2 right-2',
  };

  if (friendCount === 0 && rivalCount === 0) return null;

  return (
    <div className={cn('absolute z-10 flex gap-1', positionClasses[position])}>
      <AnimatePresence>
        {friendCount > 0 && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-medium shadow-sm"
          >
            <span>👥</span>
            <span>{friendCount}</span>
          </motion.div>
        )}
        {rivalCount > 0 && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-xs font-medium shadow-sm"
          >
            <span>⚔️</span>
            <span>{rivalCount}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Helper to detect if students are interacting based on their traits and relationships
function detectInteraction(student: Student, allStudents: Student[]): {
  type: 'chatting' | 'arguing' | 'helping' | 'passing-note' | null;
  partnerId: string | null;
} {
  // Social students with friends nearby might be chatting
  if (student.primaryTrait === 'social' && student.friendIds.length > 0 && Math.random() < 0.3) {
    return {
      type: 'chatting',
      partnerId: student.friendIds[Math.floor(Math.random() * student.friendIds.length)],
    };
  }

  // Students with rivals might be arguing
  if (student.rivalIds.length > 0 && student.mood === 'frustrated' && Math.random() < 0.2) {
    return {
      type: 'arguing',
      partnerId: student.rivalIds[Math.floor(Math.random() * student.rivalIds.length)],
    };
  }

  // Outgoing or curious students might be helping others
  if (
    (student.primaryTrait === 'outgoing' || student.primaryTrait === 'curious') &&
    student.friendIds.length > 0 &&
    student.engagement > 60 &&
    Math.random() < 0.25
  ) {
    return {
      type: 'helping',
      partnerId: student.friendIds[Math.floor(Math.random() * student.friendIds.length)],
    };
  }

  // Distracted students might be passing notes
  if (
    (student.primaryTrait === 'distracted' || student.engagement < 30) &&
    student.friendIds.length > 0 &&
    Math.random() < 0.15
  ) {
    return {
      type: 'passing-note',
      partnerId: student.friendIds[Math.floor(Math.random() * student.friendIds.length)],
    };
  }

  return { type: null, partnerId: null };
}

interface InteractionIconProps {
  type: 'chatting' | 'arguing' | 'helping' | 'passing-note';
  className?: string;
}

function InteractionIcon({ type, className }: InteractionIconProps) {
  const configs = {
    chatting: { emoji: '💬', color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-900/30' },
    arguing: { emoji: '💥', color: 'text-red-500', bg: 'bg-red-100 dark:bg-red-900/30' },
    helping: { emoji: '🤝', color: 'text-green-500', bg: 'bg-green-100 dark:bg-green-900/30' },
    'passing-note': {
      emoji: '📝',
      color: 'text-orange-500',
      bg: 'bg-orange-100 dark:bg-orange-900/30',
    },
  };

  const config = configs[type];

  return (
    <motion.div
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      exit={{ scale: 0, rotate: 180 }}
      transition={{ type: 'spring', stiffness: 400, damping: 15 }}
      className={cn(
        'absolute -top-2 -right-2 z-20',
        'w-6 h-6 rounded-full flex items-center justify-center text-xs',
        'shadow-md',
        config.bg,
        config.color,
        className
      )}
    >
      {config.emoji}
    </motion.div>
  );
}

// Simple interaction indicator for a single student card
export function StudentInteractionIndicator({ student }: { student: Student }) {
  // Randomly show interaction states (in real game, this would be based on actual game state)
  const shouldShow = Math.random() < 0.2; // 20% chance to show interaction

  if (!shouldShow || !student.attendanceToday) return null;

  const interactions = [
    student.primaryTrait === 'social' && student.friendIds.length > 0 && 'chatting',
    student.rivalIds.length > 0 && student.mood === 'frustrated' && 'arguing',
    (student.primaryTrait === 'outgoing' || student.primaryTrait === 'curious') &&
      student.engagement > 60 &&
      'helping',
    student.engagement < 30 && student.friendIds.length > 0 && 'passing-note',
  ].filter(Boolean);

  if (interactions.length === 0) return null;

  const type = interactions[Math.floor(Math.random() * interactions.length)] as
    | 'chatting'
    | 'arguing'
    | 'helping'
    | 'passing-note';

  return <InteractionIcon type={type} />;
}

// Full grid-level interaction system (for future use with positioning)
export function InteractionIndicators({ students, showConnections = false }: InteractionIndicatorsProps) {
  // This component would be used at the grid level to show connections between students
  // For now, we'll return null as we need grid position data to draw connection lines
  // In the future, this could be integrated with a grid layout system

  return null;
}
