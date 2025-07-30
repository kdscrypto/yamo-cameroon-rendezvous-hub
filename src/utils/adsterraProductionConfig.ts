// Configuration optimisée pour la production Adsterra
export interface AdsterraProductionKeys {
  HEADER_BANNER: string;
  SIDEBAR_RECTANGLE: string;
  CONTENT_RECTANGLE: string;
  FOOTER_BANNER: string;
  MOBILE_BANNER: string;
}

// Clés de production - À remplacer par les vraies clés Adsterra
const PRODUCTION_KEYS: AdsterraProductionKeys = {
  HEADER_BANNER: '6c4f8b2e9d1a3c5f7e8b9a0c2d4e6f8a',
  SIDEBAR_RECTANGLE: '1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d',
  CONTENT_RECTANGLE: '7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b',
  FOOTER_BANNER: '3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f',
  MOBILE_BANNER: '9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d'
};

// Clés de test/développement
const DEVELOPMENT_KEYS: AdsterraProductionKeys = {
  HEADER_BANNER: 'dev-header-banner',
  SIDEBAR_RECTANGLE: 'dev-sidebar-rectangle',
  CONTENT_RECTANGLE: 'dev-content-rectangle',
  FOOTER_BANNER: 'dev-footer-banner',
  MOBILE_BANNER: 'dev-mobile-banner'
};

// Fonction pour obtenir la clé appropriée selon l'environnement
export const getAdsterraKey = (placement: keyof AdsterraProductionKeys): string => {
  const isProduction = process.env.NODE_ENV === 'production';
  const keys = isProduction ? PRODUCTION_KEYS : DEVELOPMENT_KEYS;
  return keys[placement];
};

// Fonction pour vérifier si les clés sont configurées correctement
export const validateAdsterraKeys = (): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} => {
  const errors: string[] = [];
  const warnings: string[] = [];
  const isProduction = process.env.NODE_ENV === 'production';

  if (isProduction) {
    // En production, vérifier que les clés ne sont pas des placeholders
    Object.entries(PRODUCTION_KEYS).forEach(([placement, key]) => {
      if (key.startsWith('dev-') || key.includes('placeholder') || key.length < 32) {
        errors.push(`Clé de production invalide pour ${placement}: ${key}`);
      }
    });

    // Vérifier l'unicité des clés
    const uniqueKeys = new Set(Object.values(PRODUCTION_KEYS));
    if (uniqueKeys.size < Object.keys(PRODUCTION_KEYS).length) {
      warnings.push('Certaines clés de production sont identiques - recommandé d\'utiliser des clés uniques');
    }
  } else {
    // En développement, juste vérifier que les clés sont présentes
    Object.entries(DEVELOPMENT_KEYS).forEach(([placement, key]) => {
      if (!key || key.trim() === '') {
        errors.push(`Clé de développement manquante pour ${placement}`);
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

// Configuration des domaines autorisés pour Adsterra
export const ADSTERRA_ALLOWED_DOMAINS = [
  'localhost',
  '127.0.0.1',
  'yamo.lovable.app',
  'yamo.cm', // Domaine de production potentiel
  // Ajouter d'autres domaines selon les besoins
];

// Fonction pour vérifier si le domaine actuel est autorisé
export const isDomainAllowed = (): boolean => {
  if (typeof window === 'undefined') return true; // SSR
  
  const currentDomain = window.location.hostname;
  return ADSTERRA_ALLOWED_DOMAINS.some(domain => 
    currentDomain === domain || currentDomain.endsWith(`.${domain}`)
  );
};

// Configuration CSP pour Adsterra
export const getAdsterraCSPDirectives = (): string[] => {
  return [
    "script-src 'self' 'unsafe-inline' https://www.highperformanceformat.com https://a.rfihub.com",
    "frame-src 'self' https://www.highperformanceformat.com",
    "img-src 'self' data: https: blob:",
    "connect-src 'self' https://www.highperformanceformat.com https://a.rfihub.com",
    "style-src 'self' 'unsafe-inline'"
  ];
};

// Test de connectivité optimisé
export const testAdsterraConnectivity = async (): Promise<{
  success: boolean;
  method: string;
  latency: number;
  error?: string;
}> => {
  const startTime = performance.now();
  
  // Méthode 1: Test HEAD request
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    await fetch('https://www.highperformanceformat.com/js/', {
      method: 'HEAD',
      mode: 'no-cors',
      signal: controller.signal,
      cache: 'no-cache'
    });
    
    clearTimeout(timeoutId);
    const latency = performance.now() - startTime;
    
    return {
      success: true,
      method: 'HEAD request',
      latency: Math.round(latency)
    };
  } catch (error) {
    // Méthode 2: Test avec script element
    try {
      const scriptTestPromise = new Promise<boolean>((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://www.highperformanceformat.com/js/dummy.js';
        
        const cleanup = () => {
          if (script.parentNode) {
            script.parentNode.removeChild(script);
          }
        };
        
        script.onload = () => {
          cleanup();
          resolve(true);
        };
        
        script.onerror = () => {
          cleanup();
          reject(new Error('Script load failed'));
        };
        
        // Timeout
        setTimeout(() => {
          cleanup();
          reject(new Error('Script load timeout'));
        }, 3000);
        
        document.head.appendChild(script);
      });
      
      await scriptTestPromise;
      const latency = performance.now() - startTime;
      
      return {
        success: true,
        method: 'Script element test',
        latency: Math.round(latency)
      };
    } catch (scriptError) {
      const latency = performance.now() - startTime;
      
      return {
        success: false,
        method: 'All methods failed',
        latency: Math.round(latency),
        error: `HEAD: ${error instanceof Error ? error.message : 'Unknown'}, Script: ${scriptError instanceof Error ? scriptError.message : 'Unknown'}`
      };
    }
  }
};

// Performance monitoring
export interface AdsterraPerformanceMetrics {
  loadTime: number;
  renderTime: number;
  errorCount: number;
  impressions: number;
  clickRate: number;
}

export const getAdsterraPerformanceReport = (): AdsterraPerformanceMetrics => {
  // Récupérer les métriques depuis le localStorage ou une API
  const metrics = localStorage.getItem('adsterra-performance-metrics');
  
  if (metrics) {
    try {
      return JSON.parse(metrics);
    } catch {
      // Fallback to default metrics
    }
  }
  
  return {
    loadTime: 0,
    renderTime: 0,
    errorCount: 0,
    impressions: 0,
    clickRate: 0
  };
};

export const updateAdsterraPerformanceMetrics = (metrics: Partial<AdsterraPerformanceMetrics>): void => {
  const currentMetrics = getAdsterraPerformanceReport();
  const updatedMetrics = { ...currentMetrics, ...metrics };
  
  localStorage.setItem('adsterra-performance-metrics', JSON.stringify(updatedMetrics));
};