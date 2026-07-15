import { Link } from 'react-router-dom';
import { useAccount } from 'wagmi';
import styles from './AppFooter.module.css';

export function AppFooter() {
  const { isConnected, chain } = useAccount();

  return (
    <footer className={styles.footer} role="contentinfo">
      <div className={styles.inner}>
        <div className={styles.top}>
          <div className={styles.brandGroup}>
            <Link to="/" className={styles.wordmark} aria-label="Vantage Markets home">
              <img src="/Screenshot_2026-07-14_232051-removebg-preview.png" alt="Vantage Markets Logo" className={styles.wordmarkLogo} />
            </Link>
            <p className={styles.tagline}>Trustless prediction markets.</p>
          </div>

          <div className={styles.linksGroup}>
            <span className={styles.linksTitle}>Resources</span>
            <ul className={styles.linksList}>
              <li><a href="#" className={styles.link}>Documentation</a></li>
              <li><a href="https://github.com/vantage" className={styles.link}>GitHub</a></li>
              <li><a href="https://testnet.explorer.injective.network" className={styles.link}>Explorer</a></li>
              <li><a href="https://injective.com" className={styles.link}>Injective</a></li>
              <li><a href="#" className={styles.link}>Status</a></li>
              <li><a href="#" className={styles.link}>Terms</a></li>
              <li><a href="#" className={styles.link}>Privacy</a></li>
            </ul>
          </div>
        </div>

        <div className={styles.bottom}>
          <p className={styles.legal}>
            © {new Date().getFullYear()} Vantage Markets. Testnet only.
          </p>

          <div className={styles.statusBadge}>
            {isConnected ? (
              <>
                <span className={styles.statusDotActive} />
                <span>Wallet Connected • Chain {chain?.id || 'Unknown'}</span>
              </>
            ) : (
              <>
                <span className={styles.statusDotActive} />
                <span>Injective Testnet • Operational</span>
              </>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
