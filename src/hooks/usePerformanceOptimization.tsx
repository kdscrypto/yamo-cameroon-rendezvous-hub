// Hook global d'optimisation des performances
import { useEffect, useCallback, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { performanceCache, useCacheMetrics } from '@/utils/performanceCache';
import { QueryOptimizations, queryPerformanceMonitor } from '@/utils/queryOptimization';
import { securityMonitor } from '@/utils/productionMonitoring';

interface PerformanceMetrics {
  cacheMetrics: ReturnType<typeof useCacheMetrics>;
  queryMetrics: ReturnType<typeof queryPerformanceMonitor.getMetrics>;
  slowQueries: ReturnType<typeof queryPerformanceMonitor.getSlowQueries>;
  memoryUsage?: any; // Utiliser any au lieu de MemoryInfo pour la compatibilité
}

export const usePerformanceOptimization = () => {
  const queryClient = useQueryClient();
  const cacheMetrics = useCacheMetrics();

  // Précharger les données critiques au démarrage
  const preloadCriticalData = useCallback(async () => {
    try {
      await QueryOptimizations.preloadCriticalData(queryClient);
      securityMonitor.logPerformanceMetric({
        action: 'preload_critical_data',
        duration: 0,
        timestamp: Date.now(),
        success: true
      });
    } catch (error) {
      console.error('Failed to preload critical data:', error);
      securityMonitor.logPerformanceMetric({
        action: 'preload_critical_data',
        duration: 0,
        timestamp: Date.now(),
        success: false
      });
    }
  }, [queryClient]);

  // Optimiser la gestion mémoire
  const optimizeMemory = useCallback(() => {
    // Nettoyer le cache React Query s'il devient trop volumineux
    const cacheData = queryClient.getQueryCache().getAll();
    if (cacheData.length > 500) {
      queryClient.getQueryCache().clear();
      securityMonitor.logPerformanceMetric({
        action: 'query_cache_cleanup',
        duration: cacheData.length,
        timestamp: Date.now(),
        success: true
      });
    }

    // Forcer le garbage collection si disponible
    if ('gc' in window && typeof window.gc === 'function') {
      window.gc();
    }
  }, [queryClient]);

  // Surveiller les performances
  const monitorPerformance = useCallback(() => {
    // Métriques mémoire
    const memoryInfo = (performance as any).memory;
    if (memoryInfo) {
      const usedMemoryMB = memoryInfo.usedJSHeapSize / (1024 * 1024);
      const totalMemoryMB = memoryInfo.totalJSHeapSize / (1024 * 1024);
      const memoryUsagePercent = (usedMemoryMB / totalMemoryMB) * 100;

      if (memoryUsagePercent > 80) {
        console.warn('High memory usage detected:', memoryUsagePercent.toFixed(2) + '%');
        optimizeMemory();
      }
    }

    // Vérifier les requêtes lentes
    const slowQueries = queryPerformanceMonitor.getSlowQueries(1500);
    if (slowQueries.length > 0) {
      console.warn('Slow queries detected:', slowQueries);
      securityMonitor.logSecurityEvent({
        type: 'general_error',
        severity: 'medium',
        data: {
          slowQueries: slowQueries.slice(0, 5),
          message: 'Performance degradation detected'
        }
      });
    }
  }, [optimizeMemory]);

  // Optimisation automatique des requêtes
  const optimizeQueries = useCallback(() => {
    // Invalider intelligemment les requêtes obsolètes
    const now = Date.now();
    const staleTime = 30 * 60 * 1000; // 30 minutes

    queryClient.getQueryCache().getAll().forEach(query => {
      if (query.state.dataUpdatedAt && (now - query.state.dataUpdatedAt) > staleTime) {
        queryClient.invalidateQueries({ queryKey: query.queryKey });
      }
    });

    securityMonitor.logPerformanceMetric({
      action: 'query_optimization',
      duration: 0,
      timestamp: now,
      success: true
    });
  }, [queryClient]);

  // Précharger les données en fonction du comportement utilisateur
  const smartPreloading = useCallback(async (userBehavior: {
    currentPage: string;
    timeSpent: number;
    scrollPosition: number;
  }) => {
    const { currentPage, timeSpent, scrollPosition } = userBehavior;

    // Précharger en fonction de la page actuelle
    if (currentPage === '/' && timeSpent > 5000) {
      // Utilisateur engagé sur la homepage, précharger les catégories
      await queryClient.prefetchQuery({
        queryKey: ['ads-by-category-optimized', 'rencontres'],
        staleTime: 10 * 60 * 1000,
      });
    }

    if (currentPage.includes('/browse') && scrollPosition > 0.7) {
      // Utilisateur fait défiler, précharger la page suivante
      const currentData = queryClient.getQueryData(['infinite-ads']);
      if (currentData) {
        await queryClient.prefetchQuery({
          queryKey: ['approved-ads-optimized'],
          staleTime: 5 * 60 * 1000,
        });
      }
    }
  }, [queryClient]);

  // Obtenir les métriques de performance
  const getPerformanceMetrics = useCallback((): PerformanceMetrics => {
    const memoryInfo = (performance as any).memory;
    
    return {
      cacheMetrics,
      queryMetrics: queryPerformanceMonitor.getMetrics(),
      slowQueries: queryPerformanceMonitor.getSlowQueries(),
      memoryUsage: memoryInfo
    };
  }, [cacheMetrics]);

  // Initialisation et monitoring automatique
  useEffect(() => {
    // Démarrer le nettoyage automatique du cache
    performanceCache.startAutoCleanup();

    // Précharger les données critiques
    preloadCriticalData();

    // Monitoring périodique
    const monitoringInterval = setInterval(monitorPerformance, 30000); // Toutes les 30 secondes
    const optimizationInterval = setInterval(optimizeQueries, 10 * 60 * 1000); // Toutes les 10 minutes

    // Nettoyage
    return () => {
      clearInterval(monitoringInterval);
      clearInterval(optimizationInterval);
    };
  }, [preloadCriticalData, monitorPerformance, optimizeQueries]);

  // Intercepteur pour tracker les performances des requêtes
  useEffect(() => {
    const originalFetch = window.fetch;
    
    window.fetch = async (...args) => {
      const start = performance.now();
      try {
        const response = await originalFetch(...args);
        const duration = performance.now() - start;
        
        // Logger uniquement les requêtes vers Supabase
        if (args[0]?.toString().includes('supabase.co')) {
          queryPerformanceMonitor.trackQuery(
            ['fetch', args[0]?.toString() || 'unknown'],
            duration,
            response.ok
          );
        }
        
        return response;
      } catch (error) {
        const duration = performance.now() - start;
        queryPerformanceMonitor.trackQuery(
          ['fetch', args[0]?.toString() || 'unknown'],
          duration,
          false
        );
        throw error;
      }
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  return useMemo(() => ({
    preloadCriticalData,
    optimizeMemory,
    smartPreloading,
    getPerformanceMetrics,
    metrics: getPerformanceMetrics()
  }), [preloadCriticalData, optimizeMemory, smartPreloading, getPerformanceMetrics]);
};

// Hook spécialisé pour le monitoring en temps réel
export const useRealTimePerformanceMonitor = () => {
  const { metrics } = usePerformanceOptimization();

  // Alertes automatiques
  useEffect(() => {
    const { cacheMetrics, queryMetrics } = metrics;

    // Alerte sur un taux de cache faible
    if (cacheMetrics.hitRate < 50 && cacheMetrics.hitCount > 10) {
      console.warn('Low cache hit rate detected:', cacheMetrics.hitRate.toFixed(2) + '%');
    }

    // Alerte sur un taux d'erreur élevé
    if (queryMetrics.errorRate > 10 && queryMetrics.totalQueries > 20) {
      console.warn('High query error rate detected:', queryMetrics.errorRate.toFixed(2) + '%');
      securityMonitor.logSecurityEvent({
        type: 'general_error',
        severity: 'high',
        data: {
          errorRate: queryMetrics.errorRate,
          totalQueries: queryMetrics.totalQueries,
          message: 'High query error rate detected'
        }
      });
    }
  }, [metrics]);

  return metrics;
};