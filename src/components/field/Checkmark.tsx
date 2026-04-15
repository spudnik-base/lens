// Hand-drawn checkmark. Never a Unicode tick character (Section 6.3).
export function Checkmark({ size = 14, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 14 14"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M 2 7.5 L 5.5 11 L 12 3.5"
        fill="none"
        stroke="#2f5234"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
