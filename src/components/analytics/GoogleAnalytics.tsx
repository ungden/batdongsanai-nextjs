"use client";

import { useEffect } from 'react';

interface GoogleAnalyticsProps {
  trackingId: string;
}

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

const GoogleAnalytics = ({ trackingId }: GoogleAnalyticsProps) => {
  useEffect(() => {
    if (!trackingId) return;

    // Load Google Analytics script
    const script1 = document.createElement('script');
    script1.async = true;
    script1.src = `https://www.googletagmanager.com/gtag/js?id=${trackingId}`;
    document.head.appendChild(script1);

    // Initialize gtag
    const script2 = document.createElement('script');
    script2.innerHTML = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${trackingId}', {
        page_title: document.title,
        page_location: window.location.href,
      });
    `;
    document.head.appendChild(script2);

    // Cleanup function
    return () => {
      document.head.removeChild(script1);
      document.head.removeChild(script2);
    };
  }, [trackingId]);

  return null;
};

export default GoogleAnalytics;
