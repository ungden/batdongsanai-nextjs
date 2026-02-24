import React from 'react';

interface SEOProviderProps {
  children: React.ReactNode;
}

/**
 * SEOProvider is now a passthrough wrapper.
 * react-helmet-async has been replaced with direct DOM manipulation in SEOHead.
 * This wrapper is kept for backwards compatibility.
 */
const SEOProvider = ({ children }: SEOProviderProps) => {
  return <>{children}</>;
};

export default SEOProvider;
