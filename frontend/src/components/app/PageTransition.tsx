import { motion } from 'framer-motion';
import { fadeUp } from '../../lib/motion';

export function PageTransition({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={fadeUp}
      className={className}
    >
      {children}
    </motion.div>
  );
}
