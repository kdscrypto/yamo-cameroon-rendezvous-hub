
import React from 'react';
import AdSenseUnit from './AdSenseUnit';

interface RectangleAdProps {
  adSlot: string;
  className?: string;
}

const RectangleAd: React.FC<RectangleAdProps> = ({ adSlot, className = '' }) => {
  return (
    <div className={`adsense-rectangle ${className}`}>
      <AdSenseUnit
        adSlot={adSlot}
        adFormat="rectangle"
        style={{ width: '300px', height: '250px' }}
        className="mx-auto"
      />
    </div>
  );
};

export default RectangleAd;
