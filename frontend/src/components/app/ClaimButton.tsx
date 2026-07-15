import { motion } from 'framer-motion';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useWriteContract } from 'wagmi';
import { useUser } from '../../contexts/UserContext';
import { useUserBalance } from '../../hooks/useUserBalance';
import { BetService } from '../../services/BetService';
import { getErrorMessage } from '../../lib/api';
import { estimatePayout } from '../../lib/format';
import { VANTAGE_MARKET_ADDRESS, VANTAGE_MARKET_ABI } from '../../lib/contracts';
import { EASE, DURATION } from '../../lib/motion';
import type { Market } from '../../types/api';
import { ActionButton } from './ActionButton';
import styles from './ClaimButton.module.css';

interface ClaimButtonProps {
  market: Market;
}

export function ClaimButton({ market }: ClaimButtonProps) {
  const { userId } = useUser();
  const { data: balance } = useUserBalance(userId);
  const queryClient = useQueryClient();
  const { writeContractAsync } = useWriteContract();

  if (!market.resolved || !userId || !balance) return null;

  // Check if user has a bet on the winning outcome
  const winningOutcome = market.winningOutcome; // "0" or "1"
  const userWinningBets = balance.bets.filter(
    (b) => b.marketId === parseInt(market.id, 10) && String(b.outcome) === winningOutcome
  );

  if (userWinningBets.length === 0) return null;

  // Check if already claimed
  const hasClaimed = balance.claims.some(
    (c) => c.marketId === parseInt(market.id, 10)
  );
  if (hasClaimed) {
    return (
      <motion.div 
        className={styles.claimed}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: DURATION.base, ease: EASE }}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M3 8l4 4 6-8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Payout claimed
      </motion.div>
    );
  }

  // Estimate payout
  const totalUserBetWei = userWinningBets
    .reduce((acc, b) => acc + BigInt(Math.round(parseFloat(b.amountInj) * 1e18)), 0n)
    .toString();
  const estPayout = estimatePayout(
    totalUserBetWei,
    market.totalPool0,
    market.totalPool1,
    winningOutcome as '0' | '1'
  );

  const handleClaim = async () => {
    try {
      // 1. Submit on-chain claim via connected wallet
      const txHash = await toast.promise(
        writeContractAsync({
          address: VANTAGE_MARKET_ADDRESS,
          abi: VANTAGE_MARKET_ABI,
          functionName: 'claimPayout',
          args: [BigInt(market.id)],
        } as any),
        {
          loading: 'Confirm claim in your wallet...',
          success: 'Transaction submitted!',
          error: 'User rejected or transaction failed',
        }
      );

      // 2. Tell backend to index the claim
      await toast.promise(
        BetService.indexClaim(market.id, txHash),
        {
          loading: 'Indexing claim...',
          success: `Claimed ${estPayout} INJ successfully!`,
          error: (err) => getErrorMessage(err),
        }
      );
      
      await queryClient.invalidateQueries({ queryKey: ['userBalance', userId] });
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const label0 = market.outcome0Label ?? 'Option A';
  const label1 = market.outcome1Label ?? 'Option B';
  const winningLabel = winningOutcome === '0' ? label0 : label1;

  return (
    <motion.div 
      className={styles.claimBox}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: DURATION.base, ease: EASE }}
    >
      <div className={styles.claimInfo}>
        <div className={styles.claimWon}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M3 8l4 4 6-8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.2" />
          </svg>
          You picked <strong>{winningLabel}</strong> — you won
        </div>
        <div className={styles.claimEst}>
          Estimated payout: <strong>{estPayout} INJ</strong>
        </div>
      </div>

      <ActionButton
        className={`btn-pill btn-pill-dark ${styles.claimBtn}`}
        onClick={handleClaim}
        pendingLabel="Claiming..."
      >
        Claim ~{estPayout} INJ
      </ActionButton>
    </motion.div>
  );
}
