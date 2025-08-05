/**
 * @file usePerformanceMonitor.tsx
 * @description Hook for monitoring component performance and user interactions
 */

import { useEffect, useRef, useCallback } from 'react';
import { logger } from '@/utils/logger';

export interface PerformanceMetrics {
  componentName: string;
  renderTime: number;
  mountTime: number;
  interactionCount: number;
  lastInteraction: number;
}

export interface UsePerformanceMonitorOptions {
  componentName: string;
  enabled?: boolean;
  logToConsole?: boolean;
  threshold?: number; // ms threshold for performance warnings
}

export interface UsePerformanceMonitorReturn {
  trackInteraction: (action: string, data?: any) => void;
  getMetrics: () => PerformanceMetrics;
  resetMetrics: () => void;
}

export const usePerformanceMonitor = (
  options: UsePerformanceMonitorOptions
): UsePerformanceMonitorReturn => {
  const {
    componentName,
    enabled = process.env.NODE_ENV === 'development',
    logToConsole = false,
    threshold = 100,
  } = options;

  const metricsRef = useRef<PerformanceMetrics>({
    componentName,
    renderTime: 0,
    mountTime: 0,
    interactionCount: 0,
    lastInteraction: 0,
  });

  const mountTimeRef = useRef<number>(0);
  const renderStartRef = useRef<number>(0);

  // Track component mount
  useEffect(() => {
    if (!enabled) return;

    mountTimeRef.current = performance.now();
    metricsRef.current.mountTime = mountTimeRef.current;

    if (logToConsole) {
      logger.info(`[Performance] ${componentName} mounted`, {
        mountTime: mountTimeRef.current,
      });
    }

    return () => {
      if (enabled && logToConsole) {
        const totalTime = performance.now() - mountTimeRef.current;
        logger.info(`[Performance] ${componentName} unmounted`, {
          totalLifetime: totalTime,
          metrics: metricsRef.current,
        });
      }
    };
  }, [componentName, enabled, logToConsole]);

  // Track render performance
  useEffect(() => {
    if (!enabled) return;

    renderStartRef.current = performance.now();

    return () => {
      if (enabled) {
        const renderTime = performance.now() - renderStartRef.current;
        metricsRef.current.renderTime = renderTime;

        if (renderTime > threshold && logToConsole) {
          logger.warn(
            `[Performance] ${componentName} render time exceeded threshold`,
            {
              renderTime,
              threshold,
              metrics: metricsRef.current,
            }
          );
        }
      }
    };
  });

  const trackInteraction = useCallback(
    (action: string, data?: any) => {
      if (!enabled) return;

      const now = performance.now();
      metricsRef.current.interactionCount++;
      metricsRef.current.lastInteraction = now;

      if (logToConsole) {
        logger.info(`[Performance] ${componentName} interaction`, {
          action,
          data,
          interactionCount: metricsRef.current.interactionCount,
          timeSinceMount: now - mountTimeRef.current,
        });
      }
    },
    [componentName, enabled, logToConsole]
  );

  const getMetrics = useCallback((): PerformanceMetrics => {
    return { ...metricsRef.current };
  }, []);

  const resetMetrics = useCallback(() => {
    metricsRef.current = {
      componentName,
      renderTime: 0,
      mountTime: mountTimeRef.current,
      interactionCount: 0,
      lastInteraction: 0,
    };
  }, [componentName]);

  return {
    trackInteraction,
    getMetrics,
    resetMetrics,
  };
};
