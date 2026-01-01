import { cn } from '@/lib/utils';

interface PerformanceBarProps {
  value: number;
  label?: string;
  showValue?: boolean;
  size?: 'sm' | 'md';
  variant?: 'academic' | 'energy';
}

function getBarColor(value: number, variant: 'academic' | 'energy'): string {
  if (variant === 'energy') {
    if (value < 30) return 'bg-gradient-to-r from-red-400 to-red-500';
    if (value < 60) return 'bg-gradient-to-r from-amber-400 to-yellow-500';
    return 'bg-gradient-to-r from-emerald-400 to-green-500';
  }
  // academic
  if (value < 40) return 'bg-gradient-to-r from-red-400 to-rose-500';
  if (value < 70) return 'bg-gradient-to-r from-amber-400 to-orange-500';
  return 'bg-gradient-to-r from-emerald-400 to-teal-500';
}

function getValueColor(value: number): string {
  if (value < 40) return 'text-red-600 dark:text-red-400';
  if (value < 70) return 'text-amber-600 dark:text-amber-400';
  return 'text-emerald-600 dark:text-emerald-400';
}

export function PerformanceBar({
  value,
  label,
  showValue = false,
  size = 'md',
  variant = 'academic',
}: PerformanceBarProps) {
  const colorClass = getBarColor(value, variant);
  const heightClass = size === 'sm' ? 'h-1.5' : 'h-2.5';
  const valueColor = getValueColor(value);

  return (
    <div className="w-full">
      {(label || showValue) && (
        <div className="flex justify-between text-xs mb-1">
          {label && (
            <span className="text-muted-foreground font-medium">{label}</span>
          )}
          {showValue && (
            <span className={cn('font-semibold tabular-nums', valueColor)}>
              {value}%
            </span>
          )}
        </div>
      )}
      <div
        className={cn(
          'relative w-full rounded-full bg-secondary/60 overflow-hidden',
          heightClass
        )}
      >
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500 ease-out',
            colorClass
          )}
          style={{ width: `${value}%` }}
        >
          {/* Shimmer effect on high values */}
          {value >= 70 && (
            <div className="absolute inset-0 performance-bar-shimmer" />
          )}
        </div>
      </div>
    </div>
  );
}
