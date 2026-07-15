import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useMarkets } from '../hooks/useMarkets';
import { useAdmin } from '../contexts/AdminContext';
import { MarketCard } from '../components/app/MarketCard';
import { EmptyState } from '../components/app/EmptyState';
import { OnboardingTip } from '../components/app/OnboardingTip';
import { staggerContainer, fadeUp } from '../lib/motion';
import { MarketCardSkeleton } from '../components/app/Skeletons';
import type { Market } from '../types/api';
import styles from './MarketsExplorer.module.css';

type FilterTab = 'all' | 'active' | 'resolved';
type SortOption = 'newest' | 'largest';

export function MarketsExplorer() {
  const { data: markets, isLoading, isError, error } = useMarkets();
  const { isAdmin } = useAdmin();
  const [filter, setFilter] = useState<FilterTab>('all');
  const [sort, setSort] = useState<SortOption>('newest');
  const [searchParams, setSearchParams] = useSearchParams();

  const stageQuery = searchParams.get('stage')?.toLowerCase();
  const categoryQuery = searchParams.get('category')?.toLowerCase();

  const filtered: Market[] = (markets ?? []).filter((m) => {
    // 1. Tab filter
    if (filter === 'active' && m.resolved) return false;
    if (filter === 'resolved' && !m.resolved) return false;

    // 2. Stage query filter
    if (stageQuery) {
      const marketStage = (m.stage || 'Group Stage').toLowerCase();
      if (stageQuery === 'group' && marketStage !== 'group stage') return false;
      if (stageQuery === 'knockout' && marketStage !== 'knockout rounds') return false;
      if (stageQuery !== 'group' && stageQuery !== 'knockout' && marketStage !== stageQuery) return false;
    }

    // 3. Category query filter
    if (categoryQuery) {
      const marketCategory = (m.category || '').toLowerCase();
      if (categoryQuery === 'winner' && marketCategory !== 'tournament winner') return false;
      if (categoryQuery === 'scorer' && marketCategory !== 'top scorer') return false;
      if (categoryQuery !== 'winner' && categoryQuery !== 'scorer' && marketCategory !== categoryQuery) return false;
    }

    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sort === 'newest') {
      return Number(b.creationTimestamp) - Number(a.creationTimestamp);
    }
    // Largest pool
    const poolA = BigInt(a.totalPool0) + BigInt(a.totalPool1);
    const poolB = BigInt(b.totalPool0) + BigInt(b.totalPool1);
    return poolB > poolA ? 1 : poolB < poolA ? -1 : 0;
  });

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.heading}>Markets</h1>
        {markets && (
          <span className={styles.count} aria-live="polite">
            {sorted.length} {filter === 'all' ? 'total' : filter}
          </span>
        )}
      </div>

      <OnboardingTip 
        id="explorer_welcome" 
        message="Prediction markets reward being correct—not being early. Take your time to analyze the probability before staking." 
      />

      {/* Filter / sort bar */}
      <div className={styles.controls} role="toolbar" aria-label="Filter and sort markets">
        {/* Filter tabs */}
        <div className={styles.tabs} role="group" aria-label="Filter markets">
          {(['all', 'active', 'resolved'] as FilterTab[]).map((tab) => (
            <button
              key={tab}
              className={`${styles.tab} ${filter === tab ? styles.tabActive : ''}`}
              onClick={() => setFilter(tab)}
              aria-pressed={filter === tab}
              style={{ position: 'relative' }}
            >
              <span style={{ position: 'relative', zIndex: 1 }}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </span>
              {filter === tab && (
                <motion.div
                  layoutId="tab-indicator"
                  className={styles.tabIndicator}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
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

        <div className={styles.rightControls}>
          {/* Search Hint */}
          <button 
            className={styles.searchHint}
            onClick={() => {
              const event = new KeyboardEvent('keydown', { key: 'k', metaKey: true });
              window.dispatchEvent(event);
            }}
            aria-label="Search markets (Cmd+K)"
          >
            <span className={styles.searchIcon}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </span>
            <span>Search markets...</span>
            <kbd className={styles.shortcutKey}>⌘K</kbd>
          </button>

          {/* Sort */}
        <div className={styles.sortWrap}>
          <label htmlFor="sort-select" className={styles.sortLabel}>Sort:</label>
          <select
            id="sort-select"
            className={styles.sortSelect}
            value={sort}
            onChange={(e) => setSort(e.target.value as SortOption)}
          >
            <option value="newest">Newest</option>
            <option value="largest">Largest pool</option>
          </select>
          </div>
        </div>
      </div>

      {/* Active filters display */}
      {(stageQuery || categoryQuery) && (
        <div className={styles.activeFilters}>
          <span className={styles.filterLabel}>Active filters:</span>
          {stageQuery && (
            <span className={styles.filterChip}>
              Stage: {stageQuery === 'group' ? 'Group Stage' : stageQuery === 'knockout' ? 'Knockout Rounds' : stageQuery}
              <button 
                className={styles.clearFilterBtn} 
                onClick={() => {
                  searchParams.delete('stage');
                  setSearchParams(searchParams);
                }}
                aria-label="Clear stage filter"
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </span>
          )}
          {categoryQuery && (
            <span className={styles.filterChip}>
              Category: {categoryQuery === 'winner' ? 'Tournament Winner' : categoryQuery === 'scorer' ? 'Top Scorer' : categoryQuery}
              <button 
                className={styles.clearFilterBtn} 
                onClick={() => {
                  searchParams.delete('category');
                  setSearchParams(searchParams);
                }}
                aria-label="Clear category filter"
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </span>
          )}
        </div>
      )}

      <div className={styles.contentLayout}>
        <div className={styles.mainContent}>
          {/* States */}
      {isLoading && (
        <div className={styles.grid}>
          {Array.from({ length: 6 }).map((_, i) => (
            <MarketCardSkeleton key={`skeleton-${i}`} />
          ))}
        </div>
      )}

      {isError && (
        <EmptyState
          message="Could not load markets"
          detail={error?.message ?? 'The backend may be offline. Is it running on port 3001?'}
          ctaVisible={false}
        />
      )}

      {!isLoading && !isError && sorted.length === 0 && (
        <EmptyState
          message={filter === 'active' ? 'No markets are currently open.' : filter === 'resolved' ? 'No markets have resolved yet.' : 'No markets are currently available.'}
          detail={isAdmin 
            ? 'Markets appear here once created by an administrator. Create the first market from your dashboard.' 
            : 'Markets appear here once created by an administrator. Check back soon.'}
          ctaLabel={isAdmin ? 'Create first market' : undefined}
          ctaHref="/admin"
          ctaVisible={isAdmin}
        />
      )}

      {!isLoading && !isError && sorted.length > 0 && (
        <motion.div 
          className={styles.grid}
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          <AnimatePresence mode="popLayout">
            {sorted.map((market) => (
              <motion.div 
                key={market.id} 
                variants={fadeUp}
                layout
                initial="initial"
                animate="animate"
                exit="exit"
                whileHover={{ y: -4, boxShadow: '0 12px 24px rgba(0,0,0,0.06)' }}
                transition={{ duration: 0.15 }}
              >
                <MarketCard market={market} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
