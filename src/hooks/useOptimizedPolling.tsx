import { useEffect, useRef, useCallback } from 'react';

interface PollingOptions {
  interval: number;
  enabled?: boolean;
  maxRetries?: number;
  onError?: (error: any) => void;
}

export const useOptimizedPolling = (
  callback: () => Promise<void> | void,
  options: PollingOptions
) => {
  const { interval, enabled = true, maxRetries = 3, onError } = options;
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const retryCountRef = useRef(0);
  const isActiveRef = useRef(false);

  const executeCallback = useCallback(async () => {
    if (!enabled || isActiveRef.current) return;
    
    try {
      isActiveRef.current = true;
      await callback();
      retryCountRef.current = 0; // Reset retry count on success
    } catch (error) {
      retryCountRef.current++;
      console.error('Polling error:', error);
      
      if (retryCountRef.current >= maxRetries) {
        console.warn('Max retries reached, stopping polling');
        if (onError) onError(error);
        return;
      }
      
      // Exponential backoff
      const backoffDelay = Math.min(interval * Math.pow(2, retryCountRef.current), 30000);
      setTimeout(() => {
        isActiveRef.current = false;
      }, backoffDelay);
    } finally {
      isActiveRef.current = false;
    }
  }, [callback, enabled, maxRetries, onError, interval]);

  useEffect(() => {
    if (!enabled) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Execute immediately on mount
    executeCallback();

    // Set up interval
    intervalRef.current = setInterval(executeCallback, interval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [executeCallback, interval, enabled]);

  return {
    isActive: isActiveRef.current,
    retryCount: retryCountRef.current,
    stop: () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    },
    start: () => {
      if (!intervalRef.current && enabled) {
        intervalRef.current = setInterval(executeCallback, interval);
      }
    }
  };
}; 