import { motion } from 'framer-motion';
import styles from './WhyVantage.module.css';

/* ─── Icons — pixel-style ──────────────────────────── */
const PixelCheck = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
    <rect x="0" y="6" width="2" height="2" fill="currentColor" />
    <rect x="2" y="8" width="2" height="2" fill="currentColor" />
    <rect x="4" y="6" width="2" height="2" fill="currentColor" />
    <rect x="6" y="4" width="2" height="2" fill="currentColor" />
    <rect x="8" y="2" width="2" height="2" fill="currentColor" />
    <rect x="10" y="0" width="2" height="2" fill="currentColor" />
  </svg>
);

const PixelCross = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
    <rect x="0" y="0" width="2" height="2" fill="currentColor" />
    <rect x="2" y="2" width="2" height="2" fill="currentColor" />
    <rect x="4" y="4" width="2" height="2" fill="currentColor" />
    <rect x="6" y="6" width="2" height="2" fill="currentColor" />
    <rect x="8" y="8" width="2" height="2" fill="currentColor" />
    <rect x="10" y="10" width="2" height="2" fill="currentColor" />
    <rect x="8" y="2" width="2" height="2" fill="currentColor" />
    <rect x="6" y="4" width="2" height="2" fill="currentColor" />
    <rect x="4" y="6" width="2" height="2" fill="currentColor" />
    <rect x="2" y="8" width="2" height="2" fill="currentColor" />
    <rect x="0" y="10" width="2" height="2" fill="currentColor" />
  </svg>
);

const TRADITIONAL_CONS = [
  'Lock-in until final whistle',
  'Opaque odds engine',
  'Your funds, their custody',
  'Days to withdraw',
];

const VANTAGE_PROS = [
  'Binary markets, any match window',
  'Transparent parimutuel pools',
  'Non-custodial on Injective',
  'Instant on-chain settlement',
];

const EASE = [0.16, 1, 0.3, 1] as const;

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
};

const cardVariant = {
  hidden: { opacity: 0, x: -32 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.55, ease: EASE } },
};

/* ─── Component ─────────────────────────────────────── */
export function WhyVantage() {
  return (
    <section className={styles.section} id="why-vantage" aria-labelledby="why-heading">
      <div className={styles.inner}>

        <motion.h2
          id="why-heading"
          className={styles.heading}
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          Why Vantage?
        </motion.h2>

        <motion.div
          className={styles.grid}
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {/* Traditional column */}
          <motion.div className={styles.card} variants={cardVariant}>
            <p className={styles.columnLabel}>Traditional Sportsbooks</p>
            <ul className={styles.list}>
              {TRADITIONAL_CONS.map((item) => (
                <li key={item} className={styles.itemBad}>
                  <span className={styles.iconBad}>
                    <PixelCross />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Vantage column */}
          <motion.div className={`${styles.card} ${styles.cardGood}`} variants={cardVariant}>
            <p className={styles.columnLabelGood}>Vantage</p>
            <ul className={styles.list}>
              {VANTAGE_PROS.map((item) => (
                <li key={item} className={styles.itemGood}>
                  <span className={styles.iconGood}>
                    <PixelCheck />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>
        </motion.div>

      </div>
    </section>
  );
}
