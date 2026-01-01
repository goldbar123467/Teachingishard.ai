'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StudentAvatar } from './StudentAvatar';
import type { Student } from '@/lib/game/types';
import { cn } from '@/lib/utils';

export interface DramaAlertData {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  studentIds: string[];
  actionRequired?: boolean;
  onResolve?: () => void;
  timestamp: Date;
}

interface DramaAlertProps {
  alert: DramaAlertData;
  students: Student[];
  onDismiss?: (alertId: string) => void;
  onAction?: (alertId: string) => void;
}

const severityConfig = {
  low: {
    bgGradient: 'from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950',
    borderColor: 'border-blue-500',
    icon: '📘',
    pulseColor: 'bg-blue-500',
    textColor: 'text-blue-600 dark:text-blue-400',
    actionBg: 'hover:bg-blue-50 dark:hover:bg-blue-950',
  },
  medium: {
    bgGradient: 'from-yellow-50 to-amber-50 dark:from-yellow-950 dark:to-amber-950',
    borderColor: 'border-yellow-500',
    icon: '⚠️',
    pulseColor: 'bg-yellow-500',
    textColor: 'text-yellow-600 dark:text-yellow-400',
    actionBg: 'hover:bg-yellow-50 dark:hover:bg-yellow-950',
  },
  high: {
    bgGradient: 'from-orange-50 to-red-50 dark:from-orange-950 dark:to-red-950',
    borderColor: 'border-orange-500',
    icon: '🔥',
    pulseColor: 'bg-orange-500',
    textColor: 'text-orange-600 dark:text-orange-400',
    actionBg: 'hover:bg-orange-50 dark:hover:bg-orange-950',
  },
  critical: {
    bgGradient: 'from-red-50 to-rose-50 dark:from-red-950 dark:to-rose-950',
    borderColor: 'border-red-500',
    icon: '💥',
    pulseColor: 'bg-red-500',
    textColor: 'text-red-600 dark:text-red-400',
    actionBg: 'hover:bg-red-50 dark:hover:bg-red-950',
  },
};

const pulseAnimation = {
  scale: [1, 1.05, 1],
  boxShadow: [
    '0 0 0 0 rgba(var(--pulse-color), 0.7)',
    '0 0 0 10px rgba(var(--pulse-color), 0)',
  ],
};

export function DramaAlert({
  alert,
  students,
  onDismiss,
  onAction,
}: DramaAlertProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const config = severityConfig[alert.severity];
  const involvedStudents = alert.studentIds
    .map(id => students.find(s => s.id === id))
    .filter((s): s is Student => s !== undefined);

  const pulseColor = config.pulseColor.replace('bg-', '').split('-')[0];
  const colorMap: Record<string, string> = {
    'blue': '59, 130, 246',
    'yellow': '234, 179, 8',
    'orange': '249, 115, 22',
    'red': '239, 68, 68',
  };
  const rgbColor = colorMap[pulseColor] || '239, 68, 68';

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.9 }}
      transition={{ duration: 0.3, type: 'spring', stiffness: 300 }}
      className="w-full"
    >
      <motion.div
        animate={pulseAnimation}
        transition={{
          duration: 2,
          repeat: Infinity,
          repeatType: 'loop',
        }}
        style={{
          '--pulse-color': `rgb(${rgbColor})`,
        } as React.CSSProperties}
      >
        <Card
          className={cn(
            'relative overflow-hidden border-2 transition-all duration-300',
            config.borderColor,
            `bg-gradient-to-br ${config.bgGradient}`,
            'hover:shadow-lg cursor-pointer'
          )}
        >
          {/* Animated background glow */}
          <motion.div
            className={cn(
              'absolute inset-0 opacity-0 pointer-events-none',
              config.pulseColor
            )}
            animate={{
              opacity: [0.05, 0.1, 0.05],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
            }}
          />

          {/* Content */}
          <motion.div
            onClick={() => setIsExpanded(!isExpanded)}
            className="relative z-10 p-4"
          >
            {/* Header */}
            <div className="flex items-start gap-3 mb-2">
              {/* Pulsing icon */}
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="text-2xl flex-shrink-0"
              >
                {config.icon}
              </motion.div>

              {/* Title and meta */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className={cn('font-bold text-sm', config.textColor)}>
                    {alert.title}
                  </h3>
                  <motion.span
                    animate={{ opacity: [1, 0.5, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className={cn(
                      'text-[10px] font-bold px-2 py-1 rounded-full bg-current text-white',
                      config.pulseColor
                    )}
                  >
                    ALERT
                  </motion.span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {new Date(alert.timestamp).toLocaleTimeString()} •{' '}
                  {alert.severity.charAt(0).toUpperCase() + alert.severity.slice(1)} Priority
                </p>
              </div>

              {/* Expand arrow */}
              <motion.div
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={{ duration: 0.3 }}
                className="text-xl flex-shrink-0"
              >
                ▼
              </motion.div>
            </div>

            {/* Description - always visible */}
            <p className="text-sm leading-relaxed text-foreground mb-3 pl-10">
              {alert.description}
            </p>

            {/* Student avatars - always visible */}
            {involvedStudents.length > 0 && (
              <div className="flex items-center gap-2 pl-10 mb-3">
                <div className="flex -space-x-2">
                  {involvedStudents.slice(0, 4).map((student, i) => (
                    <div
                      key={student.id}
                      className="relative"
                      style={{ zIndex: involvedStudents.length - i }}
                    >
                      <StudentAvatar
                        student={student}
                        size="sm"
                        showMood={true}
                      />
                    </div>
                  ))}
                  {involvedStudents.length > 4 && (
                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-[10px] font-medium ring-2 ring-background">
                      +{involvedStudents.length - 4}
                    </div>
                  )}
                </div>
                <span className="text-xs text-muted-foreground">
                  {involvedStudents.map(s => s.firstName).join(', ')}
                </span>
              </div>
            )}

            {/* Expanded content */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="pl-10 pt-3 border-t border-current/10 space-y-3"
                >
                  {/* Details section */}
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">
                      Involved Students:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {involvedStudents.map((student) => (
                        <div
                          key={student.id}
                          className="flex items-center gap-2 px-2 py-1 rounded-lg bg-background/50 text-xs"
                        >
                          <StudentAvatar
                            student={student}
                            size="sm"
                            showMood={true}
                          />
                          <div>
                            <p className="font-medium">{student.firstName}</p>
                            <p className="text-[10px] text-muted-foreground">
                              Mood: {student.mood}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-2 pt-2">
                    {alert.actionRequired && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          onAction?.(alert.id);
                          alert.onResolve?.();
                        }}
                        className={cn(
                          'flex-1 px-3 py-2 rounded-md text-sm font-medium transition-all',
                          config.actionBg,
                          config.textColor,
                          'border border-current/20'
                        )}
                      >
                        Take Action
                      </motion.button>
                    )}
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onDismiss?.(alert.id);
                      }}
                      className="px-3 py-2 rounded-md text-sm text-muted-foreground hover:bg-muted transition-all"
                    >
                      Dismiss
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </Card>
      </motion.div>
    </motion.div>
  );
}

// Container component for multiple alerts
interface DramaAlertListProps {
  alerts: DramaAlertData[];
  students: Student[];
  onDismiss?: (alertId: string) => void;
  onAction?: (alertId: string) => void;
  maxHeight?: string;
}

export function DramaAlertList({
  alerts,
  students,
  onDismiss,
  onAction,
  maxHeight = '300px',
}: DramaAlertListProps) {
  // Sort by severity and timestamp
  const severityOrder: Record<string, number> = {
    critical: 0,
    high: 1,
    medium: 2,
    low: 3,
  };

  const sortedAlerts = [...alerts].sort((a, b) => {
    const severityDiff = severityOrder[a.severity] - severityOrder[b.severity];
    if (severityDiff !== 0) return severityDiff;
    return b.timestamp.getTime() - a.timestamp.getTime();
  });

  return (
    <div style={{ maxHeight, overflowY: 'auto' }} className="space-y-3 pr-2">
      <AnimatePresence mode="popLayout">
        {sortedAlerts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-8 text-muted-foreground"
          >
            <p className="text-sm">No drama alerts. Everything is peaceful! 🌿</p>
          </motion.div>
        ) : (
          sortedAlerts.map((alert) => (
            <DramaAlert
              key={alert.id}
              alert={alert}
              students={students}
              onDismiss={onDismiss}
              onAction={onAction}
            />
          ))
        )}
      </AnimatePresence>
    </div>
  );
}
