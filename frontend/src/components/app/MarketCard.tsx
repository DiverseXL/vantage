import type { Market } from '../../types/api';
import { getPoolSplit } from '../../lib/format';
import { Link } from 'react-router-dom';
import { motion, useSpring, useTransform, useMotionValue } from 'framer-motion';
import { useEffect, useRef } from 'react';
import { DURATION } from '../../lib/motion';
import styles from './MarketCard.module.css';
import { PixelBolt, SegmentedMeter, ScoreboardRow } from './TicketElements';

function AnimatedPool({ value }: { value: number }) {
  const motionVal = useMotionValue(value);
  const spring = useSpring(motionVal, { stiffness: 80, damping: 18 });
  const display = useTransform(spring, (v) => v.toFixed(2));
  const prevRef = useRef(value);

  useEffect(() => {
    if (value !== prevRef.current) {
      motionVal.set(value);
      prevRef.current = value;
    }
  }, [value, motionVal]);

  return <motion.span>{display}</motion.span>;
}

interface MarketCardProps {
  market: Market;
  compact?: boolean;
}

export function MarketCard({ market, compact = false }: MarketCardProps) {
  const label0 = market.outcome0Label || 'Option A';
  const label1 = market.outcome1Label || 'Option B';
  const stage = market.stage || 'Group Stage';
  const isResolved = market.resolved;
  
  let pool0Wei = market.totalPool0;
  let pool1Wei = market.totalPool1;

  const { pct0, pct1 } = getPoolSplit(pool0Wei, pool1Wei);
  const totalPoolInj = (Number(BigInt(pool0Wei)) + Number(BigInt(pool1Wei))) / 1e18;

  return (
    <motion.div
      className={`${styles.ticket} ${compact ? styles.compact : ''}`}
      whileHover={!isResolved ? { y: -4 } : undefined}
      transition={{ duration: DURATION.fast }}
      data-resolved={isResolved}
    >
      <Link to={`/market/${market.id}`} className={styles.linkWrapper} aria-label={`Market: ${market.description}`}>
        
        <div className={styles.header}>
          <span className={styles.stageBadge}>{stage}</span>
          <span className={styles.liveDot} data-open={!isResolved}>
            {isResolved ? 'RESOLVED' : 'OPEN'}
          </span>
        </div>

        <div className={styles.matchup}>
          <span className={styles.teamName}>{label0}</span>
          <span className={styles.vs}>VS</span>
          <span className={styles.teamName}>{label1}</span>
        </div>

        <SegmentedMeter pct={pct0} />

        <ScoreboardRow 
          pct0={pct0} 
          pct1={pct1} 
          isResolved={isResolved} 
          winningOutcome={market.winningOutcome} 
        />

        <div className={styles.divider} />

        <div className={styles.footer}>
          <span className={styles.poolFigure}>
            <AnimatedPool value={totalPoolInj} /> INJ
          </span>
        </div>

        <div className={styles.stub}>
          <PixelBolt size={12} />
          <span>AI INSIGHT</span>
        </div>
      </Link>
    </motion.div>
  );
}
