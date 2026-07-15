import { ShieldCheck } from 'lucide-react';
import styles from './TransparencyCallout.module.css';

export function TransparencyCallout() {
  return (
    <section className={styles.section} id="transparency" aria-labelledby="transparency-heading">
      <div className={styles.inner} data-aos="fade-up">
        <ShieldCheck size={24} strokeWidth={1.5} className={styles.icon} />
        <div className={styles.content}>
          <h2 id="transparency-heading" className={styles.heading}>
            Testnet only — verifiable settlement
          </h2>
          <p className={styles.body}>
            Vantage runs exclusively on the <strong>Injective EVM Testnet</strong> (chain ID 1439).
            All transactions use test tokens with no monetary value.
            Match results are resolved objectively via the <strong>TxLINE Devnet Oracle</strong>—ensuring tamper-proof settlement based on official sports data.{' '}
            <a
              href="https://testnet.blockscout.injective.network/"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.link}
            >
              Verify all transactions on Blockscout →
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
