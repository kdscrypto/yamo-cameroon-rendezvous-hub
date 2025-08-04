
// Utilitaires pour la gestion de l'environnement
export const ENV = {
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
  mode: import.meta.env.MODE,
  baseUrl: import.meta.env.BASE_URL,
};

// Configuration des logs selon l'environnement
export const logger = {
  info: (message: string, ...args: any[]) => {
    if (ENV.isDevelopment) {
      console.log(`[INFO] ${message}`, ...args);
    }
  },
  
  error: (message: string, ...args: any[]) => {
    console.error(`[ERROR] ${message}`, ...args);
  },
  
  warn: (message: string, ...args: any[]) => {
    if (ENV.isDevelopment) {
      console.warn(`[WARN] ${message}`, ...args);
    }
  },
  
  debug: (message: string, ...args: any[]) => {
    if (ENV.isDevelopment) {
      console.debug(`[DEBUG] ${message}`, ...args);
    }
  }
};

// Fonction pour optimiser les performances en production
export const optimizeForProduction = () => {
  if (ENV.isProduction) {
    // Désactiver les logs de développement
    console.log = () => {};
    console.debug = () => {};
    console.info = () => {};
    
    // Initialiser le monitoring de production
    initProductionMonitoring();
  }
};

// Initialisation du monitoring en production
const initProductionMonitoring = () => {
  // Monitoring des erreurs globales
  window.addEventListener('error', (event) => {
    logger.error('Erreur globale détectée:', event.error?.message || event.message);
  });

  window.addEventListener('unhandledrejection', (event) => {
    logger.error('Promise rejetée non gérée:', event.reason);
  });

  // Monitoring des performances
  if ('PerformanceObserver' in window) {
    try {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.entryType === 'largest-contentful-paint' && entry.startTime > 2500) {
            logger.warn('Performance LCP dégradée:', entry.startTime);
          }
          if (entry.entryType === 'first-input' && entry.duration > 100) {
            logger.warn('FID dégradé:', entry.duration);
          }
        });
      });
      
      observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input'] });
    } catch (error) {
      // PerformanceObserver peut ne pas être supporté
    }
  }
};
