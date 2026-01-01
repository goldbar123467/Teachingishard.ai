'use client';

import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

interface PerformanceBarProps {
  value: number;
  label?: string;
  showValue?: boolean;
  size?: 'sm' | 'md';
  variant?: 'academic' | 'energy';
  animated?: boolean;
}

function getBarColor(value: number, variant: 'academic' | 'energy'): string {
  if (variant === 'energy') {
    if (value < 30) return 'bg-gradient-to-r from-red-500 to-red-400 dark:from-red-600 dark:to-red-500';
    if (value < 60) return 'bg-gradient-to-r from-amber-500 to-yellow-400 dark:from-amber-600 dark:to-amber-500';
    return 'bg-gradient-to-r from-emerald-500 to-green-400 dark:from-emerald-600 dark:to-emerald-500';
  }
  // academic
  if (value < 40) return 'bg-gradient-to-r from-red-500 to-rose-400 dark:from-red-600 dark:to-rose-500';
  if (value < 70) return 'bg-gradient-to-r from-amber-500 to-orange-400 dark:from-amber-600 dark:to-orange-500';
  return 'bg-gradient-to-r from-emerald-500 to-teal-400 dark:from-emerald-600 dark:to-teal-500';
}

function getValueColor(value: number): string {
  if (value < 40) return 'text-red-500 dark:text-red-400';
  if (value < 70) return 'text-amber-500 dark:text-amber-400';
  return 'text-emerald-500 dark:text-emerald-400';
}

function getGlowColor(value: number, variant: 'academic' | 'energy'): string {
  if (variant === 'energy') {
    if (value < 30) return 'shadow-[0_0_10px_rgba(239,68,68,0.4)]';
    if (value < 60) return 'shadow-[0_0_10px_rgba(251,191,36,0.4)]';
    return 'shadow-[0_0_10px_rgba(52,211,153,0.4)]';
  }
  if (value < 40) return 'shadow-[0_0_10px_rgba(239,68,68,0.4)]';
  if (value < 70) return 'shadow-[0_0_10px_rgba(251,191,36,0.4)]';
  return 'shadow-[0_0_10px_rgba(52,211,153,0.4)]';
}

export function PerformanceBar({
  value,
  label,
  showValue = false,
  size = 'md',
  variant = 'academic',
  animated = true,
}: PerformanceBarProps) {
  const [displayValue, setDisplayValue] = useState(animated ? 0 : value);
  const colorClass = getBarColor(value, variant);
  const heightClass = size === 'sm' ? 'h-1.5' : 'h-2.5';
  const valueColor = getValueColor(value);
  const glowClass = getGlowColor(value, variant);

  useEffect(() => {
    if (animated) {
      // Small delay for animation effect
      const timer = setTimeout(() => setDisplayValue(value), 50);
      return () => clearTimeout(timer);
    } else {
      setDisplayValue(value);
    }
  }, [value, animated]);

  return (
    <div className="w-full">
      {(label || showValue) && (
        <div className="flex justify-between text-xs mb-1">
          {label && (
            <span className="text-muted-foreground font-medium">{label}</span>
          )}
          {showValue && (
            <span className={cn('font-semibold tabular-nums transition-colors duration-300', valueColor)}>
              {value}%
            </span>
          )}
        </div>
      )}
      <div
        className={cn(
          'relative w-full rounded-full overflow-hidden',
          'bg-slate-200/50 dark:bg-slate-700/50',
          heightClass
        )}
      >
        <div
          className={cn(
            'h-full rounded-full transition-all duration-700 ease-out relative',
            colorClass,
            value >= 60 && glowClass
          )}
          style={{ width: `${displayValue}%` }}
        >
          {/* Shimmer effect overlay */}
          <div className={cn(
            'absolute inset-0 overflow-hidden rounded-full',
            value >= 50 && 'performance-bar-shimmer'
          )}>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
          </div>
        </div>
      </div>
    </div>
  );
}
