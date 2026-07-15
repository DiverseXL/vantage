import { ActivityFeed } from './ActivityFeed';
import { useMarkets } from '../../hooks/useMarkets';
import styles from './ExplorerSidebar.module.css';

export function ExplorerSidebar() {
  const { data: markets } = useMarkets();
  
  const openMarkets = markets?.filter(m => !m.resolved).length || 0;
  const resolvedMarkets = markets?.filter(m => m.resolved).length || 0;
  
  // Fake some total volume
  const totalVolume = markets?.reduce((acc, m) => {
    return acc + Number(m.totalPool0) + Number(m.totalPool1);
  }, 0) || 0;

  return (
    <aside className={styles.sidebar}>
      {/* Contextual How It Works */}
      <div className={styles.card}>
        <h3 className={styles.cardTitle}>How prediction markets work</h3>
        <p className={styles.cardText}>
          Every market has two possible outcomes: <strong>Yes or No.</strong>
        </p>
        <p className={styles.cardText}>
          Stake INJ on the outcome you believe will happen. Once the market resolves, the losing pool is distributed proportionally among winning participants.
        </p>
      </div>

      {/* What's happening now / Stats */}
      <div className={styles.card}>
        <h3 className={styles.cardTitle}>Platform Stats</h3>
        <div className={styles.statsGrid}>
          <div className={styles.statBox}>
            <span className={styles.statValue}>{openMarkets}</span>
            <span className={styles.statLabel}>Open Markets</span>
          </div>
          <div className={styles.statBox}>
            <span className={styles.statValue}>{resolvedMarkets}</span>
            <span className={styles.statLabel}>Resolved</span>
          </div>
          <div className={styles.statBox}>
            <span className={styles.statValue}>{(totalVolume / 1e18).toFixed(1)}</span>
            <span className={styles.statLabel}>Vol (INJ)</span>
          </div>
          <div className={styles.statBox}>
            <span className={styles.statValue}>~24h</span>
            <span className={styles.statLabel}>Avg Resolution</span>
          </div>
        </div>
      </div>

      <div className={styles.card}>
        <h3 className={styles.cardTitle}>What's happening now</h3>
        <ul className={styles.latestList}>
          <li>Ethereum ETF market closes tomorrow.</li>
          <li>AI confidence updated 12 minutes ago.</li>
          <li>{openMarkets} new markets launched this week.</li>
        </ul>
      </div>

      {/* Activity Feed */}
      <ActivityFeed />
    </aside>
  );
}
