
import React from 'react';
import AdSenseUnit from './AdSenseUnit';

interface LeaderboardAdProps {
  adSlot: string;
  className?: string;
}

const LeaderboardAd: React.FC<LeaderboardAdProps> = ({ adSlot, className = '' }) => {
  return (
    <div className={`adsense-leaderboard ${className}`}>
      <AdSenseUnit
        adSlot={adSlot}
        adFormat="horizontal"
        style={{ 
          width: '728px', 
          height: '90px',
          maxWidth: '100%'
        }}
        className="mx-auto"
      />
    </div>
  );
};

export default LeaderboardAd;
