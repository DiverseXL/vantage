import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './ActivityFeed.module.css';

interface Activity {
  id: string;
  text: string;
  time: string;
}

const MOCK_ACTIVITIES = [
  { id: '1', text: 'Someone backed YES on Ethereum ETF', time: 'Just now' },
  { id: '2', text: 'Market resolved: Bitcoin Q3', time: '2 min ago' },
  { id: '3', text: 'AI insight unlocked for US Election', time: '12 min ago' },
  { id: '4', text: 'Someone backed NO on Solana $500', time: '1 hour ago' },
];

export function ActivityFeed() {
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    // Simulate initial load
    setActivities(MOCK_ACTIVITIES);
    
    // Simulate real-time updates
    const interval = setInterval(() => {
      setActivities(prev => {
        const newAct = {
          id: Date.now().toString(),
          text: `Someone backed ${Math.random() > 0.5 ? 'YES' : 'NO'} on a trending market`,
          time: 'Just now'
        };
        return [newAct, ...prev].slice(0, 5); // Keep last 5
      });
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={styles.feed}>
      <h3 className={styles.title}>Recent activity</h3>
      <div className={styles.list}>
        <AnimatePresence initial={false}>
          {activities.map((act) => (
            <motion.div 
              key={act.id}
              className={styles.item}
              initial={{ opacity: 0, height: 0, y: -10 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <span className={styles.text}>{act.text}</span>
              <span className={styles.time}>{act.time}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
