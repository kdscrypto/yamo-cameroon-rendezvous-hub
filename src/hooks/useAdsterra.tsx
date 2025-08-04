import { useEffect } from 'react';
import { shouldShowAds, enableTestMode, isDevelopment } from '@/config/adsterra';

export const useAdsterra = () => {
  useEffect(() => {
    // Activer automatiquement le mode test en développement
    enableTestMode();

    // Ne pas charger les scripts globaux en mode développement sauf si autorisé
    if (!shouldShowAds()) {
      console.log('🔧 useAdsterra: Mode développement - scripts Adsterra non chargés. Mode test activé automatiquement.');
      return;
    }

    console.log('🚀 useAdsterra: Environnement prêt pour Adsterra');
    
    // Note: Adsterra ne nécessite pas de script global
    // Les bannières sont chargées individuellement via leur code d'intégration
    
  }, []);

  const refreshAds = () => {
    try {
      if (isDevelopment()) {
        console.log('🔄 useAdsterra: Mode développement - rafraîchissement simulé');
        // Forcer le rechargement des bannières en développement
        window.dispatchEvent(new Event('adsterra-refresh'));
        return;
      }

      console.log('🔄 useAdsterra: Rafraîchissement des bannières Adsterra');
      // Pour Adsterra, le rafraîchissement peut se faire en rechargeant les bannières
      window.dispatchEvent(new Event('adsterra-refresh'));
      
    } catch (error) {
      console.error('❌ useAdsterra: Erreur lors du rafraîchissement:', error);
    }
  };

  return { refreshAds };
};