
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
  }
};
