import { notFound } from 'next/navigation';
import { PageFrame } from '@/components/layout/PageFrame';
import { SUBJECTS, getSubject } from '@/lib/content';
import { SortClient } from './SortClient';

export function generateStaticParams() {
  return SUBJECTS.map((s) => ({ subject: s.id }));
}

type Props = { params: Promise<{ subject: string }> };

export default async function SortPage({ params }: Props) {
  const { subject: subjectId } = await params;
  const subject = getSubject(subjectId);
  if (!subject) notFound();
  return (
    <PageFrame>
      <SortClient subject={subject} />
    </PageFrame>
  );
}
