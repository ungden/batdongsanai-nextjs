import AdSenseAd from './AdSenseAd';

interface BannerAdProps {
  adClient: string;
  adSlot: string;
  className?: string;
}

const BannerAd = ({ adClient, adSlot, className }: BannerAdProps) => {
  return (
    <div className={`banner-ad relative z-30 my-2 ${className || ''}`}>
      <div className="text-center text-[11px] text-muted-foreground mb-1">
        Quảng cáo
      </div>
      <AdSenseAd
        adClient={adClient}
        adSlot={adSlot}
        adFormat="auto"
        className="w-full"
        adStyle={{
          display: 'block',
          width: '100%',
          height: 'auto'
        }}
      />
    </div>
  );
};

export default BannerAd;