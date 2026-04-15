// The single-column page frame.
//
// Mobile: full width with ~22px gutters.
// Desktop: the cream paper background fills the viewport, and the
// ~400px mobile column sits centered with generous air on either side.
// No phone chrome, no shadow, no bezel — the spec is explicit.
//
// Every screen wraps its content in this.

import type { ReactNode } from 'react';

export function PageFrame({ children }: { children: ReactNode }) {
  return (
    <main className="paper min-h-dvh">
      <div className="phone-column pt-5 pb-10">{children}</div>
    </main>
  );
}
