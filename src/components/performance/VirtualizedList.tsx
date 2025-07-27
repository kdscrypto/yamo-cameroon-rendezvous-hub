// Liste virtualisée pour optimiser l'affichage de grandes listes
import React, { useState, useEffect, useRef, useMemo, ReactNode } from 'react';
import { securityMonitor } from '@/utils/productionMonitoring';

interface VirtualizedListProps<T> {
  items: T[];
  height: number;
  itemHeight: number;
  renderItem: (item: T, index: number) => ReactNode;
  className?: string;
  overscan?: number;
  onScroll?: (scrollTop: number) => void;
  loadingItem?: ReactNode;
  emptyState?: ReactNode;
  gap?: number;
}

function VirtualizedList<T>({
  items,
  height,
  itemHeight,
  renderItem,
  className = '',
  overscan = 5,
  onScroll,
  loadingItem,
  emptyState,
  gap = 0
}: VirtualizedListProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout>();

  const effectiveItemHeight = itemHeight + gap;

  // Calculer les éléments visibles
  const visibleRange = useMemo(() => {
    const containerHeight = height;
    const startIndex = Math.max(0, Math.floor(scrollTop / effectiveItemHeight) - overscan);
    const endIndex = Math.min(
      items.length - 1,
      Math.ceil((scrollTop + containerHeight) / effectiveItemHeight) + overscan
    );

    return { startIndex, endIndex };
  }, [scrollTop, height, effectiveItemHeight, items.length, overscan]);

  // Calculer les éléments à rendre
  const visibleItems = useMemo(() => {
    const { startIndex, endIndex } = visibleRange;
    return items.slice(startIndex, endIndex + 1).map((item, index) => ({
      item,
      originalIndex: startIndex + index
    }));
  }, [items, visibleRange]);

  // Gestion du scroll
  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = event.currentTarget.scrollTop;
    setScrollTop(scrollTop);
    setIsScrolling(true);
    onScroll?.(scrollTop);

    // Arrêter l'indicateur de scroll après 150ms
    clearTimeout(scrollTimeoutRef.current);
    scrollTimeoutRef.current = setTimeout(() => {
      setIsScrolling(false);
    }, 150);

    // Logger les métriques de scroll
    securityMonitor.logPerformanceMetric({
      action: 'virtualized_scroll',
      duration: scrollTop,
      timestamp: Date.now(),
      success: true
    });
  };

  // Nettoyer les timeouts
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  // Logger les métriques de rendu
  useEffect(() => {
    securityMonitor.logPerformanceMetric({
      action: 'virtualized_render',
      duration: visibleItems.length,
      timestamp: Date.now(),
      success: true
    });
  }, [visibleItems.length]);

  if (items.length === 0 && emptyState) {
    return <div className={`virtualized-empty ${className}`}>{emptyState}</div>;
  }

  const totalHeight = items.length * effectiveItemHeight;
  const { startIndex } = visibleRange;
  const offsetY = startIndex * effectiveItemHeight;

  return (
    <div
      ref={containerRef}
      className={`virtualized-list overflow-auto ${className}`}
      style={{ height }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div
          style={{
            transform: `translateY(${offsetY}px)`,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
          }}
        >
          {visibleItems.map(({ item, originalIndex }) => (
            <div
              key={originalIndex}
              style={{ 
                height: itemHeight,
                marginBottom: gap
              }}
              className={isScrolling ? 'pointer-events-none' : ''}
            >
              {loadingItem && isScrolling ? loadingItem : renderItem(item, originalIndex)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Hook pour gérer la virtualisation avec pagination infinie
export const useVirtualizedInfiniteList = <T,>(
  items: T[],
  hasNextPage: boolean,
  fetchNextPage: () => void,
  threshold: number = 0.8
) => {
  const [loadingMore, setLoadingMore] = useState(false);

  const handleScroll = (scrollTop: number) => {
    // Calculer si on est proche du bas
    const container = document.querySelector('.virtualized-list');
    if (!container) return;

    const scrollHeight = container.scrollHeight;
    const clientHeight = container.clientHeight;
    const scrollPercentage = (scrollTop + clientHeight) / scrollHeight;

    // Charger plus d'éléments si on atteint le seuil
    if (scrollPercentage >= threshold && hasNextPage && !loadingMore) {
      setLoadingMore(true);
      fetchNextPage();
      
      // Reset loading state après un délai
      setTimeout(() => setLoadingMore(false), 1000);
    }
  };

  return {
    handleScroll,
    loadingMore
  };
};

// Component wrapper avec pagination infinie
export const VirtualizedInfiniteList = <T,>({
  items,
  hasNextPage,
  fetchNextPage,
  loadingIndicator,
  ...props
}: VirtualizedListProps<T> & {
  hasNextPage: boolean;
  fetchNextPage: () => void;
  loadingIndicator?: ReactNode;
}) => {
  const { handleScroll, loadingMore } = useVirtualizedInfiniteList(
    items,
    hasNextPage,
    fetchNextPage
  );

  return (
    <div className="virtualized-infinite-container">
      <VirtualizedList
        {...props}
        items={items}
        onScroll={handleScroll}
      />
      {loadingMore && loadingIndicator && (
        <div className="virtualized-loading p-4 text-center">
          {loadingIndicator}
        </div>
      )}
    </div>
  );
};

export default VirtualizedList;