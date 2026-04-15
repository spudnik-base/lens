// Pencil tally marks, score rendered as | | | |, not numerals.
// Standard lab-notebook convention: four singles, then the fifth as a
// diagonal slash through the previous four. Groups of five run into
// the next group on the same row with a small gap.

type TallyProps = {
  count: number;
  className?: string;
};

export function Tally({ count, className }: TallyProps) {
  const groups: number[] = [];
  let remaining = Math.max(0, Math.floor(count));
  while (remaining > 0) {
    groups.push(Math.min(5, remaining));
    remaining -= 5;
  }
  if (groups.length === 0) groups.push(0);

  return (
    <span className={className} aria-label={`score ${count}`}>
      {groups.map((g, i) => (
        <TallyGroup key={i} n={g} />
      ))}
    </span>
  );
}

function TallyGroup({ n }: { n: number }) {
  // Each group is a 14-wide SVG: four vertical strokes + optional slash.
  const strokeW = 1.4;
  const color = '#8a8170'; // pencil gray
  return (
    <svg
      width={18}
      height={16}
      viewBox="0 0 18 16"
      style={{ display: 'inline-block', marginRight: 3, verticalAlign: 'middle' }}
      aria-hidden="true"
    >
      {n >= 1 && <line x1={2} y1={2} x2={2} y2={14} stroke={color} strokeWidth={strokeW} strokeLinecap="round" />}
      {n >= 2 && <line x1={5} y1={2} x2={5} y2={14} stroke={color} strokeWidth={strokeW} strokeLinecap="round" />}
      {n >= 3 && <line x1={8} y1={2} x2={8} y2={14} stroke={color} strokeWidth={strokeW} strokeLinecap="round" />}
      {n >= 4 && <line x1={11} y1={2} x2={11} y2={14} stroke={color} strokeWidth={strokeW} strokeLinecap="round" />}
      {n === 5 && (
        <line x1={0.5} y1={14} x2={13} y2={2} stroke={color} strokeWidth={strokeW} strokeLinecap="round" />
      )}
    </svg>
  );
}
