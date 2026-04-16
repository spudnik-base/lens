'use client';

// Study mode state machine.
//
// The deck has 64 sub-cards (32 lenses x 2). Each sub-card shows
// 3 specimens (2 fits + 1 impostor). Deck ordering prioritises
// unseen sub-cards; resume persists the last-seen subId to
// localStorage so navigating away and back returns to the exact card.
//
// A lens (Q#) counts as "examined" once both its a and b sub-cards
// have been revealed. The status counter shows lenses examined / 32.

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import type { Subject, Card } from '@/types/subject';
import { shuffle } from '@/lib/shuffle';
import { useProgress } from '@/lib/progress';
import { useClickSound } from '@/lib/click-sound';
import { Loupe } from '@/components/field/Loupe';
import { Checkmark } from '@/components/field/Checkmark';
import { ImpostorStamp } from '@/components/field/ImpostorStamp';
import { SpecimenCard } from '@/components/field/SpecimenCard';

const LAST_Q_PREFIX = 'lens.study.lastq.';

function loadLastSubId(subjectId: string): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(LAST_Q_PREFIX + subjectId);
    return raw || null;
  } catch {
    return null;
  }
}

function saveLastSubId(subjectId: string, subId: string) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(LAST_Q_PREFIX + subjectId, subId);
  } catch {
    /* quota, ignore */
  }
}

type DeckEntry = {
  card: Card;
  shownIdxs: number[];
};

function buildDeck(
  subject: Subject,
  prioritySubId: string | null,
  studied: Set<string>
): DeckEntry[] {
  const base = subject.cards.map((card) => ({
    card,
    shownIdxs: shuffle(card.options.map((_, i) => i)),
  }));

  let head: DeckEntry[] = [];
  let rest = base;
  if (prioritySubId != null) {
    const resume = base.find((e) => e.card.subId === prioritySubId);
    if (resume) {
      head = [resume];
      rest = base.filter((e) => e.card.subId !== prioritySubId);
    }
  }

  const unseen = shuffle(rest.filter((e) => !studied.has(e.card.subId)));
  const seen = shuffle(rest.filter((e) => studied.has(e.card.subId)));
  return [...head, ...unseen, ...seen];
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

  const [deck, setDeck] = useState<DeckEntry[]>(() =>
    buildDeck(subject, null, new Set())
  );
  const [cursor, setCursor] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const didInit = useRef(false);

  useEffect(() => {
    if (!hydrated || didInit.current) return;
    didInit.current = true;

    let priority: string | null = null;
    if (startQIndex != null) {
      // Deep link from Overview: find the first unseen sub-card for that Q#.
      const aId = `${startQIndex}a`;
      const bId = `${startQIndex}b`;
      priority = !studied.has(aId) ? aId : !studied.has(bId) ? bId : aId;
    } else {
      priority = loadLastSubId(subject.id);
    }

    setDeck(buildDeck(subject, priority, studied));
    setCursor(0);
    setSelected(null);
  }, [hydrated, studied, subject, startQIndex]);

  useEffect(() => {
    if (cursor >= deck.length) {
      setDeck(buildDeck(subject, null, studied));
      setCursor(0);
      setSelected(null);
    }
  }, [cursor, deck.length, subject, studied]);

  useEffect(() => {
    if (!didInit.current) return;
    const entry = deck[cursor];
    if (!entry) return;
    saveLastSubId(subject.id, entry.card.subId);
  }, [cursor, deck, subject.id]);

  const entry = deck[cursor] ?? deck[0];
  const card = entry.card;
  const shown = entry.shownIdxs;
  const question = subject.questions[card.qIndex - 1];
  const revealed = selected !== null;
  const totalCards = subject.cards.length;

  const handleChoose = (optionIdx: number) => {
    if (revealed) return;
    playClick();
    setSelected(optionIdx);
    mark(card.subId);
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
      {/* Status bar */}
      <div className="flex items-center justify-between pb-4">
        <Link href="/" className="marg" style={{ color: 'var(--pencil)' }}>
          &larr; HOME
        </Link>
        <div className="marg">STUDY MODE</div>
        <div className="marg">
          {hydrated ? studied.size : 0} / {totalCards}
        </div>
      </div>

      {/* Lens header */}
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

      {/* Specimens */}
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
                    <div className="marg mb-2" style={{ color: 'var(--pencil)' }}>
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

      {/* Footer prompt */}
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
