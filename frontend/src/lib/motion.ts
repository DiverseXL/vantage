export const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1]; // expo-out, snappy but not bouncy
export const DURATION = { fast: 0.15, base: 0.25, slow: 0.4, exit: 0.25 };

export const TIMINGS = {
  routeDelay: 100,      // ms to wait before showing route loader
  routeMinVisible: 250, // min ms route loader stays visible
  successHold: 900,     // ms to hold the success checkmark
  splashMax: 1600,      // max ms the splash screen can exist
};

export const SPRINGS = {
  standard: { type: "spring", stiffness: 400, damping: 25 },
  bouncy: { type: "spring", stiffness: 500, damping: 15 }
} as const;

export const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: DURATION.base, ease: EASE },
};

export const staggerContainer = {
  animate: { transition: { staggerChildren: 0.06 } },
};

