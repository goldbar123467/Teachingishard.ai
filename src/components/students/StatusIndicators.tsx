'use client';

import { motion } from 'framer-motion';
import type { Student } from '@/lib/game/types';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface StatusIndicatorsProps {
  student: Student;
  showLabels?: boolean;
  compact?: boolean;
}

// Attention level based on engagement
function getAttentionLevel(engagement: number): {
  label: string;
  icon: string;
  color: string;
  bgColor: string;
} {
  if (engagement >= 80) {
    return {
      label: 'Focused',
      icon: '👀',
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-900/30',
    };
  }
  if (engagement >= 50) {
    return {
      label: 'Attentive',
      icon: '😊',
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    };
  }
  if (engagement >= 25) {
    return {
      label: 'Distracted',
      icon: '😐',
      color: 'text-yellow-600 dark:text-yellow-400',
      bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
    };
  }
  return {
    label: 'Zoning Out',
    icon: '😴',
    color: 'text-orange-600 dark:text-orange-400',
    bgColor: 'bg-orange-100 dark:bg-orange-900/30',
  };
}

// Energy level
function getEnergyLevel(energy: number): {
  label: string;
  icon: string;
  color: string;
  bgColor: string;
} {
  if (energy >= 75) {
    return {
      label: 'Energized',
      icon: '⚡',
      color: 'text-yellow-600 dark:text-yellow-400',
      bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
    };
  }
  if (energy >= 50) {
    return {
      label: 'Normal',
      icon: '🔋',
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-900/30',
    };
  }
  if (energy >= 25) {
    return {
      label: 'Tired',
      icon: '😮‍💨',
      color: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-100 dark:bg-orange-900/30',
    };
  }
  return {
    label: 'Exhausted',
    icon: '🥱',
    color: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-100 dark:bg-red-900/30',
  };
}

// Academic performance level
function getAcademicLevel(level: number): {
  label: string;
  icon: string;
  color: string;
  bgColor: string;
} {
  if (level >= 85) {
    return {
      label: 'Excelling',
      icon: '⭐',
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-100 dark:bg-purple-900/30',
    };
  }
  if (level >= 70) {
    return {
      label: 'Proficient',
      icon: '✅',
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-900/30',
    };
  }
  if (level >= 50) {
    return {
      label: 'Developing',
      icon: '📚',
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    };
  }
  if (level >= 30) {
    return {
      label: 'Struggling',
      icon: '📝',
      color: 'text-yellow-600 dark:text-yellow-400',
      bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
    };
  }
  return {
    label: 'Needs Help',
    icon: '🆘',
    color: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-100 dark:bg-red-900/30',
  };
}

// Social status
function getSocialStatus(student: Student): {
  label: string;
  icon: string;
  color: string;
  bgColor: string;
  details: string;
} | null {
  const friendCount = student.friendIds.length;
  const rivalCount = student.rivalIds.length;

  if (rivalCount > 2) {
    return {
      label: 'Conflicts',
      icon: '⚠️',
      color: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-100 dark:bg-red-900/30',
      details: `${rivalCount} rival${rivalCount > 1 ? 's' : ''}`,
    };
  }

  if (friendCount === 0) {
    return {
      label: 'Isolated',
      icon: '😔',
      color: 'text-gray-600 dark:text-gray-400',
      bgColor: 'bg-gray-100 dark:bg-gray-900/30',
      details: 'No close friends',
    };
  }

  if (friendCount >= 4) {
    return {
      label: 'Popular',
      icon: '🌟',
      color: 'text-pink-600 dark:text-pink-400',
      bgColor: 'bg-pink-100 dark:bg-pink-900/30',
      details: `${friendCount} friends`,
    };
  }

  if (friendCount >= 2) {
    return {
      label: 'Social',
      icon: '👥',
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-100 dark:bg-blue-900/30',
      details: `${friendCount} friends`,
    };
  }

  return null;
}

interface StatusBadgeProps {
  icon: string;
  label: string;
  value: number;
  color: string;
  bgColor: string;
  tooltip: string;
  animate?: boolean;
  compact?: boolean;
}

function StatusBadge({
  icon,
  label,
  value,
  color,
  bgColor,
  tooltip,
  animate = false,
  compact = false,
}: StatusBadgeProps) {
  const content = (
    <motion.div
      initial={animate ? { scale: 0.8, opacity: 0 } : false}
      animate={animate ? { scale: 1, opacity: 1 } : false}
      transition={{ type: 'spring', stiffness: 400, damping: 15 }}
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium transition-all',
        bgColor,
        color,
        'hover:scale-105 active:scale-95',
        compact && 'px-1.5 py-0.5'
      )}
    >
      <span className="text-sm">{icon}</span>
      {!compact && <span className="hidden sm:inline">{label}</span>}
    </motion.div>
  );

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>{content}</TooltipTrigger>
        <TooltipContent
          side="top"
          className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 border-0"
        >
          <div className="text-xs space-y-0.5">
            <div className="font-semibold">{label}</div>
            <div className="text-gray-300 dark:text-gray-600">{tooltip}</div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export function StatusIndicators({ student, showLabels = false, compact = false }: StatusIndicatorsProps) {
  const attention = getAttentionLevel(student.engagement);
  const energy = getEnergyLevel(student.energy);
  const academic = getAcademicLevel(student.academicLevel);
  const social = getSocialStatus(student);

  return (
    <div className={cn('flex flex-wrap gap-1.5', compact && 'gap-1')}>
      <StatusBadge
        icon={attention.icon}
        label={attention.label}
        value={student.engagement}
        color={attention.color}
        bgColor={attention.bgColor}
        tooltip={`Engagement: ${student.engagement}/100`}
        animate
        compact={compact}
      />
      <StatusBadge
        icon={energy.icon}
        label={energy.label}
        value={student.energy}
        color={energy.color}
        bgColor={energy.bgColor}
        tooltip={`Energy: ${student.energy}/100`}
        animate
        compact={compact}
      />
      <StatusBadge
        icon={academic.icon}
        label={academic.label}
        value={student.academicLevel}
        color={academic.color}
        bgColor={academic.bgColor}
        tooltip={`Academic Level: ${student.academicLevel}/100`}
        animate
        compact={compact}
      />
      {social && (
        <StatusBadge
          icon={social.icon}
          label={social.label}
          value={student.friendIds.length}
          color={social.color}
          bgColor={social.bgColor}
          tooltip={social.details}
          animate
          compact={compact}
        />
      )}
      {!student.homeworkCompleted && (
        <StatusBadge
          icon="📝"
          label="No HW"
          value={0}
          color="text-red-600 dark:text-red-400"
          bgColor="bg-red-100 dark:bg-red-900/30"
          tooltip="Homework not completed"
          animate
          compact={compact}
        />
      )}
      {student.hasIEP && (
        <StatusBadge
          icon="📋"
          label="IEP"
          value={0}
          color="text-blue-600 dark:text-blue-400"
          bgColor="bg-blue-100 dark:bg-blue-900/30"
          tooltip="Has Individualized Education Plan"
          compact={compact}
        />
      )}
      {student.isGifted && (
        <StatusBadge
          icon="🎓"
          label="Gifted"
          value={0}
          color="text-purple-600 dark:text-purple-400"
          bgColor="bg-purple-100 dark:bg-purple-900/30"
          tooltip="Identified as Gifted & Talented"
          compact={compact}
        />
      )}
    </div>
  );
}

// Compact version for grid view
export function CompactStatusIndicators({ student }: { student: Student }) {
  return <StatusIndicators student={student} compact />;
}
