// Leaf-vein flourish under the Field Guide title. Section 6.3.
export function Ornament({ className }: { className?: string }) {
  return (
    <svg
      width={50}
      height={14}
      viewBox="0 0 50 14"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M 2 7 Q 12 2 25 7 Q 38 12 48 7"
        fill="none"
        stroke="#2A2520"
        strokeWidth={0.8}
        strokeLinecap="round"
      />
      <circle cx="25" cy="7" r="1.5" fill="#2A2520" />
    </svg>
  );
}
