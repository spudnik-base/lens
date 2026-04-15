'use client';

// Tiny client island on the home screen. Until localStorage has been
// read, we render an invisible placeholder at the correct height so the
// layout doesn't shift. Once hydrated, the line reveals the examined
// count in pencil-gray mono.

import { useProgress } from '@/lib/progress';
import { DEFAULT_SUBJECT_ID } from '@/lib/content';

export function HomeProgressLine({ total }: { total: number }) {
  const { studied, hydrated } = useProgress(DEFAULT_SUBJECT_ID);

  return (
    <div className="text-center" style={{ minHeight: 16 }}>
      {hydrated && (
        <span
          className="font-mono"
          style={{ fontSize: 10, color: 'var(--pencil)', letterSpacing: '0.12em' }}
        >
          {studied.size === 0
            ? `${total} LENSES · NONE EXAMINED YET`
            : studied.size === total
              ? `${total} LENSES · ALL EXAMINED`
              : `${total} LENSES · ${studied.size} EXAMINED`}
        </span>
      )}
    </div>
  );
}
