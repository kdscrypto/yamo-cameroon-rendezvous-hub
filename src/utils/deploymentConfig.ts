
// Configuration pour le déploiement
export const DEPLOYMENT_CONFIG = {
  // URL de production mise à jour avec votre domaine personnalisé
  PRODUCTION_URL: 'https://yamo.chat',
  
  // URL de développement
  DEVELOPMENT_URL: 'http://localhost:8080',
  
  // Configuration Supabase
  SUPABASE_URL: 'https://lusovklxvtzhluekrhwvu.supabase.co',
  SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx1c292a2x4dnR6aGx1ZWtod3Z1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5NDIyOTQsImV4cCI6MjA2NTUxODI5NH0.u4cFSTWFbC0ar9Fie1YZW26P-g1a_3iyDHscEWPLZcc',
  
  // Métadonnées pour le SEO mises à jour
  META: {
    title: 'Yamo - Plateforme d\'annonces adultes au Cameroun',
    description: 'Découvrez Yamo, la plateforme de référence pour les annonces adultes au Cameroun. Rencontres, massages, produits adultes en toute discrétion et sécurité.',
    keywords: 'annonces adultes, Cameroun, rencontres, massages, escort, Douala, Yaoundé, plateforme sécurisée'
  }
};

// Fonction utilitaire pour obtenir l'URL de base
export const getBaseUrl = (): string => {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  
  // En mode développement
  if (import.meta.env.DEV) {
    return DEPLOYMENT_CONFIG.DEVELOPMENT_URL;
  }
  
  // En production avec le nouveau domaine personnalisé
  return DEPLOYMENT_CONFIG.PRODUCTION_URL;
};

// Fonction pour vérifier si on est en production
export const isProduction = (): boolean => {
  return import.meta.env.PROD;
};

// Fonction pour forcer le rechargement du cache
export const clearCache = (): void => {
  if ('caches' in window) {
    caches.keys().then(names => {
      names.forEach(name => {
        caches.delete(name);
      });
    });
  }
  
  // Forcer le rechargement sans cache
  if (typeof window !== 'undefined') {
    window.location.reload();
  }
};

// Fonction pour vérifier le statut du déploiement
export const checkDeploymentStatus = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${getBaseUrl()}/health`, {
      cache: 'no-cache',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
    return response.ok;
  } catch (error) {
    console.error('Erreur lors de la vérification du déploiement:', error);
    return false;
  }
};
