import { PageFrame } from '@/components/layout/PageFrame';
import { getSubject, DEFAULT_SUBJECT_ID } from '@/lib/content';
import { BrowseClient } from './BrowseClient';

// Overview / Field Guide — a flat list of all 32 lenses with a progress
// bar showing how many have been examined in Study mode. Tapping a row
// jumps the student straight into Study at that specific question.
//
// The spec's earlier plan for thumb tabs by theme has been deliberately
// dropped — a single flat biology bucket is simpler for the student
// and the progress bar takes the place of themed navigation.

export default function BrowsePage() {
  const subject = getSubject(DEFAULT_SUBJECT_ID);
  if (!subject) throw new Error('Missing biology subject');
  return (
    <PageFrame>
      <BrowseClient subject={subject} />
    </PageFrame>
  );
}
