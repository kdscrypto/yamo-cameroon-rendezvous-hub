
import React from 'react';
import GoogleAdUnit from './GoogleAdUnit';
import { getAdSlot, ADS_CONFIG } from '@/config/adsConfig';

interface AdBannerProps {
  placement: 'header' | 'footer' | 'sidebar' | 'content';
  className?: string;
}

const AdBanner: React.FC<AdBannerProps> = ({ placement, className = '' }) => {
  const getAdConfig = () => {
    switch (placement) {
      case 'header':
        return {
          adSlot: getAdSlot('HEADER_BANNER'),
          adFormat: 'horizontal' as const,
          className: 'w-full max-w-4xl mx-auto my-4'
        };
      case 'sidebar':
        return {
          adSlot: getAdSlot('SIDEBAR_RECTANGLE'),
          adFormat: 'vertical' as const,
          className: 'w-full max-w-xs'
        };
      case 'content':
        return {
          adSlot: getAdSlot('CONTENT_RECTANGLE'),
          adFormat: 'rectangle' as const,
          className: 'w-full max-w-md mx-auto my-6'
        };
      case 'footer':
        return {
          adSlot: getAdSlot('FOOTER_BANNER'),
          adFormat: 'horizontal' as const,
          className: 'w-full max-w-4xl mx-auto my-4'
        };
      default:
        return {
          adSlot: getAdSlot('HEADER_BANNER'),
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
        fullWidthResponsive={ADS_CONFIG.SETTINGS.FULL_WIDTH_RESPONSIVE}
      />
    </div>
  );
};

export default AdBanner;
