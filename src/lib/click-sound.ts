'use client';

// Web Audio click sound, used by interactive stamps and specimens to
// give tactile audio feedback on tap. No external asset is shipped:
// the sound is a short filtered noise burst synthesized on demand.
//
// AudioContext is lazily created on first invocation. Since playback
// is always triggered by a genuine user click, no autoplay policy
// (iOS Safari, Chrome) blocks it. A resume() call handles the case
// where the context has been suspended by the browser between taps.

import { useCallback, useEffect, useRef } from 'react';

type MinimalAudioWindow = Window & {
  AudioContext?: typeof AudioContext;
  webkitAudioContext?: typeof AudioContext;
};

export function useClickSound() {
  const ctxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    return () => {
      const ctx = ctxRef.current;
      ctxRef.current = null;
      if (ctx) {
        ctx.close().catch(() => {
          /* ignore */
        });
      }
    };
  }, []);

  return useCallback(() => {
    if (typeof window === 'undefined') return;
    const w = window as MinimalAudioWindow;
    const Ctor = w.AudioContext ?? w.webkitAudioContext;
    if (!Ctor) return;
    try {
      if (!ctxRef.current) {
        ctxRef.current = new Ctor();
      }
      const ctx = ctxRef.current;
      if (ctx.state === 'suspended') {
        void ctx.resume();
      }

      // 70ms band-pass noise burst with a fast exponential envelope.
      // Low mid frequency (~700 Hz) gives a rubbery thunk that fits the
      // stamp aesthetic better than a high-pitched beep would.
      const duration = 0.07;
      const sampleCount = Math.max(1, Math.floor(ctx.sampleRate * duration));
      const buffer = ctx.createBuffer(1, sampleCount, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < sampleCount; i++) {
        const t = i / sampleCount;
        // White noise decaying with exp(-8t): most of the energy is
        // in the first ~15ms, then a quick tail.
        data[i] = (Math.random() * 2 - 1) * Math.exp(-t * 8);
      }

      const src = ctx.createBufferSource();
      src.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 720;
      filter.Q.value = 1.6;
      const gain = ctx.createGain();
      gain.gain.value = 0.22;
      src.connect(filter).connect(gain).connect(ctx.destination);
      src.start();
      src.stop(ctx.currentTime + duration);
    } catch {
      // Never let audio problems crash the app.
    }
  }, []);
}
