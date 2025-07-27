// Container de lazy loading optimisé pour les performances
import React, { useState, useEffect, useRef, ReactNode } from 'react';
import { securityMonitor } from '@/utils/productionMonitoring';

interface LazyLoadContainerProps {
  children: ReactNode;
  height?: number | string;
  threshold?: number;
  rootMargin?: string;
  placeholder?: ReactNode;
  onLoad?: () => void;
  className?: string;
  fallback?: ReactNode;
}

const LazyLoadContainer: React.FC<LazyLoadContainerProps> = ({
  children,
  height = 200,
  threshold = 0.1,
  rootMargin = '50px',
  placeholder,
  onLoad,
  className = '',
  fallback
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Configuration de l'Intersection Observer
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !hasLoaded) {
          setIsVisible(true);
          setHasLoaded(true);
          onLoad?.();
          
          // Logger l'événement de chargement lazy
          securityMonitor.logPerformanceMetric({
            action: 'lazy_load_triggered',
            duration: 0,
            timestamp: Date.now(),
            success: true
          });

          // Déconnecter l'observer après le chargement
          if (observerRef.current) {
            observerRef.current.unobserve(container);
          }
        }
      },
      {
        threshold,
        rootMargin
      }
    );

    observerRef.current.observe(container);

    return () => {
      if (observerRef.current && container) {
        observerRef.current.unobserve(container);
      }
    };
  }, [threshold, rootMargin, hasLoaded, onLoad]);

  // Placeholder par défaut avec skeleton loading
  const defaultPlaceholder = (
    <div 
      className="animate-pulse bg-muted rounded-lg"
      style={{ height: typeof height === 'number' ? `${height}px` : height }}
    >
      <div className="h-full w-full bg-gradient-to-r from-muted via-muted/50 to-muted animate-shimmer"></div>
    </div>
  );

  return (
    <div
      ref={containerRef}
      className={`lazy-load-container ${className}`}
      style={{ 
        minHeight: typeof height === 'number' ? `${height}px` : height 
      }}
    >
      {!isVisible ? (
        placeholder || defaultPlaceholder
      ) : (
        <div className="animate-fade-in">
          {children}
        </div>
      )}
    </div>
  );
};

// Hook pour utiliser le lazy loading avec gestion d'erreur
export const useLazyLoad = (dependencies: any[] = []) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const handleLoad = () => {
    setIsLoaded(true);
    setHasError(false);
  };

  const handleError = (error: Error) => {
    console.error('Lazy load error:', error);
    setHasError(true);
    
    securityMonitor.logSecurityEvent({
      type: 'general_error',
      severity: 'low',
      data: {
        error: error.message,
        retryCount,
        context: 'lazy_loading'
      }
    });
  };

  const retry = () => {
    setRetryCount(prev => prev + 1);
    setHasError(false);
    setIsLoaded(false);
  };

  // Reset quand les dépendances changent
  useEffect(() => {
    setIsLoaded(false);
    setHasError(false);
    setRetryCount(0);
  }, dependencies);

  return {
    isLoaded,
    hasError,
    retryCount,
    handleLoad,
    handleError,
    retry
  };
};

// Component wrapper pour lazy loading avec retry
export const LazyLoadWithRetry: React.FC<LazyLoadContainerProps & {
  maxRetries?: number;
  retryDelay?: number;
}> = ({ 
  children, 
  maxRetries = 3, 
  retryDelay = 2000,
  fallback,
  ...props 
}) => {
  const { isLoaded, hasError, retryCount, handleLoad, handleError, retry } = useLazyLoad();

  // Auto-retry avec délai
  useEffect(() => {
    if (hasError && retryCount < maxRetries) {
      const timeout = setTimeout(retry, retryDelay);
      return () => clearTimeout(timeout);
    }
  }, [hasError, retryCount, maxRetries, retryDelay, retry]);

  if (hasError && retryCount >= maxRetries) {
    return (
      <div className="lazy-load-error p-4 text-center">
        {fallback || (
          <div className="space-y-2">
            <p className="text-muted-foreground">Erreur de chargement</p>
            <button 
              onClick={retry}
              className="text-sm text-primary hover:underline"
            >
              Réessayer
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <LazyLoadContainer 
      {...props}
      onLoad={() => {
        handleLoad();
        props.onLoad?.();
      }}
    >
      {children}
    </LazyLoadContainer>
  );
};

export default LazyLoadContainer;