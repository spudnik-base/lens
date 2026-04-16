import { notFound } from 'next/navigation';
import { PageFrame } from '@/components/layout/PageFrame';
import { SUBJECTS, getSubject } from '@/lib/content';
import { StudyClient } from './StudyClient';

export function generateStaticParams() {
  return SUBJECTS.map((s) => ({ subject: s.id }));
}

type Props = {
  params: Promise<{ subject: string }>;
  searchParams: Promise<{ q?: string }>;
};

export default async function StudyPage({ params, searchParams }: Props) {
  const { subject: subjectId } = await params;
  const subject = getSubject(subjectId);
  if (!subject) notFound();
  const { q } = await searchParams;
  const startQIndex = q && /^\d+$/.test(q) ? parseInt(q, 10) : null;

  return (
    <PageFrame>
      <StudyClient subject={subject} startQIndex={startQIndex} />
    </PageFrame>
  );
}
