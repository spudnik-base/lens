'use client';

import { useProgress } from '@/lib/progress';
import { PencilProgressBar } from '@/components/field/PencilProgressBar';

export function HomeProgress({ subjectId, totalCards }: { subjectId: string; totalCards: number }) {
  const { studied, hydrated } = useProgress(subjectId);
  const done = hydrated ? studied.size : 0;

  return (
    <PencilProgressBar
      value={done}
      total={totalCards}
      label="CARDS EXAMINED"
    />
  );
}
