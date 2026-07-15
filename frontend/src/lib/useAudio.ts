/**
 * useAudio — Semantic audio wrapper for Vantage
 *
 * Exposes meaningful method names rather than raw cue strings.
 * This keeps the implementation replaceable: if we ever swap Cuelume
 * for another library, only this file changes.
 *
 * Available Cuelume cues (v0.1.1):
 *   chime | sparkle | droplet | bloom | whisper | tick | press | release | toggle | success
 *
 * Sound mapping:
 *   press()   → "press"    (button pressed)
 *   release() → "release"  (button released)
 *   success() → "success"  (async action completed)
 *   toggle()  → "toggle"   (toggle switch)
 *   hover()   → "tick"     (nav hover, desktop only)
 *   error()   → "droplet"  (descending tone — subtle failure cue)
 *   notify()  → "sparkle"  (non-blocking notification)
 *   whisper() → "whisper"  (AI panel expand / subtle expand)
 */

import { useCallback } from 'react';
import { safePlay, isAudioEnabled, type SoundName } from './audio';
import { useAudioContext } from '../contexts/AudioContext';

export interface AudioAPI {
  /** Button / interactive element pressed */
  press(): void;
  /** Button / interactive element released */
  release(): void;
  /** Async action completed successfully */
  success(): void;
  /** Toggle switch changed */
  toggle(): void;
  /** Navigation link hovered (desktop only) */
  hover(): void;
  /** Action failed — subtle descending tone */
  error(): void;
  /** Non-blocking notification appeared */
  notify(): void;
  /** AI panel expanded / subtle expand */
  whisper(): void;
}

// Internal cue-name mapping — only valid SoundName values used
const CUE: Record<keyof AudioAPI, SoundName> = {
  press:   'press',
  release: 'release',
  success: 'success',
  toggle:  'toggle',
  hover:   'tick',
  error:   'droplet',  // descending pitch = subtle "something went wrong"
  notify:  'sparkle',
  whisper: 'whisper',
};

export function useAudio(): AudioAPI {
  const { soundsEnabled } = useAudioContext();

  const play = useCallback(
    (cue: SoundName) => {
      if (!soundsEnabled) return;
      if (!isAudioEnabled()) return;
      safePlay(cue);
    },
    [soundsEnabled]
  );

  return {
    press:   () => play(CUE.press),
    release: () => play(CUE.release),
    success: () => play(CUE.success),
    toggle:  () => play(CUE.toggle),
    hover:   () => play(CUE.hover),
    error:   () => play(CUE.error),
    notify:  () => play(CUE.notify),
    whisper: () => play(CUE.whisper),
  };
}
