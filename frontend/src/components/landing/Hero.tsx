import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AnnotationMark } from './AnnotationMark';
import styles from './Hero.module.css';

/* ─── Pixel football icon ───────────────────────────── */
const PixelFootball = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
    <rect x="4" y="0" width="6" height="2" fill="currentColor" />
    <rect x="2" y="2" width="2" height="2" fill="currentColor" />
    <rect x="10" y="2" width="2" height="2" fill="currentColor" />
    <rect x="0" y="4" width="2" height="6" fill="currentColor" />
    <rect x="12" y="4" width="2" height="6" fill="currentColor" />
    <rect x="2" y="10" width="2" height="2" fill="currentColor" />
    <rect x="10" y="10" width="2" height="2" fill="currentColor" />
    <rect x="4" y="12" width="6" height="2" fill="currentColor" />
    <rect x="5" y="5" width="4" height="4" fill="currentColor" />
  </svg>
);

/* ─── Component ─────────────────────────────────────── */
export function Hero() {
  return (
    <section className={styles.hero} aria-label="Hero section">
      {/* ── Checkerboard background ───────────────── */}
      <div className={styles.checkGrid} aria-hidden="true">
        {/* Asymmetric quilted blocks — varied widths/heights, no uniform grid */}
        <div className={styles.block} style={{ width: '22%', height: '38%', top: 0, left: 0 }} />
        <div className={styles.blockAlt} style={{ width: '18%', height: '38%', top: 0, left: '22%' }} />
        <div className={styles.block} style={{ width: '28%', height: '38%', top: 0, left: '40%' }} />
        <div className={styles.blockAlt} style={{ width: '32%', height: '38%', top: 0, left: '68%' }} />

        <div className={styles.blockAlt} style={{ width: '30%', height: '30%', top: '38%', left: 0 }} />
        <div className={styles.block} style={{ width: '20%', height: '30%', top: '38%', left: '30%' }} />
        <div className={styles.blockAlt} style={{ width: '25%', height: '30%', top: '38%', left: '50%' }} />
        <div className={styles.block} style={{ width: '25%', height: '30%', top: '38%', left: '75%' }} />

        <div className={styles.block} style={{ width: '18%', height: '32%', top: '68%', left: 0 }} />
        <div className={styles.blockAlt} style={{ width: '35%', height: '32%', top: '68%', left: '18%' }} />
        <div className={styles.block} style={{ width: '22%', height: '32%', top: '68%', left: '53%' }} />
        <div className={styles.blockAlt} style={{ width: '25%', height: '32%', top: '68%', left: '75%' }} />
      </div>

      {/* ── Content — single centered column ─────── */}
      <div className={styles.content}>

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className={styles.badge}
        >
          <span className={styles.badgeDot} />
          <PixelFootball />
          <span>World Cup 2026 · Injective Testnet</span>
        </motion.div>

        {/* H1 — "Win" glitch-colored, "Cup" gets gold annotation circle */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.08 }}
          className={styles.headline}
        >
          Bet on the World{' '}
          <AnnotationMark variant="circle">
            <span className={styles.annotatedWord}>Cup.</span>
          </AnnotationMark>
          <br />
          <span className={styles.glitchWord}>Win</span>
          {' '}when they don't.
        </motion.h1>

        {/* Subhead */}
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.18 }}
          className={styles.subhead}
        >
          Binary markets on every match, every group, every knockout round —
          denominated in INJ. No bookmaker sets the odds. The crowd's stake does.
        </motion.p>

        {/* CTA — declarative press/release sounds on the primary action */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.28 }}
        >
          <Link
            to="/markets"
            className={styles.ctaButton}
            id="hero-launch-app"
            data-cuelume-press
            data-cuelume-release
          >
            Launch app
          </Link>
        </motion.div>

      </div>
    </section>
  );
}
