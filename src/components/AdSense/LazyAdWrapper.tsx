
import React, { useState, useRef, useEffect } from 'react';

interface LazyAdWrapperProps {
  children: React.ReactNode;
  className?: string;
  rootMargin?: string;
  threshold?: number;
}

const LazyAdWrapper: React.FC<LazyAdWrapperProps> = ({
  children,
  className = '',
  rootMargin = '100px',
  threshold = 0.1
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const adRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        rootMargin,
        threshold
      }
    );

    if (adRef.current) {
      observer.observe(adRef.current);
    }

    return () => observer.disconnect();
  }, [isVisible, rootMargin, threshold]);

  return (
    <div ref={adRef} className={className}>
      {isVisible ? children : (
        <div className="w-full h-24 bg-muted/20 animate-pulse rounded flex items-center justify-center">
          <span className="text-muted-foreground text-sm">Chargement de la publicité...</span>
        </div>
      )}
    </div>
  );
};

export default LazyAdWrapper;
