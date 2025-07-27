// Système de cache avancé pour optimiser les performances
import { securityMonitor } from './productionMonitoring';

interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiry: number;
  accessCount: number;
  lastAccess: number;
}

interface CacheConfig {
  maxSize: number;
  defaultTTL: number; // Time to live en millisecondes
  enableMetrics: boolean;
}

class PerformanceCache {
  private static instance: PerformanceCache;
  private cache = new Map<string, CacheItem<any>>();
  private config: CacheConfig;
  private hitCount = 0;
  private missCount = 0;

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      maxSize: 1000,
      defaultTTL: 10 * 60 * 1000, // 10 minutes
      enableMetrics: true,
      ...config
    };
  }

  static getInstance(config?: Partial<CacheConfig>): PerformanceCache {
    if (!PerformanceCache.instance) {
      PerformanceCache.instance = new PerformanceCache(config);
    }
    return PerformanceCache.instance;
  }

  set<T>(key: string, data: T, ttl?: number): void {
    const now = Date.now();
    const expiry = ttl || this.config.defaultTTL;

    // Nettoyer le cache si nécessaire
    if (this.cache.size >= this.config.maxSize) {
      this.evictLeastUsed();
    }

    this.cache.set(key, {
      data,
      timestamp: now,
      expiry: now + expiry,
      accessCount: 0,
      lastAccess: now
    });

    if (this.config.enableMetrics) {
      securityMonitor.logPerformanceMetric({
        action: 'cache_set',
        duration: 0,
        timestamp: now,
        success: true
      });
    }
  }

  get<T>(key: string): T | null {
    const now = Date.now();
    const item = this.cache.get(key);

    if (!item) {
      this.missCount++;
      return null;
    }

    // Vérifier l'expiration
    if (now > item.expiry) {
      this.cache.delete(key);
      this.missCount++;
      return null;
    }

    // Mettre à jour les statistiques d'accès
    item.accessCount++;
    item.lastAccess = now;
    this.hitCount++;

    if (this.config.enableMetrics) {
      securityMonitor.logPerformanceMetric({
        action: 'cache_hit',
        duration: 0,
        timestamp: now,
        success: true
      });
    }

    return item.data;
  }

  has(key: string): boolean {
    const item = this.cache.get(key);
    if (!item) return false;
    
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
    this.hitCount = 0;
    this.missCount = 0;
  }

  // Éviction des éléments les moins utilisés
  private evictLeastUsed(): void {
    let leastUsedKey = '';
    let leastUsedScore = Infinity;

    for (const [key, item] of this.cache.entries()) {
      // Score basé sur la fréquence d'accès et la récence
      const ageWeight = (Date.now() - item.lastAccess) / (1000 * 60); // en minutes
      const score = item.accessCount / (ageWeight + 1);

      if (score < leastUsedScore) {
        leastUsedScore = score;
        leastUsedKey = key;
      }
    }

    if (leastUsedKey) {
      this.cache.delete(leastUsedKey);
    }
  }

  // Métriques de performance
  getMetrics() {
    const total = this.hitCount + this.missCount;
    return {
      hitRate: total > 0 ? (this.hitCount / total) * 100 : 0,
      hitCount: this.hitCount,
      missCount: this.missCount,
      cacheSize: this.cache.size,
      maxSize: this.config.maxSize
    };
  }

  // Préchargement intelligent
  async preload<T>(keys: string[], fetcher: (key: string) => Promise<T>, ttl?: number): Promise<void> {
    const promises = keys.map(async (key) => {
      if (!this.has(key)) {
        try {
          const data = await fetcher(key);
          this.set(key, data, ttl);
        } catch (error) {
          console.warn(`Preload failed for key ${key}:`, error);
        }
      }
    });

    await Promise.allSettled(promises);
  }

  // Nettoyage automatique des entrées expirées
  startAutoCleanup(intervalMs: number = 5 * 60 * 1000): void {
    setInterval(() => {
      const now = Date.now();
      const keysToDelete: string[] = [];

      for (const [key, item] of this.cache.entries()) {
        if (now > item.expiry) {
          keysToDelete.push(key);
        }
      }

      keysToDelete.forEach(key => this.cache.delete(key));

      if (keysToDelete.length > 0 && this.config.enableMetrics) {
        securityMonitor.logPerformanceMetric({
          action: 'cache_cleanup',
          duration: keysToDelete.length,
          timestamp: now,
          success: true
        });
      }
    }, intervalMs);
  }
}

// Instance globale du cache
export const performanceCache = PerformanceCache.getInstance();

// Hook React pour utiliser le cache
export const useCacheMetrics = () => {
  return performanceCache.getMetrics();
};

// Utilitaires de cache spécialisés
export const CacheKeys = {
  ADS_APPROVED: 'ads:approved',
  ADS_BY_CATEGORY: (category: string) => `ads:category:${category}`,
  ADS_BY_LOCATION: (location: string) => `ads:location:${location}`,
  USER_PROFILE: (userId: string) => `user:profile:${userId}`,
  CONVERSATIONS: (userId: string) => `conversations:${userId}`,
  UNREAD_COUNT: (userId: string) => `unread:${userId}`,
} as const;

export default performanceCache;