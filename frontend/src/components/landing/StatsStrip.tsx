import { motion } from 'framer-motion';
import { useMarkets } from '../../hooks/useMarkets';
import { CountUp } from './CountUp';
import styles from './StatsStrip.module.css';

const EASE = [0.16, 1, 0.3, 1] as const;

const tileVariant = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, delay: i * 0.08, ease: EASE },
  }),
};

export function StatsStrip() {
  const { data: markets, isLoading } = useMarkets();

  const liveMatches   = markets?.filter((m) => !m.resolved).length ?? 0;
  const totalInjNum   = Number(
    markets?.reduce((acc, m) => acc + BigInt(m.totalPool0) + BigInt(m.totalPool1), 0n) ?? 0n,
  ) / 1e18;
  const openMarkets   = markets?.filter((m) => !m.resolved).length ?? 0;

  const stats = [
    { value: liveMatches,  label: 'Matches live',    decimals: 0, suffix: '' },
    { value: totalInjNum,  label: 'INJ in play',      decimals: 3, suffix: ' INJ' },
    { value: openMarkets,  label: 'Open right now',   decimals: 0, suffix: '' },
  ];

  return (
    <section className={styles.strip} aria-label="Platform statistics">
      <div className={styles.inner}>
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            className={styles.stat}
            custom={i}
            variants={tileVariant}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <span className={styles.value}>
              {isLoading
                ? '—'
                : <CountUp to={s.value} decimals={s.decimals} suffix={s.suffix} />}
            </span>
            <span className={styles.label}>{s.label}</span>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
