'use client';

// Progress tracking — which linking questions the student has examined
// (i.e. completed one reveal for) in Study mode. Stored client-side in
// localStorage, namespaced by subject id.
//
// No accounts, no sync, no backend. If the user clears their storage,
// progress resets — that is acceptable for the MVP.

import { useEffect, useState, useCallback } from 'react';

const KEY_PREFIX = 'lens.progress.';

function storageKey(subjectId: string) {
  return `${KEY_PREFIX}${subjectId}`;
}

function load(subjectId: string): Set<number> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = window.localStorage.getItem(storageKey(subjectId));
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter((n) => Number.isInteger(n)));
  } catch {
    return new Set();
  }
}

function save(subjectId: string, set: Set<number>) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(storageKey(subjectId), JSON.stringify([...set]));
  } catch {
    /* quota — ignore */
  }
}

/**
 * useProgress — returns the studied Q# set for a subject plus helpers.
 * `hydrated` indicates whether the client-side state has been loaded,
 * which matters because SSR renders 0/32 and we want to delay revealing
 * the progress UI until we know the real number (prevents a flash).
 */
export function useProgress(subjectId: string) {
  const [studied, setStudied] = useState<Set<number>>(() => new Set());
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setStudied(load(subjectId));
    setHydrated(true);
  }, [subjectId]);

  // Cross-tab sync — if Study mode in another tab marks a question,
  // the overview in this tab updates live.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handler = (e: StorageEvent) => {
      if (e.key === storageKey(subjectId)) setStudied(load(subjectId));
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, [subjectId]);

  const mark = useCallback(
    (qIndex: number) => {
      setStudied((prev) => {
        if (prev.has(qIndex)) return prev;
        const next = new Set(prev);
        next.add(qIndex);
        save(subjectId, next);
        return next;
      });
    },
    [subjectId]
  );

  const reset = useCallback(() => {
    setStudied(new Set());
    save(subjectId, new Set());
  }, [subjectId]);

  return { studied, hydrated, mark, reset };
}
