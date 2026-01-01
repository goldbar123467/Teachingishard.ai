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

// Gradient colors for traits
const TRAIT_GRADIENTS: Record<string, { border: string; glow: string; ring: string }> = {
  curious: {
    border: 'from-blue-400 to-cyan-400',
    glow: 'hover:shadow-blue-500/20',
    ring: 'ring-blue-400/30 group-hover:ring-blue-400/60',
  },
  shy: {
    border: 'from-violet-400 to-purple-400',
    glow: 'hover:shadow-violet-500/20',
    ring: 'ring-violet-400/30 group-hover:ring-violet-400/60',
  },
  outgoing: {
    border: 'from-amber-400 to-yellow-400',
    glow: 'hover:shadow-amber-500/20',
    ring: 'ring-amber-400/30 group-hover:ring-amber-400/60',
  },
  distracted: {
    border: 'from-orange-400 to-red-400',
    glow: 'hover:shadow-orange-500/20',
    ring: 'ring-orange-400/30 group-hover:ring-orange-400/60',
  },
  perfectionist: {
    border: 'from-emerald-400 to-green-400',
    glow: 'hover:shadow-emerald-500/20',
    ring: 'ring-emerald-400/30 group-hover:ring-emerald-400/60',
  },
  creative: {
    border: 'from-pink-400 to-rose-400',
    glow: 'hover:shadow-pink-500/20',
    ring: 'ring-pink-400/30 group-hover:ring-pink-400/60',
  },
  analytical: {
    border: 'from-cyan-400 to-teal-400',
    glow: 'hover:shadow-cyan-500/20',
    ring: 'ring-cyan-400/30 group-hover:ring-cyan-400/60',
  },
  athletic: {
    border: 'from-lime-400 to-green-400',
    glow: 'hover:shadow-lime-500/20',
    ring: 'ring-lime-400/30 group-hover:ring-lime-400/60',
  },
  leader: {
    border: 'from-yellow-400 to-amber-400',
    glow: 'hover:shadow-yellow-500/20',
    ring: 'ring-yellow-400/30 group-hover:ring-yellow-400/60',
  },
  helper: {
    border: 'from-rose-400 to-pink-400',
    glow: 'hover:shadow-rose-500/20',
    ring: 'ring-rose-400/30 group-hover:ring-rose-400/60',
  },
  social: {
    border: 'from-fuchsia-400 to-purple-400',
    glow: 'hover:shadow-fuchsia-500/20',
    ring: 'ring-fuchsia-400/30 group-hover:ring-fuchsia-400/60',
  },
};

const DEFAULT_GRADIENT = {
  border: 'from-gray-400 to-slate-400',
  glow: 'hover:shadow-gray-500/20',
  ring: 'ring-gray-400/30 group-hover:ring-gray-400/60',
};

export function StudentCard({ student, onClick, compact = false }: StudentCardProps) {
  const traitStyle = TRAIT_GRADIENTS[student.primaryTrait] || DEFAULT_GRADIENT;

  if (compact) {
    return (
      <div
        className={cn(
          'relative cursor-pointer group',
          !student.attendanceToday && 'opacity-50'
        )}
        onClick={onClick}
      >
        {/* Gradient border effect */}
        <div className={cn(
          'absolute -inset-[1px] rounded-xl bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm',
          traitStyle.border
        )} />
        <Card className={cn(
          'relative border-0 bg-card/80 backdrop-blur-sm',
          'hover:scale-[1.02] active:scale-[0.98] transition-all duration-200',
          traitStyle.glow,
          'hover:shadow-lg'
        )}>
          <CardContent className="p-3">
            <div className="flex items-center gap-3">
              <Avatar className={cn(
                'h-10 w-10 ring-2 ring-offset-2 ring-offset-background shadow-sm transition-all duration-300',
                traitStyle.ring
              )}>
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
      </div>
    );
  }

  return (
    <div
      className={cn(
        'relative cursor-pointer group',
        !student.attendanceToday && 'opacity-50'
      )}
      onClick={onClick}
    >
      {/* Gradient glow effect */}
      <div className={cn(
        'absolute -inset-[2px] rounded-xl bg-gradient-to-r opacity-0 group-hover:opacity-70 transition-all duration-300',
        traitStyle.border,
        'blur-md'
      )} />

      {/* Gradient border */}
      <div className={cn(
        'absolute -inset-[1px] rounded-xl bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-300',
        traitStyle.border
      )} />

      <Card className={cn(
        'relative border-0 bg-card/95 backdrop-blur-sm overflow-hidden',
        'hover:scale-[1.01] active:scale-[0.99] transition-all duration-200',
        traitStyle.glow,
        'hover:shadow-xl'
      )}>
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/[0.02] dark:to-white/[0.02] pointer-events-none" />

        <CardContent className="p-4 relative">
          <div className="flex flex-col items-center text-center gap-3">
            {/* Avatar with gradient ring */}
            <div className="relative">
              <div className={cn(
                'absolute -inset-1 rounded-full bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm',
                traitStyle.border
              )} />
              <Avatar className={cn(
                'relative h-16 w-16 ring-2 ring-offset-2 ring-offset-background shadow-lg transition-all duration-300',
                traitStyle.ring
              )}>
                <AvatarImage
                  src={getDiceBearUrl(student.avatarSeed)}
                  alt={getStudentFullName(student)}
                  className="group-hover:scale-105 transition-transform duration-300"
                />
                <AvatarFallback className="text-lg bg-gradient-to-br from-primary/30 to-primary/10 text-primary font-semibold">
                  {getStudentInitials(student)}
                </AvatarFallback>
              </Avatar>
              {!student.attendanceToday && (
                <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center text-white text-[10px] font-bold shadow-sm ring-2 ring-background">
                  X
                </span>
              )}
            </div>

            {/* Name and trait */}
            <div>
              <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                {getStudentFullName(student)}
              </h3>
              <p className={cn(
                'text-xs capitalize tracking-wide bg-gradient-to-r bg-clip-text text-transparent',
                traitStyle.border
              )}>
                {student.primaryTrait}
              </p>
            </div>

            {/* Mood */}
            <MoodIndicator mood={student.mood} size="md" />

            {/* Stats with gradient fills */}
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

            {/* Badges with glass effect */}
            <div className="flex flex-wrap gap-1.5 justify-center min-h-[24px]">
              {student.hasIEP && (
                <Badge
                  variant="outline"
                  className="text-xs bg-blue-500/10 backdrop-blur-sm border-blue-400/30 text-blue-600 dark:text-blue-400 shadow-sm"
                >
                  IEP
                </Badge>
              )}
              {student.isGifted && (
                <Badge
                  variant="outline"
                  className="text-xs bg-purple-500/10 backdrop-blur-sm border-purple-400/30 text-purple-600 dark:text-purple-400 shadow-sm"
                >
                  Gifted
                </Badge>
              )}
              {student.needsExtraHelp && !student.hasIEP && (
                <Badge
                  variant="outline"
                  className="text-xs bg-orange-500/10 backdrop-blur-sm border-orange-400/30 text-orange-600 dark:text-orange-400 shadow-sm"
                >
                  Needs Help
                </Badge>
              )}
              {!student.homeworkCompleted && (
                <Badge
                  className="text-xs bg-gradient-to-r from-red-500 to-rose-500 border-0 text-white shadow-sm"
                >
                  No HW
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
