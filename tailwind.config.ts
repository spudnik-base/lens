import type { Config } from 'tailwindcss';

// Palette is strict, see Section 6.1 of lens-spec.md.
// Two ink colors max on any screen, plus pencil gray. No other colors.
const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#F2E9D0', // page background
        card: '#FBF6E5', // raised card surface
        border: '#c8bd9e', // hairline tan card border / dividers
        ink: '#2A2520', // primary text, illustrations
        pencil: '#8a8170', // annotations, secondary text
        'ink-red': '#9c3a2c', // impostor, "does not fit"
        'ink-green': '#2f5234', // "fits", checkmarks
        'body-subtle': '#5a544a', // body subtle text on cream
        // kept for completeness, used only in hypothetical phone chrome
        // mockups, the app itself never renders this color.
        'phone-chrome': '#1f1d1a',
      },
      fontFamily: {
        // Loaded via next/font in src/app/layout.tsx.
        // CSS variables --font-serif and --font-mono are injected there.
        serif: ['var(--font-serif)', 'Georgia', 'serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
      fontWeight: {
        // Two weights only, never 600+ (breaks inkwell feel).
        normal: '400',
        medium: '500',
      },
      maxWidth: {
        // Single source of truth for the mobile column width used on
        // every screen. On desktop this column is centered with air
        // on either side, no phone-frame chrome, just cream paper.
        phone: '400px',
      },
      letterSpacing: {
        // Rubber stamps are the one uppercase element allowed.
        stamp: '0.12em',
        'stamp-wide': '0.15em',
      },
    },
  },
  plugins: [],
};

export default config;
