"use client";

import { useCallback, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getErrorTracker, ErrorSeverity } from '@/config/monitoring';

// Hook for error tracking with automatic user context
export function useErrorTracking() {
  const { user } = useAuth();
  const tracker = getErrorTracker();

  // Update user context when auth changes
  useEffect(() => {
    if (user) {
      tracker.setUser({
        id: user.id,
        email: user.email || undefined,
        name: user.user_metadata?.full_name || undefined,
      });
    } else {
      tracker.setUser(null);
    }
  }, [user, tracker]);

  // Capture an error
  const captureError = useCallback((error: Error, context?: Record<string, unknown>) => {
    tracker.captureException(error, context);
  }, [tracker]);

  // Log a message
  const logMessage = useCallback((message: string, severity: ErrorSeverity = 'info') => {
    tracker.captureMessage(message, severity);
  }, [tracker]);

  // Add context for future errors
  const setContext = useCallback((name: string, context: Record<string, unknown>) => {
    tracker.setContext(name, context);
  }, [tracker]);

  // Add a breadcrumb
  const addBreadcrumb = useCallback((category: string, message: string, data?: Record<string, unknown>) => {
    tracker.addBreadcrumb({ category, message, data });
  }, [tracker]);

  // Track an async operation with automatic error capture
  const trackAsync = useCallback(async <T,>(
    operation: string,
    fn: () => Promise<T>,
    context?: Record<string, unknown>
  ): Promise<T> => {
    tracker.addBreadcrumb({
      category: 'async',
      message: `Starting: ${operation}`,
      data: context,
    });

    try {
      const result = await fn();
      tracker.addBreadcrumb({
        category: 'async',
        message: `Completed: ${operation}`,
      });
      return result;
    } catch (error) {
      tracker.captureException(error as Error, {
        operation,
        ...context,
      });
      throw error;
    }
  }, [tracker]);

  return {
    captureError,
    logMessage,
    setContext,
    addBreadcrumb,
    trackAsync,
  };
}

// HOC for error boundary integration
export function withErrorTracking<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  componentName: string
) {
  return function ErrorTrackedComponent(props: P) {
    const { setContext } = useErrorTracking();

    useEffect(() => {
      setContext('component', { name: componentName });
    }, [setContext]);

    return <WrappedComponent {...props} />;
  };
}
