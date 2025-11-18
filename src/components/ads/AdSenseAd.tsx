
import { useEffect, useRef } from 'react';

interface AdSenseAdProps {
  adClient: string;
  adSlot: string;
  adFormat?: string;
  adStyle?: React.CSSProperties;
  className?: string;
  responsive?: boolean;
}

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

const AdSenseAd = ({ 
  adClient, 
  adSlot, 
  adFormat = "auto",
  adStyle = { display: 'block' },
  className = "",
  responsive = true
}: AdSenseAdProps) => {
  const adRef = useRef<HTMLDivElement>(null);
  const isAdLoaded = useRef(false);

  useEffect(() => {
    if (!adClient || !adSlot) return;

    // Load AdSense script if not already loaded
    if (!document.querySelector(`script[src*="pagead2.googlesyndication.com"]`)) {
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adClient}`;
      script.crossOrigin = "anonymous";
      document.head.appendChild(script);
    }

    // Initialize ads
    const timer = setTimeout(() => {
      if (!isAdLoaded.current) {
        try {
          (window.adsbygoogle = window.adsbygoogle || []).push({});
          isAdLoaded.current = true;
        } catch (error) {
          console.error('AdSense error:', error);
        }
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [adClient, adSlot]);

  if (!adClient || !adSlot) {
    return null;
  }

  return (
    <div className={`adsense-container ${className}`} ref={adRef}>
      <ins
        className="adsbygoogle"
        style={adStyle}
        data-ad-client={adClient}
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive={responsive.toString()}
      />
    </div>
  );
};

export default AdSenseAd;
