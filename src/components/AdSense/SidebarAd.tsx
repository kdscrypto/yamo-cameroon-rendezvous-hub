
import React from 'react';
import AdSenseUnit from './AdSenseUnit';

interface SidebarAdProps {
  adSlot: string;
  className?: string;
}

const SidebarAd: React.FC<SidebarAdProps> = ({ adSlot, className = '' }) => {
  return (
    <div className={`adsense-sidebar ${className}`}>
      <AdSenseUnit
        adSlot={adSlot}
        adFormat="vertical"
        style={{ width: '160px', height: '600px' }}
        className="mx-auto"
      />
    </div>
  );
};

export default SidebarAd;
