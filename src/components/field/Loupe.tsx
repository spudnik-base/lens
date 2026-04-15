// The loupe, signature motif. Hand-drawn ink. See Section 6.3.
// Three size variants. Dimensions are read from CSS variables defined
// in globals.css so they scale with the typography at each breakpoint.
// The `why` lives outside: this component is pure SVG, no label.

type LoupeProps = {
  size?: 'full' | 'compact' | 'mini';
  className?: string;
};

export function Loupe({ size = 'full', className }: LoupeProps) {
  const widthVar =
    size === 'full'
      ? 'var(--loupe-full-w)'
      : size === 'compact'
        ? 'var(--loupe-compact-w)'
        : 'var(--loupe-mini-w)';
  const heightVar =
    size === 'full'
      ? 'var(--loupe-full-h)'
      : size === 'compact'
        ? 'var(--loupe-compact-h)'
        : 'var(--loupe-mini-h)';

  return (
    <svg
      style={{ width: widthVar, height: heightVar, flexShrink: 0 }}
      viewBox="0 0 46 68"
      className={className}
      aria-hidden="true"
    >
      {/* Ring interior, subtle cream fill so the question is visible
          "through" the lens when layered above it. */}
      <circle cx="22" cy="22" r="17" fill="#FBF6E5" stroke="#2A2520" strokeWidth={1.6} />
      {/* Inner bevel suggestion. */}
      <circle cx="22" cy="22" r="13" fill="none" stroke="#2A2520" strokeWidth={0.5} opacity={0.35} />
      {/* Highlight arc, the sheen on a polished lens. */}
      <path
        d="M 13 17 Q 17 12 23 11"
        fill="none"
        stroke="#2A2520"
        strokeWidth={0.6}
        opacity={0.45}
      />
      {/* Handle neck. */}
      <line x1="34" y1="34" x2="42" y2="46" stroke="#2A2520" strokeWidth={2.5} strokeLinecap="round" />
      {/* Grip, a small ink rectangle, rotated. */}
      <rect
        x="38"
        y="44"
        width="8"
        height="14"
        rx="1.5"
        fill="#2A2520"
        transform="rotate(-45 42 51)"
      />
    </svg>
  );
}
