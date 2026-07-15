import { useState, useEffect, useRef } from 'react';
import { useNavigationState } from '../../hooks/useNavigationState';
import { useLocation } from 'react-router-dom';
import { TIMINGS } from '../../lib/motion';
import styles from './LoaderElements.module.css';

const SEGMENTS = 20;

export function RouteLoader() {
  const location = useLocation();
  const isNavigating = useNavigationState();
  const [show, setShow] = useState(false);
  const [progress, setProgress] = useState(0); // 0..SEGMENTS

  // Stable refs to avoid stale closure issues
  const showRef = useRef(show);
  showRef.current = show;

  const isTest = new URLSearchParams(location.search).get('test-splash') === '1';
  const hasSeenSplash = sessionStorage.getItem('vantage:splash_seen');
  const isSplashActive = isTest || (location.pathname === '/' && !hasSeenSplash);

  useEffect(() => {
    if (isSplashActive) {
      setShow(false);
      setProgress(0);
      return;
    }

    let delayTimeout: ReturnType<typeof setTimeout>;
    let progressInterval: ReturnType<typeof setInterval>;

    if (isNavigating) {
      // Delay appearance by routeDelay ms to avoid flash on fast navigations
      delayTimeout = setTimeout(() => {
        setShow(true);
        setProgress(0);

        let current = 0;
        progressInterval = setInterval(() => {
          current += 1;
          if (current <= 17) {
            // Cap at 85% — real completion drives us to 100%
            setProgress(current);
          } else {
            clearInterval(progressInterval);
          }
        }, 28);
      }, TIMINGS.routeDelay);
    } else {
      // Navigation completed — drive to 100% then unmount
      if (showRef.current) {
        setProgress(SEGMENTS);
        delayTimeout = setTimeout(() => {
          setShow(false);
          setProgress(0);
        }, 220);
      }
    }

    return () => {
      clearTimeout(delayTimeout);
      clearInterval(progressInterval);
    };
  }, [isNavigating, isSplashActive]); // NOTE: `show` removed from deps; using ref to avoid loops

  if (!show) return null;

  return (
    <div
      className={styles.routeLoader}
      role="progressbar"
      aria-busy={isNavigating}
      aria-valuemin={0}
      aria-valuemax={SEGMENTS}
      aria-valuenow={progress}
      aria-valuetext="Loading page"
    >
      {Array.from({ length: SEGMENTS }).map((_, i) => (
        <div
          key={i}
          className={`${styles.routeSegment} ${i < progress ? styles.illuminated : ''}`}
        />
      ))}
    </div>
  );
}
