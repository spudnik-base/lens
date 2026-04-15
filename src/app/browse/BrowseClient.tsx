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
import { PencilProgressBar } from '@/components/field/PencilProgressBar';

export function BrowseClient({ subject }: { subject: Subject }) {
  const { studied, hydrated, reset } = useProgress(subject.id);
  const total = subject.questions.length;
  const doneCount = hydrated ? studied.size : 0;
  const [confirmReset, setConfirmReset] = useState(false);

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
      {/* Status bar --------------------------------------------------- */}
      <div className="flex items-center justify-between pb-4">
        <Link href="/" className="marg" style={{ color: 'var(--pencil)' }}>
          &larr; HOME
        </Link>
        <div className="marg">OVERVIEW</div>
        <div className="marg">{total} LENSES</div>
      </div>

      {/* Title plate --------------------------------------------------- */}
      <header className="text-center pt-6 pb-5">
        <div className="marg mb-4">IB BIOLOGY</div>
        <h1 className="editorial" style={{ fontSize: 'var(--fs-xl)', lineHeight: 1 }}>
          Field Guide
        </h1>
        <div className="mt-4 flex justify-center">
          <Ornament />
        </div>
      </header>

      {/* Progress bar ------------------------------------------------- */}
      <div className="mt-2 mb-8">
        <PencilProgressBar total={total} label="LENSES EXAMINED" />
      </div>

      <div className="rule my-5" />

      {/* Lens list ----------------------------------------------------- */}
      <ul className="flex flex-col">
        {rows.map(({ qIndex, text, done }) => (
          <li key={qIndex}>
            <Link
              href={`/study?q=${qIndex}`}
              className="flex items-start gap-4 py-4"
              style={{
                color: 'var(--ink)',
                borderTop: '1px solid var(--border)',
              }}
            >
              <span
                className="font-mono shrink-0 text-right"
                style={{
                  width: 32,
                  fontSize: 'var(--fs-xs)',
                  color: 'var(--pencil)',
                  lineHeight: 1.5,
                  paddingTop: 4,
                }}
              >
                {String(qIndex).padStart(2, '0')}
              </span>
              <span
                className="editorial flex-1"
                style={{ fontSize: 'var(--fs-md)', lineHeight: 1.35 }}
              >
                {text}
              </span>
              <span className="shrink-0 w-6 mt-1" aria-hidden="true">
                {done && <Checkmark size={18} />}
              </span>
            </Link>
          </li>
        ))}
      </ul>

      {/* Reset --------------------------------------------------------- */}
      <div className="mt-14 text-center">
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
          <div className="marg flex items-center justify-center gap-4">
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
