// Optimisation avancée des requêtes React Query
import { QueryClient } from '@tanstack/react-query';
import { performanceCache, CacheKeys } from './performanceCache';
import { securityMonitor } from './productionMonitoring';

// Configuration optimisée du QueryClient
export const createOptimizedQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Cache pendant 15 minutes
        staleTime: 15 * 60 * 1000,
        // Garde en mémoire pendant 30 minutes
        gcTime: 30 * 60 * 1000,
        // Retry intelligent
        retry: (failureCount, error: any) => {
          // Ne pas retry sur les erreurs d'authentification
          if (error?.status === 401 || error?.status === 403) {
            return false;
          }
          // Retry jusqu'à 3 fois pour les autres erreurs
          return failureCount < 3;
        },
        // Délai entre les retries exponentiel
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        // Ne pas refetch automatiquement au focus
        refetchOnWindowFocus: false,
        // Ne pas refetch automatiquement à la reconnexion
        refetchOnReconnect: 'always',
        // Utiliser le cache par défaut
        refetchOnMount: true,
      },
      mutations: {
        // Retry des mutations en cas d'erreur réseau
        retry: (failureCount, error: any) => {
          if (error?.status >= 400 && error?.status < 500) {
            return false; // Erreurs client, ne pas retry
          }
          return failureCount < 2; // Retry 2 fois pour les erreurs serveur
        },
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
      }
    },
  });
};

// Middleware de cache personnalisé
export const cacheMiddleware = {
  // Intercepter les requêtes pour utiliser le cache local
  onBeforeQuery: async (queryKey: string[], fetcher: () => Promise<any>) => {
    const cacheKey = queryKey.join(':');
    const cachedData = performanceCache.get(cacheKey);
    
    if (cachedData) {
      securityMonitor.logPerformanceMetric({
        action: 'query_cache_hit',
        duration: 0,
        timestamp: Date.now(),
        success: true
      });
      return cachedData;
    }
    
    return null;
  },

  // Mettre en cache le résultat
  onAfterQuery: (queryKey: string[], data: any, ttl?: number) => {
    const cacheKey = queryKey.join(':');
    performanceCache.set(cacheKey, data, ttl);
    
    securityMonitor.logPerformanceMetric({
      action: 'query_cache_set',
      duration: 0,
      timestamp: Date.now(),
      success: true
    });
  }
};

// Optimisations de requêtes spécifiques
export const QueryOptimizations = {
  // Précharger les données critiques
  preloadCriticalData: async (queryClient: QueryClient) => {
    const promises = [
      // Précharger les annonces approuvées
      queryClient.prefetchQuery({
        queryKey: ['approved-ads-optimized'],
        staleTime: 10 * 60 * 1000,
      }),
      
      // Précharger les catégories populaires
      queryClient.prefetchQuery({
        queryKey: ['ads-by-category-optimized', 'rencontres'],
        staleTime: 15 * 60 * 1000,
      }),
    ];

    await Promise.allSettled(promises);
  },

  // Batching des requêtes similaires
  batchSimilarQueries: (queries: Array<{ queryKey: string[]; fetcher: () => Promise<any> }>) => {
    // Grouper les requêtes par type
    const queryGroups = new Map<string, typeof queries>();
    
    queries.forEach(query => {
      const type = query.queryKey[0];
      if (!queryGroups.has(type)) {
        queryGroups.set(type, []);
      }
      queryGroups.get(type)!.push(query);
    });

    // Exécuter les groupes en parallèle
    return Promise.all(
      Array.from(queryGroups.values()).map(group => 
        Promise.allSettled(group.map(q => q.fetcher()))
      )
    );
  },

  // Invalidation intelligente du cache
  smartInvalidation: (queryClient: QueryClient, pattern: string) => {
    // Invalider seulement les requêtes qui correspondent au pattern
    queryClient.invalidateQueries({
      predicate: (query) => {
        return query.queryKey.some(key => 
          typeof key === 'string' && key.includes(pattern)
        );
      }
    });
  }
};

// Moniteur de performance des requêtes
export class QueryPerformanceMonitor {
  private static instance: QueryPerformanceMonitor;
  private queryMetrics = new Map<string, {
    count: number;
    totalDuration: number;
    errors: number;
    lastExecution: number;
  }>();

  static getInstance(): QueryPerformanceMonitor {
    if (!QueryPerformanceMonitor.instance) {
      QueryPerformanceMonitor.instance = new QueryPerformanceMonitor();
    }
    return QueryPerformanceMonitor.instance;
  }

  trackQuery(queryKey: string[], duration: number, success: boolean) {
    const key = queryKey.join(':');
    const existing = this.queryMetrics.get(key) || {
      count: 0,
      totalDuration: 0,
      errors: 0,
      lastExecution: 0
    };

    existing.count++;
    existing.totalDuration += duration;
    existing.lastExecution = Date.now();
    
    if (!success) {
      existing.errors++;
    }

    this.queryMetrics.set(key, existing);

    // Logger les métriques
    securityMonitor.logPerformanceMetric({
      action: 'query_performance',
      duration,
      timestamp: Date.now(),
      success
    });
  }

  getSlowQueries(thresholdMs: number = 2000) {
    const slowQueries: Array<{
      queryKey: string;
      averageDuration: number;
      count: number;
      errorRate: number;
    }> = [];

    for (const [key, metrics] of this.queryMetrics.entries()) {
      const averageDuration = metrics.totalDuration / metrics.count;
      if (averageDuration > thresholdMs) {
        slowQueries.push({
          queryKey: key,
          averageDuration,
          count: metrics.count,
          errorRate: (metrics.errors / metrics.count) * 100
        });
      }
    }

    return slowQueries.sort((a, b) => b.averageDuration - a.averageDuration);
  }

  getMetrics() {
    const allMetrics = Array.from(this.queryMetrics.values());
    const totalQueries = allMetrics.reduce((sum, m) => sum + m.count, 0);
    const totalErrors = allMetrics.reduce((sum, m) => sum + m.errors, 0);
    const averageDuration = allMetrics.length > 0 
      ? allMetrics.reduce((sum, m) => sum + (m.totalDuration / m.count), 0) / allMetrics.length 
      : 0;

    return {
      totalQueries,
      totalErrors,
      errorRate: totalQueries > 0 ? (totalErrors / totalQueries) * 100 : 0,
      averageDuration,
      uniqueQueries: this.queryMetrics.size
    };
  }
}

export const queryPerformanceMonitor = QueryPerformanceMonitor.getInstance();