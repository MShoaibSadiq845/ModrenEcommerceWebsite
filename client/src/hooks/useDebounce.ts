import { useState, useEffect } from 'react';

/**
 * Custom hook that debounces a value by specified delay
 * @param value - The value to debounce
 * @param delay - Delay in milliseconds (default: 1000ms)
 * @returns Debounced value
 */
export function useDebounce<T>(value: T, delay: number = 1000): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Set up timer to update debounced value after delay
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cleanup function - cancel timer if value changes before delay completes
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}
