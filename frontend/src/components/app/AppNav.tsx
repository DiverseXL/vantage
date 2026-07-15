import { useState, useRef, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext';
import { useAdmin } from '../../contexts/AdminContext';
import { useAudioContext } from '../../contexts/AudioContext';
import { truncateId } from '../../lib/format';
import { useConnect, useDisconnect, useAccount } from 'wagmi';
import { motion, AnimatePresence } from 'framer-motion';
import { WalletConnectionLoader } from './WalletConnectionLoader';
import type { WalletConnectionState } from './WalletConnectionLoader';
import styles from './AppNav.module.css';

// Helper: detect desktop-size viewport (hover sounds are desktop-only)
function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(
    () => typeof window !== 'undefined' && window.innerWidth >= 768
  );
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return isDesktop;
}

export function AppNav() {
  const { userId } = useUser();
  const { isAdmin } = useAdmin();
  const { soundsEnabled, setSoundsEnabled } = useAudioContext();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef<HTMLLIElement>(null);
  const isDesktop = useIsDesktop();

  const { connect, connectors, status: connectStatus } = useConnect();
  const { disconnect } = useDisconnect();
  const { isConnected, isConnecting } = useAccount();

  const [walletState, setWalletState] = useState<WalletConnectionState>('Disconnected');

  useEffect(() => {
    if (isConnected) {
      setWalletState('Connected');
      const timer = setTimeout(() => setWalletState('Disconnected'), 2000);
      return () => clearTimeout(timer);
    } else if (connectStatus === 'pending' || isConnecting) {
      setWalletState('Awaiting Approval');
    } else {
      setWalletState('Disconnected');
    }
  }, [isConnected, connectStatus, isConnecting]);

  const handleConnect = () => {
    setWalletState('Opening Wallet');
    const injected = connectors.find(c => c.id === 'injected' || c.id === 'metaMask') || connectors[0];
    if (injected) connect({ connector: injected });
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('scroll', handleScroll, { passive: true });

    handleScroll();

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const primaryLinks = [
    { label: 'Markets', path: '/markets' },
    { label: 'Dashboard', path: '/dashboard' },
  ];
  if (isAdmin) {
    primaryLinks.push({ label: 'Admin', path: '/admin' });
  }

  const moreLinks = [
    { label: 'How it works', href: '/#how-it-works' },
    { label: 'Premium Insight', href: '/#premium' },
    { label: 'Testnet Details', href: '/#transparency' },
  ];

  return (
    <div className={styles.navContainer}>
      <nav
        className={`${styles.nav} ${scrolled ? styles.navScrolled : ''}`}
        role="navigation"
        aria-label="App navigation"
      >
        <Link to="/" className={styles.wordmark} aria-label="Vantage Markets home">
          <img
            src="/Screenshot_2026-07-14_232051-removebg-preview.png"
            alt="Vantage Markets Logo"
            className={styles.wordmarkLogo}
          />
        </Link>

        <ul className={styles.links} role="list" onMouseLeave={() => setHoveredIndex(null)}>
          {primaryLinks.map((link, i) => (
            <li key={link.path} onMouseEnter={() => setHoveredIndex(i)} className={styles.linkItem}>
              {hoveredIndex === i && (
                <motion.div
                  className={styles.linkHoverBg}
                  layoutId="appNavHover"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <NavLink
                to={link.path}
                className={({ isActive }) =>
                  `${styles.link} ${isActive ? styles.linkActive : ''} ${link.label === 'Admin' ? styles.adminLink : ''}`
                }
                onClick={() => setDropdownOpen(false)}
                // Hover tick sound — desktop only (no sound on mobile hover)
                {...(isDesktop ? { 'data-cuelume-hover': 'tick' } : {})}
              >
                {link.label}
              </NavLink>
            </li>
          ))}

          {/* Info dropdown */}
          <li
            className={styles.linkItem}
            onMouseEnter={() => setHoveredIndex(primaryLinks.length)}
            ref={dropdownRef}
          >
            {hoveredIndex === primaryLinks.length && (
              <motion.div
                className={styles.linkHoverBg}
                layoutId="appNavHover"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            <button
              className={styles.link}
              onClick={() => setDropdownOpen(!dropdownOpen)}
              aria-expanded={dropdownOpen}
              aria-haspopup="true"
            >
              Info <span className={styles.chevron}>{dropdownOpen ? '▲' : '▼'}</span>
            </button>

            <AnimatePresence>
              {dropdownOpen && (
                <motion.div
                  className={styles.dropdown}
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                >
                  <ul className={styles.dropdownList}>
                    {moreLinks.map(l => (
                      <li key={l.label}>
                        <a
                          href={l.href}
                          className={styles.dropdownLink}
                          onClick={() => setDropdownOpen(false)}
                        >
                          {l.label}
                        </a>
                      </li>
                    ))}

                    {/* ── Divider ── */}
                    <li>
                      <div className={styles.dropdownDivider} role="separator" />
                    </li>

                    {/* ── Interaction Sounds toggle ── */}
                    <li>
                      <button
                        className={styles.soundsToggle}
                        onClick={() => setSoundsEnabled(!soundsEnabled)}
                        aria-pressed={soundsEnabled}
                        title="Toggle interaction sounds"
                      >
                        <span className={styles.soundsToggleLabel}>
                          {/* Speaker icon */}
                          <svg
                            width="13"
                            height="13"
                            viewBox="0 0 16 16"
                            fill="none"
                            aria-hidden="true"
                          >
                            {soundsEnabled ? (
                              <>
                                <path d="M3 6H1v4h2l4 3V3L3 6z" fill="currentColor" />
                                <path d="M10.5 8a2.5 2.5 0 0 0-2.5-2.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                                <path d="M13 8a5 5 0 0 0-5-5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                              </>
                            ) : (
                              <>
                                <path d="M3 6H1v4h2l4 3V3L3 6z" fill="currentColor" opacity="0.45" />
                                <path d="M13 5l-5 6M8 5l5 6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                              </>
                            )}
                          </svg>
                          Interaction Sounds
                        </span>
                        <span
                          className={`${styles.soundsPill} ${soundsEnabled ? styles.soundsPillOn : styles.soundsPillOff}`}
                          aria-hidden="true"
                        >
                          {soundsEnabled ? 'ON' : 'OFF'}
                        </span>
                      </button>
                    </li>
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>
          </li>
        </ul>

        {/* Wallet chip area */}
        <div className={styles.chipArea}>
          <WalletConnectionLoader state={walletState} />
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className={`${styles.chip} ${!userId ? styles.chipEmpty : ''}`}
            onClick={userId ? () => disconnect() : handleConnect}
            title={userId ? 'Click to disconnect' : 'Connect Wallet'}
            data-cuelume-press
            data-cuelume-release
          >
            {userId ? (
              <>
                <span className={styles.chipDot} aria-hidden="true" />
                <span className={styles.chipId}>{truncateId(userId)}</span>
              </>
            ) : (
              <span className={styles.chipEmpty}>Connect Wallet</span>
            )}
          </motion.button>
        </div>
      </nav>
    </div>
  );
}
