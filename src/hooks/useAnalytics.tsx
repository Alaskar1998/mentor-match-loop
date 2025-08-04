import { useEffect, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { logger } from '@/utils/logger';

interface AnalyticsEvent {
  event: string;
  properties?: Record<string, any>;
  timestamp: number;
  sessionId: string;
  userId?: string;
}

interface PerformanceMetrics {
  pageLoadTime: number;
  renderTime: number;
  memoryUsage?: number;
  networkRequests: number;
}

class AnalyticsService {
  private events: AnalyticsEvent[] = [];
  private sessionId: string;
  private userId?: string;
  private isOnline: boolean = navigator.onLine;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.setupOnlineListener();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private setupOnlineListener() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.flushEvents();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  track(event: string, properties?: Record<string, any>) {
    const analyticsEvent: AnalyticsEvent = {
      event,
      properties,
      timestamp: Date.now(),
      sessionId: this.sessionId,
      userId: this.userId
    };

    this.events.push(analyticsEvent);

    // Send immediately if online, otherwise queue
    if (this.isOnline) {
      this.sendEvent(analyticsEvent);
    }

    // Keep only last 100 events in memory
    if (this.events.length > 100) {
      this.events = this.events.slice(-100);
    }
  }

  private async sendEvent(event: AnalyticsEvent) {
    try {
      // Send to your analytics endpoint
      await fetch('/api/analytics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      });
    } catch (error) {
      logger.error('Failed to send analytics event:', error);
    }
  }

  private async flushEvents() {
    if (!this.isOnline || this.events.length === 0) return;

    const eventsToSend = [...this.events];
    this.events = [];

    try {
      await fetch('/api/analytics/batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventsToSend),
      });
    } catch (error) {
      logger.error('Failed to flush analytics events:', error);
      // Restore events if flush failed
      this.events = [...eventsToSend, ...this.events];
    }
  }

  setUserId(userId: string) {
    this.userId = userId;
  }

  getSessionId(): string {
    return this.sessionId;
  }
}

// Global analytics instance
const analytics = new AnalyticsService();

export const useAnalytics = () => {
  const location = useLocation();
  const pageLoadStart = useRef<number>(Date.now());
  const networkRequests = useRef<number>(0);

  // Track page views
  useEffect(() => {
    const pageLoadTime = Date.now() - pageLoadStart.current;
    
    analytics.track('page_view', {
      path: location.pathname,
      search: location.search,
      pageLoadTime,
      networkRequests: networkRequests.current
    });

    // Reset for next page
    pageLoadStart.current = Date.now();
    networkRequests.current = 0;
  }, [location]);

  // Track performance metrics
  const trackPerformance = useCallback((metrics: PerformanceMetrics) => {
    analytics.track('performance', metrics);
  }, []);

  // Track user interactions
  const trackEvent = useCallback((event: string, properties?: Record<string, any>) => {
    analytics.track(event, properties);
  }, []);

  // Track network requests
  const trackNetworkRequest = useCallback((url: string, method: string, status: number, duration: number) => {
    networkRequests.current++;
    analytics.track('network_request', {
      url,
      method,
      status,
      duration,
      timestamp: Date.now()
    });
  }, []);

  // Track errors
  const trackError = useCallback((error: Error, context?: Record<string, any>) => {
    analytics.track('error', {
      message: error.message,
      stack: error.stack,
      context,
      timestamp: Date.now()
    });
  }, []);

  // Track user engagement
  const trackEngagement = useCallback((action: string, details?: Record<string, any>) => {
    analytics.track('engagement', {
      action,
      details,
      timestamp: Date.now()
    });
  }, []);

  return {
    trackEvent,
    trackPerformance,
    trackNetworkRequest,
    trackError,
    trackEngagement,
    sessionId: analytics.getSessionId()
  };
};

// Hook for tracking component performance
export const useComponentAnalytics = (componentName: string) => {
  const { trackPerformance } = useAnalytics();
  const renderStartTime = useRef<number>(0);

  const startRender = useCallback(() => {
    renderStartTime.current = performance.now();
  }, []);

  const endRender = useCallback(() => {
    const renderTime = performance.now() - renderStartTime.current;
    
    trackPerformance({
      pageLoadTime: 0, // Will be set by page view tracking
      renderTime,
      memoryUsage: (performance as any).memory?.usedJSHeapSize,
      networkRequests: 0 // Will be set by network tracking
    });
  }, [trackPerformance]);

  return { startRender, endRender };
};

// Hook for tracking user interactions
export const useInteractionTracking = () => {
  const { trackEngagement } = useAnalytics();

  const trackClick = useCallback((element: string, context?: Record<string, any>) => {
    trackEngagement('click', { element, context });
  }, [trackEngagement]);

  const trackScroll = useCallback((depth: number, context?: Record<string, any>) => {
    trackEngagement('scroll', { depth, context });
  }, [trackEngagement]);

  const trackFormSubmission = useCallback((formName: string, success: boolean, context?: Record<string, any>) => {
    trackEngagement('form_submission', { formName, success, context });
  }, [trackEngagement]);

  const trackSearch = useCallback((query: string, results: number, context?: Record<string, any>) => {
    trackEngagement('search', { query, results, context });
  }, [trackEngagement]);

  return {
    trackClick,
    trackScroll,
    trackFormSubmission,
    trackSearch
  };
}; 