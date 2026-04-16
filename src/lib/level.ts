'use client';

// SL/HL level toggle. Persists the student's chosen level per subject
// in localStorage. "all" shows every card (HL students); "sl" filters
// out cards tagged hl (SL students only see SL content).

import { useCallback, useEffect, useState } from 'react';

export type Level = 'all' | 'sl';

const KEY_PREFIX = 'lens.level.';

export function useLevel(subjectId: string) {
  const [level, setLevelState] = useState<Level>('all');
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = window.localStorage.getItem(KEY_PREFIX + subjectId);
      if (raw === 'sl') setLevelState('sl');
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, [subjectId]);

  const setLevel = useCallback(
    (lv: Level) => {
      setLevelState(lv);
      if (typeof window !== 'undefined') {
        try {
          window.localStorage.setItem(KEY_PREFIX + subjectId, lv);
        } catch {
          /* quota */
        }
      }
    },
    [subjectId]
  );

  return { level, setLevel, hydrated };
}
