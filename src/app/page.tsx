import Link from 'next/link';
import { PageFrame } from '@/components/layout/PageFrame';
import { Loupe } from '@/components/field/Loupe';
import { SUBJECTS } from '@/lib/content';
import { SubjectProgress } from './_picker/SubjectProgress';

export default function PickerPage() {
  return (
    <PageFrame>
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
          className="mt-1"
          style={{
            fontSize: 'var(--fs-xs)',
            lineHeight: 1.4,
            color: 'var(--pencil)',
          }}
        >
          Cramly by Free.Period
        </p>
        <p
          className="editorial mt-3 px-2"
          style={{
            fontSize: 'var(--fs-sm)',
            lineHeight: 1.5,
            color: 'var(--body-subtle)',
          }}
        >
          Each IB linking question is a lens. Look through it, examine the
          specimens, and spot the one that doesn&rsquo;t belong.
        </p>
      </header>

      <div className="rule my-3" />

      <div className="marg mb-3">CHOOSE A SUBJECT</div>

      <ul className="flex flex-col gap-3">
        {SUBJECTS.map((subject) => (
          <li key={subject.id}>
            <Link
              href={`/${subject.id}`}
              className="specimen block no-underline"
              style={{ color: 'var(--ink)', padding: '12px 16px' }}
            >
              <div className="flex items-baseline justify-between gap-4">
                <span
                  className="editorial editorial--medium"
                  style={{ fontSize: 'var(--fs-md)', lineHeight: 1.2 }}
                >
                  {subject.name}
                </span>
                <span className="marg shrink-0">
                  {subject.questions.length} LENSES
                </span>
              </div>
              <div className="mt-2">
                <SubjectProgress
                  subjectId={subject.id}
                  totalCards={subject.cards.length}
                />
              </div>
            </Link>
          </li>
        ))}
      </ul>

      <footer className="mt-6 mb-3 text-center">
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
