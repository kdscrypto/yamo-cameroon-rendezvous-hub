import React, { useEffect, useRef } from 'react';
import { getAdsterraKey, type AdsterraProductionKeys } from '@/utils/adsterraProductionConfig';

interface AdsterraProductionBannerProps {
  placement: keyof AdsterraProductionKeys;
  width: number;
  height: number;
  className?: string;
}

const AdsterraProductionBanner: React.FC<AdsterraProductionBannerProps> = ({
  placement,
  width,
  height,
  className = ''
}) => {
  const bannerRef = useRef<HTMLDivElement>(null);
  const adKey = getAdsterraKey(placement);

  useEffect(() => {
    if (!bannerRef.current || !adKey) return;

    console.log(`AdsterraProductionBanner: Initialisation ${placement}`, { adKey, width, height });

    // Créer le script Adsterra
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = `https://www.highperformanceformat.com/js/${adKey}.js`;
    script.async = true;
    script.setAttribute('data-placement', placement);
    script.setAttribute('data-fresh', 'true');

    // Ajouter l'attribut de suivi pour le diagnostic
    bannerRef.current.setAttribute('data-placement', placement);
    bannerRef.current.setAttribute('data-adsterra-key', adKey);
    bannerRef.current.classList.add('adsterra-banner');

    // Gestionnaire d'événements pour le succès
    script.onload = () => {
      console.log(`AdsterraProductionBanner: Script chargé avec succès pour ${placement}`);
      bannerRef.current?.setAttribute('data-status', 'loaded');
    };

    // Gestionnaire d'événements pour les erreurs
    script.onerror = (error) => {
      console.error(`AdsterraProductionBanner: Erreur de chargement pour ${placement}`, error);
      bannerRef.current?.setAttribute('data-status', 'error');
    };

    // Ajouter le script au DOM
    document.head.appendChild(script);

    // Cleanup
    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, [adKey, placement, width, height]);

  return (
    <div
      ref={bannerRef}
      className={`adsterra-banner ad-wrapper ${className}`}
      data-placement={placement}
      style={{
        width: `${width}px`,
        height: `${height}px`,
        minWidth: `${width}px`,
        minHeight: `${height}px`,
        border: '1px dashed #ccc',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f8f9fa',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <div className="text-xs text-gray-500 text-center p-2">
        <div>Bannière Adsterra {placement}</div>
        <div>{width}x{height}</div>
        <div className="font-mono text-xs">{adKey.substring(0, 8)}...</div>
      </div>
    </div>
  );
};

export default AdsterraProductionBanner;