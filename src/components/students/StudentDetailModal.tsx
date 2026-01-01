'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { Student } from '@/lib/game/types';
import { getStudentFullName, getStudentInitials } from '@/lib/students/generator';
import { MoodIndicator } from './MoodIndicator';
import { PerformanceBar } from './PerformanceBar';
import { cn } from '@/lib/utils';

interface StudentDetailModalProps {
  student: Student | null;
  allStudents: Student[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function getDiceBearUrl(seed: string): string {
  return `https://api.dicebear.com/7.x/adventurer/svg?seed=${seed}`;
}

const TRAIT_COLORS: Record<string, string> = {
  curious: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  shy: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300',
  outgoing: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  distracted: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  perfectionist: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  creative: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300',
  analytical: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300',
  social: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
};

const LEARNING_STYLE_LABELS: Record<string, { label: string; icon: string; color: string }> = {
  visual: { label: 'Visual Learner', icon: '👁️', color: 'text-violet-600 dark:text-violet-400' },
  auditory: { label: 'Auditory Learner', icon: '👂', color: 'text-sky-600 dark:text-sky-400' },
  kinesthetic: { label: 'Kinesthetic Learner', icon: '🤲', color: 'text-orange-600 dark:text-orange-400' },
  reading: { label: 'Reading/Writing', icon: '📖', color: 'text-emerald-600 dark:text-emerald-400' },
};

function TestScoreChart({ scores }: { scores: number[] }) {
  if (scores.length === 0) {
    return (
      <div className="text-center text-sm text-muted-foreground py-4">
        No test scores yet
      </div>
    );
  }

  const maxScore = 100;
  const barWidth = Math.min(40, 200 / scores.length);

  return (
    <div className="flex items-end justify-center gap-1.5 h-24 p-2 bg-muted/30 rounded-lg">
      {scores.map((score, i) => (
        <div key={i} className="flex flex-col items-center gap-1">
          <div
            className={cn(
              'score-bar-animated rounded-t shadow-sm',
              score >= 70
                ? 'bg-gradient-to-t from-green-500 to-emerald-400'
                : score >= 50
                ? 'bg-gradient-to-t from-amber-500 to-yellow-400'
                : 'bg-gradient-to-t from-red-500 to-rose-400'
            )}
            style={{
              width: `${barWidth}px`,
              height: `${(score / maxScore) * 80}px`,
              animationDelay: `${i * 0.05}s`,
            }}
          />
          <span className="text-[10px] font-medium text-muted-foreground tabular-nums">{score}</span>
        </div>
      ))}
    </div>
  );
}

function RelationshipsList({
  studentIds,
  allStudents,
  type,
}: {
  studentIds: string[];
  allStudents: Student[];
  type: 'friend' | 'rival';
}) {
  const relatedStudents = studentIds
    .map(id => allStudents.find(s => s.id === id))
    .filter((s): s is Student => s !== undefined);

  if (relatedStudents.length === 0) {
    return (
      <div className="text-sm text-muted-foreground italic">
        No {type}s yet
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {relatedStudents.map(student => (
        <div
          key={student.id}
          className={cn(
            'relationship-pill flex items-center gap-2 px-3 py-1.5 rounded-full text-sm cursor-default border',
            type === 'friend'
              ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800'
              : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800'
          )}
        >
          <Avatar className="h-6 w-6 ring-1 ring-white dark:ring-zinc-800">
            <AvatarImage src={getDiceBearUrl(student.avatarSeed)} />
            <AvatarFallback className="text-[10px]">
              {getStudentInitials(student)}
            </AvatarFallback>
          </Avatar>
          <span className="font-medium">{student.firstName}</span>
        </div>
      ))}
    </div>
  );
}

export function StudentDetailModal({
  student,
  allStudents,
  open,
  onOpenChange,
}: StudentDetailModalProps) {
  if (!student) return null;

  const learningStyle = LEARNING_STYLE_LABELS[student.learningStyle];
  const avgTestScore = student.testScores.length > 0
    ? Math.round(student.testScores.reduce((a, b) => a + b, 0) / student.testScores.length)
    : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="sr-only">Student Profile</DialogTitle>
        </DialogHeader>

        {/* Header with avatar and basic info */}
        <div className="flex items-start gap-4">
          <Avatar className="modal-avatar-entrance h-20 w-20 ring-2 ring-offset-2 ring-offset-background ring-primary/20 shadow-lg">
            <AvatarImage src={getDiceBearUrl(student.avatarSeed)} alt={getStudentFullName(student)} />
            <AvatarFallback className="text-xl bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-semibold">
              {getStudentInitials(student)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <h2 className="text-xl font-bold">{getStudentFullName(student)}</h2>

            <div className="flex items-center gap-2 mt-1">
              <Badge className={cn('capitalize', TRAIT_COLORS[student.primaryTrait])}>
                {student.primaryTrait}
              </Badge>
              <Badge variant="outline" className="capitalize">
                {student.secondaryTrait}
              </Badge>
              <MoodIndicator mood={student.mood} size="md" />
            </div>

            <div className={cn('flex items-center gap-1.5 mt-2 text-sm', learningStyle.color)}>
              <span>{learningStyle.icon}</span>
              <span>{learningStyle.label}</span>
            </div>

            {/* Special flags */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {student.hasIEP && (
                <Badge variant="outline" className="text-xs bg-blue-50 dark:bg-blue-900/30 border-blue-200 text-blue-700 dark:text-blue-300">
                  IEP
                </Badge>
              )}
              {student.isGifted && (
                <Badge variant="outline" className="text-xs bg-purple-50 dark:bg-purple-900/30 border-purple-200 text-purple-700 dark:text-purple-300">
                  Gifted
                </Badge>
              )}
              {student.needsExtraHelp && (
                <Badge variant="outline" className="text-xs bg-orange-50 dark:bg-orange-900/30 border-orange-200 text-orange-700 dark:text-orange-300">
                  Needs Extra Help
                </Badge>
              )}
              {!student.attendanceToday && (
                <Badge variant="destructive" className="text-xs">
                  Absent Today
                </Badge>
              )}
            </div>
          </div>
        </div>

        <Separator className="my-4" />

        <Tabs defaultValue="stats" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="stats">Stats</TabsTrigger>
            <TabsTrigger value="relationships">Relationships</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="stats" className="space-y-4 mt-4">
            {/* Core stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="stat-row">
                  <PerformanceBar
                    value={student.academicLevel}
                    label="Academic Level"
                    showValue
                    size="md"
                    variant="academic"
                  />
                </div>
                <div className="stat-row">
                  <PerformanceBar
                    value={student.engagement}
                    label="Engagement"
                    showValue
                    size="md"
                    variant="academic"
                  />
                </div>
              </div>
              <div className="space-y-3">
                <div className="stat-row">
                  <PerformanceBar
                    value={student.energy}
                    label="Energy"
                    showValue
                    size="md"
                    variant="energy"
                  />
                </div>
                <div className="stat-row">
                  <PerformanceBar
                    value={student.socialSkills}
                    label="Social Skills"
                    showValue
                    size="md"
                    variant="academic"
                  />
                </div>
              </div>
            </div>

            {/* Homework status */}
            <div className="p-3 rounded-lg bg-muted/50">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Homework Status</span>
                <div className="flex items-center gap-2">
                  {student.homeworkCompleted ? (
                    <>
                      <Badge variant="outline" className="bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300">
                        Completed
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        Quality: {student.homeworkQuality}%
                      </span>
                    </>
                  ) : (
                    <Badge variant="destructive">Not Completed</Badge>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="relationships" className="space-y-4 mt-4">
            <div>
              <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                <span className="text-green-500">💚</span> Friends ({student.friendIds.length})
              </h4>
              <RelationshipsList
                studentIds={student.friendIds}
                allStudents={allStudents}
                type="friend"
              />
            </div>

            <Separator />

            <div>
              <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                <span className="text-red-500">⚡</span> Rivals ({student.rivalIds.length})
              </h4>
              <RelationshipsList
                studentIds={student.rivalIds}
                allStudents={allStudents}
                type="rival"
              />
            </div>
          </TabsContent>

          <TabsContent value="history" className="space-y-4 mt-4">
            {/* Test scores */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium">Test Scores</h4>
                {avgTestScore !== null && (
                  <span className={cn(
                    'text-sm font-medium',
                    avgTestScore >= 70 ? 'text-green-600' : avgTestScore >= 50 ? 'text-amber-600' : 'text-red-600'
                  )}>
                    Avg: {avgTestScore}%
                  </span>
                )}
              </div>
              <TestScoreChart scores={student.testScores} />
            </div>

            <Separator />

            {/* Behavior record */}
            <div className="grid grid-cols-2 gap-4">
              <div className={cn(
                'p-4 rounded-xl bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/30 dark:to-rose-900/20 border border-red-100 dark:border-red-900/50',
                student.behaviorIncidents >= 3 && 'incident-card-high'
              )}>
                <div className="text-3xl font-bold text-red-600 dark:text-red-400 tabular-nums">
                  {student.behaviorIncidents}
                </div>
                <div className="text-sm font-medium text-red-700 dark:text-red-300">
                  Behavior Incidents
                </div>
              </div>
              <div className="p-4 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/20 border border-green-100 dark:border-green-900/50">
                <div className="text-3xl font-bold text-green-600 dark:text-green-400 tabular-nums">
                  {student.positiveNotes}
                </div>
                <div className="text-sm font-medium text-green-700 dark:text-green-300">
                  Positive Notes
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
