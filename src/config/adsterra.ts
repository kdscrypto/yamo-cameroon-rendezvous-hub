// src/config/adsterra.ts

// Clé Adsterra unique pour tous les placements
export const ADSTERRA_KEY = 'ea16b4d4359bf41430e0c1ad103b76af';

// Définition des types de slots publicitaires disponibles dans l'application
export type AdSlotType = 
  | 'BANNER_728x90'
  | 'SIDEBAR_RECTANGLE'
  | 'CONTENT_RECTANGLE'
  | 'FOOTER_BANNER'
  | 'MOBILE_BANNER';

// Configuration des dimensions pour chaque type de slot
export const AdsterraAdSlots: Record<AdSlotType, { width: number; height: number }> = {
  BANNER_728x90: {
    width: 728,
    height: 90,
  },
  SIDEBAR_RECTANGLE: {
    width: 300,
    height: 250,
  },
  CONTENT_RECTANGLE: {
    width: 336,
    height: 280,
  },
  FOOTER_BANNER: {
    width: 728,
    height: 90,
  },
  MOBILE_BANNER: {
    width: 320,
    height: 50,
  },
};

// Utilitaires pour le développement et les tests
export const isDevelopment = () => process.env.NODE_ENV === 'development';
export const isTestModeEnabled = () => {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('adsterra-dev-test') === 'true';
};

// Activer le mode test en développement par défaut
export const enableTestMode = () => {
  if (typeof window !== 'undefined' && isDevelopment()) {
    localStorage.setItem('adsterra-dev-test', 'true');
    console.log('🔧 Mode test Adsterra activé pour le développement');
  }
};

// Vérifier si les ads doivent être affichées
export const shouldShowAds = () => {
  return !isDevelopment() || isTestModeEnabled();
};