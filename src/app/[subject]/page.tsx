import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PageFrame } from '@/components/layout/PageFrame';
import { Loupe } from '@/components/field/Loupe';
import { SUBJECTS, getSubject } from '@/lib/content';
import { HomeProgress } from './_home/HomeProgress';
import { LevelToggle } from './_home/LevelToggle';

export function generateStaticParams() {
  return SUBJECTS.map((s) => ({ subject: s.id }));
}

type Props = { params: Promise<{ subject: string }> };

export default async function SubjectHomePage({ params }: Props) {
  const { subject: subjectId } = await params;
  const subject = getSubject(subjectId);
  if (!subject) notFound();

  const totalCards = subject.cards.length;

  return (
    <PageFrame>
      {/* Title plate */}
      <header className="pt-4 pb-2 text-center">
        <div className="flex items-center justify-center gap-3">
          <Loupe size="compact" />
          <h1
            className="editorial"
            style={{ fontSize: 'var(--fs-xl)', lineHeight: 1, letterSpacing: '0.005em' }}
          >
            Lens
          </h1>
        </div>
        <p
          className="mt-2"
          style={{
            fontSize: 'var(--fs-sm)',
            lineHeight: 1.4,
            color: 'var(--body-subtle)',
          }}
        >
          {subject.name} linking questions
        </p>
      </header>

      <div className="rule my-4" />

      {/* Contents + level toggle */}
      <nav aria-label="modes" className="px-1">
        <div className="flex items-center justify-between mb-4">
          <div className="marg">CONTENTS</div>
          <LevelToggle subjectId={subject.id} />
        </div>

        <ul className="flex flex-col gap-3">
          <ModeCard
            href={`/${subjectId}/study`}
            num="01"
            name="Study"
            description="examine specimens, find the impostor"
          />
          <ModeCard
            href={`/${subjectId}/sort`}
            num="02"
            name="Lens Sort"
            description="60-second sorting against a single lens"
          />
          <ModeCard
            href={`/${subjectId}/browse`}
            num="03"
            name="Overview"
            description="the full field guide"
          />
        </ul>
      </nav>

      {/* Progress bar */}
      <div className="mt-6">
        <HomeProgress subjectId={subject.id} totalCards={totalCards} />
      </div>

      {/* Footer */}
      <footer className="mt-8 mb-4 text-center">
        <Link
          href="/"
          className="font-mono"
          style={{
            fontSize: 'var(--fs-xs)',
            color: 'var(--pencil)',
            letterSpacing: '0.1em',
          }}
        >
          &larr; all subjects
        </Link>
      </footer>
    </PageFrame>
  );
}

function ModeCard({
  href,
  num,
  name,
  description,
}: {
  href: string;
  num: string;
  name: string;
  description: string;
}) {
  return (
    <li>
      <Link
        href={href}
        className="specimen block no-underline"
        style={{ color: 'var(--ink)' }}
      >
        <div className="flex items-baseline justify-between mb-1">
          <span className="marg">{num}</span>
          <span
            style={{ fontSize: 'var(--fs-sm)', color: 'var(--pencil)' }}
          >
            &rarr;
          </span>
        </div>
        <span
          className="editorial editorial--medium block"
          style={{ fontSize: 'var(--fs-lg)' }}
        >
          {name}
        </span>
        <span
          className="font-mono block mt-1"
          style={{
            fontSize: 'var(--fs-xs)',
            color: 'var(--pencil)',
            lineHeight: 1.45,
          }}
        >
          {description}
        </span>
      </Link>
    </li>
  );
}
