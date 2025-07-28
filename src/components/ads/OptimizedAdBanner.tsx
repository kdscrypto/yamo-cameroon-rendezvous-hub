import React, { useState, useCallback } from 'react';
import OptimizedAdUnit from './OptimizedAdUnit';
import { getAdsterraBanner } from '@/config/adsterraConfig';
import { toast } from 'sonner';

interface OptimizedAdBannerProps {
  placement: 'header' | 'footer' | 'sidebar' | 'content';
  className?: string;
  lazy?: boolean;
  showErrorToast?: boolean;
}

const OptimizedAdBanner: React.FC<OptimizedAdBannerProps> = ({ 
  placement, 
  className = '',
  lazy = true,
  showErrorToast = false
}) => {
  const [loadingErrors, setLoadingErrors] = useState<string[]>([]);

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

  const handleAdError = useCallback((error: Error) => {
    console.error(`OptimizedAdBanner [${placement}]: Erreur de chargement`, error);
    
    setLoadingErrors(prev => [...prev, error.message]);
    
    if (showErrorToast) {
      toast.error(`Erreur de chargement de la publicité ${placement}`, {
        description: error.message
      });
    }
  }, [placement, showErrorToast]);

  const handleAdLoad = useCallback(() => {
    console.log(`OptimizedAdBanner [${placement}]: Chargement réussi`);
    
    // Nettoyer les erreurs précédentes en cas de succès
    setLoadingErrors([]);
    
    if (showErrorToast && loadingErrors.length > 0) {
      toast.success(`Publicité ${placement} chargée avec succès`);
    }
  }, [placement, showErrorToast, loadingErrors.length]);

  const config = getAdConfig();

  return (
    <div className={`optimized-ad-banner ${className}`}>
      <OptimizedAdUnit
        adKey={config.banner.key}
        width={config.banner.width}
        height={config.banner.height}
        format={config.banner.format as 'banner' | 'iframe'}
        className={config.className}
        lazy={lazy}
        onError={handleAdError}
        onLoad={handleAdLoad}
      />
      
      {/* Affichage des erreurs en mode développement */}
      {process.env.NODE_ENV === 'development' && loadingErrors.length > 0 && (
        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-600">
          <div className="font-medium">Erreurs de chargement ({loadingErrors.length}):</div>
          {loadingErrors.slice(-3).map((error, index) => (
            <div key={index} className="mt-1">• {error}</div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OptimizedAdBanner;