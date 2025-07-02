
import { useMemo, useCallback, useRef, useEffect } from 'react';

// Hook pour la mémorisation intelligente basée sur les dépendances
export const useSmartMemo = <T>(
  factory: () => T,
  deps: React.DependencyList,
  shouldUpdate?: (prevDeps: React.DependencyList, nextDeps: React.DependencyList) => boolean
) => {
  const prevDepsRef = useRef<React.DependencyList>(deps);
  
  return useMemo(() => {
    if (shouldUpdate && !shouldUpdate(prevDepsRef.current, deps)) {
      return factory();
    }
    prevDepsRef.current = deps;
    return factory();
  }, deps);
};

// Hook pour le debouncing des fonctions
export const useDebounceCallback = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T => {
  const timeoutRef = useRef<NodeJS.Timeout>();
  
  return useCallback((...args: Parameters<T>) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      callback(...args);
    }, delay);
  }, [callback, delay]) as T;
};

// Hook pour la gestion des animations performantes
export const usePerformantAnimation = (
  isActive: boolean,
  duration: number = 300
) => {
  const elementRef = useRef<HTMLElement>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    if (!elementRef.current) return;

    const element = elementRef.current;
    
    if (isActive) {
      element.style.willChange = 'transform, opacity';
      element.classList.add('animate-fade-in');
    } else {
      element.classList.remove('animate-fade-in');
      
      // Cleanup après l'animation
      setTimeout(() => {
        element.style.willChange = 'auto';
      }, duration);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isActive, duration]);

  return elementRef;
};

// Hook pour l'intersection observer optimisé
export const useIntersectionObserver = (
  callback: (isIntersecting: boolean) => void,
  options: IntersectionObserverInit = {}
) => {
  const elementRef = useRef<HTMLElement>(null);
  const observerRef = useRef<IntersectionObserver>();

  useEffect(() => {
    if (!elementRef.current) return;

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        callback(entry.isIntersecting);
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
        ...options,
      }
    );

    observerRef.current.observe(elementRef.current);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [callback, options]);

  return elementRef;
};
