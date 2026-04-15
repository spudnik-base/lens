import { PageFrame } from '@/components/layout/PageFrame';
import { Loupe } from '@/components/field/Loupe';
import { Ornament } from '@/components/field/Ornament';

// Offline fallback. Shown when the user navigates while offline and the
// requested page is not precached. The app is designed to work fully
// offline once installed, so in practice this screen is a defense in
// depth rather than a common sight.

export const dynamic = 'force-static';

export default function OfflinePage() {
  return (
    <PageFrame>
      <div className="pt-20 text-center">
        <div className="flex justify-center mb-6">
          <Loupe size="full" />
        </div>
        <div className="marg mb-3">OFFLINE</div>
        <h1 className="editorial" style={{ fontSize: 28, lineHeight: 1.1 }}>
          The field is quiet.
        </h1>
        <div className="mt-4 flex justify-center">
          <Ornament />
        </div>
        <p
          className="editorial mt-6 px-6"
          style={{ fontSize: 14, lineHeight: 1.5, color: 'var(--body-subtle)' }}
        >
          This page isn&rsquo;t cached yet. Rejoin a network and try again,
          or head back to a lens you&rsquo;ve already opened.
        </p>
      </div>
    </PageFrame>
  );
}
