'use client';

import { useProgress, countExaminedLenses } from '@/lib/progress';
import { DEFAULT_SUBJECT_ID } from '@/lib/content';
import { PencilProgressBar } from '@/components/field/PencilProgressBar';

export function HomeProgress({ totalQuestions }: { totalQuestions: number }) {
  const { studied, hydrated } = useProgress(DEFAULT_SUBJECT_ID);
  const examined = hydrated ? countExaminedLenses(studied, totalQuestions) : 0;

  return (
    <PencilProgressBar
      value={examined}
      total={totalQuestions}
      label="LENSES EXAMINED"
    />
  );
}
