// Service worker entry consumed by @serwist/next.
//
// This file is bundled into public/sw.js at build time. Since it runs
// in a WebWorker context, there is no DOM and no React. Do not import
// app code from here — treat it as its own little program.

import { defaultCache } from '@serwist/next/worker';
import type { PrecacheEntry, SerwistGlobalConfig } from 'serwist';
import { Serwist } from 'serwist';

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    // Serwist injects the precache manifest at build time.
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: defaultCache,
  // Fall back to the offline page when a navigation request cannot be
  // served from the network or the cache. The URL must include the
  // /lens basePath because that is how it's served.
  fallbacks: {
    entries: [
      {
        url: '/lens/offline',
        matcher: ({ request }) => request.destination === 'document',
      },
    ],
  },
});

serwist.addEventListeners();
