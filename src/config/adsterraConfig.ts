import { getAdsterraKey } from '@/utils/adsterraProductionConfig';

export const ADSTERRA_CONFIG = {
  // Configuration pour les bannières Adsterra
  BANNERS: {
    HEADER_BANNER: {
      key: getAdsterraKey('HEADER_BANNER'),
      width: 728,
      height: 90,
      format: 'iframe'
    },
    SIDEBAR_RECTANGLE: {
      key: getAdsterraKey('SIDEBAR_RECTANGLE'),
      width: 300,
      height: 250,
      format: 'banner'
    },
    CONTENT_RECTANGLE: {
      key: getAdsterraKey('CONTENT_RECTANGLE'),
      width: 300,
      height: 250,
      format: 'banner'
    },
    FOOTER_BANNER: {
      key: getAdsterraKey('FOOTER_BANNER'),
      width: 728,
      height: 90,
      format: 'banner'
    },
    MOBILE_BANNER: {
      key: getAdsterraKey('MOBILE_BANNER'),
      width: 320,
      height: 50,
      format: 'banner'
    }
  },
  
  // Paramètres généraux
  SETTINGS: {
    TEST_MODE: process.env.NODE_ENV === 'development',
    ALLOW_DEV_TESTING: true, // Permet de tester en développement
    FORCE_DEV_ADS: false, // Option pour forcer l'affichage en dev
    LOAD_DELAY: 1000,
    AUTO_REFRESH_ENABLED: false,
  },
  
  // Configuration des emplacements
  PLACEMENTS: {
    HOMEPAGE: {
      header: true,
      content: true,
      footer: false,
    },
    BROWSE: {
      header: true,
      sidebar: true,
      content: true,
    },
    DASHBOARD: {
      sidebar: true,
      content: true,
    },
    AD_DETAIL: {
      content: true,
      related: true,
    }
  }
};

// Fonction utilitaire pour obtenir une bannière par emplacement
export const getAdsterraBanner = (placement: keyof typeof ADSTERRA_CONFIG.BANNERS) => {
  return ADSTERRA_CONFIG.BANNERS[placement];
};

// Fonction utilitaire pour vérifier si les publicités doivent être affichées
export const shouldShowAdsterraAd = (page: keyof typeof ADSTERRA_CONFIG.PLACEMENTS, location: string): boolean => {
  const pageConfig = ADSTERRA_CONFIG.PLACEMENTS[page];
  return pageConfig && pageConfig[location as keyof typeof pageConfig] === true;
};

// Fonction utilitaire pour vérifier si Adsterra est prêt
export const isAdsterraReady = (): boolean => {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
};

// Fonction utilitaire pour vérifier si les pubs doivent être affichées en dev
export const shouldShowAdsInDev = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  const devTestEnabled = localStorage.getItem('adsterra-dev-test') === 'true';
  const forceDevAds = localStorage.getItem('adsterra-force-dev') === 'true';
  
  return devTestEnabled || forceDevAds || ADSTERRA_CONFIG.SETTINGS.FORCE_DEV_ADS;
};

// Fonction pour activer/désactiver les tests en développement
export const toggleDevTesting = (enabled: boolean): void => {
  if (typeof window === 'undefined') return;
  
  if (enabled) {
    localStorage.setItem('adsterra-dev-test', 'true');
  } else {
    localStorage.removeItem('adsterra-dev-test');
  }
};

// Fonction pour forcer l'affichage des pubs en développement
export const forceDevAds = (enabled: boolean): void => {
  if (typeof window === 'undefined') return;
  
  if (enabled) {
    localStorage.setItem('adsterra-force-dev', 'true');
  } else {
    localStorage.removeItem('adsterra-force-dev');
  }
};