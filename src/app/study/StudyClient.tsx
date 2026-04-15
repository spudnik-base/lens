'use client';

// Study mode state machine. Section 4.1 + 7.4 + 7.5.
//
// Flow:
//   1. Shuffle the deck of cards (optionally start at a specific Q#).
//   2. Show the current card: linking question + 3 specimens.
//   3. User taps a specimen they think is the impostor.
//   4. Reveal: stamp + whys for all three.
//   5. User taps anywhere ("turn the page →") to advance.
//   6. When the deck is exhausted, reshuffle and continue (spec 4.1).
//
// Each revealed card marks its qIndex in persistent progress so the
// Overview screen shows which lenses have been examined.

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import type { Subject, Card } from '@/types/subject';
import { shuffle } from '@/lib/shuffle';
import { pickStudyOptions } from '@/lib/selection';
import { useProgress } from '@/lib/progress';
import { Loupe } from '@/components/field/Loupe';
import { Checkmark } from '@/components/field/Checkmark';
import { ImpostorStamp } from '@/components/field/ImpostorStamp';
import { SpecimenCard } from '@/components/field/SpecimenCard';

type DeckEntry = {
  card: Card;
  shownIdxs: number[]; // indices into card.options, length 3
};

function buildDeck(subject: Subject, startQIndex: number | null): DeckEntry[] {
  const base = subject.cards.map((card) => ({ card, shownIdxs: pickStudyOptions(card) }));
  const shuffled = shuffle(base);
  if (startQIndex == null) return shuffled;

  // Rotate the shuffled deck so that the requested question appears first.
  const idx = shuffled.findIndex((e) => e.card.qIndex === startQIndex);
  if (idx <= 0) return shuffled;
  return [...shuffled.slice(idx), ...shuffled.slice(0, idx)];
}

export function StudyClient({
  subject,
  startQIndex,
}: {
  subject: Subject;
  startQIndex: number | null;
}) {
  const { mark } = useProgress(subject.id);

  // Deck is recomputed when startQIndex changes or the component mounts.
  // A ref tracks whether we have built the initial deck so hot reloads
  // in dev don't reshuffle on every keystroke.
  const [deck, setDeck] = useState<DeckEntry[]>(() => buildDeck(subject, startQIndex));
  const [cursor, setCursor] = useState(0);
  const [selected, setSelected] = useState<number | null>(null); // the option user tapped

  // When the deck is exhausted, reshuffle and continue (pedagogical:
  // same lens, new view of its specimens).
  useEffect(() => {
    if (cursor >= deck.length) {
      setDeck(buildDeck(subject, null));
      setCursor(0);
      setSelected(null);
    }
  }, [cursor, deck.length, subject]);

  const entry = deck[cursor] ?? deck[0];
  const card = entry.card;
  const shown = entry.shownIdxs;
  const question = subject.questions[card.qIndex - 1];
  const revealed = selected !== null;

  const handleChoose = (optionIdx: number) => {
    if (revealed) return;
    setSelected(optionIdx);
    mark(card.qIndex);
  };

  const handleAdvance = () => {
    if (!revealed) return;
    setSelected(null);
    setCursor((c) => c + 1);
  };

  // Wrap the whole reveal area in a click-to-advance listener once the
  // card is revealed, spec says "tap anywhere to advance."
  const revealWrapperRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={revealWrapperRef}
      onClick={revealed ? handleAdvance : undefined}
      className={revealed ? 'cursor-pointer' : ''}
    >
      {/* Status bar ---------------------------------------------------- */}
      <div className="flex items-center justify-between pb-4">
        <Link href="/" className="marg" style={{ color: 'var(--pencil)' }}>
          ← HOME
        </Link>
        <div className="marg">STUDY MODE</div>
        <div className="marg">
          CARD {String(cursor + 1).padStart(2, '0')} / {deck.length}
        </div>
      </div>

      {/* Lens header --------------------------------------------------- */}
      <div className="marg">EXAMINING THROUGH</div>
      <div className="mt-2 flex items-start gap-3">
        <Loupe size="compact" className="shrink-0 mt-0.5" />
        <p
          className="editorial"
          style={{ fontSize: 15, lineHeight: 1.35 }}
        >
          {question}
        </p>
      </div>

      <div className="rule my-5" />

      {/* Specimens ----------------------------------------------------- */}
      <ul className="flex flex-col gap-3">
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
                      className="marg mb-1"
                      style={{ color: 'var(--pencil)' }}
                    >
                      SPECIMEN {String(i + 1).padStart(2, '0')}
                    </div>
                    <div
                      className="editorial editorial--medium"
                      style={{ fontSize: 14, lineHeight: 1.3 }}
                    >
                      {opt.text}
                    </div>
                    {revealed && (
                      <div
                        className="editorial mt-2"
                        style={{
                          fontSize: 12,
                          lineHeight: 1.4,
                          color: 'var(--body-subtle)',
                        }}
                      >
                        {opt.why}
                      </div>
                    )}
                  </div>

                  {revealed && !isImpostor && (
                    <Checkmark size={16} className="shrink-0 mt-0.5" />
                  )}
                </div>

                {revealed && isImpostor && <ImpostorStamp />}

                {/* A faint user-chose indicator if the user picked a fit */}
                {revealed && isSelected && !isImpostor && (
                  <div
                    className="marg mt-2"
                    style={{ color: 'var(--ink-red)' }}
                  >
                    YOU CHOSE THIS ONE
                  </div>
                )}
              </SpecimenCard>
            </li>
          );
        })}
      </ul>

      {/* Footer prompt ------------------------------------------------- */}
      <div className="mt-6 text-center">
        {!revealed ? (
          <div className="marg">TAP THE SPECIMEN THAT DOESN'T BELONG</div>
        ) : (
          <div className="marg" style={{ color: 'var(--ink)' }}>
            TURN THE PAGE →
          </div>
        )}
      </div>
    </div>
  );
}
