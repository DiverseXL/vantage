import { motion } from 'framer-motion';
import { Target, Coins, Trophy } from 'lucide-react';
import styles from './HowItWorks.module.css';

const STEPS = [
  {
    number: '01',
    title: 'Pick a match',
    description: 'Browse upcoming World Cup fixtures. Every market is a straightforward binary choice—no complex parlays or opaque spreads.',
    icon: <Target size={24} strokeWidth={1.5} />,
    className: styles.bentoLarge,
  },
  {
    number: '02',
    title: 'Back a result',
    description: 'Stake INJ on your conviction. Your funds are secured on-chain in a transparent liquidity pool.',
    icon: <Coins size={24} strokeWidth={1.5} />,
  },
  {
    number: '03',
    title: 'Cash in',
    description: 'Winning sides automatically split the entire pool when the oracle settles the match.',
    icon: <Trophy size={24} strokeWidth={1.5} />,
  },
];

export function HowItWorks() {
  return (
    <section className={styles.section} id="how-it-works" aria-labelledby="how-heading">
      <div className={styles.inner}>
        <h2 id="how-heading" className={styles.heading} data-aos="fade-up">How it works</h2>
        <p className={styles.subhead} data-aos="fade-up" data-aos-delay="50">
          Three steps from curiosity to conviction.
        </p>

        <div className={styles.grid}>
          {STEPS.map((step, i) => (
            <div 
              key={step.number} 
              className={`${styles.card} ${step.className || ''}`}
              data-aos="fade-up"
              data-aos-delay={i * 150}
            >
              <motion.div 
                className={styles.iconWrap}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.15 }}
              >
                {step.icon}
              </motion.div>
              <span className={styles.number}>{step.number}</span>
              <h3 className={styles.title}>{step.title}</h3>
              <p className={styles.description}>{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
