/**
 * @file useSearchDebounce.tsx
 * @description Hook for debouncing search queries
 */

import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * @interface UseSearchDebounceOptions
 * @description Options for search debounce hook
 */
interface UseSearchDebounceOptions {
  delay?: number; // Debounce delay in milliseconds
  minLength?: number; // Minimum query length before triggering search
}

/**
 * @interface UseSearchDebounceReturn
 * @description Return type for search debounce hook
 */
interface UseSearchDebounceReturn {
  debouncedQuery: string;
  isDebouncing: boolean;
  setQuery: (query: string) => void;
  clearQuery: () => void;
}

/**
 * @hook useSearchDebounce
 * @description Debounces search queries to prevent excessive API calls
 *
 * @param {UseSearchDebounceOptions} options - Debounce configuration options
 * @param {number} options.delay - Debounce delay in milliseconds (default: 300)
 * @param {number} options.minLength - Minimum query length before triggering search (default: 2)
 *
 * @returns {UseSearchDebounceReturn} Debounced query state and functions
 *
 * @example
 * const { debouncedQuery, isDebouncing, setQuery, clearQuery } = useSearchDebounce({
 *   delay: 500,
 *   minLength: 3
 * });
 */
export const useSearchDebounce = (
  options: UseSearchDebounceOptions = {}
): UseSearchDebounceReturn => {
  const { delay = 300, minLength = 2 } = options;
  const [query, setQueryState] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isDebouncing, setIsDebouncing] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * @function clearTimeout
   * @description Clears the current timeout
   */
  const clearTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  /**
   * @function setQuery
   * @description Sets the search query with debouncing
   */
  const setQuery = useCallback(
    (newQuery: string) => {
      setQueryState(newQuery);
      setIsDebouncing(true);

      // Clear existing timeout
      clearTimeout();

      // Only debounce if query meets minimum length
      if (newQuery.length >= minLength) {
        timeoutRef.current = setTimeout(() => {
          setDebouncedQuery(newQuery);
          setIsDebouncing(false);
        }, delay);
      } else {
        // Clear debounced query if below minimum length
        setDebouncedQuery('');
        setIsDebouncing(false);
      }
    },
    [delay, minLength, clearTimeout]
  );

  /**
   * @function clearQuery
   * @description Clears the search query
   */
  const clearQuery = useCallback(() => {
    clearTimeout();
    setQueryState('');
    setDebouncedQuery('');
    setIsDebouncing(false);
  }, [clearTimeout]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      clearTimeout();
    };
  }, [clearTimeout]);

  return {
    debouncedQuery,
    isDebouncing,
    setQuery,
    clearQuery,
  };
};
