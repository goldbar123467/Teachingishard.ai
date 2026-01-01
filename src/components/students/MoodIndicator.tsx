import type { Mood } from '@/lib/game/types';
import { MOOD_COLORS, MOOD_EMOJI } from '@/lib/game/constants';
import { cn } from '@/lib/utils';

interface MoodIndicatorProps {
  mood: Mood;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
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
  excited: 'bg-yellow-100 dark:bg-yellow-900/30',
  happy: 'bg-green-100 dark:bg-green-900/30',
  neutral: 'bg-gray-100 dark:bg-gray-800/30',
  bored: 'bg-blue-100 dark:bg-blue-900/30',
  frustrated: 'bg-orange-100 dark:bg-orange-900/30',
  upset: 'bg-red-100 dark:bg-red-900/30',
};

export function MoodIndicator({ mood, size = 'md', showLabel = false }: MoodIndicatorProps) {
  const showBg = size === 'md' || size === 'lg';

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 transition-all duration-200',
        MOOD_COLORS[mood],
        showBg && 'px-2 py-0.5 rounded-full',
        showBg && MOOD_BG_CLASSES[mood]
      )}
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
