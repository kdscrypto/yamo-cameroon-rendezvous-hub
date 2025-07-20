
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface SEOConfig {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
}

const defaultSEO: Record<string, SEOConfig> = {
  '/': {
    title: "Yamo - Plateforme d'annonces adultes au Cameroun",
    description: "Découvrez Yamo, la plateforme de référence pour les annonces adultes au Cameroun. Rencontres, massages, produits adultes en toute discrétion et sécurité.",
    keywords: 'annonces adultes, Cameroun, rencontres, massages, escort, Douala, Yaoundé, plateforme sécurisée'
  },
  '/browse': {
    title: 'Parcourir les annonces - Yamo',
    description: "Parcourez notre sélection d'annonces adultes vérifiées au Cameroun. Trouvez ce que vous cherchez en toute sécurité.",
    keywords: 'parcourir annonces, recherche, annonces adultes Cameroun'
  },
  '/rencontres': {
    title: 'Rencontres et Escorts au Cameroun - Yamo',
    description: "Découvrez des annonces de rencontres discrètes et d'escorts professionnelles au Cameroun. Sécurité et discrétion garanties.",
    keywords: 'rencontres Cameroun, escort Douala, escort Yaoundé, rencontres discrètes'
  },
  '/massages': {
    title: 'Massages relaxants et thérapeutiques - Yamo',
    description: 'Trouvez des professionnels du massage au Cameroun. Massages relaxants, thérapeutiques et bien-être.',
    keywords: 'massage Cameroun, massage relaxant, massage thérapeutique, bien-être'
  },
  '/produits': {
    title: 'Produits adultes et accessoires intimes - Yamo',
    description: 'Découvrez notre sélection de produits adultes, lingerie et accessoires intimes au Cameroun.',
    keywords: 'produits adultes, lingerie, accessoires intimes, Cameroun'
  },
  '/login': {
    title: 'Connexion - Yamo',
    description: 'Connectez-vous à votre compte Yamo pour accéder à vos annonces et messages.',
    keywords: 'connexion, login, compte Yamo'
  },
  '/register': {
    title: 'Inscription - Yamo',
    description: 'Créez votre compte Yamo pour publier des annonces et contacter d\'autres membres.',
    keywords: 'inscription, créer compte, register Yamo'
  }
};

export const useSEO = () => {
  const location = useLocation();
  
  const getSEOForPath = (path: string): SEOConfig => {
    return defaultSEO[path] || defaultSEO['/'];
  };

  useEffect(() => {
    const seo = getSEOForPath(location.pathname);
    
    // Update page title
    if (seo.title) {
      document.title = seo.title;
    }
    
    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription && seo.description) {
      metaDescription.setAttribute('content', seo.description);
    }
    
    // Update meta keywords
    const metaKeywords = document.querySelector('meta[name="keywords"]');
    if (metaKeywords && seo.keywords) {
      metaKeywords.setAttribute('content', seo.keywords);
    }
  }, [location.pathname]);

  return { getSEOForPath };
};
