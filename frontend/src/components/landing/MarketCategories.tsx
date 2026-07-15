import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AnnotationMark } from './AnnotationMark';
import styles from './MarketCategories.module.css';

const EASE = [0.16, 1, 0.3, 1] as const;

/* ── Pixel icons per category ──────────────────────── */
const PixelGroup = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <rect x="2" y="0" width="4" height="4" fill="currentColor" />
    <rect x="10" y="0" width="4" height="4" fill="currentColor" />
    <rect x="6" y="6" width="4" height="4" fill="currentColor" />
    <rect x="2" y="12" width="4" height="4" fill="currentColor" />
    <rect x="10" y="12" width="4" height="4" fill="currentColor" />
  </svg>
);

const PixelKnockout = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
    <rect x="0" y="6" width="4" height="4" />
    <rect x="4" y="4" width="2" height="2" />
    <rect x="4" y="10" width="2" height="2" />
    <rect x="6" y="2" width="4" height="2" />
    <rect x="6" y="12" width="4" height="2" />
    <rect x="10" y="4" width="2" height="8" />
    <rect x="12" y="6" width="4" height="4" />
  </svg>
);

const PixelTrophy = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
    <rect x="4" y="0" width="8" height="2" />
    <rect x="2" y="2" width="12" height="6" />
    <rect x="0" y="4" width="2" height="4" />
    <rect x="14" y="4" width="2" height="4" />
    <rect x="4" y="8" width="8" height="2" />
    <rect x="6" y="10" width="4" height="2" />
    <rect x="4" y="12" width="8" height="2" />
    <rect x="2" y="14" width="12" height="2" />
  </svg>
);

const PixelTopScorer = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
    <rect x="6" y="0" width="4" height="4" />
    <rect x="4" y="4" width="8" height="2" />
    <rect x="2" y="6" width="12" height="4" />
    <rect x="4" y="10" width="8" height="2" />
    <rect x="6" y="12" width="4" height="4" />
    <rect x="7" y="5" width="2" height="6" />
  </svg>
);

const CATEGORIES = [
  {
    Icon: PixelGroup,
    title: 'Group Stage',
    body: 'Every group, every match. 48 games from kick-off to the end of the group phase.',
    chip: 'Live now',
    to: '/markets?stage=group',
  },
  {
    Icon: PixelKnockout,
    title: 'Knockout Rounds',
    body: 'Round of 32 through to the Semi-finals — markets open as each bracket clears.',
    chip: 'Opening soon',
    to: '/markets?stage=knockout',
  },
  {
    Icon: PixelTrophy,
    title: 'Tournament Winner',
    body: 'Back a nation to lift the trophy. Pool updates as favourites advance or crash out.',
    chip: 'Always open',
    to: '/markets?category=winner',
  },
  {
    Icon: PixelTopScorer,
    title: 'Top Scorer',
    body: 'Will the golden boot stay in Europe? Take your position before the group stage ends.',
    chip: 'Coming soon',
    to: '/markets?category=scorer',
  },
];

export function MarketCategories() {
  return (
    <section className={styles.section} aria-label="Market categories">
      <div className={styles.inner}>

        <motion.h2
          className={styles.headline}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, ease: EASE }}
        >
          Markets built to match{' '}
          <AnnotationMark variant="underline">
            <span className={styles.glitchWord}>your call.</span>
          </AnnotationMark>
        </motion.h2>

        <motion.div
          className={styles.scrollRow}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, delay: 0.12, ease: EASE }}
        >
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.title}
              to={cat.to}
              className={styles.card}
              aria-label={`Browse ${cat.title} markets`}
            >
              <div className={styles.cardBg} />
              <div className={styles.cardOverlay} />
              <span className={styles.cardChip}>{cat.chip}</span>
              <div className={styles.cardContent}>
                <div className={styles.cardIcon}><cat.Icon /></div>
                <h3 className={styles.cardTitle}>{cat.title}</h3>
                <p className={styles.cardBody}>{cat.body}</p>
              </div>
            </Link>
          ))}
        </motion.div>

      </div>
    </section>
  );
}
