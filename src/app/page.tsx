'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { StudentGrid } from '@/components/students/StudentGrid';
import { useGame, useClassStats, useTurn, useTeacher, useSchoolYear } from '@/hooks/useGame';
import { DAY_LABELS, PHASE_LABELS, PHASE_ORDER } from '@/lib/game/constants';
import type { Student, GameState, GameEvent } from '@/lib/game/types';
import { LessonSelector } from '@/components/teaching/LessonSelector';
import { TeachingMethodPicker } from '@/components/teaching/TeachingMethodPicker';
import { HomeworkAssigner } from '@/components/teaching/HomeworkAssigner';
import { ClassInsights } from '@/components/dashboard/ClassInsights';
import { SaveLoadModal } from '@/components/game/SaveLoadModal';
import { useAutoSave, formatLastSaved } from '@/hooks/useAutoSave';
import { EventPopup, EventNotification } from '@/components/game/EventPopup';
import { DayTransition, calculateDaySummary } from '@/components/game/DayTransition';
import { StudentDetailModal } from '@/components/students/StudentDetailModal';
import { MainLayout } from '@/components/layout';
import { SchoolYearCalendar, SchoolYearProgress } from '@/components/dashboard/SchoolYearCalendar';
import { SocialFeed } from '@/components/social/SocialFeed';
import type { FeedPostData } from '@/components/social/FeedPost';
import { generateSocialInteraction, generateFeedPost } from '@/lib/students/socialEngine';

function PhaseIndicator() {
  const turn = useTurn();
  const currentIndex = PHASE_ORDER.indexOf(turn.phase);

  return (
    <div className="flex items-center gap-1">
      {PHASE_ORDER.map((phase, index) => (
        <div key={phase} className="flex items-center">
          <div
            className={`
              phase-step w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold
              transition-all duration-300 shadow-sm
              ${index < currentIndex
                ? 'bg-gradient-to-br from-emerald-400 to-green-500 text-white shadow-emerald-200 dark:shadow-emerald-900/50'
                : ''
              }
              ${index === currentIndex
                ? 'bg-gradient-to-br from-primary to-primary/80 text-primary-foreground ring-2 ring-primary/30 ring-offset-2 ring-offset-background'
                : ''
              }
              ${index > currentIndex
                ? 'bg-muted text-muted-foreground/70'
                : ''
              }
            `}
          >
            {index < currentIndex ? (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              index + 1
            )}
          </div>
          {index < PHASE_ORDER.length - 1 && (
            <div
              className={`
                phase-connector w-6 h-0.5 mx-0.5 rounded-full transition-colors duration-300
                ${index < currentIndex
                  ? 'bg-gradient-to-r from-green-500 to-emerald-400'
                  : 'bg-muted'
                }
              `}
            />
          )}
        </div>
      ))}
    </div>
  );
}

function TeacherStats() {
  const teacher = useTeacher();

  const energyColor = teacher.energy < 30
    ? 'from-red-400 to-red-500'
    : teacher.energy < 60
    ? 'from-amber-400 to-yellow-500'
    : 'from-emerald-400 to-green-500';

  const energyTextColor = teacher.energy < 30
    ? 'text-red-600 dark:text-red-400'
    : teacher.energy < 60
    ? 'text-amber-600 dark:text-amber-400'
    : 'text-emerald-600 dark:text-emerald-400';

  return (
    <div className="grid grid-cols-2 gap-6">
      <div>
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-xs font-medium text-muted-foreground">Teacher Energy</span>
          <span className={`text-sm font-bold tabular-nums ${energyTextColor}`}>
            {teacher.energy}%
          </span>
        </div>
        <div className="relative h-2.5 w-full rounded-full bg-secondary/60 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ease-out bg-gradient-to-r ${energyColor}`}
            style={{ width: `${teacher.energy}%` }}
          />
        </div>
      </div>
      <div className="flex flex-col justify-center">
        <div className="text-xs font-medium text-muted-foreground mb-0.5">Supplies Budget</div>
        <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
          ${teacher.suppliesBudget}
        </div>
      </div>
    </div>
  );
}

interface TurnControlsProps {
  onEndDay?: () => void;
}

function TurnControls({ onEndDay }: TurnControlsProps) {
  const { advancePhase, advanceDay, canAdvancePhase } = useGame();
  const turn = useTurn();

  const handleEndDay = () => {
    if (onEndDay) {
      onEndDay();
    } else {
      advanceDay();
    }
  };

  return (
    <div className="flex gap-2">
      {turn.phase !== 'end-of-day' ? (
        <Button
          onClick={advancePhase}
          disabled={!canAdvancePhase}
        >
          {canAdvancePhase ? `Continue to ${PHASE_LABELS[PHASE_ORDER[PHASE_ORDER.indexOf(turn.phase) + 1]]}` : 'Complete Required Actions'}
        </Button>
      ) : (
        <Button onClick={handleEndDay}>
          End Day → View Summary
        </Button>
      )}
    </div>
  );
}

function PhaseContent() {
  const turn = useTurn();
  const teacher = useTeacher();
  const { state, selectLesson, selectMethod, assignHomework } = useGame();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const classLearningStyles = state.students.map(s => s.learningStyle);

  switch (turn.phase) {
    case 'morning':
      return (
        <Card>
          <CardHeader>
            <CardTitle>Morning Check-In</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Review your students&apos; status. Check who completed homework and who might need extra attention today.
            </p>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold">{mounted ? state.students.filter(s => s.attendanceToday).length : '-'}</div>
                <div className="text-xs text-muted-foreground">Present</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{mounted ? state.students.filter(s => s.homeworkCompleted).length : '-'}</div>
                <div className="text-xs text-muted-foreground">Homework Done</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{mounted ? state.students.filter(s => s.mood === 'happy' || s.mood === 'excited').length : '-'}</div>
                <div className="text-xs text-muted-foreground">Happy</div>
              </div>
            </div>
          </CardContent>
        </Card>
      );

    case 'teaching':
      return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Step 1: Choose a Lesson</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Select what to teach today. Different subjects have different energy costs and difficulty levels.
                </p>
                <LessonSelector
                  selectedLesson={turn.selectedLesson}
                  onSelectLesson={selectLesson}
                  teacherEnergy={teacher.energy}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Step 2: Choose a Teaching Method</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Pick how to teach the lesson. Methods work best for certain learning styles - check the effectiveness bar.
                </p>
                <TeachingMethodPicker
                  selectedMethod={turn.selectedMethod}
                  onSelectMethod={selectMethod}
                  teacherEnergy={teacher.energy}
                  classLearningStyles={classLearningStyles}
                />
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <ClassInsights
              students={state.students}
              selectedLesson={turn.selectedLesson}
              selectedMethod={turn.selectedMethod}
              showPredictions={turn.selectedLesson !== null && turn.selectedMethod !== null}
            />
          </div>
        </div>
      );

    case 'interaction':
      return (
        <Card>
          <CardHeader>
            <CardTitle>Student Interaction</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Click on students below to give them attention, praise, or help. Each interaction costs 5 teacher energy.
            </p>
            <div className="grid grid-cols-3 gap-4 text-center text-sm">
              <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                <div className="font-semibold text-emerald-700 dark:text-emerald-300">Praise</div>
                <div className="text-xs text-muted-foreground">Improves mood & engagement</div>
              </div>
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="font-semibold text-blue-700 dark:text-blue-300">Help</div>
                <div className="text-xs text-muted-foreground">Boosts academics, calms frustration</div>
              </div>
              <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                <div className="font-semibold text-amber-700 dark:text-amber-300">Redirect</div>
                <div className="text-xs text-muted-foreground">Increases focus, costs energy</div>
              </div>
            </div>
          </CardContent>
        </Card>
      );

    case 'end-of-day':
      return (
        <Card>
          <CardHeader>
            <CardTitle>End of Day - Assign Homework</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Choose how much homework to assign. Heavier homework boosts learning but risks lower completion.
            </p>
            <HomeworkAssigner
              selectedHomework={turn.homeworkAssigned}
              onSelectHomework={assignHomework}
            />
          </CardContent>
        </Card>
      );

    default:
      return null;
  }
}

function generateSampleFeedPosts(students: Student[], currentDay: string | number): FeedPostData[] {
  const posts: FeedPostData[] = [];

  // Generate 3-5 random social interactions as feed posts
  const numPosts = Math.floor(Math.random() * 3) + 3;
  const dayNum = typeof currentDay === 'string' ? 0 : currentDay;

  for (let i = 0; i < numPosts; i++) {
    const student1 = students[Math.floor(Math.random() * students.length)];
    let student2 = students[Math.floor(Math.random() * students.length)];

    // Ensure student2 is different
    while (student2.id === student1.id) {
      student2 = students[Math.floor(Math.random() * students.length)];
    }

    try {
      const interaction = generateSocialInteraction(student1, student2, dayNum);
      const post = generateFeedPost(interaction, students);

      // Transform to FeedPostData format
      const feedPost: FeedPostData = {
        id: post.id || `post-${i}-${Date.now()}`,
        type: (post.type as any) || 'interaction',
        author: post.author || student1.id,
        content: post.content,
        emoji: post.emoji,
        timestamp: new Date(Date.now() - Math.random() * 3600000),
        participants: interaction.participants || [student1.id, student2.id],
        sentiment: post.sentiment as any,
        likes: (post.likes ?? 0) + Math.floor(Math.random() * 8),
      };

      posts.push(feedPost);
    } catch (error) {
      // Silently skip if generation fails
      console.debug('Feed post generation skipped');
    }
  }

  return posts.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}

export default function Home() {
  const { state, newGame, loadGame, interactWithStudent, resolveEvent, checkForRandomEvents, advanceDay } = useGame();
  const classStats = useClassStats();
  const turn = useTurn();
  const teacher = useTeacher();
  const schoolYear = useSchoolYear();
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [activeEvent, setActiveEvent] = useState<GameEvent | null>(null);
  const [showDayTransition, setShowDayTransition] = useState(false);
  const [feedPosts, setFeedPosts] = useState<FeedPostData[]>([]);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const previousPhaseRef = useRef(turn.phase);
  const previousStudentsRef = useRef(state.students);
  const previousTeacherEnergyRef = useRef(teacher.energy);

  // Auto-save on phase and day changes
  const autoSave = useAutoSave(state, {
    enabled: state.autoSaveEnabled,
    interval: 60000,
    onPhaseChange: true,
    onDayChange: true,
  });

  // Check for random events when phase changes
  useEffect(() => {
    if (previousPhaseRef.current !== turn.phase) {
      // Store previous state for day summary
      if (turn.phase === 'morning') {
        previousStudentsRef.current = state.students;
        previousTeacherEnergyRef.current = teacher.energy;
      }
      previousPhaseRef.current = turn.phase;
      // Check for events on phase change
      checkForRandomEvents();
    }
  }, [turn.phase, checkForRandomEvents, state.students, teacher.energy]);

  // Generate social feed posts when day changes or on mount
  useEffect(() => {
    const newPosts = generateSampleFeedPosts(state.students, turn.dayOfWeek);
    setFeedPosts(newPosts);
  }, [turn.dayOfWeek, state.students]);

  // Show event popup when new events appear
  useEffect(() => {
    if (turn.activeEvents.length > 0 && !activeEvent) {
      setActiveEvent(turn.activeEvents[0]);
    }
  }, [turn.activeEvents, activeEvent]);

  const handleLoadGame = (loadedState: GameState) => {
    loadGame(loadedState);
  };

  const handleStudentClick = (student: Student) => {
    setSelectedStudent(student);
  };

  const handleInteraction = (action: string) => {
    if (selectedStudent && turn.phase === 'interaction') {
      interactWithStudent(selectedStudent.id, action);
      setSelectedStudent(null);
    }
  };

  const handleResolveEvent = (eventId: string, choiceId: string) => {
    resolveEvent(eventId, choiceId);
    setActiveEvent(null);
  };

  const handleShowDayTransition = () => {
    setShowDayTransition(true);
  };

  const handleAdvanceDay = () => {
    advanceDay();
    setShowDayTransition(false);
  };

  const handleLikePost = (postId: string) => {
    setLikedPosts(prev => {
      const newLiked = new Set(prev);
      if (newLiked.has(postId)) {
        newLiked.delete(postId);
      } else {
        newLiked.add(postId);
      }
      return newLiked;
    });

    // Update the post's like count
    setFeedPosts(prev =>
      prev.map(post =>
        post.id === postId
          ? { ...post, likes: (post.likes ?? 0) + (likedPosts.has(postId) ? -1 : 1) }
          : post
      )
    );
  };

  // Calculate day summary for transition
  const daySummary = calculateDaySummary(
    previousStudentsRef.current,
    state.students,
    turn,
    previousTeacherEnergyRef.current,
    teacher.energy
  );

  const [showSaveModal, setShowSaveModal] = useState(false);

  return (
    <MainLayout onSaveClick={() => setShowSaveModal(true)}>
      {/* Save/Load Modal */}
      <SaveLoadModal
        currentState={state}
        onLoad={handleLoadGame}
        trigger={<span />}
        open={showSaveModal}
        onOpenChange={setShowSaveModal}
      />

      <div className="container mx-auto px-4 py-6 lg:px-6">
        {/* Teacher Stats & Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="md:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Teacher Status</CardTitle>
            </CardHeader>
            <CardContent>
              <TeacherStats />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <TurnControls onEndDay={handleShowDayTransition} />
            </CardContent>
          </Card>
        </div>

        {/* Phase-specific content */}
        <div className="mb-6">
          <PhaseContent />
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="border-l-4 border-l-blue-400 hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Class Average
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="stat-number text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
                {classStats.classAverage}%
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-amber-400 hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Class Energy
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="stat-number text-3xl font-bold bg-gradient-to-r from-amber-600 to-yellow-400 bg-clip-text text-transparent">
                {classStats.avgEnergy}%
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-emerald-400 hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Attendance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="stat-number text-3xl font-bold bg-gradient-to-r from-emerald-600 to-green-400 bg-clip-text text-transparent">
                {classStats.presentCount}/15
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-pink-400 hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Happy Students
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="stat-number text-3xl font-bold bg-gradient-to-r from-pink-600 to-rose-400 bg-clip-text text-transparent">
                {classStats.happyCount}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* School Year Calendar */}
        <div className="mb-6">
          <SchoolYearCalendar schoolYear={schoolYear} />
        </div>

        {/* Main Content with Social Feed Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Student Grid (2/3 width on desktop) */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="grid" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="grid">Student Grid</TabsTrigger>
                <TabsTrigger value="compact">Compact View</TabsTrigger>
              </TabsList>

              <TabsContent value="grid">
                <StudentGrid
                  students={state.students}
                  onStudentClick={handleStudentClick}
                />
              </TabsContent>

              <TabsContent value="compact">
                <StudentGrid
                  students={state.students}
                  onStudentClick={handleStudentClick}
                  compact
                />
              </TabsContent>
            </Tabs>
          </div>

          {/* Right: Social Feed Sidebar (1/3 width on desktop, full width on mobile) */}
          <div className="lg:col-span-1">
            <div style={{ height: 'fit-content' }} className="sticky top-4">
              <SocialFeed
                posts={feedPosts}
                students={state.students}
                onLike={handleLikePost}
                maxHeight="500px"
                emptyStateEmoji="🤐"
                emptyStateText="No drama yet... stay tuned!"
              />
            </div>
          </div>
        </div>

        {/* Selected Student Panel */}
        {selectedStudent && (
          <div className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-sm border-t border-border/50 p-4 shadow-2xl student-panel-enter">
            <div className="container mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-lg font-semibold text-primary">
                  {selectedStudent.firstName[0]}{selectedStudent.lastName[0]}
                </div>
                <div>
                  <h3 className="font-semibold text-lg">
                    {selectedStudent.firstName} {selectedStudent.lastName}
                  </h3>
                  <p className="text-sm text-muted-foreground capitalize">
                    <span className="inline-flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-primary/60"></span>
                      {selectedStudent.primaryTrait} student
                    </span>
                    <span className="mx-2 text-border">|</span>
                    <span>{selectedStudent.learningStyle} learner</span>
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {turn.phase === 'interaction' ? (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleInteraction('praise')}
                      className="hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 dark:hover:bg-emerald-900/30 dark:hover:text-emerald-300"
                    >
                      Praise
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleInteraction('help')}
                      className="hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 dark:hover:bg-blue-900/30 dark:hover:text-blue-300"
                    >
                      Help
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleInteraction('redirect')}
                      className="hover:bg-amber-50 hover:text-amber-700 hover:border-amber-200 dark:hover:bg-amber-900/30 dark:hover:text-amber-300"
                    >
                      Redirect
                    </Button>
                  </>
                ) : (
                  <span className="text-sm text-muted-foreground italic">
                    Interactions available during Interaction phase
                  </span>
                )}
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowStudentModal(true)}
                  className="hover:bg-primary hover:text-primary-foreground"
                >
                  View Profile
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedStudent(null)}
                  className="ml-2 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/30"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Student Detail Modal */}
        <StudentDetailModal
          student={selectedStudent}
          allStudents={state.students}
          open={showStudentModal}
          onOpenChange={setShowStudentModal}
        />

        {/* Event Popup */}
        <EventPopup
          event={activeEvent}
          onResolve={handleResolveEvent}
          onDismiss={() => setActiveEvent(null)}
        />

        {/* Event Notification (for pending events when popup is closed) */}
        {turn.activeEvents.length > 0 && !activeEvent && (
          <EventNotification
            event={turn.activeEvents[0]}
            onClick={() => setActiveEvent(turn.activeEvents[0])}
          />
        )}

        {/* Day Transition Modal */}
        <DayTransition
          open={showDayTransition}
          onClose={() => setShowDayTransition(false)}
          onAdvance={handleAdvanceDay}
          currentDay={turn.dayOfWeek}
          currentWeek={turn.week}
          students={state.students}
          summary={daySummary}
        />

        {/* Auto-save status floating badge */}
        <div className="fixed bottom-4 right-4 z-50">
          <div className="flex items-center gap-2 rounded-full bg-card/80 backdrop-blur-sm border px-3 py-1.5 text-xs text-muted-foreground shadow-lg">
            {autoSave.isSaving ? (
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 animate-pulse rounded-full bg-amber-500"></span>
                Saving...
              </span>
            ) : autoSave.error ? (
              <span className="flex items-center gap-1.5 text-red-500">
                <span className="h-2 w-2 rounded-full bg-red-500"></span>
                Save failed
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                {formatLastSaved(autoSave.lastSaved)}
              </span>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
