import type { Metadata, Viewport } from 'next';
import { EB_Garamond, IBM_Plex_Mono } from 'next/font/google';
import './globals.css';

// Editorial serif, linking questions, examples, whys, title plates.
// 400 and 500 only (see Section 6.2, never 600+).
const serif = EB_Garamond({
  subsets: ['latin'],
  weight: ['400', '500'],
  style: ['normal', 'italic'],
  display: 'swap',
  variable: '--font-serif',
});

// Marginalia, round counters, timers, tallies, section labels.
const mono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400'],
  display: 'swap',
  variable: '--font-mono',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://cramly.study'),
  title: {
    default: 'Lens: a Cramly study guide',
    template: '%s · Lens',
  },
  description:
    'A Cramly study guide to the 32 linking questions in IB Biology. Examine specimens through each lens and find the impostor.',
  applicationName: 'Lens',
  appleWebApp: {
    capable: true,
    title: 'Lens',
    statusBarStyle: 'default',
  },
  formatDetection: {
    telephone: false,
    address: false,
    email: false,
  },
  openGraph: {
    type: 'website',
    siteName: 'Cramly',
    title: 'Lens: a Cramly study guide',
    description:
      'A field guide to the 32 linking questions in IB Biology. Part of Cramly.',
    url: '/lens',
    images: [
      {
        url: '/lens/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Lens: a Cramly study guide',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Lens: a Cramly study guide',
    description:
      'A field guide to the 32 linking questions in IB Biology. Part of Cramly.',
    images: ['/lens/og-image.png'],
  },
  manifest: '/lens/manifest.webmanifest',
  icons: {
    icon: [
      { url: '/lens/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/lens/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/lens/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#2A2520',
  colorScheme: 'light', // no dark mode, paper is cream
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${serif.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
