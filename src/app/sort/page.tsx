import { PageFrame } from '@/components/layout/PageFrame';
import { getSubject, DEFAULT_SUBJECT_ID } from '@/lib/content';
import { SortClient } from './SortClient';

// Lens Sort — Section 4.2. Sixty-second sort against the impostor
// rubric; see SortClient for the full state machine.

export default function SortPage() {
  const subject = getSubject(DEFAULT_SUBJECT_ID);
  if (!subject) throw new Error('Missing biology subject');
  return (
    <PageFrame>
      <SortClient subject={subject} />
    </PageFrame>
  );
}
