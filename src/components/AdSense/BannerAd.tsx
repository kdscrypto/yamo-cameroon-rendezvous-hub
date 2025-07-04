
import React from 'react';
import AdSenseUnit from './AdSenseUnit';

interface BannerAdProps {
  adSlot: string;
  className?: string;
}

const BannerAd: React.FC<BannerAdProps> = ({ adSlot, className = '' }) => {
  return (
    <div className={`adsense-banner ${className}`}>
      <AdSenseUnit
        adSlot={adSlot}
        adFormat="horizontal"
        style={{ width: '100%', height: '90px' }}
        className="w-full"
      />
    </div>
  );
};

export default BannerAd;
