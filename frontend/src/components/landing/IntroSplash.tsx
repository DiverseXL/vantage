import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { AnnotationMark } from './AnnotationMark';
import styles from '../app/LoaderElements.module.css';

/* ─── Constants ─────────────────────────────────────── */
const VANTAGE_LETTERS = 'VANTAGE'.split('');
const SPLASH_MAX_MS = 2500; // total screen time before auto-dismiss

/* ─── Component ─────────────────────────────────────── */
export function IntroSplash() {
  const location = useLocation();
  const prefersReducedMotion = useReducedMotion();

  const [show, setShow] = useState(() => {
    const isTest = new URLSearchParams(location.search).get('test-splash') === '1';
    const hasSeen = sessionStorage.getItem('vantage:splash_seen');
    return isTest || (location.pathname === '/' && !hasSeen);
  });

  const [taglineVisible, setTaglineVisible] = useState(false);
  const [metricsVisible, setMetricsVisible] = useState(false);
  const dismissRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (prefersReducedMotion) return;
    // Tagline appears smoothly after letters finish
    const t2 = setTimeout(() => setTaglineVisible(true), 500);
    // Metrics appear after tagline
    const t3 = setTimeout(() => setMetricsVisible(true), 700);
    return () => { clearTimeout(t2); clearTimeout(t3); };
  }, [prefersReducedMotion]);

  useEffect(() => {
    if (!show) return;
    sessionStorage.setItem('vantage:splash_seen', 'true');
    document.body.style.overflow = 'hidden';
    dismissRef.current = setTimeout(() => setShow(false), SPLASH_MAX_MS);
    return () => {
      if (dismissRef.current) clearTimeout(dismissRef.current);
    };
  }, [show]);

  useEffect(() => () => { document.body.style.overflow = ''; }, []);

  return (
    <AnimatePresence onExitComplete={() => { document.body.style.overflow = ''; }}>
      {show && (
        <motion.div
          className={styles.splashContainer}
          initial={{ opacity: 1 }}
          exit={
            prefersReducedMotion
              ? { opacity: 0 }
              : { scaleY: 0.015, opacity: 0 }   /* CRT power-off collapse */
          }
          transition={
            prefersReducedMotion
              ? { duration: 0.3 }
              : { duration: 0.38, ease: [0.7, 0, 1, 1] }
          }
          style={{ transformOrigin: 'center' }}
          role="presentation"
          aria-hidden="true"
        >
          {prefersReducedMotion ? (
            /* ── Reduced-motion fallback ─── */
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
              className={styles.splashLetters}
              style={{ filter: 'none' }}
            >
              VANTAGE
            </motion.span>
          ) : (
            <>
              {/* Corner registration marks — position absolute to container */}
              <div className={styles.splashCorner} aria-hidden="true" />
              <div className={styles.splashCorner} aria-hidden="true" />
              <div className={styles.splashCorner} aria-hidden="true" />
              <div className={styles.splashCorner} aria-hidden="true" />

              <div className={styles.splashInner}>

                {/* ── Wordmark area ─────────────── */}
                <div className={styles.splashWordmark}>
                  <AnnotationMark variant="circle">
                    <div className={styles.splashLetters} aria-label="VANTAGE">
                      {VANTAGE_LETTERS.map((letter, i) => (
                        <motion.span
                          key={i}
                          initial={{ opacity: 0, y: 24, filter: 'blur(8px)' }}
                          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                          transition={{
                            delay: i * 0.05,
                            duration: 0.5,
                            ease: [0.16, 1, 0.3, 1],
                          }}
                          className={styles.splashLetterSmooth}
                        >
                          {letter}
                        </motion.span>
                      ))}
                    </div>
                  </AnnotationMark>
                </div>

                {/* ── Tagline ────────────────────── */}
                <motion.p
                  className={styles.splashTagline}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: taglineVisible ? 0.6 : 0, y: taglineVisible ? 0 : 6 }}
                  transition={{ duration: 0.7, ease: 'easeOut' }}
                >
                  Binary prediction markets · Injective Testnet
                </motion.p>

                {/* ── Metrics strip ──────────────── */}
                <motion.div
                  className={styles.splashMetrics}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: metricsVisible ? 1 : 0 }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                >
                  <span className={styles.splashMetricItem}>
                    <span className={styles.splashMetricDot} />
                    On-chain settlement
                  </span>
                  <span className={styles.splashMetricSep}>·</span>
                  <span className={styles.splashMetricItem}>
                    <span className={styles.splashMetricDot} />
                    Binary outcomes
                  </span>
                  <span className={styles.splashMetricSep}>·</span>
                  <span className={styles.splashMetricItem}>
                    <span className={styles.splashMetricDot} />
                    Zero intermediaries
                  </span>
                </motion.div>

              </div>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
