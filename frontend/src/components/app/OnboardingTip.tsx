import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './OnboardingTip.module.css';

interface OnboardingTipProps {
  id: string;
  message: string;
}

export function OnboardingTip({ id, message }: OnboardingTipProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem(`vantage_tip_${id}`);
    if (!dismissed) {
      setIsVisible(true);
    }
  }, [id]);

  const handleDismiss = () => {
    localStorage.setItem(`vantage_tip_${id}`, 'dismissed');
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div 
          className={styles.tipCard}
          initial={{ opacity: 0, y: 10, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98, height: 0, marginTop: 0, marginBottom: 0, padding: 0, overflow: 'hidden' }}
          transition={{ duration: 0.2 }}
        >
          <div className={styles.content}>
            <span className={styles.badge}>Tip</span>
            <span className={styles.message}>{message}</span>
          </div>
          <button 
            className={styles.dismissBtn} 
            onClick={handleDismiss}
            aria-label="Dismiss tip"
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
