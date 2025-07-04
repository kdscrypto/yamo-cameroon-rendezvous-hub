
import React, { useEffect, useRef } from 'react';

interface AdSenseUnitProps {
  adSlot: string;
  adFormat?: 'auto' | 'rectangle' | 'horizontal' | 'vertical';
  adLayoutKey?: string;
  className?: string;
  style?: React.CSSProperties;
  responsive?: boolean;
}

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

const AdSenseUnit: React.FC<AdSenseUnitProps> = ({
  adSlot,
  adFormat = 'auto',
  adLayoutKey,
  className = '',
  style = {},
  responsive = true
}) => {
  const adRef = useRef<HTMLDivElement>(null);
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    
    try {
      if (typeof window !== 'undefined') {
        // Initialize adsbygoogle if not already done
        window.adsbygoogle = window.adsbygoogle || [];
        
        // Push the ad configuration
        window.adsbygoogle.push({});
        hasRun.current = true;
      }
    } catch (error) {
      console.error('AdSense error:', error);
    }
  }, []);

  // Build the ins element props
  const insProps: any = {
    className: 'adsbygoogle',
    style: {
      display: 'block',
      ...style
    },
    'data-ad-client': 'ca-pub-XXXXXXXXXXXXXXXXX', // Replace with your actual publisher ID
    'data-ad-slot': adSlot,
    'data-ad-format': adFormat,
  };

  if (adLayoutKey) {
    insProps['data-ad-layout-key'] = adLayoutKey;
  }

  if (responsive) {
    insProps['data-full-width-responsive'] = 'true';
  }

  return (
    <div ref={adRef} className={`adsense-container ${className}`}>
      <ins {...insProps} />
    </div>
  );
};

export default AdSenseUnit;
