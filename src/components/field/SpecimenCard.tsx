// Specimen card, cream-on-cream raised panel with hairline tan border.
// Optional masking-tape corners for the Lens Sort hero specimen, which
// is the only card that reads as "physically pinned into a journal."
//
// The card surface is #FBF6E5 on the page's #F2E9D0; the difference
// does all the visual lifting. Never add a drop shadow.
//
// Supports three verdict states:
//   - impostor:   the post-reveal red border in Study mode
//   - correct:    brief green border flash after a right Lens Sort tap
//   - wrong:      brief red border flash after a wrong Lens Sort tap
// At most one of these should be set at a time.

import type { ReactNode } from 'react';

type SpecimenCardProps = {
  children: ReactNode;
  /** Red border for the impostor reveal (Study post-reveal). */
  impostor?: boolean;
  /** Lens Sort feedback border. Overrides default tan border briefly. */
  verdict?: 'correct' | 'wrong' | null;
  /** Small rotated rectangles at the top corners, Lens Sort hero only. */
  masked?: boolean;
  className?: string;
  onClick?: () => void;
  'aria-label'?: string;
};

export function SpecimenCard({
  children,
  impostor = false,
  verdict = null,
  masked = false,
  className = '',
  onClick,
  ...rest
}: SpecimenCardProps) {
  const modifier = impostor
    ? 'specimen--impostor'
    : verdict === 'correct'
      ? 'specimen--correct'
      : verdict === 'wrong'
        ? 'specimen--wrong'
        : '';
  const classes = `specimen ${modifier} ${className}`.trim();
  const body = (
    <>
      {masked && <MaskingTapeCorners />}
      {children}
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        className={`${classes} w-full text-left`}
        onClick={onClick}
        aria-label={rest['aria-label']}
      >
        {body}
      </button>
    );
  }
  return <div className={classes}>{body}</div>;
}

function MaskingTapeCorners() {
  // Two small off-white rectangles, slightly rotated, suggesting the
  // card was taped to a journal page. Deliberately asymmetric.
  return (
    <>
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: -6,
          left: 14,
          width: 42,
          height: 16,
          background: 'rgba(250, 247, 232, 0.85)',
          border: '1px solid rgba(138, 129, 112, 0.35)',
          transform: 'rotate(-4deg)',
          pointerEvents: 'none',
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: -5,
          right: 12,
          width: 36,
          height: 15,
          background: 'rgba(250, 247, 232, 0.85)',
          border: '1px solid rgba(138, 129, 112, 0.35)',
          transform: 'rotate(3deg)',
          pointerEvents: 'none',
        }}
      />
    </>
  );
}
