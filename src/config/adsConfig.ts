
export const ADS_CONFIG = {
  // Remplacez par votre véritable ID d'éditeur Google AdSense
  PUBLISHER_ID: 'ca-pub-YOUR_PUBLISHER_ID',
  
  // Slots publicitaires - remplacez par vos véritables ID de slots
  AD_SLOTS: {
    HEADER_BANNER: '1234567890',
    SIDEBAR_RECTANGLE: '2345678901', 
    CONTENT_RECTANGLE: '3456789012',
    FOOTER_BANNER: '4567890123',
    MOBILE_BANNER: '5678901234',
  },
  
  // Paramètres publicitaires
  SETTINGS: {
    AUTO_ADS_ENABLED: false,
    FULL_WIDTH_RESPONSIVE: true,
    TEST_MODE: process.env.NODE_ENV === 'development',
    // Délai avant l'affichage des publicités (en ms)
    LOAD_DELAY: 1000,
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

// Fonction utilitaire pour obtenir un slot publicitaire par emplacement
export const getAdSlot = (placement: keyof typeof ADS_CONFIG.AD_SLOTS): string => {
  return ADS_CONFIG.AD_SLOTS[placement];
};

// Fonction utilitaire pour vérifier si les publicités doivent être affichées
export const shouldShowAd = (page: keyof typeof ADS_CONFIG.PLACEMENTS, location: string): boolean => {
  const pageConfig = ADS_CONFIG.PLACEMENTS[page];
  return pageConfig && pageConfig[location as keyof typeof pageConfig] === true;
};

// Fonction utilitaire pour vérifier si AdSense est prêt
export const isAdSenseReady = (): boolean => {
  return typeof window !== 'undefined' && 
         typeof window.adsbygoogle !== 'undefined' && 
         Array.isArray(window.adsbygoogle);
};

// Fonction utilitaire pour obtenir l'ID d'éditeur configuré
export const getPublisherId = (): string => {
  return ADS_CONFIG.PUBLISHER_ID;
};
