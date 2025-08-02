// src/config/adsterra.ts

// Définition des types de slots publicitaires disponibles dans l'application
export type AdSlotType = 
  | 'BANNER_728x90'
  | 'SIDEBAR_RECTANGLE'
  | 'CONTENT_RECTANGLE'
  | 'FOOTER_BANNER'
  | 'MOBILE_BANNER';
  
// Base de données centrale pour toutes nos clés et dimensions Adsterra
export const AdsterraAdSlots: Record<AdSlotType, { key: string; width: number; height: number }> = {
  BANNER_728x90: {
    key: 'ea16b4d4359bf41430e0c1ad103b76af',
    width: 728,
    height: 90,
  },
  SIDEBAR_RECTANGLE: {
    key: 'ea16b4d4359bf41430e0c1ad103b76af',
    width: 300,
    height: 250,
  },
  CONTENT_RECTANGLE: {
    key: 'ea16b4d4359bf41430e0c1ad103b76af',
    width: 300,
    height: 250,
  },
  FOOTER_BANNER: {
    key: 'ea16b4d4359bf41430e0c1ad103b76af',
    width: 728,
    height: 90,
  },
  MOBILE_BANNER: {
    key: 'ea16b4d4359bf41430e0c1ad103b76af',
    width: 320,
    height: 50,
  },
};