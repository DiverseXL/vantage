import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { useScrollProgress } from '../../hooks/useScrollProgress';

const POSES = [
  '/assets/oracle-ref/idle.png',
  '/assets/oracle-ref/watching.png',
  '/assets/oracle-ref/stamping.png',
  '/assets/oracle-ref/celebrating.png',
] as const;

// Calibrated against real Zone 1-8 section heights on this page
const POSE_BREAKPOINTS = [0, 0.17, 0.54, 0.63];

const LG_BREAKPOINT = 1024;

export function OracleRef() {
  const progress = useScrollProgress();
  const containerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const [poseIndex, setPoseIndex] = useState(0);
  const [isLg, setIsLg] = useState(() => window.innerWidth >= LG_BREAKPOINT);

  // Respect lg breakpoint
  useEffect(() => {
    const onResize = () => setIsLg(window.innerWidth >= LG_BREAKPOINT);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Update pose index manually
  useEffect(() => {
    let nextPose = 0;
    for (let i = POSE_BREAKPOINTS.length - 1; i >= 0; i--) {
      if (progress >= POSE_BREAKPOINTS[i]) {
        nextPose = i;
        break;
      }
    }
    setPoseIndex(nextPose);
  }, [progress]);

  // GSAP animations driven manually by progress
  useEffect(() => {
    if (!isLg) return;

    const ctx = gsap.context(() => {
      // 1. Independent continuous float
      gsap.to(innerRef.current, {
        y: -15,
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      });

      // 2. Entrance animation
      gsap.from(containerRef.current, {
        x: 300,
        opacity: 0,
        duration: 1.5,
        ease: "elastic.out(1, 0.5)",
        delay: 0.5
      });

      // Initial scrub state
      gsap.set(containerRef.current, {
        x: 0,
        scaleX: 1,
        scaleY: 1,
        filter: 'drop-shadow(0px 0px 15px rgba(35, 184, 91, 0.6))'
      });

      // 3. Scrubbed choreography timeline (paused)
      const tl = gsap.timeline({ paused: true });
      tlRef.current = tl;

      // The timeline spans progress 0.0 to 1.0
      // 0.17 -> 0.30: Patrol left, shrink, flip, drop glow
      tl.to(containerRef.current, {
        x: -(window.innerWidth - 220), // Responsive distance to left side
        scaleX: -0.85,
        scaleY: 0.85,
        filter: 'drop-shadow(0px 0px 5px rgba(255, 255, 255, 0.1))',
        duration: 0.13,
        ease: 'power2.inOut'
      }, 0.17);

      // 0.54 -> 0.63: Dash back right, normal size, warm stamping glow
      tl.to(containerRef.current, {
        x: 0,
        scaleX: 1,
        scaleY: 1,
        filter: 'drop-shadow(0px 0px 15px rgba(255, 90, 54, 0.5))',
        duration: 0.09,
        ease: 'power3.inOut'
      }, 0.54);

      // 0.63 -> 1.0: Celebrate! Grow, huge gold glow
      tl.to(containerRef.current, {
        scaleX: 1.3,
        scaleY: 1.3,
        filter: 'drop-shadow(0px 0px 35px rgba(255, 215, 0, 0.8))',
        duration: 0.37,
        ease: 'back.out(1.5)'
      }, 0.63);

    }, containerRef);

    return () => ctx.revert();
  }, [isLg]);

  // Synchronize scrubbed timeline with progress
  useEffect(() => {
    if (tlRef.current) {
      tlRef.current.progress(progress);
    }
  }, [progress]);

  // Handle window resizing cleanly for GSAP
  useEffect(() => {
    if (!isLg || !tlRef.current) return;
    const onResize = () => {
      // Small timeout to allow innerWidth to stabilize
      setTimeout(() => {
        if (!containerRef.current || !tlRef.current) return;
        
        // Rebuild timeline to capture new window bounds
        const p = tlRef.current.progress();
        tlRef.current.kill();

        const tl = gsap.timeline({ paused: true });
        tlRef.current = tl;

        // Same timeline logic, recomputed bounds
        tl.to(containerRef.current, {
          x: -(window.innerWidth - 220),
          scaleX: -0.85,
          scaleY: 0.85,
          filter: 'drop-shadow(0px 0px 5px rgba(255, 255, 255, 0.1))',
          duration: 0.13,
          ease: 'power2.inOut'
        }, 0.17)
        .to(containerRef.current, {
          x: 0,
          scaleX: 1,
          scaleY: 1,
          filter: 'drop-shadow(0px 0px 15px rgba(255, 90, 54, 0.5))',
          duration: 0.09,
          ease: 'power3.inOut'
        }, 0.54)
        .to(containerRef.current, {
          scaleX: 1.3,
          scaleY: 1.3,
          filter: 'drop-shadow(0px 0px 35px rgba(255, 215, 0, 0.8))',
          duration: 0.37,
          ease: 'back.out(1.5)'
        }, 0.63);

        tl.progress(p);
      }, 50);
    };

    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [isLg]);


  if (!isLg) return null;

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      style={{
        position: 'fixed',
        right: '32px',
        top: '25%',
        zIndex: 40,
        pointerEvents: 'none',
        width: '160px',
        height: '160px',
      }}
    >
      <div 
        ref={innerRef} 
        style={{ width: '100%', height: '100%', position: 'relative' }}
      >
        {POSES.map((src, i) => (
          <img
            key={src}
            src={src}
            alt=""
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              opacity: i === poseIndex ? 1 : 0,
              transform: i === 0 ? 'scale(1.25)' : 'none',
              transition: 'opacity 0.3s ease',
              willChange: 'opacity',
            }}
          />
        ))}
      </div>
    </div>
  );
}
