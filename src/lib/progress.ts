'use client';

// Progress tracking. Stores which sub-cards (e.g. "1a", "1b") the
// student has examined in Study mode. A lens (Q#) counts as "examined"
// when both its a and b sub-cards have been seen. This keeps the
// "32 lenses" framing across the UI while tracking completion at
// sub-card granularity.
//
// All data is in browser localStorage, namespaced by subject id.
// No accounts, no sync, no backend.

import { useEffect, useState, useCallback } from 'react';

const KEY_PREFIX = 'lens.progress.';

function storageKey(subjectId: string) {
  return `${KEY_PREFIX}${subjectId}`;
}

function load(subjectId: string): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = window.localStorage.getItem(storageKey(subjectId));
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter((s: unknown) => typeof s === 'string'));
  } catch {
    return new Set();
  }
}

function save(subjectId: string, set: Set<string>) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(storageKey(subjectId), JSON.stringify([...set]));
  } catch {
    /* quota, ignore */
  }
}

/**
 * useProgress: returns the studied sub-card set for a subject plus
 * helpers. `hydrated` is false until localStorage has been read, which
 * prevents a 0/32 flash on SSR.
 */
export function useProgress(subjectId: string) {
  const [studied, setStudied] = useState<Set<string>>(() => new Set());
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setStudied(load(subjectId));
    setHydrated(true);
  }, [subjectId]);

  // Cross-tab sync.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handler = (e: StorageEvent) => {
      if (e.key === storageKey(subjectId)) setStudied(load(subjectId));
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, [subjectId]);

  const mark = useCallback(
    (subId: string) => {
      setStudied((prev) => {
        if (prev.has(subId)) return prev;
        const next = new Set(prev);
        next.add(subId);
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

/**
 * Count how many lenses (Q#s) are fully examined, meaning both sub-cards
 * "Na" and "Nb" are in the studied set. Used by the progress bar and
 * status counters across all screens.
 */
export function countExaminedLenses(studied: Set<string>, totalQuestions: number): number {
  let count = 0;
  for (let q = 1; q <= totalQuestions; q++) {
    if (studied.has(`${q}a`) && studied.has(`${q}b`)) count++;
  }
  return count;
}
