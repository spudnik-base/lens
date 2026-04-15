'use client';

// Study mode state machine. Section 4.1 + 7.4 + 7.5.
//
// Flow:
//   1. Build a deck. Resume semantics:
//        - If ?q=<N> deep-link is present (from Overview), Q# appears
//          first, then the rest of the deck follows unstudied-first.
//        - Else if localStorage has a last-seen Q# for this subject,
//          that card appears first, then unstudied-first.
//        - Else pure unstudied-first, giving brand-new students a
//          clean shuffle of every card they have not examined yet.
//   2. Show the current card: linking question + 3 specimens.
//   3. User taps a specimen they think is the impostor.
//   4. Reveal: stamp + whys for all three. Mark qIndex as studied.
//   5. User taps anywhere to advance.
//   6. When the deck is exhausted, reshuffle (again unstudied first)
//      and continue.
//
// Whenever the cursor lands on a new card, its Q# is persisted to
// localStorage so navigating away and back returns the student to
// the exact card they were on.

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import type { Subject, Card } from '@/types/subject';
import { shuffle } from '@/lib/shuffle';
import { pickStudyOptions } from '@/lib/selection';
import { useProgress } from '@/lib/progress';
import { useClickSound } from '@/lib/click-sound';
import { Loupe } from '@/components/field/Loupe';
import { Checkmark } from '@/components/field/Checkmark';
import { ImpostorStamp } from '@/components/field/ImpostorStamp';
import { SpecimenCard } from '@/components/field/SpecimenCard';
import { PencilProgressBar } from '@/components/field/PencilProgressBar';

type DeckEntry = {
  card: Card;
  shownIdxs: number[]; // indices into card.options, length 3
};

const LAST_Q_PREFIX = 'lens.study.lastq.';

function loadLastQ(subjectId: string, max: number): number | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(LAST_Q_PREFIX + subjectId);
    if (!raw) return null;
    const n = parseInt(raw, 10);
    if (Number.isInteger(n) && n >= 1 && n <= max) return n;
    return null;
  } catch {
    return null;
  }
}

function saveLastQ(subjectId: string, q: number) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(LAST_Q_PREFIX + subjectId, String(q));
  } catch {
    /* quota, ignore */
  }
}

/**
 * Build a deck. When a priority Q# is given, that card is placed
 * first; the remaining cards follow an unstudied-first ordering so
 * resume also progresses the student through remaining lenses.
 */
function buildDeck(
  subject: Subject,
  priorityQ: number | null,
  studied: Set<number>
): DeckEntry[] {
  const base = subject.cards.map((card) => ({
    card,
    shownIdxs: pickStudyOptions(card),
  }));

  let head: DeckEntry[] = [];
  let rest = base;
  if (priorityQ != null) {
    const resume = base.find((e) => e.card.qIndex === priorityQ);
    if (resume) {
      head = [resume];
      rest = base.filter((e) => e.card.qIndex !== priorityQ);
    }
  }

  const unstudied = shuffle(rest.filter((e) => !studied.has(e.card.qIndex)));
  const done = shuffle(rest.filter((e) => studied.has(e.card.qIndex)));
  return [...head, ...unstudied, ...done];
}

export function StudyClient({
  subject,
  startQIndex,
}: {
  subject: Subject;
  startQIndex: number | null;
}) {
  const { studied, hydrated, mark } = useProgress(subject.id);
  const playClick = useClickSound();
  const totalQuestions = subject.questions.length;

  // Initial deck is built with an empty studied set (pre-hydration).
  // Once localStorage is available, a one-shot effect rebuilds using
  // the real studied set plus whichever priority Q# applies: an
  // explicit deep link wins, otherwise the saved last-seen Q#.
  const [deck, setDeck] = useState<DeckEntry[]>(() =>
    buildDeck(subject, startQIndex, new Set())
  );
  const [cursor, setCursor] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const didInit = useRef(false);

  useEffect(() => {
    if (!hydrated || didInit.current) return;
    didInit.current = true;

    const priority =
      startQIndex != null
        ? startQIndex
        : loadLastQ(subject.id, totalQuestions);

    setDeck(buildDeck(subject, priority, studied));
    setCursor(0);
    setSelected(null);
  }, [hydrated, studied, subject, startQIndex, totalQuestions]);

  // When the deck is exhausted, reshuffle using the current studied
  // set so any newly examined cards drop to the back of the next pass.
  useEffect(() => {
    if (cursor >= deck.length) {
      setDeck(buildDeck(subject, null, studied));
      setCursor(0);
      setSelected(null);
    }
  }, [cursor, deck.length, subject, studied]);

  // Persist the current card's Q# as the resume point. Runs after
  // initial hydration so the pre-hydration placeholder deck does not
  // overwrite a real saved position with garbage.
  useEffect(() => {
    if (!didInit.current) return;
    const entry = deck[cursor];
    if (!entry) return;
    saveLastQ(subject.id, entry.card.qIndex);
  }, [cursor, deck, subject.id]);

  const entry = deck[cursor] ?? deck[0];
  const card = entry.card;
  const shown = entry.shownIdxs;
  const question = subject.questions[card.qIndex - 1];
  const revealed = selected !== null;

  const handleChoose = (optionIdx: number) => {
    if (revealed) return;
    playClick();
    setSelected(optionIdx);
    mark(card.qIndex);
  };

  const handleAdvance = () => {
    if (!revealed) return;
    setSelected(null);
    setCursor((c) => c + 1);
  };

  return (
    <div
      onClick={revealed ? handleAdvance : undefined}
      className={revealed ? 'cursor-pointer' : ''}
    >
      {/* Status bar --------------------------------------------------- */}
      <div className="flex items-center justify-between pb-4">
        <Link href="/" className="marg" style={{ color: 'var(--pencil)' }}>
          &larr; HOME
        </Link>
        <div className="marg">STUDY MODE</div>
        <div className="marg">
          {hydrated ? `${studied.size} / ${totalQuestions}` : `0 / ${totalQuestions}`}
        </div>
      </div>

      {/* Persistent progress bar -------------------------------------- */}
      <div className="mb-6">
        <PencilProgressBar
          total={totalQuestions}
          label="LENSES EXAMINED"
          height={10}
        />
      </div>

      {/* Lens header --------------------------------------------------- */}
      <div className="marg">EXAMINING THROUGH</div>
      <div className="mt-3 flex items-start gap-4">
        <Loupe size="compact" className="mt-1" />
        <p
          className="editorial"
          style={{ fontSize: 'var(--fs-md)', lineHeight: 1.35 }}
        >
          {question}
        </p>
      </div>

      <div className="rule my-6" />

      {/* Specimens ----------------------------------------------------- */}
      <ul className="flex flex-col gap-4">
        {shown.map((optIdx, i) => {
          const opt = card.options[optIdx];
          const isImpostor = !!opt.impostor;
          const isSelected = selected === optIdx;
          const onClick = !revealed ? () => handleChoose(optIdx) : undefined;
          return (
            <li key={optIdx}>
              <SpecimenCard
                impostor={revealed && isImpostor}
                onClick={onClick}
                aria-label={opt.text}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div
                      className="marg mb-2"
                      style={{ color: 'var(--pencil)' }}
                    >
                      SPECIMEN {String(i + 1).padStart(2, '0')}
                    </div>
                    <div
                      className="editorial editorial--medium"
                      style={{ fontSize: 'var(--fs-md)', lineHeight: 1.3 }}
                    >
                      {opt.text}
                    </div>
                    {revealed && (
                      <div
                        className="editorial mt-3"
                        style={{
                          fontSize: 'var(--fs-sm)',
                          lineHeight: 1.45,
                          color: 'var(--body-subtle)',
                        }}
                      >
                        {opt.why}
                      </div>
                    )}
                  </div>

                  {revealed && !isImpostor && (
                    <Checkmark size={20} className="shrink-0 mt-1" />
                  )}
                </div>

                {revealed && isImpostor && <ImpostorStamp />}

                {revealed && isSelected && !isImpostor && (
                  <div className="marg mt-3" style={{ color: 'var(--ink-red)' }}>
                    YOU CHOSE THIS ONE
                  </div>
                )}
              </SpecimenCard>
            </li>
          );
        })}
      </ul>

      {/* Footer prompt ------------------------------------------------- */}
      <div className="mt-8 text-center">
        {!revealed ? (
          <div className="marg">TAP THE SPECIMEN THAT DOESN&rsquo;T BELONG</div>
        ) : (
          <div className="marg" style={{ color: 'var(--ink)' }}>
            TURN THE PAGE &rarr;
          </div>
        )}
      </div>
    </div>
  );
}
