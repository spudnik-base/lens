// Circular rubber-stamp button. Used for:
//   - Fits / Does not fit verdict buttons in Lens Sort
//   - Play again / Home actions on results screens
//
// Not used for the diagonal IMPOSTOR reveal, that is ImpostorStamp.
//
// Visually raised via a twin-circle trick: a faint trailing circle
// sits offset down-right behind the main face, creating depth without
// a CSS drop shadow. On hover the face lifts a pixel; on active press
// or when the `pressed` prop is set, the face drops onto the shadow
// position so it reads as pushed in. See globals.css for the .stamp
// transitions.

type StampProps = {
  variant: 'red' | 'green' | 'ink';
  size?: number;
  rotate?: number;
  onClick?: () => void;
  type?: 'button' | 'submit';
  disabled?: boolean;
  /** External press state, used by Lens Sort to hold the stamp filled
      with its color for ~180ms as hit feedback. */
  pressed?: boolean;
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
  pressed = false,
  children,
  ...rest
}: StampProps) {
  const color =
    variant === 'red' ? '#9c3a2c' : variant === 'green' ? '#2f5234' : '#2A2520';

  const labelFontSize = size > 96 ? 17 : size > 72 ? 14 : 12;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      aria-label={rest['aria-label']}
      data-pressed={pressed ? 'true' : undefined}
      className="stamp inline-flex items-center justify-center select-none disabled:opacity-40"
      style={{
        width: size,
        height: size,
        transform: `rotate(${rotate}deg)`,
      }}
    >
      {/* Trailing depth circle. Stays stationary; the face moves above
          and below it to signal rest / hover / press. */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        className="stamp__shadow"
        aria-hidden="true"
      >
        <circle
          cx={50}
          cy={50}
          r={46}
          fill="none"
          stroke={color}
          strokeWidth={2.2}
          opacity={0.22}
        />
      </svg>

      {/* Face. Fills with color when `pressed` so the button reads as
          "just fired", then the parent releases the prop. */}
      <span className="stamp__face">
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
            fill={pressed ? color : 'none'}
            stroke={color}
            strokeWidth={2.5}
            strokeDasharray="0.5 0.1"
          />
          <circle
            cx={50}
            cy={50}
            r={41.5}
            fill="none"
            stroke={pressed ? '#FBF6E5' : color}
            strokeWidth={0.7}
            opacity={0.5}
          />
        </svg>
        <span
          className="relative font-serif uppercase text-center leading-tight px-2"
          style={{
            color: pressed ? '#FBF6E5' : color,
            letterSpacing: '0.12em',
            fontStyle: 'normal',
            fontWeight: 500,
            fontSize: labelFontSize,
          }}
        >
          {children}
        </span>
      </span>
    </button>
  );
}
