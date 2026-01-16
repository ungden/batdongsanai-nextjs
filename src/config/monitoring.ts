// Error Tracking & Monitoring Configuration
// Ready to integrate with Sentry, LogRocket, or other services

export interface MonitoringConfig {
  enabled: boolean;
  sentry?: {
    dsn: string;
    environment: string;
    tracesSampleRate: number;
    replaysSessionSampleRate: number;
    replaysOnErrorSampleRate: number;
  };
  logRocket?: {
    appId: string;
  };
  analytics?: {
    googleAnalyticsId: string;
  };
}

// Get environment
const getEnvironment = (): string => {
  if (typeof window === 'undefined') return 'server';
  const hostname = window.location.hostname;
  if (hostname === 'localhost' || hostname === '127.0.0.1') return 'development';
  if (hostname.includes('staging') || hostname.includes('preview')) return 'staging';
  return 'production';
};

// Monitoring configuration
export const MONITORING_CONFIG: MonitoringConfig = {
  // Enable in production only by default
  enabled: getEnvironment() === 'production',

  // Sentry configuration (add DSN from environment)
  sentry: {
    dsn: import.meta.env.VITE_SENTRY_DSN || '',
    environment: getEnvironment(),
    tracesSampleRate: getEnvironment() === 'production' ? 0.1 : 1.0,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
  },

  // LogRocket configuration (add app ID from environment)
  logRocket: {
    appId: import.meta.env.VITE_LOGROCKET_APP_ID || '',
  },

  // Google Analytics
  analytics: {
    googleAnalyticsId: import.meta.env.VITE_GA_TRACKING_ID || '',
  },
};

// Error severity levels
export type ErrorSeverity = 'fatal' | 'error' | 'warning' | 'info' | 'debug';

// Error tracking interface
export interface ErrorTracker {
  captureException: (error: Error, context?: Record<string, unknown>) => void;
  captureMessage: (message: string, severity?: ErrorSeverity) => void;
  setUser: (user: { id: string; email?: string; name?: string } | null) => void;
  setContext: (name: string, context: Record<string, unknown>) => void;
  addBreadcrumb: (breadcrumb: { category: string; message: string; data?: Record<string, unknown> }) => void;
}

// Console-based error tracker for development
const consoleTracker: ErrorTracker = {
  captureException: (error, context) => {
    console.error('[Error Tracker]', error, context);
  },
  captureMessage: (message, severity = 'info') => {
    const logFn = severity === 'error' || severity === 'fatal' ? console.error : console.log;
    logFn(`[${severity.toUpperCase()}]`, message);
  },
  setUser: (user) => {
    console.log('[Error Tracker] User set:', user);
  },
  setContext: (name, context) => {
    console.log(`[Error Tracker] Context ${name}:`, context);
  },
  addBreadcrumb: (breadcrumb) => {
    console.log('[Breadcrumb]', breadcrumb);
  },
};

// Placeholder for Sentry tracker (implement when Sentry is added)
const createSentryTracker = (): ErrorTracker => {
  // TODO: Implement when @sentry/react is installed
  // import * as Sentry from '@sentry/react';
  //
  // return {
  //   captureException: (error, context) => Sentry.captureException(error, { extra: context }),
  //   captureMessage: (message, severity) => Sentry.captureMessage(message, severity),
  //   setUser: (user) => Sentry.setUser(user),
  //   setContext: (name, context) => Sentry.setContext(name, context),
  //   addBreadcrumb: (breadcrumb) => Sentry.addBreadcrumb(breadcrumb),
  // };

  return consoleTracker;
};

// Get the appropriate error tracker
export const getErrorTracker = (): ErrorTracker => {
  if (!MONITORING_CONFIG.enabled) {
    return consoleTracker;
  }

  if (MONITORING_CONFIG.sentry?.dsn) {
    return createSentryTracker();
  }

  return consoleTracker;
};

// Initialize monitoring (call this in main.tsx or App.tsx)
export const initializeMonitoring = () => {
  if (!MONITORING_CONFIG.enabled) {
    console.log('[Monitoring] Disabled in', getEnvironment(), 'environment');
    return;
  }

  console.log('[Monitoring] Initializing for', getEnvironment(), 'environment');

  // TODO: Initialize Sentry
  // if (MONITORING_CONFIG.sentry?.dsn) {
  //   Sentry.init({
  //     dsn: MONITORING_CONFIG.sentry.dsn,
  //     environment: MONITORING_CONFIG.sentry.environment,
  //     tracesSampleRate: MONITORING_CONFIG.sentry.tracesSampleRate,
  //     replaysSessionSampleRate: MONITORING_CONFIG.sentry.replaysSessionSampleRate,
  //     replaysOnErrorSampleRate: MONITORING_CONFIG.sentry.replaysOnErrorSampleRate,
  //     integrations: [
  //       Sentry.browserTracingIntegration(),
  //       Sentry.replayIntegration(),
  //     ],
  //   });
  // }

  // TODO: Initialize LogRocket
  // if (MONITORING_CONFIG.logRocket?.appId) {
  //   LogRocket.init(MONITORING_CONFIG.logRocket.appId);
  // }
};

// Performance monitoring helpers
export const measurePerformance = (name: string, fn: () => void) => {
  const start = performance.now();
  fn();
  const end = performance.now();
  console.log(`[Performance] ${name}: ${(end - start).toFixed(2)}ms`);
};

export const measureAsyncPerformance = async <T>(name: string, fn: () => Promise<T>): Promise<T> => {
  const start = performance.now();
  const result = await fn();
  const end = performance.now();
  console.log(`[Performance] ${name}: ${(end - start).toFixed(2)}ms`);
  return result;
};

// Web Vitals tracking (requires web-vitals package)
export const trackWebVitals = () => {
  // TODO: Implement when web-vitals is installed
  // import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';
  //
  // const sendToAnalytics = (metric) => {
  //   console.log('[Web Vitals]', metric.name, metric.value);
  //   // Send to analytics service
  // };
  //
  // getCLS(sendToAnalytics);
  // getFID(sendToAnalytics);
  // getFCP(sendToAnalytics);
  // getLCP(sendToAnalytics);
  // getTTFB(sendToAnalytics);

  console.log('[Web Vitals] Tracking initialized');
};
