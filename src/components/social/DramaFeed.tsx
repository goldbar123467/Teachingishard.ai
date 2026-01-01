'use client';

import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import type { Student } from '@/lib/game/types';
import { cn } from '@/lib/utils';

// Drama post types
export type DramaType = 'gossip' | 'romance' | 'clique' | 'rivalry' | 'achievement';

export interface DramaPost {
  id: string;
  type: DramaType;
  timestamp: Date;
  involvedStudentIds: string[];
  content: string;
  reactions: {
    hearts: number;
    shocked: number;
    laughing: number;
  };
  isNew?: boolean;
  replies?: DramaReply[];
}

export interface DramaReply {
  id: string;
  studentId: string;
  content: string;
  timestamp: Date;
}

interface DramaFeedProps {
  posts: DramaPost[];
  students: Student[];
  onReact?: (postId: string, reaction: keyof DramaPost['reactions']) => void;
  maxHeight?: string;
}

function getDiceBearUrl(seed: string): string {
  return `https://api.dicebear.com/7.x/adventurer/svg?seed=${seed}`;
}

const DRAMA_TYPE_CONFIG: Record<DramaType, {
  label: string;
  icon: string;
  className: string;
  borderColor: string;
}> = {
  gossip: {
    label: 'Gossip',
    icon: '👀',
    className: 'drama-gossip',
    borderColor: 'border-l-purple-500',
  },
  romance: {
    label: 'Romance',
    icon: '💕',
    className: 'drama-romance',
    borderColor: 'border-l-pink-500',
  },
  clique: {
    label: 'Squad',
    icon: '👯',
    className: 'drama-clique',
    borderColor: 'border-l-blue-500',
  },
  rivalry: {
    label: 'Drama',
    icon: '⚡',
    className: 'drama-rivalry',
    borderColor: 'border-l-red-500',
  },
  achievement: {
    label: 'Moment',
    icon: '✨',
    className: 'drama-achievement',
    borderColor: 'border-l-green-500',
  },
};

function formatTimestamp(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 7) return `${diffDays}d`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function ReactionButton({
  emoji,
  count,
  onClick,
  active,
}: {
  emoji: string;
  count: number;
  onClick: () => void;
  active?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'drama-heart-button flex items-center gap-1 px-2 py-1 rounded-full text-xs transition-all',
        'hover:bg-muted active:scale-95',
        active && 'bg-muted font-medium'
      )}
    >
      <span className="drama-heart-icon">{emoji}</span>
      {count > 0 && <span className="tabular-nums text-muted-foreground">{count}</span>}
    </button>
  );
}

function StudentAvatarStack({
  students,
  maxShow = 3
}: {
  students: Student[];
  maxShow?: number;
}) {
  const shown = students.slice(0, maxShow);
  const remaining = students.length - maxShow;

  return (
    <div className="flex -space-x-2">
      {shown.map((student, i) => (
        <Avatar
          key={student.id}
          className={cn(
            'h-8 w-8 ring-2 ring-background',
            i > 0 && 'relative'
          )}
          style={{ zIndex: shown.length - i }}
        >
          <AvatarImage src={getDiceBearUrl(student.avatarSeed)} />
          <AvatarFallback className="text-xs">
            {student.firstName[0]}
          </AvatarFallback>
        </Avatar>
      ))}
      {remaining > 0 && (
        <div
          className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium ring-2 ring-background"
          style={{ zIndex: 0 }}
        >
          +{remaining}
        </div>
      )}
    </div>
  );
}

function DramaPostCard({
  post,
  students,
  onReact,
}: {
  post: DramaPost;
  students: Student[];
  onReact?: (reaction: keyof DramaPost['reactions']) => void;
}) {
  const config = DRAMA_TYPE_CONFIG[post.type];
  const involvedStudents = post.involvedStudentIds
    .map(id => students.find(s => s.id === id))
    .filter((s): s is Student => s !== undefined);

  const primaryStudent = involvedStudents[0];

  return (
    <div className={cn('drama-post', config.className)}>
      <Card className={cn(
        'drama-post-card border-l-4 overflow-hidden',
        config.borderColor
      )}
      style={{ backgroundColor: 'var(--drama-bg)' }}
      >
        <CardHeader className="pb-2 pt-3 px-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              {primaryStudent && (
                <Avatar className="h-10 w-10 ring-2 ring-offset-2 ring-offset-background ring-[var(--drama-accent)]">
                  <AvatarImage src={getDiceBearUrl(primaryStudent.avatarSeed)} />
                  <AvatarFallback>{primaryStudent.firstName[0]}</AvatarFallback>
                </Avatar>
              )}
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm">
                    {primaryStudent?.firstName || 'Anonymous'}
                  </span>
                  {involvedStudents.length > 1 && (
                    <span className="text-muted-foreground text-sm">
                      & {involvedStudents.length - 1} other{involvedStudents.length > 2 ? 's' : ''}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{formatTimestamp(post.timestamp)}</span>
                  <span>·</span>
                  <Badge
                    variant="outline"
                    className="text-[10px] px-1.5 py-0 h-4 font-medium"
                    style={{
                      borderColor: 'var(--drama-accent)',
                      color: 'var(--drama-accent)'
                    }}
                  >
                    {config.icon} {config.label}
                  </Badge>
                </div>
              </div>
            </div>

            {post.isNew && (
              <Badge className="drama-new-badge bg-primary text-primary-foreground text-[10px] px-1.5">
                NEW
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="px-4 pb-3">
          <p className="text-sm leading-relaxed mb-3">
            {post.content}
          </p>

          {/* Multiple students involved - show avatar stack */}
          {involvedStudents.length > 1 && (
            <div className="flex items-center gap-2 mb-3 p-2 rounded-lg bg-background/50">
              <StudentAvatarStack students={involvedStudents} />
              <span className="text-xs text-muted-foreground">
                {involvedStudents.map(s => s.firstName).join(', ')}
              </span>
            </div>
          )}

          {/* Reactions bar */}
          <div className="flex items-center gap-1 pt-2 border-t border-border/50">
            <ReactionButton
              emoji="❤️"
              count={post.reactions.hearts}
              onClick={() => onReact?.('hearts')}
            />
            <ReactionButton
              emoji="😱"
              count={post.reactions.shocked}
              onClick={() => onReact?.('shocked')}
            />
            <ReactionButton
              emoji="😂"
              count={post.reactions.laughing}
              onClick={() => onReact?.('laughing')}
            />
            <div className="flex-1" />
            <button className="text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1">
              💬 Reply
            </button>
            <button className="text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1">
              🔗 Share
            </button>
          </div>

          {/* Replies preview */}
          {post.replies && post.replies.length > 0 && (
            <div className="mt-3 pt-3 border-t border-border/50 space-y-2">
              {post.replies.slice(0, 2).map(reply => {
                const replyStudent = students.find(s => s.id === reply.studentId);
                return (
                  <div key={reply.id} className="flex gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={replyStudent ? getDiceBearUrl(replyStudent.avatarSeed) : undefined} />
                      <AvatarFallback className="text-[10px]">
                        {replyStudent?.firstName[0] || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 bg-background/50 rounded-lg px-2.5 py-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium">{replyStudent?.firstName}</span>
                        <span className="text-[10px] text-muted-foreground">
                          {formatTimestamp(reply.timestamp)}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">{reply.content}</p>
                    </div>
                  </div>
                );
              })}
              {post.replies.length > 2 && (
                <button className="text-xs text-primary hover:underline pl-8">
                  View {post.replies.length - 2} more replies
                </button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export function DramaFeed({
  posts,
  students,
  onReact,
  maxHeight = '500px',
}: DramaFeedProps) {
  const [filter, setFilter] = useState<DramaType | 'all'>('all');

  const filteredPosts = filter === 'all'
    ? posts
    : posts.filter(p => p.type === filter);

  const sortedPosts = [...filteredPosts].sort(
    (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
  );

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold">Drama Feed</span>
          <span className="text-2xl">🍿</span>
        </div>
        <Badge variant="outline" className="tabular-nums">
          {posts.length} posts
        </Badge>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 px-3 py-2 border-b overflow-x-auto">
        <Button
          size="sm"
          variant={filter === 'all' ? 'default' : 'ghost'}
          className="text-xs h-7 px-3"
          onClick={() => setFilter('all')}
        >
          All
        </Button>
        {(Object.keys(DRAMA_TYPE_CONFIG) as DramaType[]).map(type => (
          <Button
            key={type}
            size="sm"
            variant={filter === type ? 'default' : 'ghost'}
            className="text-xs h-7 px-3"
            onClick={() => setFilter(type)}
          >
            {DRAMA_TYPE_CONFIG[type].icon} {DRAMA_TYPE_CONFIG[type].label}
          </Button>
        ))}
      </div>

      {/* Feed content */}
      <ScrollArea style={{ height: maxHeight }}>
        <div className="p-3 space-y-3">
          {sortedPosts.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <div className="text-4xl mb-2">🤫</div>
              <p className="text-sm">No drama yet... give it time</p>
            </div>
          ) : (
            sortedPosts.map(post => (
              <DramaPostCard
                key={post.id}
                post={post}
                students={students}
                onReact={reaction => onReact?.(post.id, reaction)}
              />
            ))
          )}

          {/* Typing indicator */}
          {sortedPosts.length > 0 && (
            <div className="flex items-center gap-2 px-4 py-3 text-muted-foreground">
              <div className="drama-typing-indicator flex gap-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-current" />
                <span className="w-1.5 h-1.5 rounded-full bg-current" />
                <span className="w-1.5 h-1.5 rounded-full bg-current" />
              </div>
              <span className="text-xs">Someone is typing...</span>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

// Helper to generate sample drama posts for testing
export function generateSampleDrama(students: Student[]): DramaPost[] {
  if (students.length < 2) return [];

  const posts: DramaPost[] = [];
  const now = new Date();

  // Find students with relationships
  const withFriends = students.filter(s => s.friendIds.length > 0);
  const withRivals = students.filter(s => s.rivalIds.length > 0);

  // Gossip post
  if (students.length >= 2) {
    posts.push({
      id: 'drama-1',
      type: 'gossip',
      timestamp: new Date(now.getTime() - 5 * 60000),
      involvedStudentIds: [students[0].id, students[1].id],
      content: `OMG did you see ${students[0].firstName} and ${students[1].firstName} passing notes during class?! 👀`,
      reactions: { hearts: 3, shocked: 2, laughing: 1 },
      isNew: true,
    });
  }

  // Romance post
  if (withFriends.length > 0) {
    const student = withFriends[0];
    const friendId = student.friendIds[0];
    const friend = students.find(s => s.id === friendId);
    if (friend) {
      posts.push({
        id: 'drama-2',
        type: 'romance',
        timestamp: new Date(now.getTime() - 30 * 60000),
        involvedStudentIds: [student.id, friend.id],
        content: `${student.firstName} shared their snack with ${friend.firstName} at lunch... 💕 just besties or something more?`,
        reactions: { hearts: 8, shocked: 0, laughing: 2 },
      });
    }
  }

  // Rivalry post
  if (withRivals.length > 0) {
    const student = withRivals[0];
    const rivalId = student.rivalIds[0];
    const rival = students.find(s => s.id === rivalId);
    if (rival) {
      posts.push({
        id: 'drama-3',
        type: 'rivalry',
        timestamp: new Date(now.getTime() - 2 * 3600000),
        involvedStudentIds: [student.id, rival.id],
        content: `${student.firstName} and ${rival.firstName} are NOT speaking after what happened in group work. The tension is REAL. ⚡`,
        reactions: { hearts: 1, shocked: 5, laughing: 3 },
        replies: [
          {
            id: 'reply-1',
            studentId: students[Math.floor(Math.random() * students.length)].id,
            content: 'I was there, it was so awkward 😬',
            timestamp: new Date(now.getTime() - 1 * 3600000),
          },
        ],
      });
    }
  }

  // Clique post
  if (students.length >= 3) {
    posts.push({
      id: 'drama-4',
      type: 'clique',
      timestamp: new Date(now.getTime() - 4 * 3600000),
      involvedStudentIds: students.slice(0, 4).map(s => s.id),
      content: 'The back row squad is getting matching friendship bracelets! 👯‍♀️ Who else wants in?',
      reactions: { hearts: 6, shocked: 0, laughing: 0 },
    });
  }

  // Achievement post
  const giftedStudent = students.find(s => s.isGifted);
  if (giftedStudent) {
    posts.push({
      id: 'drama-5',
      type: 'achievement',
      timestamp: new Date(now.getTime() - 24 * 3600000),
      involvedStudentIds: [giftedStudent.id],
      content: `${giftedStudent.firstName} got 100% on the math test AGAIN. How do they do it?! ✨`,
      reactions: { hearts: 12, shocked: 3, laughing: 0 },
    });
  }

  return posts;
}
