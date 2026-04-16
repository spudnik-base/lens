'use client';

import { useProgress } from '@/lib/progress';
import { DEFAULT_SUBJECT_ID } from '@/lib/content';
import { PencilProgressBar } from '@/components/field/PencilProgressBar';

export function HomeProgress({ totalCards }: { totalCards: number }) {
  const { studied, hydrated } = useProgress(DEFAULT_SUBJECT_ID);
  const done = hydrated ? studied.size : 0;

  return (
    <PencilProgressBar
      value={done}
      total={totalCards}
      label="CARDS EXAMINED"
    />
  );
}
