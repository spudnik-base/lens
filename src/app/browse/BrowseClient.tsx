'use client';

// Overview screen. Shows all 64 sub-cards grouped under their 32
// parent linking questions. Each sub-card (a, b) is tappable and
// jumps to Study on that specific card. Progress tracks individual
// sub-cards so both the a and b variant for each lens are visible.

import Link from 'next/link';
import { useMemo, useState } from 'react';
import type { Subject } from '@/types/subject';
import { useProgress } from '@/lib/progress';
import { Ornament } from '@/components/field/Ornament';
import { Checkmark } from '@/components/field/Checkmark';
import { PencilProgressBar } from '@/components/field/PencilProgressBar';

export function BrowseClient({ subject }: { subject: Subject }) {
  const { studied, hydrated, reset } = useProgress(subject.id);
  const totalCards = subject.cards.length;
  const done = hydrated ? studied.size : 0;
  const [confirmReset, setConfirmReset] = useState(false);

  // Group cards by qIndex so we can render question headers.
  const groups = useMemo(() => {
    const map = new Map<number, typeof subject.cards>();
    for (const card of subject.cards) {
      const arr = map.get(card.qIndex) ?? [];
      arr.push(card);
      map.set(card.qIndex, arr);
    }
    return [...map.entries()]
      .sort(([a], [b]) => a - b)
      .map(([qIndex, cards]) => ({
        qIndex,
        question: subject.questions[qIndex - 1],
        cards: cards.sort((a, b) => a.subId.localeCompare(b.subId)),
      }));
  }, [subject]);

  return (
    <div>
      {/* Status bar */}
      <div className="flex items-center justify-between pb-4">
        <Link href="/" className="marg" style={{ color: 'var(--pencil)' }}>
          &larr; HOME
        </Link>
        <div className="marg">OVERVIEW</div>
        <div className="marg">{totalCards} CARDS</div>
      </div>

      {/* Title plate */}
      <header className="text-center pt-6 pb-5">
        <div className="marg mb-4">IB BIOLOGY</div>
        <h1 className="editorial" style={{ fontSize: 'var(--fs-xl)', lineHeight: 1 }}>
          Field Guide
        </h1>
        <div className="mt-4 flex justify-center">
          <Ornament />
        </div>
      </header>

      {/* Progress bar */}
      <div className="mt-2 mb-8">
        <PencilProgressBar
          value={done}
          total={totalCards}
          label="CARDS EXAMINED"
        />
      </div>

      <div className="rule my-5" />

      {/* Lens list, grouped by question */}
      <ul className="flex flex-col">
        {groups.map(({ qIndex, question, cards }) => (
          <li key={qIndex} style={{ borderTop: '1px solid var(--border)' }}>
            {/* Question header */}
            <div className="flex items-start gap-4 pt-4 pb-2">
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
                {question}
              </span>
            </div>

            {/* Sub-card rows */}
            <div className="pl-12 pb-3 flex flex-col gap-1">
              {cards.map((card) => {
                const isDone = studied.has(card.subId);
                const letter = card.subId.replace(/^\d+/, '');
                return (
                  <Link
                    key={card.subId}
                    href={`/study?q=${card.qIndex}`}
                    className="flex items-center gap-3 py-1.5"
                    style={{ color: 'var(--ink)' }}
                  >
                    <span
                      className="font-mono shrink-0"
                      style={{
                        fontSize: 'var(--fs-xs)',
                        color: 'var(--pencil)',
                        width: 20,
                      }}
                    >
                      {letter}
                    </span>
                    <span
                      className="font-mono flex-1"
                      style={{
                        fontSize: 'var(--fs-xs)',
                        color: isDone ? 'var(--ink-green)' : 'var(--pencil)',
                      }}
                    >
                      {isDone ? 'EXAMINED' : 'NOT YET'}
                    </span>
                    <span className="shrink-0 w-5" aria-hidden="true">
                      {isDone && <Checkmark size={16} />}
                    </span>
                  </Link>
                );
              })}
            </div>
          </li>
        ))}
      </ul>

      {/* Reset */}
      <div className="mt-14 text-center">
        {!confirmReset ? (
          <button
            type="button"
            className="marg"
            style={{ color: 'var(--pencil)', background: 'transparent' }}
            onClick={() => setConfirmReset(true)}
            disabled={done === 0}
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
