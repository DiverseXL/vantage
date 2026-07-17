import { Outlet } from 'react-router-dom';
import { useAccount, useSwitchChain } from 'wagmi';
import { motion, AnimatePresence } from 'framer-motion';
import { injectiveTestnet } from '../lib/wagmi';
import { AppNav } from '../components/app/AppNav';
import { AppFooter } from '../components/app/AppFooter';
import styles from './AppLayout.module.css';

export function AppLayout() {
  const { isConnected, chainId } = useAccount();
  const { switchChainAsync } = useSwitchChain();

  const onWrongNetwork = isConnected && chainId && chainId !== injectiveTestnet.id;

  const handleSwitchNetwork = () => {
    switchChainAsync({ chainId: injectiveTestnet.id }).catch(() => {});
  };

  return (
    <div className={styles.layout}>
      <AnimatePresence>
        {onWrongNetwork && (
          <motion.div
            className={styles.networkBanner}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            role="alert"
          >
            <div className={styles.networkBannerInner}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <circle cx="8" cy="8" r="7" stroke="#F5A800" strokeWidth="1.2" />
                <path d="M8 5v4M8 11v.5" stroke="#F5A800" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
              <span className={styles.bannerText}>
                Wallet is connected to a different network. Switch to{' '}
                <strong>Injective EVM Testnet</strong> to place bets.
              </span>
              <button
                className={styles.bannerSwitchBtn}
                onClick={handleSwitchNetwork}
              >
                Switch network
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <AppNav />
      <main className={styles.main} id="main-content">
        <Outlet />
      </main>
      <AppFooter />
    </div>
  );
}
