
import { useEffect } from 'react';

export const useGoogleAds = () => {
  useEffect(() => {
    // Ne pas charger le script en mode développement
    if (process.env.NODE_ENV === 'development') {
      console.log('useGoogleAds: Mode développement - script AdSense non chargé');
      return;
    }

    // Vérifier si le script est déjà chargé
    const existingScript = document.querySelector('script[src*="googlesyndication.com"]');
    if (existingScript) {
      console.log('useGoogleAds: Script AdSense déjà chargé');
      return;
    }

    console.log('useGoogleAds: Chargement du script AdSense');
    
    // Charger le script Google AdSense
    const script = document.createElement('script');
    script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-YOUR_PUBLISHER_ID';
    script.async = true;
    script.crossOrigin = 'anonymous';
    
    // Gestion des événements de chargement
    script.onload = () => {
      console.log('useGoogleAds: Script AdSense chargé avec succès');
      // Initialiser adsbygoogle si ce n'est pas déjà fait
      if (!window.adsbygoogle) {
        window.adsbygoogle = [];
      }
    };
    
    script.onerror = () => {
      console.error('useGoogleAds: Échec du chargement du script AdSense');
    };
    
    document.head.appendChild(script);

    return () => {
      // Nettoyage : retirer le script lors du démontage du composant
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  const refreshAds = () => {
    try {
      if (process.env.NODE_ENV === 'development') {
        console.log('useGoogleAds: Mode développement - rafraîchissement simulé');
        return;
      }

      if (typeof window !== 'undefined' && window.adsbygoogle) {
        console.log('useGoogleAds: Rafraîchissement des publicités');
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } else {
        console.warn('useGoogleAds: AdSense non disponible pour le rafraîchissement');
      }
    } catch (error) {
      console.error('useGoogleAds: Erreur lors du rafraîchissement:', error);
    }
  };

  return { refreshAds };
};
