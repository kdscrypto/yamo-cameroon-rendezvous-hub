export const ADSTERRA_CONFIG = {
  // Configuration pour les bannières Adsterra
  BANNERS: {
    HEADER_BANNER: {
      key: 'ea16b4d4359bf41430e0c1ad103b76af',
      width: 728,
      height: 90,
      format: 'iframe'
    },
    SIDEBAR_RECTANGLE: {
      key: 'sidebar-rectangle-key', // Remplacez par votre clé réelle
      width: 300,
      height: 250,
      format: 'banner'
    },
    CONTENT_RECTANGLE: {
      key: 'content-rectangle-key', // Remplacez par votre clé réelle
      width: 300,
      height: 250,
      format: 'banner'
    },
    FOOTER_BANNER: {
      key: 'footer-banner-key', // Remplacez par votre clé réelle
      width: 728,
      height: 90,
      format: 'banner'
    },
    MOBILE_BANNER: {
      key: 'mobile-banner-key', // Remplacez par votre clé réelle
      width: 320,
      height: 50,
      format: 'banner'
    }
  },
  
  // Paramètres généraux
  SETTINGS: {
    TEST_MODE: process.env.NODE_ENV === 'development',
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