import type { NextConfig } from 'next';
import withSerwistInit from '@serwist/next';

// Lens is hosted at cramly.study/lens, basePath is load-bearing.
// Never remove or change this without updating the manifest scope,
// service-worker scope, and every asset URL in the codebase.
const BASE_PATH = '/lens';

const withSerwist = withSerwistInit({
  swSrc: 'src/app/sw.ts',
  swDest: 'public/sw.js',
  cacheOnNavigation: true,
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === 'development',
  // Scope is derived from the SW URL. With basePath '/lens', the SW is
  // served at /lens/sw.js so its default scope is '/lens/', exactly
  // what we want. We set it explicitly here to make the intent obvious.
  scope: `${BASE_PATH}/`,
});

const nextConfig: NextConfig = {
  basePath: BASE_PATH,
  // assetPrefix is unnecessary when basePath alone is set, Next handles
  // static asset URLs under basePath automatically. Adding assetPrefix
  // would actually double-prefix some paths.
  reactStrictMode: true,
  trailingSlash: false,
  poweredByHeader: false,
  // Root redirect: when the Lens project is hit directly at its raw
  // Vercel URL (during initial deployment testing, before cramly.study
  // is wired up), a visit to '/' would otherwise 404 because basePath
  // claims everything under '/lens'. Redirect '/' to '/lens' so the
  // preview URL is usable. basePath: false keeps the source literal
  // at the server root instead of being auto-prefixed with '/lens'.
  //
  // This has no effect in production through the cramly.study rewrite:
  // that rewrite only forwards '/lens/*' paths, so nothing on the Lens
  // project ever receives a bare '/' request from the public origin.
  async redirects() {
    return [
      {
        source: '/',
        destination: BASE_PATH,
        basePath: false,
        permanent: false,
      },
    ];
  },
  experimental: {
    // nothing yet
  },
};

export default withSerwist(nextConfig);
