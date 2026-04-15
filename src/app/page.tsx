import Link from 'next/link';
import { PageFrame } from '@/components/layout/PageFrame';
import { Ornament } from '@/components/field/Ornament';
import { PencilProgressBar } from '@/components/field/PencilProgressBar';
import { getSubject, DEFAULT_SUBJECT_ID } from '@/lib/content';

// Home, "inside cover" of the journal. Section 7.1.
//
// Intentionally static on the server. The PencilProgressBar is the
// one client island on this screen: it reads localStorage to show
// how many lenses have been examined, so students see at a glance
// where they are in the deck and can pick Study to continue from the
// first unstudied card.

export default function HomePage() {
  const subject = getSubject(DEFAULT_SUBJECT_ID);
  if (!subject) {
    // Build-time guarantee, the content registry always has biology.
    throw new Error('Missing biology subject');
  }
  const totalQuestions = subject.questions.length;

  return (
    <PageFrame>
      {/* Title plate --------------------------------------------------- */}
      <header className="pt-10 pb-6 text-center">
        <div className="marg mb-7">IB BIOLOGY</div>

        <h1
          className="editorial"
          style={{ fontSize: 'var(--fs-xxl)', lineHeight: 1, letterSpacing: '0.005em' }}
        >
          Lens
        </h1>

        <p
          className="editorial mt-6 px-4"
          style={{
            fontSize: 'var(--fs-md)',
            lineHeight: 1.45,
            color: 'var(--body-subtle)',
          }}
        >
          A Cramly study guide to the 32&nbsp;linking&nbsp;questions
        </p>

        <div className="mt-5 flex justify-center">
          <Ornament />
        </div>
      </header>

      <div className="rule my-9" />

      {/* Contents page ------------------------------------------------- */}
      <nav aria-label="modes" className="px-1">
        <div className="marg mb-6">CONTENTS</div>

        <ul className="flex flex-col gap-7">
          <ModeRow
            href="/study"
            name="Study"
            description="examine three specimens, find the impostor"
          />
          <ModeRow
            href="/sort"
            name="Lens Sort"
            description="60-second sorting against a single lens"
          />
          <ModeRow
            href="/browse"
            name="Overview"
            description="the full field guide"
          />
        </ul>
      </nav>

      {/* Progress bar, the hydrated client island --------------------- */}
      <div className="mt-12">
        <PencilProgressBar total={totalQuestions} label="LENSES EXAMINED" />
      </div>

      {/* Credit line --------------------------------------------------- */}
      <footer className="mt-20 mb-5 text-center">
        <div
          className="font-mono"
          style={{
            fontSize: 'var(--fs-xs)',
            color: 'var(--pencil)',
            letterSpacing: '0.1em',
          }}
        >
          cramly &middot; lens &middot; v0.1
        </div>
      </footer>
    </PageFrame>
  );
}

function ModeRow({
  href,
  name,
  description,
}: {
  href: string;
  name: string;
  description: string;
}) {
  return (
    <li>
      <Link
        href={href}
        className="flex items-baseline no-underline group"
        style={{ color: 'var(--ink)' }}
      >
        <span
          className="editorial editorial--medium shrink-0"
          style={{ fontSize: 'var(--fs-lg)' }}
        >
          {name}
        </span>
        <span className="leader" aria-hidden="true" />
        <span
          className="font-mono shrink-0 text-right"
          style={{
            fontSize: 'var(--fs-xs)',
            color: 'var(--pencil)',
            maxWidth: 240,
            lineHeight: 1.45,
          }}
        >
          {description}
        </span>
      </Link>
    </li>
  );
}
