import { useRef, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import styles from './AnnotationMark.module.css';

interface AnnotationMarkProps {
  variant?: 'circle' | 'underline';
  children: ReactNode;
}

/* ─── Hand-drawn circle path ─────────────────────────
   Bezier control points deliberately offset from a
   perfect ellipse — uneven line weight, marker feel.
   ──────────────────────────────────────────────────── */
const CIRCLE_PATH =
  'M 6 2 C 22 -2, 48 -3, 58 5 C 70 12, 72 28, 68 40 C 64 54, 44 60, 24 58 C 8 56, -2 42, 2 26 C 5 12, 18 4, 30 2';

/* ─── Hand-drawn underline path ──────────────────────
   Short squiggly line, slight curve, not dead-straight.
   ──────────────────────────────────────────────────── */
const UNDERLINE_PATH = 'M 2 4 C 14 0, 36 8, 58 4';

export function AnnotationMark({ variant = 'circle', children }: AnnotationMarkProps) {
  const wrapRef = useRef<HTMLSpanElement>(null);
  const [dimensions, setDimensions] = useState({ w: 0, h: 0 });
  const [visible, setVisible] = useState(false);

  /* Measure the text so the SVG scales to it */
  useEffect(() => {
    if (!wrapRef.current) return;
    const rect = wrapRef.current.getBoundingClientRect();
    setDimensions({ w: rect.width, h: rect.height });

    /* IntersectionObserver — play annotation once when text enters viewport */
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.6 },
    );
    obs.observe(wrapRef.current);
    return () => obs.disconnect();
  }, []);

  const isCircle = variant === 'circle';
  const totalLength = isCircle ? 220 : 65;

  /* Scale the SVG to wrap the measured text with a small inset */
  const pad = isCircle ? 14 : 6;
  const svgW = isCircle ? dimensions.w + pad * 2 : dimensions.w + pad;
  const svgH = isCircle ? dimensions.h + pad * 2 : 12;

  return (
    <span ref={wrapRef} className={styles.wrap}>
      {children}

      {dimensions.w > 0 && (
        <svg
          className={styles.mark}
          width={svgW}
          height={svgH}
          viewBox={isCircle ? '0 0 72 62' : '0 0 60 10'}
          preserveAspectRatio="none"
          aria-hidden="true"
          style={
            isCircle
              ? { top: -pad, left: -pad, width: svgW, height: svgH }
              : { bottom: -4, left: 0, width: svgW, height: svgH }
          }
        >
          <path
            d={isCircle ? CIRCLE_PATH : UNDERLINE_PATH}
            fill="none"
            stroke="var(--gold-annotation)"
            strokeWidth={isCircle ? 4.5 : 3.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={totalLength}
            strokeDashoffset={visible ? 0 : totalLength}
            style={{
              transition: visible
                ? `stroke-dashoffset 0.72s cubic-bezier(0.16, 1, 0.3, 1)`
                : 'none',
            }}
          />
        </svg>
      )}
    </span>
  );
}
