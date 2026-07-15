import { motion } from 'framer-motion';
import styles from './ValueProp.module.css';

const EASE = [0.16, 1, 0.3, 1] as const;

/* ── Pixel icons for each feature column ─────────── */
const PixelPool = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
    <rect x="0" y="4" width="14" height="2" fill="currentColor" />
    <rect x="0" y="8" width="14" height="2" fill="currentColor" />
    <rect x="2" y="0" width="2" height="14" fill="currentColor" />
    <rect x="10" y="0" width="2" height="14" fill="currentColor" />
  </svg>
);

const PixelChain = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
    <rect x="0" y="6" width="4" height="2" fill="currentColor" />
    <rect x="4" y="4" width="2" height="6" fill="currentColor" />
    <rect x="6" y="0" width="2" height="14" fill="currentColor" />
    <rect x="8" y="4" width="2" height="6" fill="currentColor" />
    <rect x="10" y="6" width="4" height="2" fill="currentColor" />
  </svg>
);

const PixelLock = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
    <rect x="4" y="0" width="6" height="2" fill="currentColor" />
    <rect x="2" y="2" width="2" height="4" fill="currentColor" />
    <rect x="10" y="2" width="2" height="4" fill="currentColor" />
    <rect x="0" y="6" width="14" height="8" fill="currentColor" />
    <rect x="5" y="9" width="4" height="2" fill="currentColor" rx="0" />
  </svg>
);

/* ── Pixel bolt ───────────────────────────────────── */
const PixelBolt = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <rect x="8" y="0" width="6" height="2" fill="currentColor" />
    <rect x="6" y="2" width="2" height="2" fill="currentColor" />
    <rect x="8" y="4" width="4" height="2" fill="currentColor" />
    <rect x="10" y="6" width="2" height="2" fill="currentColor" />
    <rect x="4" y="8" width="8" height="2" fill="currentColor" />
    <rect x="2" y="10" width="6" height="2" fill="currentColor" />
    <rect x="4" y="12" width="4" height="2" fill="currentColor" />
    <rect x="6" y="14" width="2" height="2" fill="currentColor" />
  </svg>
);

const FEATURES = [
  {
    Icon: PixelPool,
    label: 'Transparent',
    title: 'Pool odds, not house odds.',
    body: 'Every INJ staked is public and on-chain. The payout ratio is live crowd sentiment — no hidden margin, no line movement against you.',
  },
  {
    Icon: PixelChain,
    label: 'Instant',
    title: 'Auto-settles at full time.',
    body: 'TxLINE pushes the result on-chain seconds after the final whistle. No manual claim window, no 3-day payout queue.',
  },
  {
    Icon: PixelLock,
    label: 'Non-custodial',
    title: 'Your stake, always.',
    body: 'The relayer wallet handles gas — but funds flow directly to winners via the smart contract. We can\'t hold them and we can\'t touch them.',
  },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09 } },
};

const itemVariant = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
};

export function ValueProp() {
  return (
    <section className={styles.section} aria-label="Why Vantage works">
      <div className={styles.inner}>

        {/* Headline */}
        <motion.div
          className={styles.headlineBlock}
          initial={{ opacity: 0, x: -28 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: EASE }}
        >
          <h2 className={styles.headline}>
            The prediction market that sets you up for{' '}
            <span className={styles.accentWord}>
              <span className={styles.boltIcon}><PixelBolt /></span>
              winning.
            </span>
          </h2>
        </motion.div>

        {/* Three columns */}
        <motion.div
          className={styles.cols}
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {FEATURES.map((f) => (
            <motion.div key={f.title} className={styles.col} variants={itemVariant}>
              <div className={styles.colIcon}>
                <f.Icon />
                <span>{f.label}</span>
              </div>
              <h3 className={styles.colTitle}>{f.title}</h3>
              <p className={styles.colBody}>{f.body}</p>
            </motion.div>
          ))}
        </motion.div>

      </div>
    </section>
  );
}
