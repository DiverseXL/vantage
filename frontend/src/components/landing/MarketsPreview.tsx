import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useMarkets } from '../../hooks/useMarkets';
import { MarketCard } from '../app/MarketCard';
import { useAdmin } from '../../contexts/AdminContext';
import { staggerContainer, fadeUp } from '../../lib/motion';
import { useFixtures, teamFlagCode, gameStateLabel, type TxFixture } from '../../hooks/useFixtures';
import styles from './MarketsPreview.module.css';

const EASE = [0.16, 1, 0.3, 1] as const;

function FlagImg({ code, name }: { code: string; name: string }) {
  return (
    <img
      src={`https://flagcdn.com/48x36/${code}.png`}
      width={32}
      height={24}
      alt={`${name} flag`}
      style={{ borderRadius: 3, objectFit: 'cover' }}
    />
  );
}

function LiveDot() {
  return (
    <span className={styles.liveDot} aria-label="Live">
      <span className={styles.liveDotPulse} />
    </span>
  );
}

function FixtureCard({ fixture }: { fixture: TxFixture }) {
  const state = gameStateLabel(fixture.GameState);
  const startDate = new Date(fixture.StartTime);
  const dateStr = startDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  const timeStr = startDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

  return (
    <Link to={`/markets?fixture=${fixture.FixtureId}`} className={styles.matchCard}>
      {/* Header */}
      <div className={styles.matchHeader}>
        <span className={styles.matchStage}>{fixture.Competition}</span>
        {state === 'live' ? (
          <span className={styles.liveChip}><LiveDot /> LIVE</span>
        ) : state === 'finished' ? (
          <span className={styles.finishedChip}>FT</span>
        ) : (
          <span className={styles.matchTime}>{dateStr} · {timeStr}</span>
        )}
      </div>

      {/* Teams */}
      <div className={styles.matchTeams}>
        <div className={styles.team}>
          <FlagImg code={teamFlagCode(fixture.Participant1Id)} name={fixture.Participant1} />
          <span className={styles.teamName}>{fixture.Participant1}</span>
        </div>

        <div className={styles.matchVs}>VS</div>

        <div className={`${styles.team} ${styles.teamRight}`}>
          <FlagImg code={teamFlagCode(fixture.Participant2Id)} name={fixture.Participant2} />
          <span className={styles.teamName}>{fixture.Participant2}</span>
        </div>
      </div>

      {/* CTA */}
      <div className={styles.matchCta}>
        <span>View market</span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M5 12h14M12 5l7 7-7 7"/>
        </svg>
      </div>
    </Link>
  );
}

export function MarketsPreview() {
  const { data: markets, isLoading: marketsLoading } = useMarkets();
  const { data: fixtures, isLoading: fixturesLoading } = useFixtures();
  const { isAdmin } = useAdmin();

  const openMarkets = markets?.filter((m) => !m.resolved) ?? [];
  const previewMarkets = openMarkets.slice(0, 4);
  const isLoading = marketsLoading || fixturesLoading;

  // Show fixtures when no live open markets
  const showFixtures = !marketsLoading && previewMarkets.length === 0;
  // Only show upcoming + live fixtures (not finished)
  const liveFixtures = (fixtures ?? []).filter(f => gameStateLabel(f.GameState) !== 'finished');

  return (
    <section className={styles.section} aria-labelledby="preview-heading">
      <div className={styles.inner}>
        <div className={styles.titleRow}>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, ease: EASE }}
          >
            <h2 id="preview-heading" className={styles.heading}>
              {showFixtures ? 'Upcoming fixtures' : 'Open markets'}
            </h2>
            {showFixtures && (
              <p className={styles.subheading}>
                Live data · TxOdds — {liveFixtures.length} upcoming{' '}
                {liveFixtures.some(f => f.GameState === 2) && <span className={styles.liveIndicator}> · <LiveDot /> matches live now</span>}
              </p>
            )}
          </motion.div>
          <Link to="/markets" className={`btn-pill btn-pill-light ${styles.viewAll}`}>
            View all
          </Link>
        </div>

        {isLoading && (
          <div className={styles.skeletonRow}>
            {[0, 1, 2, 3].map((i) => <div key={i} className={styles.skeleton} />)}
          </div>
        )}

        {/* Live on-chain markets take priority */}
        {!isLoading && previewMarkets.length > 0 && (
          <motion.div
            className={styles.scrollRow}
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {previewMarkets.map((market) => (
              <motion.div
                key={market.id}
                variants={fadeUp}
                whileHover={{ y: -4, boxShadow: '0 12px 24px rgba(0,0,0,0.06)' }}
                transition={{ duration: 0.15 }}
              >
                <MarketCard market={market} compact />
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Real TxOdds fixtures when no live markets */}
        {showFixtures && (
          <motion.div
            className={styles.scrollRow}
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {liveFixtures.length > 0
              ? liveFixtures.slice(0, 6).map((fixture) => (
                  <motion.div
                    key={fixture.FixtureId}
                    variants={fadeUp}
                    whileHover={{ y: -4 }}
                    transition={{ duration: 0.15 }}
                  >
                    <FixtureCard fixture={fixture} />
                  </motion.div>
                ))
              : (
                  <motion.div className={styles.empty} variants={fadeUp}>
                    <p className={styles.emptyText}>No upcoming fixtures found.</p>
                  </motion.div>
                )
            }
          </motion.div>
        )}

        {showFixtures && isAdmin && (
          <div className={styles.adminCta}>
            <Link to="/admin" className="btn-pill btn-pill-dark">
              Create first live market
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
