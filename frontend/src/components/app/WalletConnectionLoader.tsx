import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PixelSpinner } from './PixelSpinner';
import { SPRINGS } from '../../lib/motion';
import { Check } from 'lucide-react';
import { useAudio } from '../../lib/useAudio';
import styles from './LoaderElements.module.css';

export type WalletConnectionState =
  | 'Disconnected'
  | 'Opening Wallet'
  | 'Awaiting Approval'
  | 'Awaiting Signature'
  | 'Broadcasting'
  | 'Confirming'
  | 'Connected';

interface WalletConnectionLoaderProps {
  state: WalletConnectionState;
}

export function WalletConnectionLoader({ state }: WalletConnectionLoaderProps) {
  const audio = useAudio();
  const prevStateRef = useRef<WalletConnectionState>(state);

  // Play a subtle success cue only when the wallet is first approved/connected.
  // This is the meaningful milestone — not when the modal opens.
  useEffect(() => {
    const prev = prevStateRef.current;
    prevStateRef.current = state;

    if (
      (prev === 'Awaiting Approval' || prev === 'Awaiting Signature') &&
      state === 'Connected'
    ) {
      audio.success();
    }
  }, [state, audio]);

  if (state === 'Disconnected') return null;

  const isConnected = state === 'Connected';

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={state}
        className={styles.walletLoaderContainer}
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -5 }}
        transition={{ duration: 0.2 }}
        role="status"
        aria-live="polite"
        aria-label={isConnected ? 'Wallet connected' : state}
      >
        {isConnected ? (
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={SPRINGS.bouncy}
            className={styles.walletSuccess}
          >
            <Check size={14} strokeWidth={3} />
            <span>Connected</span>
          </motion.div>
        ) : (
          <>
            <PixelSpinner />
            <span className={styles.walletStateText}>{state}…</span>
          </>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
