import React, { useEffect, useRef, useState } from 'react';
import { getAdsterraKey } from '@/utils/adsterraProductionConfig';

interface AdsterraBannerProps {
  placement: 'HEADER_BANNER' | 'SIDEBAR_RECTANGLE' | 'CONTENT_RECTANGLE' | 'FOOTER_BANNER' | 'MOBILE_BANNER';
  className?: string;
  width?: number;
  height?: number;
}

const AdsterraBannerContainer: React.FC<AdsterraBannerProps> = ({
  placement,
  className = '',
  width = 728,
  height = 90
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAdsterraBanner = async () => {
      try {
        if (!containerRef.current) return;

        const key = getAdsterraKey(placement);
        
        // Nettoyer le conteneur existant
        containerRef.current.innerHTML = '';
        
        // Créer l'élément script Adsterra
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.async = true;
        script.src = `https://www.highperformanceformat.com/js/${key}.js`;
        
        // Configuration des attributs Adsterra
        script.setAttribute('data-cfasync', 'false');
        
        // Gestion des événements
        script.onload = () => {
          setIsLoaded(true);
          setError(null);
          
          // Notifier le système de suivi
          if (window.adsterraLoaded) {
            window.adsterraLoaded(placement, key);
          }
        };
        
        script.onerror = () => {
          setError(`Impossible de charger la bannière ${placement}`);
          setIsLoaded(false);
        };
        
        // Timeout de sécurité
        const timeout = setTimeout(() => {
          if (!isLoaded) {
            setError(`Timeout lors du chargement de ${placement}`);
          }
        }, 5000);
        
        // Nettoyer le timeout si le script se charge
        script.addEventListener('load', () => clearTimeout(timeout));
        
        // Ajouter le script au conteneur
        containerRef.current.appendChild(script);
        
        // Ajouter un conteneur pour la bannière
        const bannerDiv = document.createElement('div');
        bannerDiv.className = 'adsterra-banner';
        bannerDiv.setAttribute('data-placement', placement);
        bannerDiv.setAttribute('data-key', key);
        bannerDiv.style.width = `${width}px`;
        bannerDiv.style.height = `${height}px`;
        bannerDiv.style.margin = '0 auto';
        bannerDiv.style.textAlign = 'center';
        
        containerRef.current.appendChild(bannerDiv);
        
      } catch (err) {
        setError(`Erreur lors de l'initialisation: ${err instanceof Error ? err.message : 'Inconnue'}`);
        setIsLoaded(false);
      }
    };

    loadAdsterraBanner();
    
    // Cleanup
    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [placement, width, height]);

  if (error) {
    return (
      <div 
        className={`adsterra-error border border-red-300 bg-red-50 p-4 rounded ${className}`}
        style={{ width: `${width}px`, height: `${height}px` }}
      >
        <div className="text-red-600 text-sm text-center">
          <p>Erreur Adsterra</p>
          <p className="text-xs mt-1">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`adsterra-container ${className}`}
      data-placement={placement}
      data-loaded={isLoaded}
      style={{ 
        minWidth: `${width}px`, 
        minHeight: `${height}px`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      {!isLoaded && (
        <div className="text-muted-foreground text-sm">
          Chargement bannière {placement}...
        </div>
      )}
    </div>
  );
};

// Déclaration globale pour le tracking
declare global {
  interface Window {
    adsterraLoaded?: (placement: string, key: string) => void;
  }
}

export default AdsterraBannerContainer;