// Circular rubber-stamp button. Used for:
//   - Fits / Does not fit verdict buttons in Lens Sort
//   - Play again / Home actions on results screens
//
// Not used for the diagonal IMPOSTOR reveal, that is ImpostorStamp.
//
// Two color variants: red ink (negative) and green ink (affirmative).
// Slight hand-pressed rotation per button. Wide letterspacing, serif
// uppercase, matches a real rubber stamp.

type StampProps = {
  variant: 'red' | 'green' | 'ink';
  size?: number;
  rotate?: number;
  onClick?: () => void;
  type?: 'button' | 'submit';
  disabled?: boolean;
  'aria-label'?: string;
  children: React.ReactNode;
};

export function Stamp({
  variant,
  size = 108,
  rotate = 0,
  onClick,
  type = 'button',
  disabled,
  children,
  ...rest
}: StampProps) {
  const color =
    variant === 'red' ? '#9c3a2c' : variant === 'green' ? '#2f5234' : '#2A2520';
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      aria-label={rest['aria-label']}
      className="relative inline-flex items-center justify-center select-none disabled:opacity-40"
      style={{
        width: size,
        height: size,
        transform: `rotate(${rotate}deg)`,
        background: 'transparent',
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        className="absolute inset-0"
        aria-hidden="true"
      >
        <circle
          cx={50}
          cy={50}
          r={46}
          fill="none"
          stroke={color}
          strokeWidth={2.5}
          // A touch of jitter to feel hand-pressed, but not cartoony.
          strokeDasharray="0.5 0.1"
        />
        <circle cx={50} cy={50} r={41.5} fill="none" stroke={color} strokeWidth={0.7} opacity={0.4} />
      </svg>
      <span
        className="relative font-serif uppercase text-center leading-tight px-2"
        style={{
          color,
          letterSpacing: '0.12em',
          fontStyle: 'normal',
          fontWeight: 500,
          fontSize: size > 90 ? 13 : 11,
        }}
      >
        {children}
      </span>
    </button>
  );
}
