import { PageFrame } from '@/components/layout/PageFrame';
import { getSubject, DEFAULT_SUBJECT_ID } from '@/lib/content';
import { StudyClient } from './StudyClient';

// Study mode — Section 4.1 and 7.4 / 7.5.
//
// The page is a thin server component that loads the subject and hands
// it to the client. Everything interactive (shuffle, reveal, progress)
// lives in StudyClient.
//
// Supports ?q=<Q#> to start on a specific question, used by the
// Overview screen for jump-to-question.

type SearchParams = Promise<{ q?: string }>;

export default async function StudyPage({ searchParams }: { searchParams: SearchParams }) {
  const subject = getSubject(DEFAULT_SUBJECT_ID);
  if (!subject) throw new Error('Missing biology subject');
  const { q } = await searchParams;
  const startQIndex = q && /^\d+$/.test(q) ? parseInt(q, 10) : null;

  return (
    <PageFrame>
      <StudyClient subject={subject} startQIndex={startQIndex} />
    </PageFrame>
  );
}
