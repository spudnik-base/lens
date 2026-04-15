'use client';

// Thin tan-outlined progress bar with a hatched pencil fill up to
// `value / max`. No gradients, no rounded corners, no animated
// celebrations; looks like ruled graph paper filled in by hand.
//
// Used on the home screen, Overview, and Study mode so students see
// the same "lenses examined" indicator everywhere, all reading from
// the same localStorage-backed progress set.

import { useProgress } from '@/lib/progress';
import { DEFAULT_SUBJECT_ID } from '@/lib/content';

type PencilProgressBarProps = {
  total: number;
  /** Optional label above the bar. Defaults to "PROGRESS". */
  label?: string;
  /** Height in px. Slightly thicker on larger screens via CSS vars. */
  height?: number;
};

export function PencilProgressBar({
  total,
  label = 'PROGRESS',
  height = 14,
}: PencilProgressBarProps) {
  const { studied, hydrated } = useProgress(DEFAULT_SUBJECT_ID);
  const done = hydrated ? studied.size : 0;
  const pct = total > 0 ? done / total : 0;
  const widthPct = `${(Math.max(0, Math.min(1, pct)) * 100).toFixed(1)}%`;

  return (
    <section aria-label="progress" className="w-full">
      <div className="flex items-baseline justify-between mb-2">
        <div className="marg">{label}</div>
        <div
          className="font-mono"
          style={{
            fontSize: 'var(--fs-xs)',
            color: 'var(--pencil)',
            letterSpacing: '0.1em',
          }}
        >
          {hydrated ? `${done} / ${total}` : `0 / ${total}`}
        </div>
      </div>
      <div
        style={{
          position: 'relative',
          height,
          border: '1px solid var(--border)',
          background: 'var(--card)',
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
    </section>
  );
}
