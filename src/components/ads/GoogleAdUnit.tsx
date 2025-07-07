
import React, { useEffect, useRef } from 'react';

interface GoogleAdUnitProps {
  adSlot: string;
  adFormat?: 'auto' | 'rectangle' | 'horizontal' | 'vertical';
  fullWidthResponsive?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

const GoogleAdUnit: React.FC<GoogleAdUnitProps> = ({
  adSlot,
  adFormat = 'auto',
  fullWidthResponsive = true,
  className = '',
  style = {}
}) => {
  const adRef = useRef<HTMLModElement>(null);

  useEffect(() => {
    try {
      // Vérifier si nous sommes dans un environnement de développement
      if (process.env.NODE_ENV === 'development') {
        console.log('GoogleAdUnit: Mode développement - publicités simulées');
        return;
      }

      // Vérifier si AdSense est disponible
      if (typeof window !== 'undefined' && window.adsbygoogle) {
        console.log('GoogleAdUnit: Initialisation de la publicité pour slot:', adSlot);
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } else {
        console.warn('GoogleAdUnit: AdSense script non chargé');
      }
    } catch (error) {
      console.error('GoogleAdUnit: Erreur lors de l\'initialisation:', error);
    }
  }, [adSlot]);

  // En mode développement, afficher un placeholder
  if (process.env.NODE_ENV === 'development') {
    return (
      <div className={`ad-container ${className}`} style={style}>
        <div 
          className="border-2 border-dashed border-gray-300 bg-gray-50 p-4 text-center text-gray-500 min-h-[250px] flex items-center justify-center"
          style={style}
        >
          <div>
            <div className="font-semibold mb-2">Publicité Google (Mode Dev)</div>
            <div className="text-sm">Slot: {adSlot}</div>
            <div className="text-sm">Format: {adFormat}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`ad-container ${className}`} style={style}>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: 'block', ...style }}
        data-ad-client="ca-pub-YOUR_PUBLISHER_ID"
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive={fullWidthResponsive.toString()}
      />
    </div>
  );
};

export default GoogleAdUnit;
