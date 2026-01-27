import { useState, useEffect, useRef } from 'react';

/**
 * Hook to throttle a value to avoid excessive re-renders.
 *
 * @param value - The value to throttle.
 * @param ms - The minimum interval between updates in milliseconds.
 * @returns The throttled value.
 */
export function useThrottle<T>(value: T, ms: number): T {
  const [throttled, setThrottled] = useState(value);
  const lastUpdate = useRef(Date.now());
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const now = Date.now();
    const elapsed = now - lastUpdate.current;

    if (elapsed >= ms) {
      // Enough time passed, update immediately
      lastUpdate.current = now;
      setThrottled(value);
    } else if (!timeoutRef.current) {
      // Schedule an update for the remaining time
      timeoutRef.current = setTimeout(() => {
        lastUpdate.current = Date.now();
        setThrottled(value);
        timeoutRef.current = null;
      }, ms - elapsed);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [value, ms]);

  return throttled;
}
