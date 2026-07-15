import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import styles from './GradientCtaCard.module.css';

const EASE = [0.16, 1, 0.3, 1] as const;

/* ── Pixel football coin ────────────────────────────
   Repeating pattern at top of the gradient card —
   low opacity, crop at edges.                        */
const PixelCoin = ({ size = 40 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden="true">
    <rect x="12" y="0"  width="16" height="4"  fill="white" />
    <rect x="4"  y="4"  width="8"  height="4"  fill="white" />
    <rect x="28" y="4"  width="8"  height="4"  fill="white" />
    <rect x="0"  y="12" width="4"  height="16" fill="white" />
    <rect x="36" y="12" width="4"  height="16" fill="white" />
    <rect x="4"  y="32" width="8"  height="4"  fill="white" />
    <rect x="28" y="32" width="8"  height="4"  fill="white" />
    <rect x="12" y="36" width="16" height="4"  fill="white" />
    {/* Inner cross pattern */}
    <rect x="16" y="12" width="8"  height="4"  fill="white" />
    <rect x="12" y="16" width="4"  height="8"  fill="white" />
    <rect x="24" y="16" width="4"  height="8"  fill="white" />
    <rect x="16" y="24" width="8"  height="4"  fill="white" />
  </svg>
);

export function GradientCtaCard() {
  return (
    <section className={styles.section} aria-label="Get started with Vantage">
      <motion.div
        className={styles.card}
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: EASE }}
      >
        {/* Pixel pattern row — decorative, cropped at card edges */}
        <div className={styles.pixelRow} aria-hidden="true">
          {Array.from({ length: 8 }).map((_, i) => (
            <PixelCoin key={i} size={48} />
          ))}
        </div>

        {/* Stacked text lines — progressively dimmer */}
        <div className={styles.textStack}>
          <p className={styles.line + ' ' + styles.line1}>Back the right side.</p>
          <p className={styles.line + ' ' + styles.line2}>Collect your winnings.</p>
          <p className={styles.line + ' ' + styles.line3}>Stack your INJ.</p>
        </div>

        {/* Bottom row */}
        <div className={styles.ctaRow}>
          <span className={styles.ctaLabel}>
            Injective EVM Testnet · Group Stage live now
          </span>
          <Link to="/markets" className={styles.ctaButton} id="gradient-cta-launch">
            Open the markets →
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
