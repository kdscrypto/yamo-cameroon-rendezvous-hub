// Système de rate limiting avancé pour prévenir les abus
import { securityMonitor } from './productionMonitoring';

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  keyGenerator?: (identifier: string) => string;
  skipSuccessful?: boolean;
  skipFailures?: boolean;
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
  firstRequest: number;
}

class RateLimiter {
  private static instance: RateLimiter;
  private store = new Map<string, RateLimitEntry>();
  private configs = new Map<string, RateLimitConfig>();

  static getInstance(): RateLimiter {
    if (!RateLimiter.instance) {
      RateLimiter.instance = new RateLimiter();
    }
    return RateLimiter.instance;
  }

  // Configurer les limites pour différents endpoints
  configure(endpoint: string, config: RateLimitConfig) {
    this.configs.set(endpoint, config);
  }

  // Vérifier si une requête est autorisée
  isAllowed(endpoint: string, identifier: string): {
    allowed: boolean;
    remaining: number;
    resetTime: number;
    retryAfter?: number;
  } {
    const config = this.configs.get(endpoint);
    if (!config) {
      // Pas de limite configurée, autoriser
      return { allowed: true, remaining: Infinity, resetTime: 0 };
    }

    const key = config.keyGenerator ? config.keyGenerator(identifier) : `${endpoint}:${identifier}`;
    const now = Date.now();
    
    // Nettoyer les entrées expirées
    this.cleanup();

    let entry = this.store.get(key);
    
    if (!entry) {
      // Première requête
      entry = {
        count: 1,
        resetTime: now + config.windowMs,
        firstRequest: now
      };
      this.store.set(key, entry);
      
      return {
        allowed: true,
        remaining: config.maxRequests - 1,
        resetTime: entry.resetTime
      };
    }

    // Vérifier si la fenêtre a expiré
    if (now >= entry.resetTime) {
      // Reset de la fenêtre
      entry.count = 1;
      entry.resetTime = now + config.windowMs;
      entry.firstRequest = now;
      
      return {
        allowed: true,
        remaining: config.maxRequests - 1,
        resetTime: entry.resetTime
      };
    }

    // Incrémenter le compteur
    entry.count++;

    if (entry.count > config.maxRequests) {
      // Rate limit dépassé
      securityMonitor.logSecurityEvent({
        type: 'rate_limit_exceeded',
        severity: 'medium',
        data: {
          endpoint,
          identifier,
          count: entry.count,
          maxRequests: config.maxRequests,
          windowMs: config.windowMs
        }
      });

      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.resetTime,
        retryAfter: Math.ceil((entry.resetTime - now) / 1000)
      };
    }

    return {
      allowed: true,
      remaining: config.maxRequests - entry.count,
      resetTime: entry.resetTime
    };
  }

  // Nettoyer les entrées expirées
  private cleanup() {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (now >= entry.resetTime) {
        this.store.delete(key);
      }
    }
  }

  // Obtenir les statistiques
  getStats() {
    const now = Date.now();
    let activeEntries = 0;
    let totalRequests = 0;

    for (const entry of this.store.values()) {
      if (now < entry.resetTime) {
        activeEntries++;
        totalRequests += entry.count;
      }
    }

    return {
      activeEntries,
      totalRequests,
      totalKeys: this.store.size
    };
  }

  // Configurations prédéfinies
  static getDefaultConfigs() {
    return {
      // API générale
      api: {
        windowMs: 15 * 60 * 1000, // 15 minutes
        maxRequests: 100,
      },
      
      // Authentification
      auth: {
        windowMs: 15 * 60 * 1000, // 15 minutes
        maxRequests: 5,
      },
      
      // Création d'annonces
      createAd: {
        windowMs: 60 * 60 * 1000, // 1 heure
        maxRequests: 10,
      },
      
      // Messages
      messages: {
        windowMs: 60 * 1000, // 1 minute
        maxRequests: 30,
      },
      
      // Contact
      contact: {
        windowMs: 60 * 60 * 1000, // 1 heure
        maxRequests: 3,
      }
    };
  }
}

// Instance globale
export const rateLimiter = RateLimiter.getInstance();

// Initialiser les configurations par défaut
export const initializeRateLimiting = () => {
  const configs = RateLimiter.getDefaultConfigs();
  
  Object.entries(configs).forEach(([endpoint, config]) => {
    rateLimiter.configure(endpoint, config);
  });
  
  securityMonitor.logSecurityEvent({
    type: 'general_error',
    severity: 'low',
    data: {
      message: 'Rate limiting initialized',
      endpoints: Object.keys(configs)
    }
  });
};

// Hook React pour le rate limiting
export const useRateLimiting = (endpoint: string, identifier: string) => {
  const checkLimit = () => {
    return rateLimiter.isAllowed(endpoint, identifier);
  };

  return { checkLimit };
};

// Middleware pour les requêtes
export const rateLimitMiddleware = (endpoint: string) => {
  return (identifier: string) => {
    const result = rateLimiter.isAllowed(endpoint, identifier);
    
    if (!result.allowed) {
      throw new Error(`Rate limit exceeded. Try again in ${result.retryAfter} seconds.`);
    }
    
    return result;
  };
};

export default rateLimiter;