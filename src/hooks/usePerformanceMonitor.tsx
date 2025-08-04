import { useEffect, useRef, useCallback } from 'react';
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

  const startRender = useCallback(() => {
    if (!enabled) return;
    renderStartTime.current = performance.now();
  }, [enabled]);

  const endRender = useCallback(() => {
    if (!enabled) return;
    
    const renderTime = performance.now() - renderStartTime.current;
    renderCount.current++;

    // Check if render was slow
    if (renderTime > threshold) {
      const metrics: PerformanceMetrics = {
        renderTime,
        componentName,
        timestamp: Date.now(),
        memoryUsage: (performance as any).memory?.usedJSHeapSize
      };

      logger.warn('Slow render detected in ${componentName}:', metrics);
      onSlowRender?.(metrics);
    }

    // Log every 100th render for monitoring
    if (renderCount.current % 100 === 0) {
      logger.debug('${componentName} render count:', renderCount.current);
    }
  }, [enabled, threshold, componentName, onSlowRender]);

  useEffect(() => {
    startRender();
    return () => {
      endRender();
    };
  });

  return {
    startRender,
    endRender,
    renderCount: renderCount.current
  };
}; 