
import React from 'react';
import AdsterraAdUnit from './AdsterraAdUnit';
import { getAdsterraBanner, ADSTERRA_CONFIG } from '@/config/adsterraConfig';

interface AdBannerProps {
  placement: 'header' | 'footer' | 'sidebar' | 'content';
  className?: string;
}

const AdBanner: React.FC<AdBannerProps> = ({ placement, className = '' }) => {
  const getAdConfig = () => {
    switch (placement) {
      case 'header':
        const headerBanner = getAdsterraBanner('HEADER_BANNER');
        return {
          banner: headerBanner,
          className: 'w-full max-w-4xl mx-auto my-4'
        };
      case 'sidebar':
        const sidebarBanner = getAdsterraBanner('SIDEBAR_RECTANGLE');
        return {
          banner: sidebarBanner,
          className: 'w-full max-w-xs'
        };
      case 'content':
        const contentBanner = getAdsterraBanner('CONTENT_RECTANGLE');
        return {
          banner: contentBanner,
          className: 'w-full max-w-md mx-auto my-6'
        };
      case 'footer':
        const footerBanner = getAdsterraBanner('FOOTER_BANNER');
        return {
          banner: footerBanner,
          className: 'w-full max-w-4xl mx-auto my-4'
        };
      default:
        const defaultBanner = getAdsterraBanner('HEADER_BANNER');
        return {
          banner: defaultBanner,
          className: 'w-full'
        };
    }
  };

  const config = getAdConfig();

  return (
    <div className={`ad-banner ${className}`}>
      <AdsterraAdUnit
        adKey={config.banner.key}
        width={config.banner.width}
        height={config.banner.height}
        format={config.banner.format as 'banner' | 'iframe'}
        className={config.className}
      />
    </div>
  );
};

export default AdBanner;
