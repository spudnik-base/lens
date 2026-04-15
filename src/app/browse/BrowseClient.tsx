'use client';

// Overview screen. Section 7.6 in spirit, but simpler: one flat list
// of 32 questions, pencil tick beside each that has been examined, a
// hand-lettered progress bar at the top, and a reset button in pencil
// marginalia for starting over.

import Link from 'next/link';
import { useMemo, useState } from 'react';
import type { Subject } from '@/types/subject';
import { useProgress } from '@/lib/progress';
import { Ornament } from '@/components/field/Ornament';
import { Checkmark } from '@/components/field/Checkmark';

export function BrowseClient({ subject }: { subject: Subject }) {
  const { studied, hydrated, reset } = useProgress(subject.id);
  const total = subject.questions.length;
  const doneCount = hydrated ? studied.size : 0;
  const pct = total > 0 ? doneCount / total : 0;
  const [confirmReset, setConfirmReset] = useState(false);

  // Memoized rows so React doesn't re-render the entire list on every
  // navigation event. 32 items is small but the habit is worth keeping.
  const rows = useMemo(
    () =>
      subject.questions.map((q, i) => {
        const qIndex = i + 1;
        return { qIndex, text: q, done: studied.has(qIndex) };
      }),
    [subject.questions, studied]
  );

  return (
    <div>
      {/* Status bar ---------------------------------------------------- */}
      <div className="flex items-center justify-between pb-4">
        <Link href="/" className="marg" style={{ color: 'var(--pencil)' }}>
          ← HOME
        </Link>
        <div className="marg">OVERVIEW</div>
        <div className="marg">{total} LENSES</div>
      </div>

      {/* Title plate --------------------------------------------------- */}
      <header className="text-center pt-4 pb-4">
        <div className="marg mb-3">IB BIOLOGY</div>
        <h1 className="editorial" style={{ fontSize: 32, lineHeight: 1 }}>
          Field Guide
        </h1>
        <div className="mt-3 flex justify-center">
          <Ornament />
        </div>
      </header>

      {/* Hand-drawn progress bar -------------------------------------- */}
      <section aria-label="progress" className="mt-2 mb-6">
        <div className="flex items-baseline justify-between mb-2">
          <div className="marg">PROGRESS</div>
          <div
            className="font-mono"
            style={{ fontSize: 10, color: 'var(--pencil)', letterSpacing: '0.1em' }}
          >
            {hydrated ? `${doneCount} / ${total}` : `0 / ${total}`}
          </div>
        </div>
        <PencilProgressBar pct={pct} />
      </section>

      <div className="rule my-5" />

      {/* Lens list ----------------------------------------------------- */}
      <ul className="flex flex-col">
        {rows.map(({ qIndex, text, done }) => (
          <li key={qIndex}>
            <Link
              href={`/study?q=${qIndex}`}
              className="flex items-start gap-3 py-3"
              style={{ color: 'var(--ink)', borderTop: '1px solid var(--border)' }}
            >
              <span
                className="font-mono shrink-0 text-right"
                style={{
                  width: 22,
                  fontSize: 11,
                  color: 'var(--pencil)',
                  lineHeight: 1.5,
                  paddingTop: 2,
                }}
              >
                {String(qIndex).padStart(2, '0')}
              </span>
              <span
                className="editorial flex-1"
                style={{ fontSize: 14, lineHeight: 1.35 }}
              >
                {text}
              </span>
              <span className="shrink-0 w-4 mt-1" aria-hidden="true">
                {done && <Checkmark size={14} />}
              </span>
            </Link>
          </li>
        ))}
      </ul>

      {/* Reset --------------------------------------------------------- */}
      <div className="mt-10 text-center">
        {!confirmReset ? (
          <button
            type="button"
            className="marg"
            style={{ color: 'var(--pencil)', background: 'transparent' }}
            onClick={() => setConfirmReset(true)}
            disabled={doneCount === 0}
          >
            ERASE ALL MARKS
          </button>
        ) : (
          <div className="marg flex items-center justify-center gap-3">
            <span>ARE YOU SURE?</span>
            <button
              type="button"
              onClick={() => {
                reset();
                setConfirmReset(false);
              }}
              style={{ color: 'var(--ink-red)', background: 'transparent' }}
              className="marg"
            >
              YES, ERASE
            </button>
            <button
              type="button"
              onClick={() => setConfirmReset(false)}
              style={{ color: 'var(--pencil)', background: 'transparent' }}
              className="marg"
            >
              CANCEL
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Pencil-style progress bar. Thin tan outline containing a hatched
// pencil fill up to `pct`. No gradients, no rounded corners, it looks
// like ruled graph paper filled in by hand.
function PencilProgressBar({ pct }: { pct: number }) {
  const clamped = Math.max(0, Math.min(1, pct));
  const widthPct = `${(clamped * 100).toFixed(1)}%`;
  return (
    <div
      style={{
        position: 'relative',
        height: 14,
        border: '1px solid var(--border)',
        background: 'var(--card)',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          bottom: 0,
          width: widthPct,
          backgroundImage:
            'repeating-linear-gradient(-45deg, #2f5234 0px, #2f5234 1px, transparent 1px, transparent 4px)',
          transition: 'width 240ms ease-out',
          opacity: 0.9,
        }}
        aria-hidden="true"
      />
    </div>
  );
}
