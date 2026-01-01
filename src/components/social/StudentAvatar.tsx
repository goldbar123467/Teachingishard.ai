'use client';

import React from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import type { Student, Mood } from '@/lib/game/types';
import { cn } from '@/lib/utils';

interface StudentAvatarProps {
  student: Student;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showMood?: boolean;
}

const sizeClasses = {
  sm: 'h-8 w-8 text-[10px]',
  md: 'h-12 w-12 text-sm',
  lg: 'h-16 w-16 text-base',
  xl: 'h-24 w-24 text-lg',
};

const moodRingColors: Record<Mood, {
  ring: string;
  bg: string;
  gradient: string;
}> = {
  happy: {
    ring: 'ring-green-400 shadow-lg shadow-green-400/30',
    bg: 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950',
    gradient: 'from-green-300 to-emerald-300',
  },
  excited: {
    ring: 'ring-yellow-400 shadow-lg shadow-yellow-400/30',
    bg: 'bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-950 dark:to-amber-950',
    gradient: 'from-yellow-300 to-amber-300',
  },
  neutral: {
    ring: 'ring-slate-300 shadow-lg shadow-slate-300/20',
    bg: 'bg-gradient-to-br from-slate-50 to-gray-50 dark:from-slate-900 dark:to-gray-900',
    gradient: 'from-slate-300 to-gray-300',
  },
  bored: {
    ring: 'ring-orange-400 shadow-lg shadow-orange-400/30',
    bg: 'bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950 dark:to-amber-950',
    gradient: 'from-orange-300 to-amber-300',
  },
  frustrated: {
    ring: 'ring-orange-500 shadow-lg shadow-orange-500/30',
    bg: 'bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950 dark:to-red-950',
    gradient: 'from-orange-400 to-red-400',
  },
  upset: {
    ring: 'ring-red-500 shadow-lg shadow-red-500/30',
    bg: 'bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-950 dark:to-rose-950',
    gradient: 'from-red-400 to-rose-400',
  },
};

const moodEmojis: Record<Mood, string> = {
  happy: '😊',
  excited: '🤩',
  neutral: '😐',
  bored: '😑',
  frustrated: '😠',
  upset: '😢',
};

function getDiceBearUrl(seed: string): string {
  return `https://api.dicebear.com/7.x/adventurer/svg?seed=${seed}`;
}

export function StudentAvatar({
  student,
  size = 'md',
  showMood = true,
}: StudentAvatarProps) {
  const moodConfig = moodRingColors[student.mood];
  const sizeClass = sizeClasses[size];

  // Scale ring width based on size
  const ringWidth = size === 'sm' ? 'ring-1' : size === 'md' ? 'ring-2' : 'ring-[3px]';

  return (
    <div className="relative inline-block">
      {/* Background glow */}
      <div
        className={cn(
          'absolute inset-0 rounded-full blur-lg opacity-30',
          `bg-gradient-to-br ${moodConfig.gradient}`
        )}
        style={{ transform: 'scale(1.1)' }}
      />

      {/* Avatar with mood ring */}
      <Avatar
        className={cn(
          sizeClass,
          'relative border-2 border-background transition-all duration-300',
          ringWidth,
          moodConfig.ring
        )}
      >
        <AvatarImage
          src={getDiceBearUrl(student.avatarSeed)}
          alt={`${student.firstName} ${student.lastName}`}
        />
        <AvatarFallback className={cn(moodConfig.bg)}>
          {student.firstName[0]}
          {student.lastName[0]}
        </AvatarFallback>
      </Avatar>

      {/* Mood indicator emoji - positioned absolutely */}
      {showMood && (
        <div
          className={cn(
            'absolute bottom-0 right-0 rounded-full bg-white dark:bg-slate-800',
            'border-2 border-background shadow-lg flex items-center justify-center',
            'transform transition-transform duration-200',
            size === 'sm' && 'h-5 w-5 text-xs',
            size === 'md' && 'h-6 w-6 text-sm',
            size === 'lg' && 'h-8 w-8 text-base',
            size === 'xl' && 'h-10 w-10 text-lg'
          )}
        >
          {moodEmojis[student.mood]}
        </div>
      )}

      {/* Student name tooltip on hover (for larger sizes) */}
      {size === 'lg' || size === 'xl' && (
        <div
          className={cn(
            'absolute top-full mt-2 left-1/2 transform -translate-x-1/2',
            'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900',
            'text-xs font-medium px-2 py-1 rounded whitespace-nowrap',
            'opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity'
          )}
        >
          {student.firstName}
        </div>
      )}
    </div>
  );
}
