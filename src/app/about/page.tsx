import Link from 'next/link';
import { PageFrame } from '@/components/layout/PageFrame';
import { Loupe } from '@/components/field/Loupe';

export default function AboutPage() {
  return (
    <PageFrame>
      <header className="pt-4 pb-2 text-center">
        <div className="flex items-center justify-center gap-3">
          <Loupe size="compact" />
          <h1
            className="editorial"
            style={{ fontSize: 'var(--fs-xl)', lineHeight: 1 }}
          >
            Lens
          </h1>
        </div>
      </header>

      <div className="rule my-4" />

      <article>
        <h2
          className="editorial editorial--medium mb-4"
          style={{ fontSize: 'var(--fs-lg)' }}
        >
          How it works
        </h2>

        <Section>
          Every IB subject has linking questions: broad, cross-cutting prompts
          designed to build what the IB calls networked knowledge rather than
          isolated facts. The questions used in Lens are paraphrased from
          or inspired by the IB subject guides. They are not the official
          wording.
        </Section>

        <Section>
          Lens turns each linking question into a sorting challenge. For each
          lens, you see a set of specimens. Most genuinely fit the lens. One
          is an impostor: it looks like it belongs but fails on close
          inspection. Your job is to find the impostor and understand why it
          doesn&rsquo;t fit. That&rsquo;s the learning.
        </Section>

        <div className="rule my-5" />

        <h2
          className="editorial editorial--medium mb-4"
          style={{ fontSize: 'var(--fs-lg)' }}
        >
          Three modes
        </h2>

        <ModeBlock title="Study">
          Work through each lens at your own pace. See the specimens, pick the
          impostor, read the explanations. Progress is saved so you can pick up
          where you left off.
        </ModeBlock>

        <ModeBlock title="Lens Sort">
          A 60-second timed round. Specimens appear one at a time; for each,
          decide: fits or doesn&rsquo;t fit. Your top 3 scores are recorded.
        </ModeBlock>

        <ModeBlock title="Overview">
          Browse all the linking questions. See which lenses you&rsquo;ve
          examined and jump to any one directly.
        </ModeBlock>

        <div className="rule my-5" />

        <h2
          className="editorial editorial--medium mb-4"
          style={{ fontSize: 'var(--fs-lg)' }}
        >
          SL and HL
        </h2>

        <Section>
          Each subject supports filtering by IB level. SL students see only
          Standard Level content. HL students see everything. Set your level
          on the subject home page.
        </Section>
      </article>

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
          &larr; back
        </Link>
      </footer>
    </PageFrame>
  );
}

function Section({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="mb-4"
      style={{
        fontSize: 'var(--fs-sm)',
        lineHeight: 1.6,
        color: 'var(--body-subtle)',
      }}
    >
      {children}
    </p>
  );
}

function ModeBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-5">
      <div className="marg mb-1">{title.toUpperCase()}</div>
      <p
        style={{
          fontSize: 'var(--fs-sm)',
          lineHeight: 1.6,
          color: 'var(--body-subtle)',
        }}
      >
        {children}
      </p>
    </div>
  );
}
