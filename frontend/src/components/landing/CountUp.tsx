import { useEffect, useState } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { EASE } from '../../lib/motion';

interface CountUpProps {
  to: number;
  decimals?: number;
  suffix?: string;
  duration?: number;
}

export function CountUp({ to, decimals = 0, suffix = '', duration = 1.5 }: CountUpProps) {
  const [hasInView, setHasInView] = useState(false);
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => 
    latest.toFixed(decimals) + suffix
  );

  useEffect(() => {
    if (hasInView) {
      const controls = animate(0, to, {
        duration,
        ease: EASE,
        onUpdate: (latest) => count.set(latest)
      });
      return controls.stop;
    }
  }, [hasInView, count, to, duration]);

  return (
    <motion.span
      onViewportEnter={() => setHasInView(true)}
      viewport={{ once: true }}
    >
      {rounded}
    </motion.span>
  );
}
