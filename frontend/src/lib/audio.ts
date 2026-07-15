/**
 * audio.ts — Vantage global audio initialization module
 *
 * Responsibilities:
 *  - Wrap cuelume's bind() so it is only ever called once (idempotent)
 *  - Lazy-initialize on first user interaction to satisfy browser autoplay policy
 *  - Respect `prefers-reduced-motion` (disables audio if motion is reduced)
 *  - Respect the user's stored preference (`localStorage: vantage:sounds`)
 *  - Export isAudioEnabled() for conditional play calls
 *
 * Available cuelume sound names (v0.1.1):
 *   chime | sparkle | droplet | bloom | whisper | tick | press | release | toggle | success
 */

import { bind, play as cuelumePlay } from 'cuelume';

/**
 * The complete set of built-in cuelume sound names.
 * Defined locally since `SoundName` is not re-exported from the cuelume root.
 */
export type SoundName =
  | 'chime'
  | 'sparkle'
  | 'droplet'
  | 'bloom'
  | 'whisper'
  | 'tick'
  | 'press'
  | 'release'
  | 'toggle'
  | 'success';

// ── Internal state ────────────────────────────────────────────────────────────

let _initialized = false;
let _bound = false;

const STORAGE_KEY = 'vantage:sounds';

/**
 * Returns whether interaction sounds are currently active.
 * Checks both the user preference and the OS accessibility setting.
 */
export function isAudioEnabled(): boolean {
  if (typeof window === 'undefined') return false;

  // Check OS preference — respect prefers-reduced-motion for audio too
  const mq = window.matchMedia?.('(prefers-reduced-motion: reduce)');
  if (mq?.matches) return false;

  // Check stored user preference (default = enabled)
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'false') return false;
  } catch {
    // localStorage unavailable
  }

  return true;
}

/**
 * Sets the user's sound preference and persists it.
 */
export function setAudioEnabled(enabled: boolean): void {
  try {
    localStorage.setItem(STORAGE_KEY, String(enabled));
  } catch {
    // localStorage unavailable
  }
}

/**
 * Thin wrapper around cuelume's play() that respects the enabled flag.
 * Application code should use useAudio() rather than calling this directly.
 */
export function safePlay(cue: SoundName): void {
  if (!isAudioEnabled()) return;
  try {
    // cuelume's play() accepts any string at runtime
    (cuelumePlay as (name: string) => void)(cue);
  } catch {
    // Swallow — AudioContext not yet created, or cue unavailable
  }
}

/**
 * Bind cuelume's declarative data-cuelume-* attribute handlers.
 * Safe to call multiple times — only runs once.
 */
function ensureBound(): void {
  if (_bound) return;
  _bound = true;
  try {
    bind();
  } catch {
    // Cuelume may throw if AudioContext is not yet available; that's fine.
  }
}

/**
 * initAudio — call once after React mounts, from main.tsx.
 *
 * Defers actual binding to the first user interaction so we don't
 * violate the browser's autoplay policy (which requires a user gesture
 * before AudioContext can be created).
 *
 * Idempotent: safe to call multiple times (e.g. during HMR).
 */
export function initAudio(): void {
  if (_initialized) return;
  _initialized = true;

  if (typeof window === 'undefined') return;

  const INTERACTION_EVENTS = ['click', 'keydown', 'touchstart', 'pointerdown'] as const;

  const onFirstInteraction = () => {
    if (!isAudioEnabled()) return;
    ensureBound();
    // Remove listeners after first successful initialization
    INTERACTION_EVENTS.forEach(evt =>
      window.removeEventListener(evt, onFirstInteraction, { capture: true })
    );
  };

  INTERACTION_EVENTS.forEach(evt =>
    window.addEventListener(evt, onFirstInteraction, { once: false, capture: true, passive: true })
  );
}
