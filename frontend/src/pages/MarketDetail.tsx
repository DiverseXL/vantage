import { useState } from 'react';
import { motion } from 'framer-motion';
import { useParams, Link } from 'react-router-dom';
import { useMarket } from '../hooks/useMarkets';
import { useUser } from '../contexts/UserContext';
import { useUserBalance } from '../hooks/useUserBalance';
import { BettingForm } from '../components/app/BettingForm';
import { ClaimButton } from '../components/app/ClaimButton';
import { PaywallModal } from '../components/app/PaywallModal';
import { EmptyState } from '../components/app/EmptyState';
import { formatInj, formatTimestamp, getPoolSplit, explorerTxUrl } from '../lib/format';
import { ChevronRight, Database, Lock } from 'lucide-react';
import type { Bet, PremiumStatsResponse } from '../types/api';
import styles from './MarketDetail.module.css';
import { PixelBolt, SegmentedMeter, ScoreboardRow } from '../components/app/TicketElements';
import { MarketDetailSkeleton } from '../components/app/Skeletons';

export function MarketDetail() {
  const { id } = useParams<{ id: string }>();
  const { userId } = useUser();
  const { data: market, isLoading, isError } = useMarket(id!);
  const { data: balance } = useUserBalance(userId);

  const [optimisticBets, setOptimisticBets] = useState<Bet[]>([]);
  const [showPaywall, setShowPaywall] = useState(false);
  const [insight, setInsight] = useState<PremiumStatsResponse | null>(() => {
    // Restore from localStorage if previously unlocked
    if (!userId || !id) return null;
    const stored = localStorage.getItem(`vantage:insight:${id}:${userId}`);
    return stored ? { marketId: id, premiumInsight: 'Loading cached insight…', generatedAt: '' } : null;
  });

  const handleOptimisticBet = (bet: Bet) => {
    setOptimisticBets((prev) => [bet, ...prev]);
  };

  const handleInsightSuccess = (data: PremiumStatsResponse) => {
    setInsight(data);
    setShowPaywall(false);
  };

  if (isLoading) {
    return (
      <div className={styles.page} aria-busy="true" aria-label="Loading market">
        <MarketDetailSkeleton />
      </div>
    );
  }

  if (isError || !market) {
    return (
      <EmptyState
        message="Market not found"
        detail="This market ID doesn't exist, or the backend is offline."
        ctaLabel="Back to markets"
        ctaHref="/markets"
      />
    );
  }

  const { pct0, pct1 } = getPoolSplit(market.totalPool0, market.totalPool1);
  const label0 = market.outcome0Label ?? 'Option A';
  const label1 = market.outcome1Label ?? 'Option B';
  const totalPool = (BigInt(market.totalPool0) + BigInt(market.totalPool1)).toString();

  // Merge real bets with optimistic bets for the activity feed
  const userBets = balance?.bets.filter((b) => b.marketId === parseInt(market.id, 10)) ?? [];
  const userClaims = balance?.claims.filter((c) => c.marketId === parseInt(market.id, 10)) ?? [];
  const allActivity = [
    ...optimisticBets,
    ...userBets,
    ...userClaims.map((c) => ({
      marketId: c.marketId,
      outcome: parseInt(market.winningOutcome, 10),
      amountInj: c.payoutAmountInj,
      timestamp: c.timestamp,
      txHash: c.txHash,
      isClaim: true,
    })),
  ].sort((a, b) => b.timestamp - a.timestamp);

  return (
    <div className={styles.page}>
      {/* Breadcrumbs */}
      <div className={styles.breadcrumbs}>
        <Link to="/markets" className={styles.breadcrumbLink}>Markets</Link>
        <ChevronRight size={14} className={styles.breadcrumbIcon} />
        <span className={styles.breadcrumbCurrent}>{market.category || 'World Cup 2026'}</span>
        <ChevronRight size={14} className={styles.breadcrumbIcon} />
        <span className={styles.breadcrumbCurrent}>{market.stage || 'Group Stage'}</span>
      </div>

      {/* Market header */}
      <div className={styles.header}>
        <div className={styles.headerTop}>
          <span className={`${styles.statusPill} ${market.resolved ? styles.resolved : styles.active}`}>
            {market.resolved ? 'Resolved' : 'Active'}
          </span>
          <span className={styles.resolutionSource}>
            <Database size={12} className={styles.resolutionIcon} />
            Settled by TxLINE Oracle
          </span>
          <span className={styles.timestamp}>{formatTimestamp(market.creationTimestamp)}</span>
        </div>
        <h1 className={styles.description}>{market.description}</h1>
      </div>

      {/* Pool breakdown — Match Ticket Style */}
      <div className={styles.poolBreakdown}>
        
        <div className={styles.matchup}>
          <span className={styles.teamName}>{label0}</span>
          <span className={styles.vs}>VS</span>
          <span className={styles.teamName}>{label1}</span>
        </div>

        <SegmentedMeter pct={pct0} />
        
        <ScoreboardRow 
          pct0={pct0} 
          pct1={pct1} 
          isResolved={market.resolved} 
          winningOutcome={market.winningOutcome} 
        />

        <div className={styles.totalRow}>
          <span className={styles.totalLabel}>Total pool</span>
          <span className={styles.totalValue}>{formatInj(totalPool, 4)} INJ</span>
        </div>
      </div>

      {/* Side-by-side: betting + activity */}
      <div className={styles.mainGrid}>
        <div className={styles.leftCol}>
          {/* Betting form */}
          <BettingForm market={market} onOptimisticBet={handleOptimisticBet} />

          {/* Claim button (conditionally shown) */}
          <ClaimButton market={market} />

          {/* Premium insight panel */}
          <div className={styles.premiumPanel}>
            {insight ? (
              <div className={styles.insightBox}>
                <div className={styles.insightHeader}>
                  <PixelBolt size={14} />
                  <span>AI Market Insight</span>
                </div>
                <div className={styles.insightContent}>
                  <p className={styles.insightText}>{insight.premiumInsight}</p>
                </div>
                {insight.generatedAt && (
                  <p className={styles.insightMeta}>Generated {new Date(insight.generatedAt).toLocaleString()}</p>
                )}
              </div>
            ) : (
              <div className={styles.lockedInsightBox}>
                <div className={styles.insightHeader}>
                  <PixelBolt size={14} />
                  <span>AI Market Insight</span>
                </div>
                <div className={styles.lockedPreview}>
                  <div className={styles.blurText}>
                    Recent form suggests a tight match, but underlying metrics indicate a potential upset.
                    The head-to-head record heavily favors one side, while squad news reveals key absences.
                  </div>
                  <div className={styles.unlockOverlay}>
                    <button
                      className={styles.premiumBtn}
                      onClick={() => setShowPaywall(true)}
                    >
                      <Lock size={16} strokeWidth={1.5} />
                      Buy the read — 0.001 INJ
                    </button>
                    <span className={styles.unlockSubtext}>Unlocks Form, H2H & Squad Context</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Activity feed */}
        <div className={styles.rightCol}>
          <h2 className={styles.sectionTitle}>Your activity</h2>
          {allActivity.length === 0 ? (
            <div className={styles.noActivity}>
              {userId ? 'No activity on this market yet.' : 'Set a user ID to see your activity.'}
            </div>
          ) : (
            <motion.ul className={styles.activityList} layout>
              {allActivity.map((item, i) => {
                const isClaim = 'isClaim' in item;
                const isPending = item.txHash === 'pending';
                return (
                  <motion.li 
                    key={item.txHash + i} 
                    className={`${styles.activityItem} ${isPending ? styles.pending : ''}`}
                    layout
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <div className={styles.activityLeft}>
                      <span className={`${styles.activityType} ${isClaim ? styles.claimType : styles.betType}`}>
                        {isClaim ? 'Claim' : `Bet: ${item.outcome === 0 ? label0 : label1}`}
                      </span>
                      <span className={styles.activityTime}>
                        {formatTimestamp(item.timestamp)}
                      </span>
                    </div>
                    <div className={styles.activityRight}>
                      <span className={styles.activityAmount}>{item.amountInj} INJ</span>
                      {isPending ? (
                        <span className={styles.activityPending}>pending</span>
                      ) : (
                        <a
                          href={explorerTxUrl(item.txHash)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.activityTx}
                        >
                          {item.txHash.slice(0, 8)}…
                        </a>
                      )}
                    </div>
                  </motion.li>
                );
              })}
            </motion.ul>
          )}
        </div>
      </div>

      {/* Paywall modal */}
      {showPaywall && userId && (
        <PaywallModal
          marketId={market.id}
          userId={userId}
          onSuccess={handleInsightSuccess}
          onClose={() => setShowPaywall(false)}
        />
      )}
    </div>
  );
}
