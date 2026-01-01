'use client';

import React from 'react';
import { motion } from 'framer-motion';
import type { Student } from '@/lib/game/types';
import type { FeedPostData } from './FeedPost';
import { StudentAvatar } from './StudentAvatar';
import { cn } from '@/lib/utils';
import { Heart, MessageCircle, Share2 } from 'lucide-react';

interface SocialPostProps {
  post: FeedPostData;
  students: Student[];
  onLike?: (postId: string) => void;
  viewingStudent?: Student;
  compact?: boolean;
}

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

const postTypeConfig = {
  interaction: { icon: '💬', color: 'from-blue-500/20 to-blue-400/10' },
  mood_change: { icon: '😊', color: 'from-purple-500/20 to-purple-400/10' },
  achievement: { icon: '🏆', color: 'from-amber-500/20 to-amber-400/10' },
  drama: { icon: '⚡', color: 'from-red-500/20 to-red-400/10' },
  teacher_action: { icon: '👨‍🏫', color: 'from-green-500/20 to-green-400/10' },
};

export function SocialPost({
  post,
  students,
  onLike,
  viewingStudent,
  compact = false,
}: SocialPostProps) {
  const authorStudent = students.find(s => s.id === post.author);
  const config = postTypeConfig[post.type];
  const [liked, setLiked] = React.useState(false);
  const [likeCount, setLikeCount] = React.useState(post.likes ?? 0);

  const handleLike = () => {
    if (!liked) {
      setLiked(true);
      setLikeCount(prev => prev + 1);
      onLike?.(post.id);
    } else {
      setLiked(false);
      setLikeCount(prev => Math.max(0, prev - 1));
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'rounded-lg overflow-hidden',
        !compact && 'bg-gradient-to-br to-slate-900/40 from-slate-800/60 border border-slate-700/50'
      )}
    >
      <div className={cn('p-3', compact && 'pb-2')}>
        {/* Header */}
        <div className="flex items-start gap-3 mb-2">
          {authorStudent && (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
              {authorStudent.firstName[0]}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-white font-semibold text-sm truncate">
                {authorStudent?.firstName || 'System'}
              </span>
              <span className="text-slate-400 text-xs">
                @{authorStudent?.firstName.toLowerCase()}{authorStudent?.id.slice(0, 3)}
              </span>
            </div>
            <p className="text-slate-500 text-xs mt-0.5">
              {formatTime(post.timestamp)}
            </p>
          </div>
          <div className="text-lg flex-shrink-0">{post.emoji}</div>
        </div>

        {/* Content */}
        <p className={cn('text-slate-100 leading-snug mb-2', compact ? 'text-xs' : 'text-sm')}>
          {post.content}
        </p>

        {/* Footer - Actions */}
        {!compact && (
          <div className="flex items-center justify-between pt-2 mt-2 border-t border-slate-700/50 text-slate-400">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleLike}
              className="flex items-center gap-1.5 text-xs hover:text-pink-400 transition-colors"
            >
              <Heart
                className={cn('h-4 w-4', liked && 'fill-pink-500 text-pink-500')}
              />
              <span>{likeCount}</span>
            </motion.button>
            <button className="flex items-center gap-1.5 text-xs hover:text-blue-400 transition-colors">
              <MessageCircle className="h-4 w-4" />
              <span>{Math.floor(Math.random() * 10)}</span>
            </button>
            <button className="flex items-center gap-1.5 text-xs hover:text-green-400 transition-colors">
              <Share2 className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
