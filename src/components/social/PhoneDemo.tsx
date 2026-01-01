'use client';

import React, { useState } from 'react';
import { PhoneScreen } from './PhoneScreen';
import { TrendingSection } from './TrendingSection';
import { NotificationBadge } from './NotificationBadge';
import { Button } from '@/components/ui/button';
import type { Student } from '@/lib/game/types';
import type { FeedPostData } from './FeedPost';

/**
 * Demo component showing how to use the Phone UI
 * This is for testing and demonstration purposes
 */

interface PhoneDemoProps {
  students: Student[];
  posts: FeedPostData[];
}

export function PhoneDemo({ students, posts }: PhoneDemoProps) {
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8 text-center">
          📱 Student Phone UI Demo
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Student selector */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-white mb-4">
              Select a Student
            </h2>
            <div className="space-y-2">
              {students.slice(0, 8).map(student => (
                <Button
                  key={student.id}
                  variant={selectedStudent?.id === student.id ? 'default' : 'outline'}
                  className="w-full justify-start gap-3"
                  onClick={() => setSelectedStudent(student)}
                >
                  <div className="relative">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-xs">
                      {student.firstName[0]}
                    </div>
                    {Math.random() > 0.5 && (
                      <NotificationBadge
                        count={Math.floor(Math.random() * 10) + 1}
                        animated={true}
                        size="sm"
                      />
                    )}
                  </div>
                  <span>
                    {student.firstName} {student.lastName}
                  </span>
                </Button>
              ))}
            </div>
          </div>

          {/* Center: Phone screen */}
          <div className="flex items-center justify-center">
            {selectedStudent ? (
              <PhoneScreen
                student={selectedStudent}
                posts={posts}
                students={students}
                onClose={() => setSelectedStudent(null)}
                onLike={(postId) => console.log('Liked:', postId)}
              />
            ) : (
              <div className="text-center text-slate-400 py-32">
                <div className="text-6xl mb-4">📱</div>
                <p>Select a student to view their phone</p>
              </div>
            )}
          </div>

          {/* Right: Trending section */}
          <div>
            <TrendingSection posts={posts} maxItems={5} />
          </div>
        </div>
      </div>
    </div>
  );
}
