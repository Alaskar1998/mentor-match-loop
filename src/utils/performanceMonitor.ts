/**
 * @file performanceMonitor.ts
 * @description Advanced performance monitoring utilities for React components
 */
import { logger } from './logger';

export interface PerformanceMetrics {
  renderTime: number;
  mountTime: number;
  unmountTime: number;
  memoryUsage?: number;
  interactionCount: number;
  errorCount: number;
}

export interface PerformanceThresholds {
  renderTime: number;
  memoryUsage: number;
  interactionDelay: number;
}

export interface PerformanceConfig {
  enabled: boolean;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  thresholds: PerformanceThresholds;
  sampleRate: number; // 0-1, percentage of components to monitor
}

class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, PerformanceMetrics> = new Map();
  private config: PerformanceConfig;
  private observers: Set<(componentName: string, metrics: PerformanceMetrics) => void> = new Set();

  private constructor() {
    this.config = {
      enabled: process.env.NODE_ENV === 'development',
      logLevel: 'info',
      thresholds: {
        renderTime: 16, // 16ms = 60fps
        memoryUsage: 50 * 1024 * 1024, // 50MB
        interactionDelay: 100, // 100ms
      },
      sampleRate: 0.1, // Monitor 10% of components
    };
  }

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  /**
   * Configure the performance monitor
   */
  configure(config: Partial<PerformanceConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Start monitoring a component
   */
  startMonitoring(componentName: string): () => void {
    if (!this.config.enabled || Math.random() > this.config.sampleRate) {
      return () => {}; // No-op if disabled or not sampled
    }

    const startTime = performance.now();
    const startMemory = this.getMemoryUsage();

    const metrics: PerformanceMetrics = {
      renderTime: 0,
      mountTime: startTime,
      unmountTime: 0,
      memoryUsage: startMemory,
      interactionCount: 0,
      errorCount: 0,
    };

    this.metrics.set(componentName, metrics);

    // Return cleanup function
    return () => {
      const endTime = performance.now();
      const endMemory = this.getMemoryUsage();
      
      const currentMetrics = this.metrics.get(componentName);
      if (currentMetrics) {
        currentMetrics.renderTime = endTime - startTime;
        currentMetrics.unmountTime = endTime;
        currentMetrics.memoryUsage = endMemory;

        this.checkThresholds(componentName, currentMetrics);
        this.notifyObservers(componentName, currentMetrics);
      }
    };
  }

  /**
   * Track user interaction
   */
  trackInteraction(componentName: string, interactionType: string, delay: number): void {
    if (!this.config.enabled) return;

    const metrics = this.metrics.get(componentName);
    if (metrics) {
      metrics.interactionCount++;
      
      if (delay > this.config.thresholds.interactionDelay) {
        logger.warn(`Slow interaction detected in ${componentName}: ${interactionType} took ${delay}ms`);
      }
    }
  }

  /**
   * Track error occurrence
   */
  trackError(componentName: string, error: Error): void {
    if (!this.config.enabled) return;

    const metrics = this.metrics.get(componentName);
    if (metrics) {
      metrics.errorCount++;
      logger.error(`Error in ${componentName}:`, error);
    }
  }

  /**
   * Get performance metrics for a component
   */
  getMetrics(componentName: string): PerformanceMetrics | undefined {
    return this.metrics.get(componentName);
  }

  /**
   * Get all performance metrics
   */
  getAllMetrics(): Map<string, PerformanceMetrics> {
    return new Map(this.metrics);
  }

  /**
   * Clear all metrics
   */
  clearMetrics(): void {
    this.metrics.clear();
  }

  /**
   * Subscribe to performance updates
   */
  subscribe(callback: (componentName: string, metrics: PerformanceMetrics) => void): () => void {
    this.observers.add(callback);
    return () => {
      this.observers.delete(callback);
    };
  }

  /**
   * Get memory usage (if available)
   */
  private getMemoryUsage(): number | undefined {
    if ('memory' in performance) {
      return (performance as any).memory.usedJSHeapSize;
    }
    return undefined;
  }

  /**
   * Check if metrics exceed thresholds
   */
  private checkThresholds(componentName: string, metrics: PerformanceMetrics): void {
    const { thresholds } = this.config;

    if (metrics.renderTime > thresholds.renderTime) {
      logger.warn(`Slow render detected in ${componentName}: ${metrics.renderTime.toFixed(2)}ms`);
    }

    if (metrics.memoryUsage && metrics.memoryUsage > thresholds.memoryUsage) {
      logger.warn(`High memory usage in ${componentName}: ${(metrics.memoryUsage / 1024 / 1024).toFixed(2)}MB`);
    }
  }

  /**
   * Notify observers of performance updates
   */
  private notifyObservers(componentName: string, metrics: PerformanceMetrics): void {
    this.observers.forEach(callback => {
      try {
        callback(componentName, metrics);
      } catch (error) {
        logger.error('Error in performance observer:', error);
      }
    });
  }

  /**
   * Generate performance report
   */
  generateReport(): {
    summary: {
      totalComponents: number;
      slowComponents: number;
      highMemoryComponents: number;
      averageRenderTime: number;
    };
    details: Array<{ componentName: string; metrics: PerformanceMetrics }>;
  } {
    const components = Array.from(this.metrics.entries());
    const slowComponents = components.filter(([, metrics]) => 
      metrics.renderTime > this.config.thresholds.renderTime
    ).length;
    
    const highMemoryComponents = components.filter(([, metrics]) => 
      metrics.memoryUsage && metrics.memoryUsage > this.config.thresholds.memoryUsage
    ).length;

    const totalRenderTime = components.reduce((sum, [, metrics]) => 
      sum + metrics.renderTime, 0
    );
    const averageRenderTime = components.length > 0 ? totalRenderTime / components.length : 0;

    return {
      summary: {
        totalComponents: components.length,
        slowComponents,
        highMemoryComponents,
        averageRenderTime,
      },
      details: components.map(([componentName, metrics]) => ({
        componentName,
        metrics,
      })),
    };
  }
}

// Export singleton instance
export const performanceMonitor = PerformanceMonitor.getInstance();

/**
 * HOC to automatically monitor component performance
 */
export function withPerformanceMonitoring<P extends object>(
  Component: React.ComponentType<P>,
  componentName?: string
): React.ComponentType<P> {
  const displayName = componentName || Component.displayName || Component.name || 'Unknown';

  const WrappedComponent: React.FC<P> = (props) => {
    const cleanup = performanceMonitor.startMonitoring(displayName);

    React.useEffect(() => {
      return cleanup;
    }, []);

    return <Component {...props} />;
  };

  WrappedComponent.displayName = `withPerformanceMonitoring(${displayName})`;
  return WrappedComponent;
}

/**
 * Hook to track component interactions
 */
export function usePerformanceTracking(componentName: string) {
  const trackInteraction = React.useCallback((interactionType: string, delay: number) => {
    performanceMonitor.trackInteraction(componentName, interactionType, delay);
  }, [componentName]);

  const trackError = React.useCallback((error: Error) => {
    performanceMonitor.trackError(componentName, error);
  }, [componentName]);

  return { trackInteraction, trackError };
} 