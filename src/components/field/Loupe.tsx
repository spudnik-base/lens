// The loupe, signature motif. Hand-drawn ink. See Section 6.3.
// Full size is ~46×68. Compact is ~32×46 for the Study header.
// The `why` lives outside: this component is pure SVG, no label.

type LoupeProps = {
  size?: 'full' | 'compact' | 'mini';
  className?: string;
};

export function Loupe({ size = 'full', className }: LoupeProps) {
  const dims = size === 'full' ? { w: 46, h: 68 } : size === 'compact' ? { w: 32, h: 46 } : { w: 14, h: 20 };
  return (
    <svg
      width={dims.w}
      height={dims.h}
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
