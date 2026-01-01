'use client';

import { useContext, useMemo } from 'react';
import { GameContext } from '@/lib/game/context';
import type { StudentPost, StudentPhone } from '@/lib/students/socialMedia';

export function useSocialMedia() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useSocialMedia must be used within a GameProvider');
  }

  const { state, processSocialMedia, likePost, checkPhone, confiscatePhone } = context;

  return {
    posts: state.socialPosts,
    trendingPosts: state.trendingPosts,
    studentPhones: state.studentPhones,
    processSocialMedia,
    likePost,
    checkPhone,
    confiscatePhone,
  };
}

export function useStudentPhone(studentId: string): StudentPhone | undefined {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useStudentPhone must be used within a GameProvider');
  }

  return context.state.studentPhones[studentId];
}

export function useStudentPosts(studentId?: string): StudentPost[] {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useStudentPosts must be used within a GameProvider');
  }

  return useMemo(() => {
    if (!studentId) return context.state.socialPosts;
    return context.state.socialPosts.filter(p => p.authorId === studentId);
  }, [context.state.socialPosts, studentId]);
}

export function useTrendingPosts(limit: number = 10): StudentPost[] {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useTrendingPosts must be used within a GameProvider');
  }

  return useMemo(() => {
    return context.state.trendingPosts.slice(0, limit);
  }, [context.state.trendingPosts, limit]);
}
