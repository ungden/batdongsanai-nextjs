
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface AnalyticsEvent {
  action: string;
  category: string;
  label?: string;
  value?: number;
}

export const useAnalytics = (trackingId?: string) => {
  const location = useLocation();

  useEffect(() => {
    if (trackingId && window.gtag) {
      // Track page views
      window.gtag('config', trackingId, {
        page_title: document.title,
        page_location: window.location.href,
        page_path: location.pathname,
      });
    }
  }, [location, trackingId]);

  const trackEvent = ({ action, category, label, value }: AnalyticsEvent) => {
    if (window.gtag) {
      window.gtag('event', action, {
        event_category: category,
        event_label: label,
        value: value,
      });
    }
  };

  const trackProjectView = (projectId: string, projectName: string) => {
    trackEvent({
      action: 'view_project',
      category: 'Projects',
      label: `${projectName} (${projectId})`,
    });
  };

  const trackSearch = (query: string, results: number) => {
    trackEvent({
      action: 'search',
      category: 'Search',
      label: query,
      value: results,
    });
  };

  const trackCalculation = (type: string) => {
    trackEvent({
      action: 'calculate',
      category: 'Calculator',
      label: type,
    });
  };

  const trackFavorite = (action: 'add' | 'remove', projectId: string) => {
    trackEvent({
      action: `${action}_favorite`,
      category: 'Favorites',
      label: projectId,
    });
  };

  return {
    trackEvent,
    trackProjectView,
    trackSearch,
    trackCalculation,
    trackFavorite,
  };
};
