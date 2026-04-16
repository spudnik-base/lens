'use client';

// Thin tan-outlined progress bar with a hatched pencil fill up to
// value / total. No gradients, no rounded corners, no animated
// celebrations; looks like ruled graph paper filled in by hand.
//
// This is a pure display component. The parent computes the value
// (typically lenses examined via countExaminedLenses) and passes it in.

type PencilProgressBarProps = {
  value: number;
  total: number;
  label?: string;
  height?: number;
};

export function PencilProgressBar({
  value,
  total,
  label = 'PROGRESS',
  height = 14,
}: PencilProgressBarProps) {
  const pct = total > 0 ? value / total : 0;
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
          {value} / {total}
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
