'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { StudentAvatar } from './StudentAvatar';
import type { Student } from '@/lib/game/types';
import { cn } from '@/lib/utils';

export interface FeedPostData {
  id: string;
  type: 'interaction' | 'mood_change' | 'achievement' | 'drama' | 'teacher_action';
  author: string; // student ID or 'system'
  content: string;
  emoji: string;
  timestamp: Date;
  participants: string[]; // student IDs involved
  sentiment: 'positive' | 'negative' | 'neutral' | 'dramatic';
  likes?: number;
  tags?: string[]; // hashtags for trending topics
}

interface FeedPostProps {
  post: FeedPostData;
  students: Student[];
  onLike?: (postId: string) => void;
  onAuthorClick?: (student: Student) => void;
}

const postTypeConfig = {
  interaction: {
    label: 'Interaction',
    icon: '💬',
    color: 'text-blue-600 dark:text-blue-400',
  },
  mood_change: {
    label: 'Mood Change',
    icon: '😊',
    color: 'text-purple-600 dark:text-purple-400',
  },
  achievement: {
    label: 'Achievement',
    icon: '🏆',
    color: 'text-amber-600 dark:text-amber-400',
  },
  drama: {
    label: 'Drama',
    icon: '⚡',
    color: 'text-red-600 dark:text-red-400',
  },
  teacher_action: {
    label: 'Teacher',
    icon: '👨‍🏫',
    color: 'text-green-600 dark:text-green-400',
  },
};

const sentimentBorderColors = {
  positive: 'border-l-green-500 shadow-lg shadow-green-500/10',
  negative: 'border-l-red-500 shadow-lg shadow-red-500/10',
  neutral: 'border-l-slate-400 shadow-lg shadow-slate-400/10',
  dramatic: 'border-l-orange-500 shadow-lg shadow-orange-500/20',
};

const typeBorderColors = {
  drama: 'border-l-pink-500 shadow-lg shadow-pink-500/10',
  achievement: 'border-l-blue-500 shadow-lg shadow-blue-500/10',
  interaction: 'border-l-green-500 shadow-lg shadow-green-500/10',
  mood_change: 'border-l-purple-500 shadow-lg shadow-purple-500/10',
  teacher_action: 'border-l-blue-500 shadow-lg shadow-blue-500/10',
};

const dramaticGlowAnimation = {
  initial: { boxShadow: 'inset 0 0 20px rgba(249, 115, 22, 0)' },
  animate: {
    boxShadow: [
      'inset 0 0 20px rgba(249, 115, 22, 0)',
      'inset 0 0 20px rgba(249, 115, 22, 0.3)',
      'inset 0 0 20px rgba(249, 115, 22, 0)',
    ],
    transition: { duration: 2, repeat: Infinity },
  },
};

function formatTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function FeedPost({
  post,
  students,
  onLike,
  onAuthorClick,
}: FeedPostProps) {
  const config = postTypeConfig[post.type];
  const authorStudent = students.find(s => s.id === post.author);
  const participantStudents = post.participants
    .map(id => students.find(s => s.id === id))
    .filter((s): s is Student => s !== undefined);

  const isDrama = post.sentiment === 'dramatic';
  // Use type-based border colors, fallback to sentiment if type doesn't have specific color
  const borderColor = typeBorderColors[post.type] || sentimentBorderColors[post.sentiment];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.4 }}
      className="w-full"
    >
      <motion.div
        {...(isDrama ? dramaticGlowAnimation : {})}
        whileHover={{ translateY: -2 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        <Card
          className={cn(
            'border-l-4 overflow-hidden transition-all duration-300',
            borderColor,
            isDrama && 'ring-2 ring-orange-500/50',
            'hover:shadow-lg hover:shadow-slate-400/20 dark:hover:shadow-slate-600/20'
          )}
        >
          <div className="p-4">
            {/* Header: Avatar, Name, Type, Time */}
            <div className="flex items-start gap-3 mb-3">
              {authorStudent && (
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="cursor-pointer"
                  onClick={() => onAuthorClick?.(authorStudent)}
                >
                  <StudentAvatar
                    student={authorStudent}
                    size="md"
                    showMood={true}
                  />
                </motion.div>
              )}

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <motion.span
                    whileHover={{ scale: 1.02 }}
                    className={cn(
                      "font-semibold text-sm truncate transition-colors",
                      onAuthorClick && authorStudent && "cursor-pointer hover:text-primary"
                    )}
                    onClick={() => authorStudent && onAuthorClick?.(authorStudent)}
                  >
                    {authorStudent?.firstName || 'System'}
                  </motion.span>
                  <Badge
                    variant="outline"
                    className={cn(
                      'text-[10px] px-2 py-0 h-5',
                      config.color
                    )}
                  >
                    <span className="mr-1">{config.icon}</span>
                    {config.label}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {formatTime(post.timestamp)}
                </p>
              </div>

              {/* Emoji indicator */}
              <div className="text-2xl">{post.emoji}</div>
            </div>

            {/* Content */}
            <p className="text-sm leading-relaxed mb-3 text-foreground">
              {post.content}
            </p>

            {/* Participants display (if more than just author) */}
            {participantStudents.length > 1 && (
              <div className="flex items-center gap-2 mb-3 p-2 rounded-lg bg-muted/50">
                <div className="flex -space-x-2">
                  {participantStudents.slice(0, 3).map((student, i) => (
                    <div
                      key={student.id}
                      className="relative"
                      style={{ zIndex: participantStudents.length - i }}
                    >
                      <StudentAvatar
                        student={student}
                        size="sm"
                        showMood={false}
                      />
                    </div>
                  ))}
                  {participantStudents.length > 3 && (
                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-[10px] font-medium ring-2 ring-background">
                      +{participantStudents.length - 3}
                    </div>
                  )}
                </div>
                <span className="text-xs text-muted-foreground">
                  {participantStudents.map(s => s.firstName).join(', ')}
                </span>
              </div>
            )}

            {/* Engagement footer */}
            <div className="flex items-center justify-between pt-2 border-t border-border/50">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onLike?.(post.id)}
                className={cn(
                  'flex items-center gap-1 px-3 py-1.5 rounded-md text-sm transition-all',
                  'hover:bg-muted active:scale-95'
                )}
              >
                <span className="text-lg">❤️</span>
                <span className="text-xs font-medium">
                  {post.likes ?? 0}
                </span>
              </motion.button>

              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2 text-xs"
                >
                  💬 Reply
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2 text-xs"
                >
                  🔗 Share
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}
