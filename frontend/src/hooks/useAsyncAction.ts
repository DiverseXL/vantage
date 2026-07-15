import { useState, useCallback, useRef, useEffect } from 'react';
import { TIMINGS } from '../lib/motion';

type ActionState = 'idle' | 'pending' | 'success' | 'error';

export function useAsyncAction<TArgs extends any[], TResult>(
  asyncFn: (...args: TArgs) => Promise<TResult>
) {
  const [status, setStatus] = useState<ActionState>('idle');
  const [error, setError] = useState<Error | null>(null);
  
  const isMounted = useRef(true);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const reset = useCallback(() => {
    if (isMounted.current) {
      setStatus('idle');
      setError(null);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    }
  }, []);

  const execute = useCallback(
    async (...args: TArgs) => {
      if (status === 'pending') return; // Mutex
      
      setStatus('pending');
      setError(null);
      
      try {
        const result = await asyncFn(...args);
        
        if (isMounted.current) {
          setStatus('success');
          
          // Hold success state for TIMINGS.successHold ms, then reset
          if (timeoutRef.current) clearTimeout(timeoutRef.current);
          timeoutRef.current = setTimeout(() => {
            if (isMounted.current) {
              setStatus('idle');
            }
          }, TIMINGS.successHold);
        }
        
        return result;
      } catch (err) {
        if (isMounted.current) {
          setStatus('error');
          setError(err instanceof Error ? err : new Error(String(err)));
          
          // Shake animation will play, then auto reset after a bit
          if (timeoutRef.current) clearTimeout(timeoutRef.current);
          timeoutRef.current = setTimeout(() => {
            if (isMounted.current) {
              setStatus('idle');
            }
          }, 600); // 600ms is enough for the shake animation to finish
        }
        throw err;
      }
    },
    [asyncFn, status]
  );

  return { status, error, execute, reset, isPending: status === 'pending' };
}
