'use client';

// Lens Sort high-score tracking. Stores the top 3 scores per subject
// in localStorage so students can see their best rounds on the idle
// screen and know when they've beaten a personal record.

const KEY_PREFIX = 'lens.sort.scores.';

export type SortScore = {
  correct: number;
  total: number;
  date: string; // ISO date, e.g. "2026-04-16"
};

export function loadScores(subjectId: string): SortScore[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(KEY_PREFIX + subjectId);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (s: unknown): s is SortScore =>
          typeof s === 'object' &&
          s !== null &&
          typeof (s as SortScore).correct === 'number' &&
          typeof (s as SortScore).total === 'number'
      )
      .slice(0, 3);
  } catch {
    return [];
  }
}

/**
 * Record a score. If it's good enough to be in the top 3 (ranked by
 * correct/total percentage, then by correct count as tiebreaker),
 * it's inserted and the list is trimmed to 3. Returns the updated
 * list and whether this score made the board.
 */
export function recordScore(
  subjectId: string,
  score: SortScore
): { scores: SortScore[]; isTopThree: boolean } {
  const existing = loadScores(subjectId);
  const all = [...existing, score];
  all.sort((a, b) => {
    const pctA = a.total > 0 ? a.correct / a.total : 0;
    const pctB = b.total > 0 ? b.correct / b.total : 0;
    if (pctB !== pctA) return pctB - pctA;
    return b.correct - a.correct;
  });
  const top = all.slice(0, 3);
  const isTopThree = top.some(
    (s) => s.correct === score.correct && s.total === score.total && s.date === score.date
  );
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(KEY_PREFIX + subjectId, JSON.stringify(top));
    } catch {
      /* quota */
    }
  }
  return { scores: top, isTopThree };
}
