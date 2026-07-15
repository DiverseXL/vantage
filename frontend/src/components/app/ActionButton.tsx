import { useEffect, useRef, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { useAsyncAction } from '../../hooks/useAsyncAction';
import { useAudio } from '../../lib/useAudio';
import { PixelSpinner } from './PixelSpinner';
import { SPRINGS } from '../../lib/motion';

interface ActionButtonProps {
  onClick: () => Promise<void>;
  pendingLabel: string;
  children: ReactNode;
  className?: string;
  disabled?: boolean;
}

export function ActionButton({
  onClick,
  pendingLabel,
  children,
  className = '',
  disabled = false,
}: ActionButtonProps) {
  const { execute, status } = useAsyncAction(onClick);
  const audio = useAudio();

  // Track previous status to fire cues exactly on state transitions
  const prevStatusRef = useRef(status);

  useEffect(() => {
    const prev = prevStatusRef.current;
    prevStatusRef.current = status;

    if (prev === 'pending' && status === 'success') {
      // Action completed — play success only after the async work is done
      audio.success();
    } else if (prev === 'pending' && status === 'error') {
      audio.error();
    }
  }, [status, audio]);

  const handleClick = () => {
    audio.press();
    execute();
  };

  const handleRelease = () => {
    // Release sound only when idle/error (not pending — the press already fired)
    if (status === 'idle' || status === 'error') {
      audio.release();
    }
  };

  return (
    <motion.button
      className={className}
      onClick={handleClick}
      onPointerUp={handleRelease}
      disabled={disabled || status === 'pending'}
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
      animate={status === 'error' ? { x: [-5, 5, -5, 5, 0] } : {}}
      transition={status === 'error' ? { duration: 0.4 } : {}}
      // Declarative cuelume attributes (supplement the imperative calls above)
      data-cuelume-press
      data-cuelume-release
    >
      {status === 'idle' || status === 'error' ? (
        children
      ) : status === 'pending' ? (
        <>
          <PixelSpinner />
          <span>{pendingLabel}</span>
        </>
      ) : status === 'success' ? (
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={SPRINGS.bouncy}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <Check size={18} strokeWidth={3} />
        </motion.div>
      ) : null}
    </motion.button>
  );
}
