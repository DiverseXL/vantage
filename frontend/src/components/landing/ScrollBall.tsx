import { useState, useEffect } from 'react';
import { useScrollProgress } from '../../hooks/useScrollProgress';

export function ScrollBall() {
  const progress = useScrollProgress();
  const [trackHeight, setTrackHeight] = useState(600);
  const [isMd, setIsMd] = useState(() => window.innerWidth >= 768);

  useEffect(() => {
    // Dynamic calibration: travel down 75% of the viewport height.
    const onResize = () => {
      setTrackHeight(window.innerHeight * 0.75);
      setIsMd(window.innerWidth >= 768);
    };
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  if (!isMd) return null;

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        top: '10%',
        left: '50%',
        transform: `translate(-50%, ${progress * trackHeight}px)`,
        zIndex: 999,
        width: '40px',
        height: '40px',
        pointerEvents: 'none',
        backgroundImage: "url('/assets/scroll-ball/ball.png')",
        backgroundSize: 'contain',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        imageRendering: 'pixelated',
        filter: 'drop-shadow(0 6px 8px rgba(0,0,0,0.3))',
      }}
    />
  );
}
