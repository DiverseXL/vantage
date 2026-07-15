import { motion } from 'framer-motion';
import styles from './LoaderElements.module.css';

/**
 * PixelSpinner — 8 blocks orbiting in a circle.
 * Each block pulses from low to full opacity sequentially,
 * giving the appearance of a rotating clock hand.
 */
export function PixelSpinner() {
  const blocks = Array.from({ length: 8 });

  return (
    <div
      className={styles.pixelSpinner}
      aria-hidden="true"
      role="img"
      aria-label="Loading"
    >
      {blocks.map((_, i) => (
        <motion.div
          key={i}
          className={styles.spinnerBlock}
          initial={{ opacity: 0.12 }}
          animate={{ opacity: [0.12, 1, 0.12] }}
          transition={{
            repeat: Infinity,
            duration: 0.9,
            ease: 'linear',
            delay: (i * 0.9) / 8,
            times: [0, 0.3, 1],
          }}
          style={{
            transform: `rotate(${i * 45}deg) translateY(-6px)`,
          }}
        />
      ))}
    </div>
  );
}
