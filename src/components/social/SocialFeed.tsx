'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { FeedPost, FeedPostData } from './FeedPost';
import type { Student } from '@/lib/game/types';
import { cn } from '@/lib/utils';

type FilterTab = 'all' | 'drama' | 'friendships' | 'academic';

interface SocialFeedProps {
  posts: FeedPostData[];
  students: Student[];
  onLike?: (postId: string) => void;
  maxHeight?: string;
  emptyStateEmoji?: string;
  emptyStateText?: string;
  phoneStyle?: boolean;
  selectedStudentId?: string;
  onRefresh?: () => void;
}

const filterConfig: Record<FilterTab, {
  label: string;
  icon: string;
  filter: (post: FeedPostData) => boolean;
}> = {
  all: {
    label: 'All',
    icon: '📱',
    filter: () => true,
  },
  drama: {
    label: 'Drama',
    icon: '⚡',
    filter: (post) => post.sentiment === 'dramatic' || post.type === 'drama',
  },
  friendships: {
    label: 'Friendships',
    icon: '💕',
    filter: (post) => post.sentiment === 'positive' && (post.type === 'interaction' || post.type === 'achievement'),
  },
  academic: {
    label: 'Academic',
    icon: '📚',
    filter: (post) => post.type === 'achievement' || post.type === 'teacher_action',
  },
};

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export function SocialFeed({
  posts,
  students,
  onLike,
  maxHeight = '600px',
  emptyStateEmoji = '🤐',
  emptyStateText = 'No posts yet. Check back later!',
  phoneStyle = false,
  selectedStudentId,
  onRefresh,
}: SocialFeedProps) {
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);

  // Filter and sort posts
  const filteredPosts = useMemo(() => {
    const config = filterConfig[activeFilter];
    let filtered = posts.filter(config.filter);

    // Filter by selected student if provided
    if (selectedStudentId) {
      filtered = filtered.filter(
        post => post.author === selectedStudentId || post.participants?.includes(selectedStudentId)
      );
    }

    return filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }, [posts, activeFilter, selectedStudentId]);

  const handlePullRefresh = () => {
    if (onRefresh && !isRefreshing) {
      setIsRefreshing(true);
      onRefresh();
      setTimeout(() => setIsRefreshing(false), 1000);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!phoneStyle) return;
    const touch = e.touches[0];
    setPullDistance(touch.clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!phoneStyle) return;
    const touch = e.touches[0];
    const distance = touch.clientY - pullDistance;
    if (distance > 80 && !isRefreshing) {
      handlePullRefresh();
    }
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-background via-background to-muted/20 rounded-xl border border-border/50">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center justify-between px-4 py-4 border-b border-border/50 bg-gradient-to-r from-background to-muted/30"
      >
        <div className="flex items-center gap-2">
          <span className="text-2xl">📱</span>
          <h2 className="text-lg font-bold bg-gradient-to-r from-violet-600 to-purple-600 dark:from-violet-400 dark:to-purple-400 bg-clip-text text-transparent">
            Social Feed
          </h2>
          <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded-full">
            {posts.length} posts
          </span>
        </div>
      </motion.div>

      {/* Filter Tabs */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="flex gap-2 px-4 py-3 border-b border-border/50 overflow-x-auto bg-muted/20 sticky top-0 z-10"
      >
        {(Object.keys(filterConfig) as FilterTab[]).map((filter) => {
          const config = filterConfig[filter];
          const isActive = activeFilter === filter;

          return (
            <motion.div
              key={filter}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                variant={isActive ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveFilter(filter)}
                className={cn(
                  'text-xs h-8 px-3 whitespace-nowrap gap-1 transition-all',
                  isActive && 'shadow-lg shadow-violet-500/30'
                )}
              >
                <span>{config.icon}</span>
                {config.label}
              </Button>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Feed Content */}
      <ScrollArea
        style={{ height: maxHeight }}
        className="flex-1"
      >
        <div
          className="p-4 space-y-3"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
        >
          {/* Pull to refresh indicator */}
          {phoneStyle && isRefreshing && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center py-2 mb-2"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="inline-block text-violet-500 text-xl"
              >
                ⟳
              </motion.div>
              <p className="text-xs text-muted-foreground mt-1">Refreshing...</p>
            </motion.div>
          )}
          {filteredPosts.length === 0 ? (
            // Empty State
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center justify-center py-16 text-center"
            >
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-6xl mb-4"
              >
                {emptyStateEmoji}
              </motion.div>
              <p className="text-sm text-muted-foreground">
                {emptyStateText}
              </p>
              {activeFilter !== 'all' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveFilter('all')}
                  className="mt-4"
                >
                  Clear filter
                </Button>
              )}
            </motion.div>
          ) : (
            // Posts List
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="space-y-3"
            >
              <AnimatePresence mode="wait">
                {filteredPosts.map((post) => (
                  <motion.div
                    key={post.id}
                    variants={itemVariants}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    <FeedPost
                      post={post}
                      students={students}
                      onLike={onLike}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}

          {/* Typing indicator at bottom */}
          {filteredPosts.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex items-center justify-center gap-1 py-4 text-muted-foreground"
            >
              <motion.span
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                className="inline-block w-1.5 h-1.5 rounded-full bg-current"
              />
              <motion.span
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: 0.1 }}
                className="inline-block w-1.5 h-1.5 rounded-full bg-current"
              />
              <motion.span
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                className="inline-block w-1.5 h-1.5 rounded-full bg-current"
              />
              <span className="text-xs ml-1">Someone is typing...</span>
            </motion.div>
          )}
        </div>
      </ScrollArea>

      {/* Footer hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="px-4 py-2 border-t border-border/50 text-center text-[10px] text-muted-foreground bg-muted/20"
      >
        Refreshes as events happen
      </motion.div>
    </div>
  );
}
