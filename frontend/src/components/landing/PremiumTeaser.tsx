import { Database, KeySquare, FileText } from 'lucide-react';
import styles from './PremiumTeaser.module.css';

export function PremiumTeaser() {
  return (
    <section className={styles.section} id="premium" aria-labelledby="premium-heading">
      <div className={styles.inner} data-aos="fade-up">
        <div className={styles.badge}>Buy the read</div>
        <h2 id="premium-heading" className={styles.heading}>
          Deep dive match analysis, on-demand.
        </h2>
        <p className={styles.body}>
          Unlock an AI-synthesized report for any fixture—aggregating recent form, head-to-head records, and squad news. Pay a tiny fee on-chain to reveal the insight.
        </p>
        <p className={styles.disclaimer}>
          Transparency note: The AI model aggregates public sports data. It does not possess a crystal ball. Bet responsibly.
        </p>
        <div className={styles.featureRow}>
          <div className={styles.feature}>
            <Database size={20} strokeWidth={1.5} />
            <span>0.001 INJ per market</span>
          </div>
          <div className={styles.feature}>
            <KeySquare size={20} strokeWidth={1.5} />
            <span>No account, no signup</span>
          </div>
          <div className={styles.feature}>
            <FileText size={20} strokeWidth={1.5} />
            <span>Form, H2H & Squad context</span>
          </div>
        </div>
      </div>
    </section>
  );
}
