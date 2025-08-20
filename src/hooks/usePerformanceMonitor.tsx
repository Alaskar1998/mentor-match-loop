import { useEffect, useLayoutEffect, useRef, useCallback } from 'react';
import { logger } from '@/utils/logger';

interface PerformanceMetrics {
  renderTime: number;
  memoryUsage?: number;
  componentName: string;
  timestamp: number;
}

interface UsePerformanceMonitorOptions {
  enabled?: boolean;
  threshold?: number;
  onSlowRender?: (metrics: PerformanceMetrics) => void;
}

export const usePerformanceMonitor = (
  componentName: string,
  options: UsePerformanceMonitorOptions = {}
) => {
  const { enabled = true, threshold = 16, onSlowRender } = options;
  const renderStartTime = useRef<number>(0);
  const renderCount = useRef<number>(0);
  const isFirstRender = useRef(true);

  // Start render timing on component function entry
  if (enabled && isFirstRender.current) {
    renderStartTime.current = performance.now();
    isFirstRender.current = false;
  } else if (enabled) {
    renderStartTime.current = performance.now();
  }

  const endRender = useCallback(() => {
    if (!enabled) return;
    
    const renderTime = performance.now() - renderStartTime.current;
    renderCount.current++;

    // Only track actual render performance, not cleanup
    if (renderTime > threshold && renderTime < 10000) { // Cap at 10s to filter out lifecycle events
      const metrics: PerformanceMetrics = {
        renderTime,
        componentName,
        timestamp: Date.now(),
        memoryUsage: (performance as any).memory?.usedJSHeapSize
      };

      logger.warn(`⚠️ Slow render detected in ${componentName}:`, metrics);
      onSlowRender?.(metrics);
    }

    // Log every 100th render for monitoring
    if (renderCount.current % 100 === 0) {
      logger.debug(`${componentName} render count:`, renderCount.current);
    }
  }, [enabled, threshold, componentName, onSlowRender]);

  // Use layoutEffect to measure after DOM updates but before paint
  useLayoutEffect(() => {
    if (enabled) {
      endRender();
    }
  });

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (enabled) {
        logger.debug(`🧹 ${componentName} unmounted after ${renderCount.current} renders`);
      }
    };
  }, [componentName, enabled]);

  return {
    renderCount: renderCount.current
  };
}; 