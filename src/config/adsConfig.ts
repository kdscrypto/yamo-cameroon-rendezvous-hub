
export const ADS_CONFIG = {
  // Replace with your actual Google AdSense Publisher ID
  PUBLISHER_ID: 'ca-pub-YOUR_PUBLISHER_ID',
  
  // Ad slots - replace with your actual ad slot IDs
  AD_SLOTS: {
    HEADER_BANNER: '1234567890',
    SIDEBAR_RECTANGLE: '2345678901', 
    CONTENT_RECTANGLE: '3456789012',
    FOOTER_BANNER: '4567890123',
    MOBILE_BANNER: '5678901234',
  },
  
  // Ad settings
  SETTINGS: {
    AUTO_ADS_ENABLED: false,
    FULL_WIDTH_RESPONSIVE: true,
    TEST_MODE: process.env.NODE_ENV === 'development',
  },
  
  // Placements configuration
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

// Helper function to get ad slot by placement
export const getAdSlot = (placement: keyof typeof ADS_CONFIG.AD_SLOTS): string => {
  return ADS_CONFIG.AD_SLOTS[placement];
};

// Helper function to check if ads should be shown in a specific location
export const shouldShowAd = (page: keyof typeof ADS_CONFIG.PLACEMENTS, location: string): boolean => {
  const pageConfig = ADS_CONFIG.PLACEMENTS[page];
  return pageConfig && pageConfig[location as keyof typeof pageConfig] === true;
};
