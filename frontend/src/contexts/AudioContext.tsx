/**
 * AudioContext — React context for the sound preference toggle.
 *
 * Provides:
 *   soundsEnabled  — whether interaction sounds are currently on
 *   setSoundsEnabled — persists the preference to localStorage
 *
 * Consumed by:
 *   useAudio()         — to gate all play calls
 *   Settings toggle    — to let the user turn sounds on/off
 */

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import { setAudioEnabled } from '../lib/audio';

const STORAGE_KEY = 'vantage:sounds';

interface AudioContextValue {
  soundsEnabled: boolean;
  setSoundsEnabled: (enabled: boolean) => void;
}

const AudioCtx = createContext<AudioContextValue | null>(null);

function readStoredPreference(): boolean {
  try {
    const val = localStorage.getItem(STORAGE_KEY);
    if (val === 'false') return false;
  } catch {
    // localStorage unavailable (SSR / private mode)
  }
  return true; // default ON
}

export function AudioProvider({ children }: { children: ReactNode }) {
  const [soundsEnabled, setSoundsEnabledState] = useState<boolean>(readStoredPreference);

  const setSoundsEnabled = useCallback((enabled: boolean) => {
    setSoundsEnabledState(enabled);
    setAudioEnabled(enabled); // persist to localStorage via audio.ts
  }, []);

  return (
    <AudioCtx.Provider value={{ soundsEnabled, setSoundsEnabled }}>
      {children}
    </AudioCtx.Provider>
  );
}

export function useAudioContext(): AudioContextValue {
  const ctx = useContext(AudioCtx);
  if (!ctx) throw new Error('useAudioContext must be used within <AudioProvider>');
  return ctx;
}
