/**
 * @file lazyLoading.tsx
 * @description Utility for lazy loading React components with loading and error states
 */

import React, { Suspense, ComponentType, lazy } from 'react';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export interface LazyComponentProps {
  fallback?: React.ReactNode;
  errorBoundary?: React.ComponentType<any>;
}

export interface LazyComponentOptions {
  loadingFallback?: React.ReactNode;
  errorFallback?: React.ComponentType<any>;
  retryCount?: number;
  retryDelay?: number;
}

/**
 * @function createLazyComponent
 * @description Creates a lazy-loaded component with custom loading and error states
 * @param {() => Promise<{ default: ComponentType<any> }>} importFn - Dynamic import function
 * @param {LazyComponentOptions} options - Configuration options
 * @returns {React.ComponentType<any>} Lazy component with error boundary
 */
export const createLazyComponent = (
  importFn: () => Promise<{ default: ComponentType<any> }>,
  options: LazyComponentOptions = {}
): React.ComponentType<any> => {
  const {
    loadingFallback = (
      <LoadingSpinner size="lg" className="flex justify-center p-8" />
    ),
    errorFallback: ErrorFallback,
    retryCount = 3,
    retryDelay = 1000,
  } = options;

  const LazyComponent = lazy(importFn);

  // Error boundary component
  const ErrorBoundaryComponent: React.FC<{ children: React.ReactNode }> = ({
    children,
  }) => {
    const [hasError, setHasError] = React.useState(false);
    const [retryAttempt, setRetryAttempt] = React.useState(0);

    React.useEffect(() => {
      const handleError = (error: Error) => {
        console.error('Lazy component error:', error);
        setHasError(true);
      };

      window.addEventListener('error', handleError);
      return () => window.removeEventListener('error', handleError);
    }, []);

    const handleRetry = () => {
      if (retryAttempt < retryCount) {
        setRetryAttempt(prev => prev + 1);
        setHasError(false);
        // Force re-render by updating key
        setTimeout(() => {
          window.location.reload();
        }, retryDelay);
      }
    };

    if (hasError) {
      if (ErrorFallback) {
        return (
          <ErrorFallback
            onRetry={handleRetry}
            retryAttempt={retryAttempt}
            maxRetries={retryCount}
          />
        );
      }

      return (
        <div className="flex flex-col items-center justify-center p-8 space-y-4">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900">
              Failed to load component
            </h3>
            <p className="text-sm text-gray-600 mt-2">
              {retryAttempt < retryCount
                ? `Retry attempt ${retryAttempt + 1} of ${retryCount}`
                : 'Maximum retry attempts reached'}
            </p>
          </div>
          {retryAttempt < retryCount && (
            <button
              onClick={handleRetry}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Retry
            </button>
          )}
        </div>
      );
    }

    return <>{children}</>;
  };

  // Wrapped component with Suspense and Error Boundary
  const WrappedComponent: React.FC<any> = props => (
    <ErrorBoundaryComponent>
      <Suspense fallback={loadingFallback}>
        <LazyComponent {...props} />
      </Suspense>
    </ErrorBoundaryComponent>
  );

  return WrappedComponent;
};

/**
 * @function withLazyLoading
 * @description Higher-order component for adding lazy loading to existing components
 * @param {ComponentType<any>} Component - Component to wrap
 * @param {LazyComponentOptions} options - Configuration options
 * @returns {React.ComponentType<any>} Wrapped component
 */
export const withLazyLoading = (
  Component: ComponentType<any>,
  options: LazyComponentOptions = {}
): React.ComponentType<any> => {
  const {
    loadingFallback = (
      <LoadingSpinner size="lg" className="flex justify-center p-8" />
    ),
    errorFallback: ErrorFallback,
  } = options;

  const WrappedComponent: React.FC<any> = props => {
    const [isLoaded, setIsLoaded] = React.useState(false);
    const [hasError, setHasError] = React.useState(false);

    React.useEffect(() => {
      // Simulate loading delay for demonstration
      const timer = setTimeout(() => {
        setIsLoaded(true);
      }, 100);

      return () => clearTimeout(timer);
    }, []);

    if (hasError) {
      if (ErrorFallback) {
        return <ErrorFallback />;
      }
      return (
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900">
              Component failed to load
            </h3>
            <button
              onClick={() => {
                setHasError(false);
                setIsLoaded(false);
              }}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      );
    }

    if (!isLoaded) {
      return <>{loadingFallback}</>;
    }

    return <Component {...props} />;
  };

  return WrappedComponent;
};

/**
 * @function preloadComponent
 * @description Preloads a lazy component in the background
 * @param {() => Promise<{ default: ComponentType<any> }>} importFn - Dynamic import function
 * @returns {Promise<void>} Promise that resolves when component is loaded
 */
export const preloadComponent = async (
  importFn: () => Promise<{ default: ComponentType<any> }>
): Promise<void> => {
  try {
    await importFn();
  } catch (error) {
    console.warn('Failed to preload component:', error);
  }
};

/**
 * @function createRouteLazyLoader
 * @description Creates a lazy loader specifically for route components
 * @param {() => Promise<{ default: ComponentType<any> }>} importFn - Dynamic import function
 * @param {string} routeName - Name of the route for better error messages
 * @returns {React.ComponentType<any>} Lazy route component
 */
export const createRouteLazyLoader = (
  importFn: () => Promise<{ default: ComponentType<any> }>,
  routeName: string
): React.ComponentType<any> => {
  return createLazyComponent(importFn, {
    loadingFallback: (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Loading {routeName}...</p>
        </div>
      </div>
    ),
    errorFallback: ({ onRetry, retryAttempt, maxRetries }: any) => (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900">
            Failed to load {routeName}
          </h3>
          <p className="text-sm text-gray-600 mt-2">
            {retryAttempt < maxRetries
              ? `Retry attempt ${retryAttempt + 1} of ${maxRetries}`
              : 'Maximum retry attempts reached'}
          </p>
          {retryAttempt < maxRetries && (
            <button
              onClick={onRetry}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Retry
            </button>
          )}
        </div>
      </div>
    ),
  });
};
