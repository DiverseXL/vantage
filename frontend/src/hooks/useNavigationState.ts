import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { TIMINGS } from '../lib/motion';

export function useNavigationState() {
  const [isNavigating, setIsNavigating] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Whenever location changes, trigger the navigation state.
    // In a future data router migration (e.g., Remix, TanStack Router),
    // this hook would simply return the router's native transition state.
    setIsNavigating(true);
    
    // Simulate navigation duration for synchronous transitions
    // This allows the route loader to show during AnimatePresence exit transitions
    const timeout = setTimeout(() => {
      setIsNavigating(false);
    }, TIMINGS.routeMinVisible);

    return () => clearTimeout(timeout);
  }, [location.pathname]);

  return isNavigating;
}
