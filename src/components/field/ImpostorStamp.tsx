// Diagonal "IMPOSTOR" stamp used in Study reveals. Section 7.5.
// Partially clipped by the card edge, rotated 20°, faded red ink.
export function ImpostorStamp({ className }: { className?: string }) {
  return (
    <div
      className={className}
      aria-hidden="true"
      style={{
        position: 'absolute',
        top: -8,
        right: -16,
        transform: 'rotate(20deg)',
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          border: '2px solid #9c3a2c',
          padding: '6px 14px',
          color: '#9c3a2c',
          fontFamily: 'var(--font-serif), Georgia, serif',
          fontStyle: 'normal',
          fontWeight: 500,
          fontSize: 13,
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          background: 'transparent',
        }}
      >
        Impostor
      </div>
    </div>
  );
}
