import Link from 'next/link';
import { PageFrame } from '@/components/layout/PageFrame';
import { Ornament } from '@/components/field/Ornament';
import { Loupe } from '@/components/field/Loupe';
import { SUBJECTS } from '@/lib/content';
import { SubjectProgress } from './_picker/SubjectProgress';

export default function PickerPage() {
  return (
    <PageFrame>
      <header className="pt-6 pb-3 text-center">
        <div className="flex items-center justify-center gap-3">
          <Loupe size="full" />
          <h1
            className="editorial"
            style={{ fontSize: 'var(--fs-xxl)', lineHeight: 1, letterSpacing: '0.005em' }}
          >
            Lens
          </h1>
        </div>

        <p
          className="editorial mt-3 px-4"
          style={{
            fontSize: 'var(--fs-sm)',
            lineHeight: 1.45,
            color: 'var(--body-subtle)',
          }}
        >
          Cramly by Free.Period
        </p>

        <div className="mt-3 flex justify-center">
          <Ornament />
        </div>
      </header>

      <div className="rule my-5" />

      <div className="marg mb-4">CHOOSE A SUBJECT</div>

      <ul className="flex flex-col gap-4">
        {SUBJECTS.map((subject) => (
          <li key={subject.id}>
            <Link
              href={`/${subject.id}`}
              className="specimen block no-underline"
              style={{ color: 'var(--ink)' }}
            >
              <div className="marg mb-2">{subject.name.toUpperCase()}</div>
              <div
                className="editorial editorial--medium"
                style={{ fontSize: 'var(--fs-lg)', lineHeight: 1.2 }}
              >
                {subject.questions.length} linking questions
              </div>
              <div className="mt-3">
                <SubjectProgress
                  subjectId={subject.id}
                  totalCards={subject.cards.length}
                />
              </div>
            </Link>
          </li>
        ))}
      </ul>

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
