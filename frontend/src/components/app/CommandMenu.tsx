import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useMarkets } from '../../hooks/useMarkets';
import styles from './CommandMenu.module.css';

export function CommandMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const { data: markets } = useMarkets();
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const filteredMarkets = (markets ?? []).filter(m => 
    m.description.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 5); // Limit results

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className={styles.overlay} onClick={() => setIsOpen(false)}>
        <motion.div 
          className={styles.modal}
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className={styles.inputWrapper}>
            <span className={styles.searchIcon}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </span>
            <input 
              type="text" 
              className={styles.input}
              placeholder="Search markets..." 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
            />
            <span className={styles.shortcut}>ESC</span>
          </div>

          {query && (
            <div className={styles.results}>
              {filteredMarkets.length > 0 ? (
                <ul className={styles.resultList}>
                  {filteredMarkets.map(m => (
                    <li key={m.id}>
                      <button 
                        className={styles.resultItem}
                        onClick={() => {
                          setIsOpen(false);
                          setQuery('');
                          navigate(`/market/${m.id}`);
                        }}
                      >
                        <span className={styles.category}>Market #{m.id}</span>
                        <span className={styles.question}>{m.description}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className={styles.noResults}>No markets found matching "{query}"</div>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
