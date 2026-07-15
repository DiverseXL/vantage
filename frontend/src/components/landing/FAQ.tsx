import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './FAQ.module.css';

const EASE = [0.16, 1, 0.3, 1] as const;

/* ── Pixel "+" — rotates 45° on open, never swapped ── */
const PixelPlus = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
    <rect x="5" y="0" width="4" height="14" fill="currentColor" />
    <rect x="0" y="5" width="14" height="4" fill="currentColor" />
  </svg>
);

const FAQS = [
  {
    question: 'What is Vantage?',
    answer:
      'Vantage is a non-custodial sports prediction market on the Injective EVM Testnet. It replaces opaque sportsbook lines with transparent, on-chain parimutuel pools where the crowd\'s stake is the odds.',
  },
  {
    question: 'How does the parimutuel payout work?',
    answer:
      'All INJ staked across both sides forms a single pool. When the market resolves, the winning side splits the entire pool proportionally to each bet. The larger the imbalance, the bigger the underdog payout — no house margin involved.',
  },
  {
    question: 'What is the maximum I can lose?',
    answer:
      'Exactly what you stake. Binary markets have no leverage. Your downside is always and only your initial position — not a penny more.',
  },
  {
    question: 'What happens if a match is postponed or abandoned?',
    answer:
      'Postponed or abandoned matches fall back to the propose/dispute/bond mechanism — any participant can propose a resolution and others may challenge it within the dispute window. This is the rare-case backstop. Normal finished matches settle automatically via TxLINE.',
  },
  {
    question: 'Is this on mainnet?',
    answer:
      'No. Vantage runs on the Injective EVM Testnet (Chain ID 1439). All tokens are test INJ with no real monetary value. Mainnet is post-hackathon.',
  },
  {
    question: 'Where does the match result come from?',
    answer:
      'Match results are sourced via the TxLINE oracle and committed on-chain before any market can close. TxLINE aggregates from official sports data feeds.',
  },
  {
    question: 'What wallet do I need?',
    answer:
      'Any EVM-compatible wallet — MetaMask, Rabby, Frame. Configure it for the Injective EVM Testnet and you\'re ready. No special Injective wallet required.',
  },
  {
    question: 'Is there a minimum bet?',
    answer:
      'A minimum is enforced at contract level. The exact figure will be published here once on-chain minimum-stake validation ships. There is no enforced maximum.',
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (i: number) => setOpenIndex(openIndex === i ? null : i);

  return (
    <section className={styles.section} id="faq" aria-labelledby="faq-heading">
      <div className={styles.inner}>

        {/* ── Left column ── */}
        <motion.div
          className={styles.leftCol}
          initial={{ opacity: 0, x: -24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, ease: EASE }}
        >
          <span className={styles.eyebrow} aria-hidden="true">FAQ</span>
          <p className={styles.description}>
            We're here to make on-chain prediction markets as clear and honest as possible.
          </p>
        </motion.div>

        {/* ── Right column: accordion ── */}
        <div className={styles.list} role="list">
          {FAQS.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <motion.div
                key={i}
                className={styles.item}
                role="listitem"
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05, ease: EASE }}
              >
                <button
                  className={styles.questionButton}
                  onClick={() => toggle(i)}
                  aria-expanded={isOpen}
                  aria-controls={`faq-answer-${i}`}
                  id={`faq-question-${i}`}
                >
                  <span className={styles.questionText}>{faq.question}</span>
                  <span className={`${styles.iconWrap} ${isOpen ? styles.iconOpen : ''}`}>
                    <PixelPlus />
                  </span>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      id={`faq-answer-${i}`}
                      key="answer"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.28, ease: EASE }}
                      className={styles.answerWrap}
                      role="region"
                      aria-labelledby={`faq-question-${i}`}
                    >
                      <p className={styles.answerText}>{faq.answer}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
