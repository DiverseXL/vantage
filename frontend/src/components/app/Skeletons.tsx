import { motion } from 'framer-motion';
import styles from './Skeletons.module.css';

// Base pulse component
export function SkeletonBlock({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <motion.div 
      className={`${styles.skeletonBlock} ${className || ''}`}
      style={style}
      animate={{ opacity: [0.5, 1, 0.5] }}
      transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
      aria-hidden="true"
    />
  );
}

export function MarketCardSkeleton() {
  return (
    <div className={styles.cardSkeleton}>
      <div className={styles.headerRow}>
        <SkeletonBlock className={styles.categoryTag} />
        <SkeletonBlock className={styles.dateTag} />
      </div>
      <SkeletonBlock className={styles.titleLine} />
      <SkeletonBlock className={styles.titleLineShort} />
      <div className={styles.outcomeRow}>
        <SkeletonBlock className={styles.outcomeBox} />
        <SkeletonBlock className={styles.outcomeBox} />
      </div>
      <div className={styles.footerRow}>
        <SkeletonBlock className={styles.poolInfo} />
      </div>
    </div>
  );
}

export function MarketDetailSkeleton() {
  return (
    <div className={styles.detailSkeleton}>
      <div className={styles.headerArea}>
        <div className={styles.headerRow}>
          <SkeletonBlock className={styles.categoryTag} />
          <SkeletonBlock className={styles.statusTag} />
        </div>
        <SkeletonBlock className={styles.mainTitle} />
        <SkeletonBlock className={styles.subTitle} />
      </div>
      
      <div className={styles.gridArea}>
        {/* Left Column */}
        <div className={styles.mainCol}>
          <SkeletonBlock className={styles.heroBox} />
          <SkeletonBlock className={styles.chartBox} />
        </div>
        
        {/* Right Column */}
        <div className={styles.sideCol}>
          <SkeletonBlock className={styles.actionBox} />
          <SkeletonBlock className={styles.actionBoxSmall} />
        </div>
      </div>
    </div>
  );
}

export function StatsSkeleton() {
  return (
    <div className={styles.statsSkeleton}>
      <SkeletonBlock className={styles.statBox} />
      <SkeletonBlock className={styles.statBox} />
      <SkeletonBlock className={styles.statBox} />
    </div>
  );
}

export function ActivityFeedSkeleton() {
  return (
    <div className={styles.feedSkeleton}>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className={styles.feedRow}>
          <SkeletonBlock className={styles.avatar} />
          <div className={styles.feedTextCol}>
            <SkeletonBlock className={styles.feedText} />
            <SkeletonBlock className={styles.feedTime} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function AIInsightSkeleton() {
  return (
    <div className={styles.insightSkeleton}>
      <div className={styles.insightHeader}>
        <SkeletonBlock className={styles.insightIcon} />
        <SkeletonBlock className={styles.insightTitle} />
      </div>
      <SkeletonBlock className={styles.insightTextLine} />
      <SkeletonBlock className={styles.insightTextLine} />
      <SkeletonBlock className={styles.insightTextLineShort} />
    </div>
  );
}
