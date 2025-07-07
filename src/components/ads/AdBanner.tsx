
import React from 'react';
import GoogleAdUnit from './GoogleAdUnit';

interface AdBannerProps {
  placement: 'header' | 'footer' | 'sidebar' | 'content';
  className?: string;
}

const AdBanner: React.FC<AdBannerProps> = ({ placement, className = '' }) => {
  const getAdConfig = () => {
    switch (placement) {
      case 'header':
        return {
          adSlot: '1234567890', // Replace with your actual ad slot
          adFormat: 'horizontal' as const,
          className: 'w-full max-w-4xl mx-auto my-4'
        };
      case 'sidebar':
        return {
          adSlot: '2345678901', // Replace with your actual ad slot
          adFormat: 'vertical' as const,
          className: 'w-full max-w-xs'
        };
      case 'content':
        return {
          adSlot: '3456789012', // Replace with your actual ad slot
          adFormat: 'rectangle' as const,
          className: 'w-full max-w-md mx-auto my-6'
        };
      case 'footer':
        return {
          adSlot: '4567890123', // Replace with your actual ad slot
          adFormat: 'horizontal' as const,
          className: 'w-full max-w-4xl mx-auto my-4'
        };
      default:
        return {
          adSlot: '1234567890',
          adFormat: 'auto' as const,
          className: 'w-full'
        };
    }
  };

  const config = getAdConfig();

  return (
    <div className={`ad-banner ${className}`}>
      <GoogleAdUnit
        adSlot={config.adSlot}
        adFormat={config.adFormat}
        className={config.className}
      />
    </div>
  );
};

export default AdBanner;
