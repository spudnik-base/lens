import type { MetadataRoute } from 'next';

// PWA manifest for Lens. Served at /lens/manifest.webmanifest.
//
// Critical: every path here must be absolute under the /lens basePath.
// Next.js does NOT auto-prefix values inside the manifest, because the
// manifest file is statically served. If you forget the prefix on any
// icon URL, the install will succeed but icons will 404.

const BASE = '/lens';

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: `${BASE}/`,
    name: 'Lens for IB Biology',
    short_name: 'Lens',
    description: 'A Cramly study guide to the 32 linking questions in IB Biology.',
    start_url: `${BASE}/?source=pwa`,
    scope: `${BASE}/`,
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#F2E9D0', // cream paper, iOS splash matches
    theme_color: '#2A2520', // ink black
    categories: ['education', 'productivity'],
    icons: [
      {
        src: `${BASE}/icons/icon-192.png`,
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: `${BASE}/icons/icon-512.png`,
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: `${BASE}/icons/icon-maskable-192.png`,
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: `${BASE}/icons/icon-maskable-512.png`,
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
