import type { Mood } from '@/lib/game/types';
import { MOOD_COLORS, MOOD_EMOJI } from '@/lib/game/constants';
import { cn } from '@/lib/utils';

interface MoodIndicatorProps {
  mood: Mood;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  pulsing?: boolean;
}

const SIZE_CLASSES = {
  sm: 'text-sm',
  md: 'text-lg',
  lg: 'text-2xl',
};

const MOOD_LABELS: Record<Mood, string> = {
  excited: 'Excited',
  happy: 'Happy',
  neutral: 'Neutral',
  bored: 'Bored',
  frustrated: 'Frustrated',
  upset: 'Upset',
};

const MOOD_ANIMATION_CLASSES: Record<Mood, string> = {
  excited: 'mood-excited',
  happy: 'mood-happy',
  neutral: '',
  bored: '',
  frustrated: 'mood-frustrated',
  upset: 'mood-upset',
};

const MOOD_BG_CLASSES: Record<Mood, string> = {
  excited: 'bg-yellow-100/80 dark:bg-yellow-500/20',
  happy: 'bg-green-100/80 dark:bg-emerald-500/20',
  neutral: 'bg-gray-100/80 dark:bg-slate-500/20',
  bored: 'bg-blue-100/80 dark:bg-blue-500/20',
  frustrated: 'bg-orange-100/80 dark:bg-orange-500/20',
  upset: 'bg-red-100/80 dark:bg-red-500/20',
};

// Glow colors for pulsing effect
const MOOD_GLOW_COLORS: Record<Mood, string> = {
  excited: 'shadow-[0_0_8px_rgba(250,204,21,0.5)]',
  happy: 'shadow-[0_0_8px_rgba(52,211,153,0.5)]',
  neutral: 'shadow-[0_0_8px_rgba(148,163,184,0.3)]',
  bored: 'shadow-[0_0_8px_rgba(96,165,250,0.4)]',
  frustrated: 'shadow-[0_0_8px_rgba(251,146,60,0.5)]',
  upset: 'shadow-[0_0_8px_rgba(248,113,113,0.5)]',
};

export function MoodIndicator({ mood, size = 'md', showLabel = false, pulsing = false }: MoodIndicatorProps) {
  const showBg = size === 'md' || size === 'lg';
  const shouldPulse = pulsing || mood === 'excited' || mood === 'frustrated' || mood === 'upset';

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 transition-all duration-200',
        MOOD_COLORS[mood],
        showBg && 'px-2.5 py-1 rounded-full',
        showBg && MOOD_BG_CLASSES[mood],
        showBg && shouldPulse && 'status-pulsing',
        showBg && MOOD_GLOW_COLORS[mood]
      )}
      style={shouldPulse ? { '--pulse-color': getMoodPulseColor(mood) } as React.CSSProperties : undefined}
    >
      <span
        className={cn(
          SIZE_CLASSES[size],
          MOOD_ANIMATION_CLASSES[mood],
          'inline-block'
        )}
        role="img"
        aria-label={MOOD_LABELS[mood]}
      >
        {MOOD_EMOJI[mood]}
      </span>
      {showLabel && (
        <span className="text-xs font-medium capitalize">{MOOD_LABELS[mood]}</span>
      )}
    </span>
  );
}

function getMoodPulseColor(mood: Mood): string {
  const colors: Record<Mood, string> = {
    excited: 'rgba(250, 204, 21, 0.5)',
    happy: 'rgba(52, 211, 153, 0.4)',
    neutral: 'rgba(148, 163, 184, 0.2)',
    bored: 'rgba(96, 165, 250, 0.3)',
    frustrated: 'rgba(251, 146, 60, 0.5)',
    upset: 'rgba(248, 113, 113, 0.5)',
  };
  return colors[mood];
}
