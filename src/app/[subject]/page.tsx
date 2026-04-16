import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PageFrame } from '@/components/layout/PageFrame';
import { Ornament } from '@/components/field/Ornament';
import { Loupe } from '@/components/field/Loupe';
import { SUBJECTS, getSubject } from '@/lib/content';
import { HomeProgress } from './_home/HomeProgress';
import { LevelToggle } from './_home/LevelToggle';

// Subject home, the "inside cover" for a specific subject.

export function generateStaticParams() {
  return SUBJECTS.map((s) => ({ subject: s.id }));
}

type Props = { params: Promise<{ subject: string }> };

export default async function SubjectHomePage({ params }: Props) {
  const { subject: subjectId } = await params;
  const subject = getSubject(subjectId);
  if (!subject) notFound();

  const totalCards = subject.cards.length;
  const totalQuestions = subject.questions.length;

  return (
    <PageFrame>
      {/* Title plate --------------------------------------------------- */}
      <header className="pt-6 pb-3 text-center">
        <Link href="/" className="marg mb-3 inline-block" style={{ color: 'var(--pencil)' }}>
          &larr; ALL SUBJECTS
        </Link>

        <div className="flex items-center justify-center gap-3 mb-1">
          <Loupe size="full" />
          <h1
            className="editorial"
            style={{ fontSize: 'var(--fs-xxl)', lineHeight: 1, letterSpacing: '0.005em' }}
          >
            Lens
          </h1>
        </div>

        <div className="marg mb-2">{subject.name.toUpperCase()}</div>

        <p
          className="editorial px-4"
          style={{
            fontSize: 'var(--fs-md)',
            lineHeight: 1.45,
            color: 'var(--body-subtle)',
          }}
        >
          {totalQuestions}&nbsp;linking&nbsp;questions
        </p>

        <div className="mt-3 flex justify-center">
          <Ornament />
        </div>

        <LevelToggle subjectId={subject.id} />
      </header>

      <div className="rule my-5" />

      {/* Contents page ------------------------------------------------- */}
      <nav aria-label="modes" className="px-1">
        <div className="marg mb-4">CONTENTS</div>

        <ul className="flex flex-col gap-5">
          <ModeRow
            href={`/${subjectId}/study`}
            name="Study"
            description="examine specimens, find the impostor"
          />
          <ModeRow
            href={`/${subjectId}/sort`}
            name="Lens Sort"
            description="60-second sorting against a single lens"
          />
          <ModeRow
            href={`/${subjectId}/browse`}
            name="Overview"
            description="the full field guide"
          />
        </ul>
      </nav>

      {/* Progress bar */}
      <div className="mt-8">
        <HomeProgress subjectId={subject.id} totalCards={totalCards} />
      </div>

      {/* Credit line */}
      <footer className="mt-12 mb-5 text-center">
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
