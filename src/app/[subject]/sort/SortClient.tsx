'use client';

// Lens Sort, Section 4.2 and 7.2 / 7.3.
//
// State machine:
//   idle     -> press "begin" to start. This gesture is needed because
//               the audio context kicks off here on first user click.
//   playing  -> 60s timer, deck of cards, each card yields 5 options
//               presented one-at-a-time. User answers Fits / Does-not-
//               fit; a click sound plays, the pressed stamp briefly
//               fills with its color, and the specimen card borders
//               green or red for the verdict before advancing.
//   results  -> score + review list of incorrect judgments.
//
// Feedback is intentionally local: the earlier whole-screen tint was
// replaced with button-local press state and a specimen-border flash.

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useReducer, useRef, useState } from 'react';
import type { Subject, Card } from '@/types/subject';
import { shuffle } from '@/lib/shuffle';
import { useClickSound } from '@/lib/click-sound';
import { loadScores, recordScore, type SortScore } from '@/lib/sort-scores';
import { useLevel } from '@/lib/level';
import { Loupe } from '@/components/field/Loupe';
import { Stamp } from '@/components/field/Stamp';
import { SpecimenCard } from '@/components/field/SpecimenCard';
import { Tally } from '@/components/field/Tally';

const ROUND_SECONDS = 60;
const FEEDBACK_MS = 220;

// ---------------------------------------------------------------------
// State model
// ---------------------------------------------------------------------

type Judgment = {
  qIndex: number;
  subId: string;
  question: string;
  text: string;
  why: string;
  wasImpostor: boolean;
  userSaidFits: boolean;
  correct: boolean;
};

type DeckItem = {
  qIndex: number;
  subId: string;
  optionIdx: number;
  isImpostor: boolean;
};

type State =
  | { phase: 'idle' }
  | {
      phase: 'playing';
      deck: DeckItem[];
      cursor: number;
      secondsLeft: number;
      judgments: Judgment[];
    }
  | {
      phase: 'results';
      judgments: Judgment[];
    };

type Action =
  | { type: 'start'; deck: DeckItem[] }
  | { type: 'tick' }
  | { type: 'judge'; judgment: Judgment }
  | { type: 'end' }
  | { type: 'again'; deck: DeckItem[] };

function initialState(): State {
  return { phase: 'idle' };
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'start':
      return {
        phase: 'playing',
        deck: action.deck,
        cursor: 0,
        secondsLeft: ROUND_SECONDS,
        judgments: [],
      };
    case 'tick': {
      if (state.phase !== 'playing') return state;
      if (state.secondsLeft <= 1) {
        return { phase: 'results', judgments: state.judgments };
      }
      return { ...state, secondsLeft: state.secondsLeft - 1 };
    }
    case 'judge': {
      if (state.phase !== 'playing') return state;
      return {
        ...state,
        cursor: state.cursor + 1,
        judgments: [...state.judgments, action.judgment],
      };
    }
    case 'end':
      if (state.phase !== 'playing') return state;
      return { phase: 'results', judgments: state.judgments };
    case 'again':
      return {
        phase: 'playing',
        deck: action.deck,
        cursor: 0,
        secondsLeft: ROUND_SECONDS,
        judgments: [],
      };
  }
}

// Build a deck: shuffle cards, and for each card shuffle its 5 options.
// Flatten into (qIndex, optionIdx) entries so the cursor advances one
// option at a time.
function buildDeck(subject: Subject): DeckItem[] {
  const cards = shuffle(subject.cards);
  const out: DeckItem[] = [];
  for (const card of cards) {
    const optIdxs = shuffle(card.options.map((_, i) => i));
    for (const optionIdx of optIdxs) {
      out.push({
        qIndex: card.qIndex,
        subId: card.subId,
        optionIdx,
        isImpostor: !!card.options[optionIdx].impostor,
      });
    }
  }
  return out;
}

// ---------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------

export function SortClient({ subject }: { subject: Subject }) {
  const { level } = useLevel(subject.id);
  const filteredSubject = useMemo(() => {
    if (level === 'all') return subject;
    return { ...subject, cards: subject.cards.filter((c) => !c.hl) };
  }, [subject, level]);
  const [state, dispatch] = useReducer(reducer, undefined, initialState);

  // One interval tick per second while playing.
  useEffect(() => {
    if (state.phase !== 'playing') return;
    const id = window.setInterval(() => dispatch({ type: 'tick' }), 1000);
    return () => window.clearInterval(id);
  }, [state.phase]);

  // Infinite deck: when the cursor runs past the end before the timer,
  // reshuffle and continue (Section 4.2).
  useEffect(() => {
    if (state.phase !== 'playing') return;
    if (state.cursor < state.deck.length) return;
    const fresh = buildDeck(filteredSubject);
    dispatch({ type: 'again', deck: fresh });
  }, [state, subject]);

  if (state.phase === 'idle') {
    return (
      <IdleScreen
        subjectId={subject.id}
        onBegin={() => dispatch({ type: 'start', deck: buildDeck(filteredSubject) })}
      />
    );
  }

  if (state.phase === 'results') {
    return (
      <ResultsScreen
        subjectId={subject.id}
        judgments={state.judgments}
        onAgain={() => dispatch({ type: 'again', deck: buildDeck(filteredSubject) })}
      />
    );
  }

  return <PlayingScreen subject={subject} state={state} dispatch={dispatch} />;
}

// ---------------------------------------------------------------------
// Idle
// ---------------------------------------------------------------------
function IdleScreen({ subjectId, onBegin }: { subjectId: string; onBegin: () => void }) {
  const playClick = useClickSound();
  const [scores, setScores] = useState<SortScore[]>([]);
  useEffect(() => {
    setScores(loadScores(subjectId));
  }, [subjectId]);

  return (
    <div>
      <div className="flex items-center justify-between pb-4">
        <Link href={`/${subjectId}`} className="marg" style={{ color: 'var(--pencil)' }}>
          &larr; HOME
        </Link>
        <div className="marg">LENS SORT</div>
        <div className="marg">60 SEC</div>
      </div>

      <div className="pt-12 text-center">
        <div className="flex justify-center mb-6">
          <Loupe size="full" />
        </div>
        <h1 className="editorial" style={{ fontSize: 'var(--fs-xl)', lineHeight: 1.1 }}>
          Lens Sort
        </h1>
        <p
          className="editorial mt-4 px-6"
          style={{ fontSize: 'var(--fs-md)', lineHeight: 1.5, color: 'var(--body-subtle)' }}
        >
          Sixty seconds. One lens at a time. For each specimen, decide
          whether it fits the lens or is an impostor.
        </p>

        {scores.length > 0 && (
          <div className="mt-8">
            <div className="marg mb-3">TOP SCORES</div>
            <ol className="inline-flex flex-col gap-1.5">
              {scores.map((s, i) => (
                <li key={i} className="flex items-baseline gap-3">
                  <span
                    className="font-mono shrink-0"
                    style={{ fontSize: 'var(--fs-xs)', color: 'var(--pencil)', width: 16 }}
                  >
                    {i + 1}.
                  </span>
                  <span
                    className="editorial editorial--medium"
                    style={{ fontSize: 'var(--fs-md)' }}
                  >
                    {s.correct}/{s.total}
                  </span>
                  <span
                    className="font-mono"
                    style={{ fontSize: 'var(--fs-xs)', color: 'var(--pencil)' }}
                  >
                    {formatDate(s.date)}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        )}

        <div className="mt-10 flex justify-center">
          <Stamp
            variant="ink"
            size={132}
            rotate={-2}
            onClick={() => {
              playClick();
              onBegin();
            }}
          >
            Begin
          </Stamp>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------
// Playing
// ---------------------------------------------------------------------
function PlayingScreen({
  subject,
  state,
  dispatch,
}: {
  subject: Subject;
  state: Extract<State, { phase: 'playing' }>;
  dispatch: React.Dispatch<Action>;
}) {
  const playClick = useClickSound();
  const [pressed, setPressed] = useState<'fits' | 'notfit' | null>(null);
  const [verdict, setVerdict] = useState<'correct' | 'wrong' | null>(null);
  const feedbackTimer = useRef<number | null>(null);

  // Clear any pending feedback timer when the phase changes or we
  // unmount, so stale timers never fire mid-results screen.
  useEffect(() => {
    return () => {
      if (feedbackTimer.current != null) {
        window.clearTimeout(feedbackTimer.current);
      }
    };
  }, []);

  const current = state.deck[state.cursor];
  const card = useMemo(
    () => subject.cards.find((c) => c.subId === current.subId) as Card,
    [subject.cards, current.subId]
  );
  const option = card.options[current.optionIdx];
  const question = subject.questions[current.qIndex - 1];

  const handleJudge = (userSaidFits: boolean) => {
    // Debounce: ignore taps during feedback so a double-press can't
    // burn through two judgments in a single animation.
    if (pressed !== null) return;

    playClick();
    setPressed(userSaidFits ? 'fits' : 'notfit');

    const wasImpostor = current.isImpostor;
    const correct = userSaidFits !== wasImpostor;
    setVerdict(correct ? 'correct' : 'wrong');

    const j: Judgment = {
      qIndex: current.qIndex,
      subId: current.subId,
      question,
      text: option.text,
      why: option.why,
      wasImpostor,
      userSaidFits,
      correct,
    };

    feedbackTimer.current = window.setTimeout(() => {
      dispatch({ type: 'judge', judgment: j });
      setPressed(null);
      setVerdict(null);
      feedbackTimer.current = null;
    }, FEEDBACK_MS);
  };

  const correctSoFar = state.judgments.filter((j) => j.correct).length;

  return (
    <div>
      {/* Status bar --------------------------------------------------- */}
      <div className="flex items-center justify-between pb-3">
        <div className="marg">ROUND 01</div>
        <div className="marg flex items-center gap-1.5">
          <Loupe size="mini" />
          <span>0:{String(state.secondsLeft).padStart(2, '0')}</span>
        </div>
        <Tally count={correctSoFar} />
      </div>

      {/* Lens header -------------------------------------------------- */}
      <div className="marg mt-2">EXAMINING THROUGH</div>
      <div className="mt-3 flex items-start gap-4">
        <Loupe size="full" />
        <p
          className="editorial"
          style={{ fontSize: 'var(--fs-lg)', lineHeight: 1.3, paddingTop: 6 }}
        >
          {question}
        </p>
      </div>

      <div className="rule my-5" />

      {/* Specimen card ------------------------------------------------ */}
      <div className="relative">
        <SpecimenCard masked verdict={verdict}>
          <div className="marg mb-3" style={{ color: 'var(--pencil)' }}>
            SPECIMEN {String((state.cursor % 99) + 1).padStart(2, '0')}
          </div>
          <div
            className="editorial editorial--medium"
            style={{ fontSize: 'var(--fs-lg)', lineHeight: 1.3 }}
          >
            {option.text}
          </div>
        </SpecimenCard>

        {/* Vertical "no. X of Y" marginalia up the right edge. Hidden
            on narrow viewports where the rotation crowds the card. */}
        <div
          className="hidden md:block absolute"
          style={{
            top: '50%',
            right: -22,
            transform: 'translateY(-50%) rotate(90deg)',
            transformOrigin: 'right center',
          }}
        >
          <span className="marg">
            NO. {String(state.cursor + 1).padStart(2, '0')} OF {state.deck.length}
          </span>
        </div>
      </div>

      {/* Prompt ------------------------------------------------------- */}
      <div className="marg text-center mt-7">DOES IT FIT THE LENS?</div>

      {/* Verdict stamps ----------------------------------------------- */}
      <div className="mt-6 flex items-center justify-center gap-8">
        <Stamp
          variant="red"
          size={128}
          rotate={-5}
          onClick={() => handleJudge(false)}
          pressed={pressed === 'notfit'}
          aria-label="does not fit"
        >
          Does not
          <br />
          fit
        </Stamp>
        <Stamp
          variant="green"
          size={128}
          rotate={4}
          onClick={() => handleJudge(true)}
          pressed={pressed === 'fits'}
          aria-label="fits"
        >
          Fits
        </Stamp>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------
// Results
// ---------------------------------------------------------------------
function ResultsScreen({
  subjectId,
  judgments,
  onAgain,
}: {
  subjectId: string;
  judgments: Judgment[];
  onAgain: () => void;
}) {
  const router = useRouter();
  const playClick = useClickSound();
  const total = judgments.length;
  const correct = judgments.filter((j) => j.correct).length;
  const wrong = judgments.filter((j) => !j.correct);
  const cleanSweep = total > 0 && wrong.length === 0;

  // Record the score on first render (once per results screen).
  const [topThree, setTopThree] = useState(false);
  const didRecord = useRef(false);
  useEffect(() => {
    if (didRecord.current || total === 0) return;
    didRecord.current = true;
    const { isTopThree } = recordScore(subjectId, {
      correct,
      total,
      date: new Date().toISOString().slice(0, 10),
    });
    setTopThree(isTopThree);
  }, [subjectId, correct, total]);

  return (
    <div>
      <div className="flex items-center justify-between pb-4">
        <Link href={`/${subjectId}`} className="marg" style={{ color: 'var(--pencil)' }}>
          &larr; HOME
        </Link>
        <div className="marg">ROUND COMPLETE</div>
        <div className="marg">LENS SORT</div>
      </div>

      {/* Score stamp */}
      <div className="pt-6 pb-10 flex flex-col items-center">
        <div
          className="relative flex items-center justify-center"
          style={{ width: 168, height: 168 }}
        >
          <svg width={168} height={168} viewBox="0 0 100 100" className="absolute inset-0">
            <circle
              cx={50}
              cy={50}
              r={46}
              fill="none"
              stroke="#2A2520"
              strokeWidth={2.5}
              strokeDasharray="0.5 0.1"
            />
            <circle cx={50} cy={50} r={41} fill="none" stroke="#2A2520" strokeWidth={0.7} opacity={0.4} />
          </svg>
          <div
            className="editorial editorial--medium"
            style={{ fontSize: 'var(--fs-xl)', lineHeight: 1 }}
          >
            {correct}/{total}
          </div>
        </div>
        {topThree && (
          <div className="marg mt-3" style={{ color: 'var(--ink-green)' }}>
            NEW TOP 3
          </div>
        )}
      </div>

      {/* Review list -------------------------------------------------- */}
      {cleanSweep ? (
        <p className="editorial text-center" style={{ fontSize: 'var(--fs-lg)' }}>
          A clean sweep.
        </p>
      ) : (
        <section>
          <div className="marg text-center mb-4">INCORRECT JUDGMENTS &middot; REVIEW</div>
          <ul className="flex flex-col gap-4">
            {wrong.map((j, i) => (
              <li key={i}>
                <SpecimenCard impostor>
                  <div className="marg mb-2" style={{ color: 'var(--pencil)' }}>
                    {truncate(j.question, 80)}
                  </div>
                  <div
                    className="editorial editorial--medium"
                    style={{ fontSize: 'var(--fs-md)', lineHeight: 1.3 }}
                  >
                    {j.text}
                  </div>
                  <div className="marg mt-3">
                    YOU SAID {j.userSaidFits ? 'FITS' : "DOESN'T FIT"} &middot;{' '}
                    ACTUALLY {j.wasImpostor ? "DOESN'T FIT" : 'FITS'}
                  </div>
                  <div
                    className="editorial mt-2"
                    style={{ fontSize: 'var(--fs-sm)', color: 'var(--body-subtle)', lineHeight: 1.45 }}
                  >
                    {j.why}
                  </div>
                </SpecimenCard>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Actions ------------------------------------------------------ */}
      <div className="mt-12 flex items-center justify-center gap-10">
        <Stamp
          variant="ink"
          size={108}
          rotate={-3}
          onClick={() => {
            playClick();
            onAgain();
          }}
        >
          Play
          <br />
          again
        </Stamp>
        <Stamp
          variant="ink"
          size={108}
          rotate={3}
          onClick={() => {
            playClick();
            router.push(`/${subjectId}`);
          }}
        >
          Home
        </Stamp>
      </div>
    </div>
  );
}

function truncate(s: string, max: number) {
  if (s.length <= max) return s;
  return s.slice(0, max - 1).trimEnd() + '\u2026';
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
function formatDate(iso: string): string {
  const d = new Date(iso + 'T00:00:00');
  if (isNaN(d.getTime())) return iso;
  return `${d.getDate()} ${MONTHS[d.getMonth()]}`;
}
