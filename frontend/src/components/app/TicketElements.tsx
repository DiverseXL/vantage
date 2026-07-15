import React from 'react';
import styles from './TicketElements.module.css';

export const AnnotationMark = ({ children, variant = 'underline' }: { children: React.ReactNode, variant?: 'underline' | 'circle' }) => (
  <span className={styles.annotationWrapper}>
    {children}
    {variant === 'underline' && (
      <svg className={styles.annotationUnderline} viewBox="0 0 100 20" preserveAspectRatio="none">
        <path d="M5,15 Q30,5 50,12 T95,10" fill="none" stroke="var(--amber-accent)" strokeWidth="3" strokeLinecap="round" />
      </svg>
    )}
  </span>
);

export const PixelBolt = ({ size = 12 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 10 10" fill="currentColor" aria-hidden="true">
    <rect x="5" y="0" width="3" height="1" />
    <rect x="4" y="1" width="3" height="1" />
    <rect x="3" y="2" width="3" height="1" />
    <rect x="2" y="3" width="5" height="1" />
    <rect x="3" y="4" width="3" height="1" />
    <rect x="2" y="5" width="3" height="1" />
    <rect x="1" y="6" width="3" height="1" />
    <rect x="0" y="7" width="3" height="1" />
  </svg>
);

export function SegmentedMeter({ pct, segments = 12 }: { pct: number; segments?: number }) {
  const filledCount = Math.round((pct / 100) * segments);
  return (
    <div className={styles.meter}>
      {Array.from({ length: segments }).map((_, i) => (
        <div
          key={i}
          className={styles.segment}
          data-filled={i < filledCount}
          data-side={i < segments / 2 ? 'left' : 'right'}
        />
      ))}
    </div>
  );
}

export function PctReadout({ value, isAnnotated }: { value: number; isAnnotated: boolean }) {
  return (
    <span className={styles.pct}>
      {isAnnotated ? (
        <AnnotationMark variant="underline">{value}%</AnnotationMark>
      ) : (
        `${value}%`
      )}
    </span>
  );
}

interface ScoreboardRowProps {
  pct0: number;
  pct1: number;
  isResolved: boolean;
  winningOutcome?: string | null;
}

export function ScoreboardRow({ pct0, pct1, isResolved, winningOutcome }: ScoreboardRowProps) {
  // Annotation branches: If resolved, mark the winning side. If open, mark the leading pool percentage.
  let mark0 = false;
  let mark1 = false;
  
  if (isResolved && winningOutcome) {
    mark0 = winningOutcome === '0';
    mark1 = winningOutcome === '1';
  } else {
    // Open market: mark leading percentage
    mark0 = pct0 >= pct1;
    mark1 = pct1 > pct0;
  }

  return (
    <div className={styles.pctRow}>
      <PctReadout value={pct0} isAnnotated={mark0} />
      <PctReadout value={pct1} isAnnotated={mark1} />
    </div>
  );
}
