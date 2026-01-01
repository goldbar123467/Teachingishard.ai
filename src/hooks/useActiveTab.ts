'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Hook to persist the active tab (pathname) to localStorage
 * This allows the app to restore the last visited page on reload
 */
export function useActiveTab() {
  const pathname = usePathname();

  useEffect(() => {
    // Save current pathname to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('classroom-sim:last-active-tab', pathname);
    }
  }, [pathname]);

  return pathname;
}

/**
 * Get the last active tab from localStorage
 */
export function getLastActiveTab(): string {
  if (typeof window === 'undefined') return '/';
  return localStorage.getItem('classroom-sim:last-active-tab') || '/';
}
