'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface NotificationBadgeProps {
  count: number;
  animated?: boolean;
  size?: 'sm' | 'md' | 'lg';
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  className?: string;
}

const sizeConfig = {
  sm: {
    badge: 'h-4 min-w-[16px] text-[9px]',
    ping: 'h-4 w-4',
  },
  md: {
    badge: 'h-5 min-w-[20px] text-[10px]',
    ping: 'h-5 w-5',
  },
  lg: {
    badge: 'h-6 min-w-[24px] text-xs',
    ping: 'h-6 w-6',
  },
};

const positionConfig = {
  'top-right': '-top-1 -right-1',
  'top-left': '-top-1 -left-1',
  'bottom-right': '-bottom-1 -right-1',
  'bottom-left': '-bottom-1 -left-1',
};

export function NotificationBadge({
  count,
  animated = false,
  size = 'md',
  position = 'top-right',
  className,
}: NotificationBadgeProps) {
  const [prevCount, setPrevCount] = useState(count);
  const [shouldPing, setShouldPing] = useState(false);

  // Trigger animation when count increases
  useEffect(() => {
    if (count > prevCount && animated) {
      setShouldPing(true);
      const timer = setTimeout(() => setShouldPing(false), 1000);
      return () => clearTimeout(timer);
    }
    setPrevCount(count);
  }, [count, prevCount, animated]);

  if (count === 0) return null;

  const displayCount = count > 99 ? '99+' : count.toString();
  const sizes = sizeConfig[size];

  return (
    <div className={cn('absolute', positionConfig[position], className)}>
      <AnimatePresence mode="wait">
        <motion.div
          key={count}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0 }}
          transition={{
            type: 'spring',
            stiffness: 500,
            damping: 25,
          }}
          className="relative"
        >
          {/* Ping animation ring */}
          {shouldPing && (
            <motion.span
              initial={{ scale: 1, opacity: 1 }}
              animate={{ scale: 2, opacity: 0 }}
              transition={{ duration: 0.6 }}
              className={cn(
                'absolute inset-0 rounded-full bg-red-500',
                sizes.ping
              )}
            />
          )}

          {/* Badge */}
          <motion.div
            animate={shouldPing ? {
              scale: [1, 1.2, 1],
              rotate: [0, -10, 10, -10, 0],
            } : {}}
            transition={{ duration: 0.4 }}
            className={cn(
              'relative flex items-center justify-center rounded-full bg-red-500 text-white font-bold px-1.5 shadow-lg shadow-red-500/50 ring-2 ring-background',
              sizes.badge
            )}
          >
            <motion.span
              key={displayCount}
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 10, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {displayCount}
            </motion.span>
          </motion.div>

          {/* Subtle pulse for ongoing notifications */}
          {animated && count > 0 && (
            <motion.span
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.5, 0.8, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className={cn(
                'absolute inset-0 rounded-full bg-red-500/30',
                sizes.ping
              )}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

interface NotificationDotProps {
  visible?: boolean;
  animated?: boolean;
  size?: 'sm' | 'md' | 'lg';
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  className?: string;
}

const dotSizeConfig = {
  sm: 'h-2 w-2',
  md: 'h-2.5 w-2.5',
  lg: 'h-3 w-3',
};

export function NotificationDot({
  visible = true,
  animated = true,
  size = 'md',
  position = 'top-right',
  className,
}: NotificationDotProps) {
  if (!visible) return null;

  return (
    <div className={cn('absolute', positionConfig[position], className)}>
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0 }}
        className="relative"
      >
        {/* Ping animation */}
        {animated && (
          <>
            <motion.span
              animate={{
                scale: [1, 2],
                opacity: [0.5, 0],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeOut',
              }}
              className={cn(
                'absolute inset-0 rounded-full bg-red-500',
                dotSizeConfig[size]
              )}
            />
            <motion.span
              animate={{
                scale: [1, 2],
                opacity: [0.5, 0],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeOut',
                delay: 0.5,
              }}
              className={cn(
                'absolute inset-0 rounded-full bg-red-500',
                dotSizeConfig[size]
              )}
            />
          </>
        )}

        {/* Dot */}
        <div
          className={cn(
            'rounded-full bg-red-500 ring-2 ring-background shadow-lg shadow-red-500/50',
            dotSizeConfig[size]
          )}
        />
      </motion.div>
    </div>
  );
}
