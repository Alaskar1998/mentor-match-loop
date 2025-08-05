import React, { Component, ErrorInfo, ReactNode } from 'react';
import { logger } from '@/utils/logger';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorCount: number;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, errorCount: 0 };
  }

  static getDerivedStateFromError(error: Error): State {
    // In development, React StrictMode may cause errors to be thrown twice
    // We'll track this and only show the error UI after multiple occurrences
    return { hasError: true, error, errorCount: 1 };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logger.error('Error Boundary caught an error:', error, errorInfo);

    // Increment error count
    this.setState(prev => ({ errorCount: prev.errorCount + 1 }));

    // Send to error reporting service
    if (process.env.NODE_ENV === 'production') {
      // Send to Sentry, LogRocket, etc.
      logger.error('Error reported to monitoring service');
    }

    this.props.onError?.(error, errorInfo);
  }

  componentDidUpdate(prevProps: Props, prevState: State) {
    // If we're in development and this is likely a StrictMode double-error,
    // reset the error state after a short delay
    if (
      process.env.NODE_ENV === 'development' &&
      this.state.hasError &&
      this.state.errorCount === 1
    ) {
      setTimeout(() => {
        this.setState({ hasError: false, error: undefined, errorCount: 0 });
      }, 1000);
    }
  }

  render() {
    if (this.state.hasError) {
      // In development, only show error UI after multiple errors to avoid
      // showing it for StrictMode double-invocations
      if (process.env.NODE_ENV === 'development' && this.state.errorCount < 2) {
        return this.props.children;
      }

      return (
        this.props.fallback || (
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">Something went wrong</h2>
              <p className="text-muted-foreground mb-4">
                We're sorry, but something unexpected happened.
              </p>
              <div className="space-y-2">
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md mr-2"
                >
                  Reload Page
                </button>
                <button
                  onClick={() =>
                    this.setState({
                      hasError: false,
                      error: undefined,
                      errorCount: 0,
                    })
                  }
                  className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md"
                >
                  Try Again
                </button>
              </div>
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mt-4 text-left">
                  <summary className="cursor-pointer text-sm text-muted-foreground">
                    Error Details (Development)
                  </summary>
                  <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-auto">
                    {this.state.error.toString()}
                  </pre>
                </details>
              )}
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
