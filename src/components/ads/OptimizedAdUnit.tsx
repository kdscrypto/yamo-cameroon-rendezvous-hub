import React, { useEffect, useRef, useState, useCallback } from 'react';
import { shouldShowAdsInDev, ADSTERRA_CONFIG } from '@/config/adsterraConfig';
import { useAdPerformanceMonitoring } from '@/hooks/useAdPerformanceMonitoring';

interface OptimizedAdUnitProps {
  adKey: string;
  width: number;
  height: number;
  format?: 'banner' | 'iframe';
  className?: string;
  style?: React.CSSProperties;
  lazy?: boolean;
  onError?: (error: Error) => void;
  onLoad?: () => void;
}

interface AdLoadingState {
  loading: boolean;
  loaded: boolean;
  error: string | null;
  retryCount: number;
}

const OptimizedAdUnit: React.FC<OptimizedAdUnitProps> = ({
  adKey,
  width,
  height,
  format = 'banner',
  className = '',
  style = {},
  lazy = true,
  onError,
  onLoad
}) => {
  const { recordLoadEvent } = useAdPerformanceMonitoring();
  const adRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const [loadingState, setLoadingState] = useState<AdLoadingState>({
    loading: false,
    loaded: false,
    error: null,
    retryCount: 0
  });
  
  const [isVisible, setIsVisible] = useState(!lazy);

  const loadAd = useCallback(async () => {
    // Ne pas charger en mode développement sauf si autorisé
    if (process.env.NODE_ENV === 'development' && !shouldShowAdsInDev()) {
      console.log('OptimizedAdUnit: Mode développement - bannière non initialisée');
      return;
    }

    // Vérifier si la clé est valide
    if (adKey.includes('REMPLACEZ_PAR_VOTRE_CLE_ADSTERRA')) {
      const error = new Error('Clé Adsterra placeholder détectée');
      setLoadingState(prev => ({ ...prev, error: error.message, loading: false }));
      onError?.(error);
      return;
    }

    if (!adRef.current || loadingState.loaded) return;

    setLoadingState(prev => ({ ...prev, loading: true, error: null }));
    const startTime = performance.now();

    try {
      // Délai configuré avant le chargement
      await new Promise(resolve => setTimeout(resolve, ADSTERRA_CONFIG.SETTINGS.LOAD_DELAY));

      console.log('OptimizedAdUnit: Chargement de la bannière Adsterra avec délai', { 
        adKey, 
        width, 
        height,
        delay: ADSTERRA_CONFIG.SETTINGS.LOAD_DELAY 
      });
      
      // Nettoyer le conteneur
      adRef.current.innerHTML = '';
      
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
      
      // Script d'invocation Adsterra avec gestion d'erreur
      const invokeScript = document.createElement('script');
      invokeScript.type = 'text/javascript';
      invokeScript.src = `//www.highperformanceformat.com/${adKey}/invoke.js`;
      
      // Timeout pour détecter les échecs de chargement
      loadTimeoutRef.current = setTimeout(() => {
        if (!loadingState.loaded) {
          const error = new Error('Timeout de chargement de la bannière Adsterra');
          setLoadingState(prev => ({ 
            ...prev, 
            error: error.message, 
            loading: false 
          }));
          onError?.(error);
        }
      }, 10000); // 10 secondes timeout
      
      // Événements de chargement
      invokeScript.onload = () => {
        const loadTime = performance.now() - startTime;
        console.log('OptimizedAdUnit: Script Adsterra chargé avec succès');
        if (loadTimeoutRef.current) {
          clearTimeout(loadTimeoutRef.current);
        }
        setLoadingState(prev => ({ 
          ...prev, 
          loading: false, 
          loaded: true 
        }));
        recordLoadEvent(adKey, loadTime, true);
        onLoad?.();
      };
      
      invokeScript.onerror = (error) => {
        const loadTime = performance.now() - startTime;
        console.error('OptimizedAdUnit: Erreur de chargement du script Adsterra:', error);
        if (loadTimeoutRef.current) {
          clearTimeout(loadTimeoutRef.current);
        }
        const errorObj = new Error('Erreur de chargement du script Adsterra');
        setLoadingState(prev => ({ 
          ...prev, 
          error: errorObj.message, 
          loading: false,
          retryCount: prev.retryCount + 1
        }));
        recordLoadEvent(adKey, loadTime, false, errorObj.message);
        onError?.(errorObj);
      };
      
      adRef.current.appendChild(configScript);
      adRef.current.appendChild(invokeScript);
      
    } catch (error) {
      console.error('OptimizedAdUnit: Erreur lors du chargement:', error);
      const errorObj = error instanceof Error ? error : new Error('Erreur inconnue');
      setLoadingState(prev => ({ 
        ...prev, 
        error: errorObj.message, 
        loading: false,
        retryCount: prev.retryCount + 1
      }));
      onError?.(errorObj);
    }
  }, [adKey, width, height, format, loadingState.loaded, onError, onLoad]);

  // Lazy loading avec Intersection Observer
  useEffect(() => {
    if (!lazy || isVisible) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setIsVisible(true);
          observerRef.current?.disconnect();
        }
      },
      {
        rootMargin: '100px' // Charger 100px avant que l'élément soit visible
      }
    );

    if (adRef.current) {
      observerRef.current.observe(adRef.current);
    }

    return () => {
      observerRef.current?.disconnect();
    };
  }, [lazy, isVisible]);

  // Charger la publicité quand elle devient visible
  useEffect(() => {
    if (isVisible && !loadingState.loaded && !loadingState.loading) {
      loadAd();
    }
  }, [isVisible, loadAd, loadingState.loaded, loadingState.loading]);

  // Fonction de retry
  const retryLoad = useCallback(() => {
    if (loadingState.retryCount < 3) {
      console.log(`OptimizedAdUnit: Tentative de rechargement ${loadingState.retryCount + 1}/3`);
      setLoadingState(prev => ({ 
        ...prev, 
        loading: false, 
        loaded: false, 
        error: null 
      }));
      setTimeout(() => loadAd(), 1000);
    }
  }, [loadingState.retryCount, loadAd]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (loadTimeoutRef.current) {
        clearTimeout(loadTimeoutRef.current);
      }
      observerRef.current?.disconnect();
    };
  }, []);

  // Affichage de placeholder en mode développement (sauf si test activé)
  if (process.env.NODE_ENV === 'development' && !shouldShowAdsInDev()) {
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
            Adsterra Banner (Optimisé)
          </div>
          <div className="text-xs text-muted-foreground">
            {width}x{height} • {format}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Lazy: {lazy ? 'Oui' : 'Non'}
          </div>
        </div>
      </div>
    );
  }

  // Affichage en cas d'erreur avec option de retry
  if (loadingState.error) {
    return (
      <div
        className={`bg-red-50 border-2 border-red-200 flex flex-col items-center justify-center p-2 ${className}`}
        style={{
          width: `${width}px`,
          height: `${height}px`,
          ...style
        }}
      >
        <div className="text-center">
          <div className="text-xs font-medium text-red-600 mb-2">
            Erreur de chargement
          </div>
          <div className="text-xs text-red-500 mb-2">
            {loadingState.error}
          </div>
          {loadingState.retryCount < 3 && (
            <button
              onClick={retryLoad}
              className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
            >
              Réessayer ({loadingState.retryCount}/3)
            </button>
          )}
        </div>
      </div>
    );
  }

  // Affichage en cours de chargement
  if (loadingState.loading) {
    return (
      <div
        className={`bg-muted border border-border flex items-center justify-center ${className}`}
        style={{
          width: `${width}px`,
          height: `${height}px`,
          ...style
        }}
      >
        <div className="text-center">
          <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <div className="text-xs text-muted-foreground">
            Chargement...
          </div>
        </div>
      </div>
    );
  }

  // Bannière Adsterra optimisée
  return (
    <div
      ref={adRef}
      className={`adsterra-banner optimized-ad ${className}`}
      style={{
        width: `${width}px`,
        height: `${height}px`,
        ...style
      }}
      data-ad-key={adKey}
      data-ad-format={format}
      data-lazy={lazy}
      data-loading-state={JSON.stringify(loadingState)}
    />
  );
};

export default OptimizedAdUnit;