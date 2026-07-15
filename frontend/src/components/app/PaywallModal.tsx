import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { PremiumService } from '../../services/PremiumService';
import { getErrorMessage } from '../../lib/api';
import type { PaymentRequiredBody, PremiumStatsResponse } from '../../types/api';
import { ActionButton } from './ActionButton';
import styles from './PaywallModal.module.css';

interface PaywallModalProps {
  marketId: string;
  userId: string;
  onSuccess: (insight: PremiumStatsResponse) => void;
  onClose: () => void;
}

export function PaywallModal({ marketId, userId, onSuccess, onClose }: PaywallModalProps) {
  const [instructions, setInstructions] = useState<PaymentRequiredBody | null>(null);
  const [txHash, setTxHash] = useState('');
  const [isLoadingInstructions, setIsLoadingInstructions] = useState(true);
  const [copied, setCopied] = useState(false);

  // Fetch payment instructions from 402 response
  useEffect(() => {
    PremiumService.getPaymentInstructions(marketId)
      .then(setInstructions)
      .catch(() => toast.error('Could not load payment instructions'))
      .finally(() => setIsLoadingInstructions(false));
  }, [marketId]);

  const copyAddress = () => {
    if (!instructions) return;
    navigator.clipboard.writeText(instructions.payTo).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleUnlock = async () => {
    if (!txHash.trim()) return;
    try {
      const insight = await PremiumService.getInsight(marketId, txHash.trim());
      // Persist unlock state so user isn't asked to re-pay on refresh
      localStorage.setItem(`vantage:insight:${marketId}:${userId}`, txHash.trim());
      onSuccess(insight);
    } catch (err) {
      toast.error(getErrorMessage(err));
      throw err;
    }
  };

  return (
    <div className={styles.backdrop} role="dialog" aria-modal="true" aria-label="Unlock premium insight">
      <motion.div 
        className={styles.modal}
        layout
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
      >
        {/* Header */}
        <div className={styles.header}>
          <h2 className={styles.title}>Buy the read: Form & H2H</h2>
          <button
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Close paywall modal"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
              <path d="M3 3l12 12M15 3L3 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {isLoadingInstructions ? (
          <div className={styles.loading}>
            <div className={styles.spinner} aria-label="Loading payment instructions" />
            <span>Fetching payment details…</span>
          </div>
        ) : instructions ? (
          <>
            {/* Step 1 — Send payment */}
            <div className={styles.step}>
              <span className={styles.stepNumber}>1</span>
              <div className={styles.stepContent}>
                <p className={styles.stepTitle}>
                  Send <strong>{instructions.amountInj} INJ</strong> to this address
                </p>
                <p className={styles.stepDetail}>
                  Network: {instructions.network} (Chain ID {instructions.chainId})
                </p>
                <div className={styles.addressBox}>
                  <code className={styles.address}>{instructions.payTo}</code>
                  <button
                    className={styles.copyBtn}
                    onClick={copyAddress}
                    aria-label="Copy address to clipboard"
                  >
                    {copied ? (
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M2 7l4 4 6-8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    ) : (
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <rect x="4" y="4" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
                        <path d="M2 10V2h8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                      </svg>
                    )}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </div>
            </div>

            {/* Step 2 — Paste tx hash */}
            <div className={styles.step}>
              <span className={styles.stepNumber}>2</span>
              <div className={styles.stepContent}>
                <label htmlFor="tx-hash-input" className={styles.stepTitle}>
                  Paste your transaction hash
                </label>
                <input
                  id="tx-hash-input"
                  type="text"
                  className={styles.txInput}
                  value={txHash}
                  onChange={(e) => setTxHash(e.target.value)}
                  placeholder="0x..."
                  aria-label="Transaction hash"
                />
              </div>
            </div>

            {/* Unlock button */}
            <ActionButton
              className={`btn-pill btn-pill-dark ${styles.unlockBtn}`}
              onClick={handleUnlock}
              pendingLabel="Verifying…"
              disabled={!txHash.trim()}
            >
              Unlock the read
            </ActionButton>
          </>
        ) : (
          <p className={styles.errorText}>Could not load payment instructions. Try refreshing.</p>
        )}
      </motion.div>
    </div>
  );
}
