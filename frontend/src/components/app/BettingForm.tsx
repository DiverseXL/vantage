import { useState } from 'react';
import { motion } from 'framer-motion';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useWriteContract } from 'wagmi';
import { parseEther } from 'viem';
import { useUser } from '../../contexts/UserContext';
import { useUserBalance } from '../../hooks/useUserBalance';
import { BetService } from '../../services/BetService';
import { getErrorMessage } from '../../lib/api';
import { VANTAGE_MARKET_ADDRESS, VANTAGE_MARKET_ABI } from '../../lib/contracts';
import { EASE, DURATION } from '../../lib/motion';
import { formatInj } from '../../lib/format';
import type { Market, Bet } from '../../types/api';
import { ActionButton } from './ActionButton';
import styles from './BettingForm.module.css';

interface BettingFormProps {
  market: Market;
  onOptimisticBet?: (bet: Bet) => void;
}

const MIN_BET = 0.001;

export function BettingForm({ market, onOptimisticBet }: BettingFormProps) {
  const { userId } = useUser();
  const { data: balance, refetch } = useUserBalance(userId);
  const queryClient = useQueryClient();

  const [outcome, setOutcome] = useState<0 | 1>(0);
  const [amount, setAmount] = useState('');

  const { writeContractAsync } = useWriteContract();

  const label0 = market.outcome0Label ?? 'Option A';
  const label1 = market.outcome1Label ?? 'Option B';

  const amountNum = parseFloat(amount);
  const isValidAmount = !isNaN(amountNum) && amountNum >= MIN_BET;
  const canSubmit = Boolean(userId) && isValidAmount;

  const handleSubmit = async () => {
    if (!canSubmit) return;

    try {
      // 1. Submit the transaction via the user's connected wallet
      const txHash = await toast.promise(
        writeContractAsync({
          address: VANTAGE_MARKET_ADDRESS,
          abi: VANTAGE_MARKET_ABI,
          functionName: 'placeBet',
          args: [BigInt(market.id), outcome],
          value: parseEther(amount),
        } as any),
        {
          loading: 'Confirm in your wallet...',
          success: 'Transaction submitted!',
          error: 'User rejected or transaction failed',
        }
      );

      // Optimistic: add to local pending list
      const optimisticBet: Bet = {
        marketId: parseInt(market.id, 10),
        outcome,
        amountInj: amount,
        timestamp: Date.now() / 1000,
        txHash,
      };
      onOptimisticBet?.(optimisticBet);

      setAmount('');

      // 2. Tell backend to index the txHash
      await toast.promise(
        BetService.indexBet(market.id, txHash),
        {
          loading: 'Indexing on Vantage...',
          success: 'Bet confirmed and indexed!',
          error: (err) => getErrorMessage(err),
        }
      );

      // Invalidate queries to reconcile optimistic state
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['market', market.id] }),
        refetch(),
      ]);
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  if (market.resolved) {
    return (
      <div className={styles.disabledBox} role="note">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
          <circle cx="9" cy="9" r="8" stroke="currentColor" strokeWidth="1.2" />
          <path d="M9 5v4M9 12v.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
        <span>This market has resolved — betting is closed.</span>
      </div>
    );
  }

  if (!userId) {
    return (
      <div className={styles.disabledBox} role="note">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
          <circle cx="9" cy="9" r="8" stroke="currentColor" strokeWidth="1.2" />
          <path d="M9 5v4M9 12v.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
        <span>Connect your wallet in the navigation bar to place a bet.</span>
      </div>
    );
  }

  const userBets = balance?.bets.filter(b => b.marketId === parseInt(market.id, 10)) ?? [];
  const totalStaked0 = userBets.filter(b => b.outcome === 0).reduce((acc, b) => acc + parseFloat(b.amountInj), 0);
  const totalStaked1 = userBets.filter(b => b.outcome === 1).reduce((acc, b) => acc + parseFloat(b.amountInj), 0);
  const hasPositions = totalStaked0 > 0 || totalStaked1 > 0;

  return (
    <div className={styles.container}>
      {hasPositions && (
        <div className={styles.positionSummary}>
          <h4 className={styles.positionTitle}>Your Position</h4>
          <div className={styles.positionGrid}>
            {totalStaked0 > 0 && (
              <div className={styles.positionRow}>
                <span className={styles.positionLabel}>{label0}</span>
                <span className={styles.positionAmount}>{formatInj(totalStaked0.toString(), 3)} INJ</span>
              </div>
            )}
            {totalStaked1 > 0 && (
              <div className={styles.positionRow}>
                <span className={styles.positionLabel}>{label1}</span>
                <span className={styles.positionAmount}>{formatInj(totalStaked1.toString(), 3)} INJ</span>
              </div>
            )}
          </div>
        </div>
      )}
      
      <div className={styles.form} aria-label="Place a bet">
        <h3 className={styles.formTitle}>Place a bet</h3>

      {/* Outcome selector */}
      <fieldset className={styles.fieldset}>
        <legend className={styles.fieldLabel}>Choose outcome</legend>
        <div className={styles.outcomeGroup} role="radiogroup">
          {([0, 1] as const).map((o) => {
            const lbl = o === 0 ? label0 : label1;
            return (
              <label
                key={o}
                className={`${styles.outcomeOption} ${outcome === o ? styles.outcomeSelected : ''}`}
                style={{ position: 'relative' }}
              >
                {outcome === o && (
                  <motion.div
                    layoutId="outcome-indicator"
                    className={styles.outcomeIndicator}
                    style={{
                      position: 'absolute',
                      inset: 0,
                      backgroundColor: '#17171A',
                      borderRadius: '8px',
                      zIndex: 0
                    }}
                    transition={{ duration: DURATION.base, ease: EASE }}
                  />
                )}
                <input
                  type="radio"
                  name="outcome"
                  value={o}
                  checked={outcome === o}
                  onChange={() => setOutcome(o)}
                  className={styles.radioInput}
                />
                <span className={styles.outcomeLabel} style={{ position: 'relative', zIndex: 1 }}>{lbl}</span>
              </label>
            );
          })}
        </div>
      </fieldset>

      {/* Amount input */}
      <div className={styles.amountGroup}>
        <label htmlFor="bet-amount" className={styles.fieldLabel}>Amount</label>
        <div className={styles.amountInputWrap}>
          <input
            id="bet-amount"
            type="number"
            min={MIN_BET}
            step="0.001"
            placeholder="0.000"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className={styles.amountInput}
            aria-describedby="bet-amount-hint"
          />
          <span className={styles.amountUnit} aria-hidden="true">INJ</span>
        </div>
        <div className={styles.amountHintGroup}>
          <p id="bet-amount-hint" className={styles.amountHint}>
            Minimum bet: {MIN_BET} INJ
          </p>
          <p className={styles.explainerContext}>
            If you are correct, you will win a proportional share of the losing pool based on your stake. 
            Payouts can be claimed after the oracle settles the market.
          </p>
        </div>
      </div>

      {/* Submit */}
      <ActionButton
        onClick={handleSubmit}
        pendingLabel="Placing..."
        className={`btn-pill btn-pill-dark ${styles.submitBtn}`}
        disabled={!canSubmit}
      >
        Bet on {outcome === 0 ? label0 : label1}
      </ActionButton>
    </div>
    </div>
  );
}
