'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import type { Student } from '@/lib/game/types';
import { getStudentFullName, getStudentInitials } from '@/lib/students/generator';
import { cn } from '@/lib/utils';
import { MoodIndicator } from './MoodIndicator';
import { PerformanceBar } from './PerformanceBar';

interface StudentCardProps {
  student: Student;
  onClick?: () => void;
  compact?: boolean;
}

function getDiceBearUrl(seed: string): string {
  return `https://api.dicebear.com/7.x/adventurer/svg?seed=${seed}`;
}

const TRAIT_COLORS: Record<string, string> = {
  curious: 'border-l-blue-400',
  shy: 'border-l-violet-400',
  outgoing: 'border-l-amber-400',
  distracted: 'border-l-orange-400',
  perfectionist: 'border-l-emerald-400',
  creative: 'border-l-pink-400',
  analytical: 'border-l-cyan-400',
  athletic: 'border-l-lime-400',
  leader: 'border-l-yellow-400',
  helper: 'border-l-rose-400',
};

export function StudentCard({ student, onClick, compact = false }: StudentCardProps) {
  const traitColor = TRAIT_COLORS[student.primaryTrait] || 'border-l-gray-400';

  if (compact) {
    return (
      <Card
        className={cn(
          'cursor-pointer student-card-glow border-l-4',
          'hover:scale-[1.02] active:scale-[0.98]',
          traitColor,
          !student.attendanceToday && 'opacity-50 student-absent'
        )}
        onClick={onClick}
      >
        <CardContent className="p-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 ring-2 ring-white dark:ring-zinc-800 shadow-sm">
              <AvatarImage src={getDiceBearUrl(student.avatarSeed)} alt={student.firstName} />
              <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-medium">
                {getStudentInitials(student)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium truncate">{student.firstName}</span>
                <MoodIndicator mood={student.mood} size="sm" />
              </div>
              <PerformanceBar value={student.academicLevel} size="sm" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={cn(
        'cursor-pointer student-card-glow border-l-4 group',
        'hover:scale-[1.02] active:scale-[0.98]',
        traitColor,
        !student.attendanceToday && 'opacity-50 student-absent'
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex flex-col items-center text-center gap-3">
          {/* Avatar with ring effect */}
          <div className="relative">
            <Avatar className="h-16 w-16 ring-2 ring-offset-2 ring-offset-background ring-primary/20 group-hover:ring-primary/40 transition-all duration-300 shadow-md">
              <AvatarImage
                src={getDiceBearUrl(student.avatarSeed)}
                alt={getStudentFullName(student)}
                className="group-hover:scale-105 transition-transform duration-300"
              />
              <AvatarFallback className="text-lg bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-semibold">
                {getStudentInitials(student)}
              </AvatarFallback>
            </Avatar>
            {!student.attendanceToday && (
              <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-[10px] font-bold shadow-sm">
                X
              </span>
            )}
          </div>

          {/* Name and trait */}
          <div>
            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
              {getStudentFullName(student)}
            </h3>
            <p className="text-xs text-muted-foreground capitalize tracking-wide">
              {student.primaryTrait}
            </p>
          </div>

          {/* Mood */}
          <MoodIndicator mood={student.mood} size="md" />

          {/* Stats */}
          <div className="w-full space-y-2.5">
            <PerformanceBar
              value={student.academicLevel}
              label="Academics"
              showValue
              size="sm"
              variant="academic"
            />
            <PerformanceBar
              value={student.energy}
              label="Energy"
              showValue
              size="sm"
              variant="energy"
            />
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-1.5 justify-center min-h-[24px]">
            {student.hasIEP && (
              <Badge
                variant="outline"
                className="text-xs bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 badge-iep"
              >
                IEP
              </Badge>
            )}
            {student.isGifted && (
              <Badge
                variant="outline"
                className="text-xs bg-purple-50 dark:bg-purple-900/30 border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 badge-gifted"
              >
                Gifted
              </Badge>
            )}
            {student.needsExtraHelp && !student.hasIEP && (
              <Badge
                variant="outline"
                className="text-xs bg-orange-50 dark:bg-orange-900/30 border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-300 badge-needs-help"
              >
                Needs Help
              </Badge>
            )}
            {!student.homeworkCompleted && (
              <Badge
                variant="destructive"
                className="text-xs shadow-sm"
              >
                No HW
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
