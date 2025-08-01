// src/components/AdsterraBanner.tsx
import React, { useEffect, useRef } from 'react';
import { AdsterraAdSlots, AdSlotType } from '@/config/adsterra';

type AdsterraBannerProps = {
  slot: AdSlotType; // On passe maintenant un "slot" au lieu des détails
};

const AdsterraBanner: React.FC<AdsterraBannerProps> = ({ slot }) => {
  const bannerRef = useRef<HTMLDivElement>(null);
  const adDetails = AdsterraAdSlots[slot];

  useEffect(() => {
    // Si les détails de la pub n'existent pas ou si la clé est un placeholder, on arrête.
    if (!adDetails || adDetails.key.startsWith('REMPLACEZ_MOI')) {
        console.warn(`Adsterra: Clé non configurée pour le slot ${slot}`);
        return;
    }

    if (!bannerRef.current || bannerRef.current.children.length > 0) {
      return;
    }
    
    const { key: adKey, width, height } = adDetails;

    const configScript = document.createElement('script');
    configScript.type = 'text/javascript';
    configScript.innerHTML = `atOptions = {'key' : '${adKey}', 'format' : 'iframe', 'height' : ${height}, 'width' : ${width}, 'params' : {}};`;

    const invokeScript = document.createElement('script');
    invokeScript.type = 'text/javascript';
    invokeScript.src = `//www.highperformanceformat.com/${adKey}/invoke.js`;
    invokeScript.async = true;

    bannerRef.current.appendChild(configScript);
    bannerRef.current.appendChild(invokeScript);

  }, [slot, adDetails]);

  if (!adDetails || adDetails.key.startsWith('REMPLACEZ_MOI')) {
    // N'affiche rien si la clé n'est pas configurée pour éviter les erreurs.
    return null;
  }
  
  return (
    <div 
      ref={bannerRef} 
      className="adsterra-banner-container"
      style={{ 
        width: `${adDetails.width}px`, 
        height: `${adDetails.height}px`, 
        minWidth: `${adDetails.width}px`,
        minHeight: `${adDetails.height}px`,
        maxWidth: `${adDetails.width}px`,
        maxHeight: `${adDetails.height}px`,
        display: 'block',
        overflow: 'hidden',
        position: 'relative',
        backgroundColor: '#f8f9fa',
        border: '1px solid #e9ecef'
      }}
      data-slot={slot}
      data-dimensions={`${adDetails.width}x${adDetails.height}`}
    />
  );
};

export default AdsterraBanner;