import { useEffect } from 'react';

export const useAdsterra = () => {
  useEffect(() => {
    // Ne pas charger les scripts en mode développement
    if (process.env.NODE_ENV === 'development') {
      console.log('useAdsterra: Mode développement - scripts Adsterra non chargés');
      return;
    }

    // Vérifier si les scripts sont déjà chargés
    const existingScript = document.querySelector('script[src*="adsterra"]');
    if (existingScript) {
      console.log('useAdsterra: Scripts Adsterra déjà chargés');
      return;
    }

    console.log('useAdsterra: Chargement des scripts Adsterra');
    
    // Note: Adsterra ne nécessite pas de script global
    // Les bannières sont chargées individuellement via leur code d'intégration
    
  }, []);

  const refreshAds = () => {
    try {
      if (process.env.NODE_ENV === 'development') {
        console.log('useAdsterra: Mode développement - rafraîchissement simulé');
        return;
      }

      console.log('useAdsterra: Rafraîchissement des bannières Adsterra');
      // Pour Adsterra, le rafraîchissement peut se faire en rechargeant les bannières
      // Ceci dépend de la méthode d'intégration choisie
      
    } catch (error) {
      console.error('useAdsterra: Erreur lors du rafraîchissement:', error);
    }
  };

  return { refreshAds };
};