'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { X, Home, Bell, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Student } from '@/lib/game/types';
import type { FeedPostData } from './FeedPost';
import { SocialPost } from './SocialPost';
import { ScrollArea } from '@/components/ui/scroll-area';

type PhoneTab = 'feed' | 'notifications' | 'profile';

interface PhoneScreenProps {
  student: Student;
  posts: FeedPostData[];
  students: Student[];
  onClose: () => void;
  onLike?: (postId: string) => void;
  className?: string;
}

export function PhoneScreen({
  student,
  posts,
  students,
  onClose,
  onLike,
  className,
}: PhoneScreenProps) {
  const [activeTab, setActiveTab] = useState<PhoneTab>('feed');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filter posts - student's own posts and posts they can see
  const visiblePosts = posts
    .filter(post => {
      // Show posts from the student
      if (post.author === student.id) return true;
      // Show posts from friends
      if (student.friendIds?.includes(post.author)) return true;
      // Show posts where student is mentioned
      if (post.participants?.includes(student.id)) return true;
      return false;
    })
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  // Simulated notifications count
  const notificationCount = Math.floor(Math.random() * 5) + 1;

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className={cn(
        'relative mx-auto max-w-sm w-full',
        className
      )}
    >
      {/* Phone Frame */}
      <div className="relative bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 rounded-[3rem] p-3 shadow-2xl ring-1 ring-slate-700">
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-slate-950 rounded-b-3xl z-20 flex items-center justify-center">
          <div className="w-16 h-1 bg-slate-800 rounded-full" />
        </div>

        {/* Screen */}
        <div className="relative bg-slate-950 rounded-[2.5rem] overflow-hidden shadow-inner h-[680px] flex flex-col">
          {/* Status Bar */}
          <div className="relative z-10 flex items-center justify-between px-6 pt-8 pb-2 bg-gradient-to-b from-slate-900/95 to-transparent">
            <span className="text-white text-sm font-medium">
              {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
            </span>
            <div className="flex items-center gap-1">
              <div className="w-1 h-1 rounded-full bg-green-400" />
              <div className="text-white text-xs">📶</div>
              <div className="text-white text-xs">🔋</div>
            </div>
          </div>

          {/* App Header */}
          <div className="relative z-10 flex items-center justify-between px-4 py-3 bg-slate-900/90 backdrop-blur-sm border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm shadow-lg">
                {student.firstName[0]}
              </div>
              <div>
                <h3 className="text-white font-semibold text-sm">
                  {student.firstName}
                </h3>
                <p className="text-slate-400 text-xs">
                  @{student.firstName.toLowerCase()}{student.id.slice(0, 3)}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0 text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 relative overflow-hidden">
            <AnimatePresence mode="wait">
              {activeTab === 'feed' && (
                <motion.div
                  key="feed"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                  className="h-full"
                >
                  <ScrollArea className="h-full">
                    <div className="p-4 space-y-3">
                      {/* Pull to refresh indicator */}
                      {isRefreshing && (
                        <motion.div
                          initial={{ opacity: 0, y: -20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-center py-2"
                        >
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                            className="inline-block text-purple-400"
                          >
                            ⟳
                          </motion.div>
                        </motion.div>
                      )}

                      {visiblePosts.length === 0 ? (
                        <div className="text-center py-16">
                          <div className="text-6xl mb-4">📱</div>
                          <p className="text-slate-400 text-sm">
                            No posts yet
                          </p>
                          <p className="text-slate-500 text-xs mt-1">
                            Follow friends to see their posts
                          </p>
                        </div>
                      ) : (
                        visiblePosts.map(post => (
                          <SocialPost
                            key={post.id}
                            post={post}
                            students={students}
                            onLike={onLike}
                            viewingStudent={student}
                          />
                        ))
                      )}

                      {/* Bottom spacing */}
                      <div className="h-20" />
                    </div>
                  </ScrollArea>
                </motion.div>
              )}

              {activeTab === 'notifications' && (
                <motion.div
                  key="notifications"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                  className="h-full"
                >
                  <ScrollArea className="h-full">
                    <div className="p-4 space-y-3">
                      <h3 className="text-white font-semibold mb-4">Notifications</h3>
                      {Array.from({ length: notificationCount }).map((_, i) => (
                        <div
                          key={i}
                          className="bg-slate-900/50 border border-slate-800 rounded-xl p-3 hover:bg-slate-800/50 transition-colors"
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                              <Bell className="h-5 w-5 text-white" />
                            </div>
                            <div className="flex-1">
                              <p className="text-white text-sm">
                                Someone liked your post
                              </p>
                              <p className="text-slate-400 text-xs mt-1">
                                {Math.floor(Math.random() * 60)}m ago
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </motion.div>
              )}

              {activeTab === 'profile' && (
                <motion.div
                  key="profile"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                  className="h-full"
                >
                  <ScrollArea className="h-full">
                    <div className="p-4">
                      {/* Profile Header */}
                      <div className="text-center mb-6">
                        <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-3xl shadow-2xl mb-4">
                          {student.firstName[0]}
                        </div>
                        <h2 className="text-white font-bold text-xl mb-1">
                          {student.firstName} {student.lastName}
                        </h2>
                        <p className="text-slate-400 text-sm mb-4">
                          @{student.firstName.toLowerCase()}{student.id.slice(0, 3)}
                        </p>
                        <div className="flex gap-4 justify-center text-center">
                          <div>
                            <div className="text-white font-bold">
                              {visiblePosts.filter(p => p.author === student.id).length}
                            </div>
                            <div className="text-slate-400 text-xs">Posts</div>
                          </div>
                          <div>
                            <div className="text-white font-bold">
                              {student.friendIds?.length || 0}
                            </div>
                            <div className="text-slate-400 text-xs">Friends</div>
                          </div>
                          <div>
                            <div className="text-white font-bold">
                              {Math.floor(student.popularity || 50)}
                            </div>
                            <div className="text-slate-400 text-xs">Popularity</div>
                          </div>
                        </div>
                      </div>

                      {/* Student's Posts */}
                      <div className="border-t border-slate-800 pt-4">
                        <h3 className="text-white font-semibold mb-3 text-sm">Posts</h3>
                        <div className="space-y-3">
                          {visiblePosts
                            .filter(p => p.author === student.id)
                            .slice(0, 5)
                            .map(post => (
                              <SocialPost
                                key={post.id}
                                post={post}
                                students={students}
                                onLike={onLike}
                                viewingStudent={student}
                                compact
                              />
                            ))}
                        </div>
                      </div>
                    </div>
                  </ScrollArea>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Bottom Navigation */}
          <div className="relative z-10 flex items-center justify-around px-6 py-4 bg-slate-900/95 backdrop-blur-sm border-t border-slate-800">
            <TabButton
              icon={Home}
              label="Feed"
              active={activeTab === 'feed'}
              onClick={() => setActiveTab('feed')}
            />
            <TabButton
              icon={Bell}
              label="Notifications"
              active={activeTab === 'notifications'}
              onClick={() => setActiveTab('notifications')}
              badge={notificationCount}
            />
            <TabButton
              icon={User}
              label="Profile"
              active={activeTab === 'profile'}
              onClick={() => setActiveTab('profile')}
            />
          </div>
        </div>

        {/* Home indicator */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-slate-700 rounded-full" />
      </div>
    </motion.div>
  );
}

interface TabButtonProps {
  icon: React.ElementType;
  label: string;
  active: boolean;
  onClick: () => void;
  badge?: number;
}

function TabButton({ icon: Icon, label, active, onClick, badge }: TabButtonProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="relative flex flex-col items-center gap-1"
    >
      <div className="relative">
        <Icon
          className={cn(
            'h-6 w-6 transition-colors',
            active ? 'text-purple-400' : 'text-slate-400'
          )}
        />
        {badge !== undefined && badge > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full h-4 min-w-[16px] px-1 flex items-center justify-center"
          >
            {badge}
          </motion.div>
        )}
      </div>
      <span
        className={cn(
          'text-[10px] transition-colors',
          active ? 'text-purple-400 font-medium' : 'text-slate-400'
        )}
      >
        {label}
      </span>
    </motion.button>
  );
}
