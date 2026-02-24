"use client";

import * as React from "react"

// Breakpoints matching Tailwind defaults
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

const MOBILE_BREAKPOINT = BREAKPOINTS.md;

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isMobile
}

// Enhanced breakpoint hook
export function useBreakpoint() {
  const [breakpoint, setBreakpoint] = React.useState<'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'>('md');
  const [dimensions, setDimensions] = React.useState({ width: 0, height: 0 });

  React.useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      setDimensions({ width, height });

      if (width < BREAKPOINTS.sm) setBreakpoint('xs');
      else if (width < BREAKPOINTS.md) setBreakpoint('sm');
      else if (width < BREAKPOINTS.lg) setBreakpoint('md');
      else if (width < BREAKPOINTS.xl) setBreakpoint('lg');
      else if (width < BREAKPOINTS['2xl']) setBreakpoint('xl');
      else setBreakpoint('2xl');
    };

    updateBreakpoint();
    window.addEventListener('resize', updateBreakpoint);
    return () => window.removeEventListener('resize', updateBreakpoint);
  }, []);

  return {
    breakpoint,
    dimensions,
    isMobile: breakpoint === 'xs' || breakpoint === 'sm',
    isTablet: breakpoint === 'md',
    isDesktop: breakpoint === 'lg' || breakpoint === 'xl' || breakpoint === '2xl',
    isSmallScreen: breakpoint === 'xs' || breakpoint === 'sm' || breakpoint === 'md',
  };
}

// Media query hook for custom queries
export function useMediaQuery(query: string) {
  const [matches, setMatches] = React.useState(false);

  React.useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = () => setMatches(mql.matches);

    mql.addEventListener("change", onChange);
    setMatches(mql.matches);

    return () => mql.removeEventListener("change", onChange);
  }, [query]);

  return matches;
}

// Orientation hook
export function useOrientation() {
  const [orientation, setOrientation] = React.useState<'portrait' | 'landscape'>('portrait');

  React.useEffect(() => {
    const updateOrientation = () => {
      setOrientation(window.innerHeight > window.innerWidth ? 'portrait' : 'landscape');
    };

    updateOrientation();
    window.addEventListener('resize', updateOrientation);
    window.addEventListener('orientationchange', updateOrientation);

    return () => {
      window.removeEventListener('resize', updateOrientation);
      window.removeEventListener('orientationchange', updateOrientation);
    };
  }, []);

  return orientation;
}

// Ensure proper export
export { useIsMobile as default }
