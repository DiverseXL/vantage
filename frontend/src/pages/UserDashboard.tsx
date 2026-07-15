import React from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '../contexts/UserContext';
import { useUserBalance } from '../hooks/useUserBalance';
import { useMarkets } from '../hooks/useMarkets';
import { formatTimestamp, explorerTxUrl } from '../lib/format';
import { EmptyState } from '../components/app/EmptyState';
import type { Bet } from '../types/api';
import { staggerContainer, fadeUp } from '../lib/motion';
import styles from './UserDashboard.module.css';

type HistoryTab = 'all' | 'bets' | 'claims';

export function UserDashboard() {
  const { userId } = useUser();
  const { data: balance, isLoading } = useUserBalance(userId);
  const { data: markets } = useMarkets();

  const [tab, setTab] = React.useState<HistoryTab>('all');

  if (!userId) {
    return (
      <div className={styles.page}>
        <EmptyState
          message="Set your user ID to view your dashboard"
          detail="Click the ID chip in the top navigation bar to enter your identifier."
          ctaLabel="Go to markets"
          ctaHref="/markets"
        />
      </div>
    );
  }

  if (isLoading) {
    return <div className={styles.page}><div className={styles.skeleton} aria-busy="true" aria-label="Loading dashboard" /></div>;
  }

  if (!balance || (balance.bets.length === 0 && balance.claims.length === 0)) {
    return (
      <div className={styles.page}>
        <h1 className={styles.heading}>Dashboard</h1>
        <EmptyState
          message="No activity yet"
          detail="Place your first bet to see your history here."
          ctaLabel="Browse markets"
          ctaHref="/markets"
        />
      </div>
    );
  }

  // Stat calculations
  const totalBetInj = balance.totalBetInj;
  const totalClaimedInj = balance.totalClaimedInj;
  const netPL = totalClaimedInj - totalBetInj;
  const resolvedBets = balance.bets.filter((b) => {
    const mkt = markets?.find((m) => m.id === String(b.marketId));
    return mkt?.resolved;
  });
  const winRate = resolvedBets.length > 0
    ? Math.round((balance.claims.length / resolvedBets.length) * 100)
    : null;

  // Build unified history rows
  type HistoryRow = {
    type: 'bet' | 'claim';
    marketId: number;
    amount: string;
    outcome?: number;
    timestamp: number;
    txHash: string;
    status?: string;
  };

  const getMarketStatus = (bet: Bet): string => {
    const mkt = markets?.find((m) => m.id === String(bet.marketId));
    if (!mkt) return 'open';
    if (!mkt.resolved) return 'open';
    if (String(bet.outcome) === mkt.winningOutcome) {
      const hasClaim = balance.claims.some((c) => c.marketId === bet.marketId);
      return hasClaim ? 'claimed' : 'won';
    }
    return 'lost';
  };

  const betRows: HistoryRow[] = balance.bets.map((b) => ({
    type: 'bet',
    marketId: b.marketId,
    amount: b.amountInj,
    outcome: b.outcome,
    timestamp: b.timestamp,
    txHash: b.txHash,
    status: getMarketStatus(b),
  }));

  const claimRows: HistoryRow[] = balance.claims.map((c) => ({
    type: 'claim',
    marketId: c.marketId,
    amount: c.payoutAmountInj,
    timestamp: c.timestamp,
    txHash: c.txHash,
    status: 'claimed',
  }));

  const allRows = [...betRows, ...claimRows].sort((a, b) => b.timestamp - a.timestamp);
  const displayRows = tab === 'bets' ? betRows : tab === 'claims' ? claimRows : allRows;

  return (
    <div className={styles.page}>
      <h1 className={styles.heading}>Dashboard</h1>
      <p className={styles.userId}>ID: <code>{userId}</code></p>

      {/* Stat tiles */}
      <motion.div 
        className={styles.statGrid}
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        <motion.div className={styles.statTile} variants={fadeUp}>
          <span className={styles.statValue}>{totalBetInj.toFixed(4)}</span>
          <span className={styles.statLabel}>INJ Staked</span>
        </motion.div>
        <motion.div className={styles.statTile} variants={fadeUp}>
          <span className={styles.statValue}>{totalClaimedInj.toFixed(4)}</span>
          <span className={styles.statLabel}>INJ Claimed</span>
        </motion.div>
        <motion.div className={`${styles.statTile} ${netPL >= 0 ? styles.statPositive : styles.statNegative}`} variants={fadeUp}>
          <span className={styles.statValue}>{netPL >= 0 ? '+' : ''}{netPL.toFixed(4)}</span>
          <span className={styles.statLabel}>Net P/L (INJ)</span>
        </motion.div>
        <motion.div className={styles.statTile} variants={fadeUp}>
          <span className={styles.statValue}>{winRate !== null ? `${winRate}%` : '—'}</span>
          <span className={styles.statLabel}>Win Rate</span>
        </motion.div>
      </motion.div>

      {/* History table */}
      <div className={styles.tableSection}>
        <div className={styles.tableHeader}>
          <h2 className={styles.tableTitle}>History</h2>
          <div className={styles.tabs}>
            {(['all', 'bets', 'claims'] as HistoryTab[]).map((t) => (
              <button
                key={t}
                className={`${styles.tab} ${tab === t ? styles.tabActive : ''}`}
                onClick={() => setTab(t)}
                aria-pressed={tab === t}
                style={{ position: 'relative' }}
              >
                <span style={{ position: 'relative', zIndex: 1 }}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </span>
                {tab === t && (
                  <motion.div
                    layoutId="dashboard-tab-indicator"
                    style={{
                      position: 'absolute',
                      inset: 0,
                      backgroundColor: '#17171A',
                      borderRadius: '9999px',
                      zIndex: 0
                    }}
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Market</th>
                <th>Type</th>
                <th>Outcome</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date</th>
                <th>Tx</th>
              </tr>
            </thead>
            <motion.tbody layout>
              <AnimatePresence mode="popLayout">
                {displayRows.map((row) => {
                  const mkt = markets?.find((m) => m.id === String(row.marketId));
                  const label0 = mkt?.outcome0Label ?? 'Option A';
                  const label1 = mkt?.outcome1Label ?? 'Option B';
                  return (
                    <motion.tr 
                      key={row.txHash + row.type}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                    >
                      <td>
                        <Link to={`/market/${row.marketId}`} className={styles.marketLink}>
                          {mkt?.description ? (
                            <span className={styles.marketDesc}>{mkt.description}</span>
                          ) : (
                            `#${row.marketId}`
                          )}
                        </Link>
                      </td>
                      <td>
                        <span className={`${styles.typeBadge} ${row.type === 'claim' ? styles.claimBadge : ''}`}>
                          {row.type}
                        </span>
                      </td>
                      <td className={styles.outcomeCell}>
                        {row.type === 'bet' && row.outcome !== undefined
                          ? row.outcome === 0 ? label0 : label1
                          : '—'}
                      </td>
                      <td className={styles.amountCell}>
                        {row.type === 'claim' ? '+' : ''}{Number(row.amount).toFixed(4)} INJ
                      </td>
                      <td>
                        <span className={`${styles.statusBadge} ${styles[`status_${row.status}`]}`}>
                          {row.status}
                        </span>
                      </td>
                      <td className={styles.dateCell}>{formatTimestamp(row.timestamp)}</td>
                      <td>
                        <a
                          href={explorerTxUrl(row.txHash)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.txLink}
                        >
                          {row.txHash.slice(0, 8)}…
                        </a>
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            </motion.tbody>
          </table>
        </div>
      </div>
    </div>
  );
}


