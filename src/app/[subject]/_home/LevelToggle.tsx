'use client';

import { useLevel, type Level } from '@/lib/level';

export function LevelToggle({ subjectId }: { subjectId: string }) {
  const { level, setLevel, hydrated } = useLevel(subjectId);
  if (!hydrated) return null;

  return (
    <div className="flex items-center justify-center gap-2 mt-4">
      <span className="marg" style={{ textTransform: 'none', letterSpacing: '0.05em' }}>Level:</span>
      <ToggleBtn active={level === 'sl'} onClick={() => setLevel('sl')}>SL</ToggleBtn>
      <ToggleBtn active={level === 'all'} onClick={() => setLevel('all')}>HL</ToggleBtn>
    </div>
  );
}

function ToggleBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="font-mono"
      style={{
        fontSize: 'var(--fs-xs)',
        letterSpacing: '0.1em',
        padding: '4px 14px',
        border: '1px solid var(--border)',
        background: active ? 'var(--ink)' : 'transparent',
        color: active ? 'var(--card)' : 'var(--pencil)',
        transition: 'background 120ms ease, color 120ms ease',
      }}
    >
      {children}
    </button>
  );
}
