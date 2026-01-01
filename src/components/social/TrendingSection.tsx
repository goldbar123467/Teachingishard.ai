'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Hash, Flame } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { FeedPostData } from './FeedPost';

interface TrendingSectionProps {
  posts: FeedPostData[];
  maxItems?: number;
  className?: string;
}

interface TrendingHashtag {
  tag: string;
  count: number;
  trend: 'up' | 'hot' | 'new';
}

interface TrendingPost {
  post: FeedPostData;
  engagement: number;
}

// Extract hashtags from post content
function extractHashtags(content: string): string[] {
  const hashtagRegex = /#(\w+)/g;
  const matches = content.match(hashtagRegex);
  return matches ? matches.map(tag => tag.toLowerCase()) : [];
}

// Analyze trending hashtags from posts
function getTrendingHashtags(posts: FeedPostData[], limit: number = 5): TrendingHashtag[] {
  const hashtagCounts = new Map<string, number>();

  posts.forEach(post => {
    const tags = extractHashtags(post.content);
    tags.forEach(tag => {
      hashtagCounts.set(tag, (hashtagCounts.get(tag) || 0) + 1);
    });
  });

  // Convert to array and sort by count
  const sorted = Array.from(hashtagCounts.entries())
    .map(([tag, count]) => ({
      tag,
      count,
      trend: count > 5 ? 'hot' : count > 2 ? 'up' : 'new',
    } as TrendingHashtag))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);

  // Add some default hashtags if not enough
  const defaults: TrendingHashtag[] = [
    { tag: '#classroomlife', count: 12, trend: 'hot' },
    { tag: '#homework', count: 8, trend: 'up' },
    { tag: '#recess', count: 6, trend: 'up' },
    { tag: '#friendshipgoals', count: 5, trend: 'new' },
    { tag: '#teachermoment', count: 4, trend: 'new' },
  ];

  const combined = [...sorted];
  defaults.forEach(def => {
    if (!combined.find(h => h.tag === def.tag) && combined.length < limit) {
      combined.push(def);
    }
  });

  return combined.slice(0, limit);
}

// Get top engaging posts
function getTrendingPosts(posts: FeedPostData[], limit: number = 3): TrendingPost[] {
  return posts
    .map(post => ({
      post,
      engagement: (post.likes || 0) * 2 + (post.sentiment === 'dramatic' ? 10 : 0),
    }))
    .sort((a, b) => b.engagement - a.engagement)
    .slice(0, limit);
}

const trendIconConfig = {
  hot: { icon: Flame, color: 'text-orange-500', bg: 'bg-orange-500/10' },
  up: { icon: TrendingUp, color: 'text-green-500', bg: 'bg-green-500/10' },
  new: { icon: Hash, color: 'text-blue-500', bg: 'bg-blue-500/10' },
};

export function TrendingSection({
  posts,
  maxItems = 5,
  className,
}: TrendingSectionProps) {
  const trendingHashtags = getTrendingHashtags(posts, maxItems);
  const trendingPosts = getTrendingPosts(posts, 3);

  return (
    <Card className={cn('overflow-hidden', className)}>
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-5 w-5 text-violet-500" />
          <h3 className="font-bold text-lg bg-gradient-to-r from-violet-600 to-purple-600 dark:from-violet-400 dark:to-purple-400 bg-clip-text text-transparent">
            What's Happening
          </h3>
        </div>

        {/* Trending Hashtags */}
        <div className="space-y-2 mb-4">
          {trendingHashtags.map((hashtag, index) => {
            const config = trendIconConfig[hashtag.trend];
            const Icon = config.icon;

            return (
              <motion.div
                key={hashtag.tag}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.02, x: 4 }}
                className="group cursor-pointer"
              >
                <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className={cn('p-1.5 rounded-lg', config.bg)}>
                    <Icon className={cn('h-4 w-4', config.color)} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm truncate">
                        {hashtag.tag}
                      </span>
                      {hashtag.trend === 'hot' && (
                        <motion.span
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 0.5, repeat: Infinity }}
                          className="text-xs"
                        >
                          🔥
                        </motion.span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {hashtag.count} {hashtag.count === 1 ? 'post' : 'posts'}
                    </p>
                  </div>

                  <div className="flex items-center gap-1 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-xs">View</span>
                    <span className="text-xs">→</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Divider */}
        <div className="border-t border-border my-4" />

        {/* Trending Posts Preview */}
        <div>
          <h4 className="font-semibold text-sm mb-3 text-muted-foreground">
            Top Posts Today
          </h4>
          <div className="space-y-2">
            {trendingPosts.slice(0, 3).map((item, index) => (
              <motion.div
                key={item.post.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.01 }}
                className="cursor-pointer"
              >
                <div className="p-2 rounded-lg hover:bg-muted/50 transition-colors group">
                  <div className="flex items-start gap-2">
                    <span className="text-lg flex-shrink-0">{item.post.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-foreground line-clamp-2 mb-1">
                        {item.post.content}
                      </p>
                      <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                        <span className="flex items-center gap-1">
                          ❤️ {item.post.likes || 0}
                        </span>
                        <span>•</span>
                        <span>
                          {item.post.sentiment === 'dramatic' && (
                            <span className="text-orange-500 font-medium">HOT</span>
                          )}
                          {item.post.sentiment === 'positive' && (
                            <span className="text-green-500">Positive</span>
                          )}
                          {item.post.sentiment === 'negative' && (
                            <span className="text-red-500">Drama</span>
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Footer link */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="mt-4 w-full text-center text-sm text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 font-medium transition-colors"
        >
          Show more trends
        </motion.button>
      </div>
    </Card>
  );
}

interface MiniTrendingBadgeProps {
  trend: 'up' | 'hot' | 'new';
  count?: number;
  className?: string;
}

export function MiniTrendingBadge({ trend, count, className }: MiniTrendingBadgeProps) {
  const config = trendIconConfig[trend];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className={cn(
        'inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium',
        config.bg,
        config.color,
        className
      )}
    >
      <Icon className="h-3 w-3" />
      {count !== undefined && <span>{count}</span>}
    </motion.div>
  );
}
