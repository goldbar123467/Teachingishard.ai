'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import type { GameState } from '@/lib/game/types';
import { quickSave } from '@/lib/game/persistence';

interface UseAutoSaveOptions {
  enabled?: boolean;
  interval?: number; // Interval in ms for periodic saves
  onPhaseChange?: boolean; // Save when phase changes
  onDayChange?: boolean; // Save when day changes
}

interface AutoSaveStatus {
  lastSaved: Date | null;
  isSaving: boolean;
  error: string | null;
}

export function useAutoSave(
  state: GameState,
  options: UseAutoSaveOptions = {}
) {
  const {
    enabled = true,
    interval = 60000, // 1 minute default
    onPhaseChange = true,
    onDayChange = true,
  } = options;

  const [status, setStatus] = useState<AutoSaveStatus>({
    lastSaved: null,
    isSaving: false,
    error: null,
  });

  // Store state in a ref so we can access current state without causing re-renders
  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const previousPhaseRef = useRef(state.turn.phase);
  const previousDayRef = useRef(state.turn.dayOfWeek);
  const previousWeekRef = useRef(state.turn.week);

  // performSave no longer has state in dependency array - uses ref instead
  const performSave = useCallback(() => {
    const currentState = stateRef.current;
    if (!enabled || !currentState.autoSaveEnabled) return;

    setStatus(prev => ({ ...prev, isSaving: true, error: null }));

    try {
      const success = quickSave(currentState);
      if (success) {
        setStatus({
          lastSaved: new Date(),
          isSaving: false,
          error: null,
        });
      } else {
        setStatus(prev => ({
          ...prev,
          isSaving: false,
          error: 'Failed to save',
        }));
      }
    } catch (error) {
      setStatus(prev => ({
        ...prev,
        isSaving: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }));
    }
  }, [enabled]); // Only depends on enabled, not state

  // Save on phase change
  useEffect(() => {
    if (!onPhaseChange || !enabled) return;

    if (previousPhaseRef.current !== state.turn.phase) {
      previousPhaseRef.current = state.turn.phase;
      performSave();
    }
  }, [state.turn.phase, onPhaseChange, enabled, performSave]);

  // Save on day/week change
  useEffect(() => {
    if (!onDayChange || !enabled) return;

    const dayChanged = previousDayRef.current !== state.turn.dayOfWeek;
    const weekChanged = previousWeekRef.current !== state.turn.week;

    if (dayChanged || weekChanged) {
      previousDayRef.current = state.turn.dayOfWeek;
      previousWeekRef.current = state.turn.week;
      performSave();
    }
  }, [state.turn.dayOfWeek, state.turn.week, onDayChange, enabled, performSave]);

  // Periodic save - timer no longer resets when state changes
  useEffect(() => {
    if (!enabled || interval <= 0) return;

    const timer = setInterval(performSave, interval);
    return () => clearInterval(timer);
  }, [enabled, interval, performSave]);

  // Manual save function
  const save = useCallback(() => {
    performSave();
  }, [performSave]);

  return {
    ...status,
    save,
  };
}

// Format relative time for display
export function formatLastSaved(date: Date | null): string {
  if (!date) return 'Never';

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);

  if (diffSec < 10) return 'Just now';
  if (diffSec < 60) return `${diffSec}s ago`;
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;

  return date.toLocaleDateString();
}
