import Link from 'next/link';
import { PageFrame } from '@/components/layout/PageFrame';
import { Ornament } from '@/components/field/Ornament';
import { getSubject, DEFAULT_SUBJECT_ID } from '@/lib/content';
import { HomeProgressLine } from './_home/HomeProgressLine';

// Home, "inside cover" of the journal. Section 7.1.
//
// Intentionally static on the server, with a small client island
// (HomeProgressLine) that reveals studied-count once localStorage has
// been read. Everything else, the title plate, contents page, credit
// line, is server-rendered so the first paint is complete and paper.

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
      <header className="pt-8 pb-6 text-center">
        <div className="marg mb-6">IB BIOLOGY</div>

        <h1
          className="editorial"
          style={{ fontSize: 52, lineHeight: 1, letterSpacing: '0.005em' }}
        >
          Lens
        </h1>

        <p
          className="editorial mt-5 px-6"
          style={{ fontSize: 16, lineHeight: 1.45, color: 'var(--body-subtle)' }}
        >
          A Cramly study guide to the 32&nbsp;linking&nbsp;questions
        </p>

        <div className="mt-4 flex justify-center">
          <Ornament />
        </div>
      </header>

      <div className="rule my-8" />

      {/* Contents page ------------------------------------------------- */}
      <nav aria-label="modes" className="px-1">
        <div className="marg mb-5">CONTENTS</div>

        <ul className="flex flex-col gap-6">
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

      {/* Progress line, client island reveals studied count ----------- */}
      <div className="mt-10">
        <HomeProgressLine total={totalQuestions} />
      </div>

      {/* Credit line --------------------------------------------------- */}
      <footer className="mt-16 mb-4 text-center">
        <div
          className="font-mono"
          style={{ fontSize: 10, color: 'var(--pencil)', letterSpacing: '0.1em' }}
        >
          cramly · lens · v0.1
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
          style={{ fontSize: 22 }}
        >
          {name}
        </span>
        <span className="leader" aria-hidden="true" />
        <span
          className="font-mono shrink-0 text-right"
          style={{
            fontSize: 10,
            color: 'var(--pencil)',
            maxWidth: 200,
            lineHeight: 1.4,
          }}
        >
          {description}
        </span>
      </Link>
    </li>
  );
}
