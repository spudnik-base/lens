'use client';

import { useProgress } from '@/lib/progress';

export function SubjectProgress({
  subjectId,
  totalCards,
}: {
  subjectId: string;
  totalCards: number;
}) {
  const { studied, hydrated } = useProgress(subjectId);
  const done = hydrated ? studied.size : 0;
  const pct = totalCards > 0 ? done / totalCards : 0;
  const widthPct = `${(Math.max(0, Math.min(1, pct)) * 100).toFixed(1)}%`;

  return (
    <div>
      <div className="flex items-baseline justify-between mb-1">
        <span
          className="font-mono"
          style={{ fontSize: 'var(--fs-xs)', color: 'var(--pencil)', letterSpacing: '0.1em' }}
        >
          {hydrated ? `${done} / ${totalCards} CARDS` : `0 / ${totalCards} CARDS`}
        </span>
      </div>
      <div
        style={{
          position: 'relative',
          height: 10,
          border: '1px solid var(--border)',
          background: 'var(--paper)',
        }}
      >
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            bottom: 0,
            width: widthPct,
            backgroundImage:
              'repeating-linear-gradient(-45deg, #2f5234 0px, #2f5234 1px, transparent 1px, transparent 4px)',
            transition: 'width 240ms ease-out',
            opacity: 0.9,
          }}
        />
      </div>
    </div>
  );
}
