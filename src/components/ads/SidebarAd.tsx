
import AdSenseAd from './AdSenseAd';

interface SidebarAdProps {
  adClient: string;
  adSlot: string;
  className?: string;
}

const SidebarAd = ({ adClient, adSlot, className }: SidebarAdProps) => {
  return (
    <div className={`sidebar-ad ${className}`}>
      <div className="text-center text-xs text-muted-foreground mb-2">
        Quảng cáo
      </div>
      <AdSenseAd
        adClient={adClient}
        adSlot={adSlot}
        adFormat="auto"
        className="w-full"
        adStyle={{
          display: 'block',
          width: '300px',
          height: '250px'
        }}
      />
    </div>
  );
};

export default SidebarAd;
