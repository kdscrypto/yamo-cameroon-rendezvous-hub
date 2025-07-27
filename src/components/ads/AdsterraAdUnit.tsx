import React, { useEffect, useRef } from 'react';

interface AdsterraAdUnitProps {
  adKey: string;
  width: number;
  height: number;
  format?: 'banner' | 'iframe';
  className?: string;
  style?: React.CSSProperties;
}

const AdsterraAdUnit: React.FC<AdsterraAdUnitProps> = ({
  adKey,
  width,
  height,
  format = 'banner',
  className = '',
  style = {}
}) => {
  const adRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Ne pas initialiser les publicités en mode développement
    if (process.env.NODE_ENV === 'development') {
      console.log('AdsterraAdUnit: Mode développement - bannière non initialisée');
      return;
    }

    if (adRef.current && adKey) {
      console.log('AdsterraAdUnit: Initialisation de la bannière Adsterra', { adKey, width, height });
      
      // Configuration Adsterra
      const configScript = document.createElement('script');
      configScript.type = 'text/javascript';
      configScript.innerHTML = `
        atOptions = {
          'key' : '${adKey}',
          'format' : '${format}',
          'height' : ${height},
          'width' : ${width},
          'params' : {}
        };
      `;
      
      // Script d'invocation Adsterra
      const invokeScript = document.createElement('script');
      invokeScript.type = 'text/javascript';
      invokeScript.src = `//www.highperformanceformat.com/${adKey}/invoke.js`;
      
      adRef.current.appendChild(configScript);
      adRef.current.appendChild(invokeScript);
    }
  }, [adKey, width, height]);

  // Affichage de placeholder en mode développement
  if (process.env.NODE_ENV === 'development') {
    return (
      <div
        className={`bg-muted border-2 border-dashed border-muted-foreground/20 flex items-center justify-center ${className}`}
        style={{
          width: `${width}px`,
          height: `${height}px`,
          ...style
        }}
      >
        <div className="text-center">
          <div className="text-sm font-medium text-muted-foreground">
            Adsterra Banner
          </div>
          <div className="text-xs text-muted-foreground">
            {width}x{height} • {adKey}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Format: {format}
          </div>
        </div>
      </div>
    );
  }

  // Bannière Adsterra en production
  return (
    <div
      ref={adRef}
      className={`adsterra-banner ${className}`}
      style={{
        width: `${width}px`,
        height: `${height}px`,
        ...style
      }}
      data-ad-key={adKey}
      data-ad-format={format}
    />
  );
};

export default AdsterraAdUnit;