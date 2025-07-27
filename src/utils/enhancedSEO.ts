import { generateMetaTags } from '@/utils/seoOptimizations';

// Enhanced SEO configurations for different page types
export const seoConfigs = {
  homepage: {
    title: 'Yamo - Plateforme d\'annonces adultes au Cameroun',
    description: 'Découvrez Yamo, la plateforme de référence pour les annonces adultes au Cameroun. Rencontres, massages, produits adultes en toute discrétion et sécurité.',
    keywords: 'annonces adultes, Cameroun, rencontres, massages, escort, Douala, Yaoundé, plateforme sécurisée',
    url: 'https://yamo.lovable.app/',
    type: 'website'
  },
  
  browse: {
    title: 'Parcourir les annonces adultes au Cameroun - Yamo',
    description: 'Parcourez notre sélection d\'annonces adultes vérifiées au Cameroun. Trouvez ce que vous cherchez en toute sécurité sur Yamo.',
    keywords: 'parcourir annonces, recherche, annonces adultes Cameroun, navigation sécurisée',
    url: 'https://yamo.lovable.app/browse',
    type: 'website'
  },
  
  rencontres: {
    title: 'Rencontres et Escorts au Cameroun - Yamo',
    description: 'Découvrez des annonces de rencontres discrètes et d\'escorts professionnelles au Cameroun. Sécurité et discrétion garanties sur Yamo.',
    keywords: 'rencontres Cameroun, escort Douala, escort Yaoundé, rencontres discrètes, annonces adultes',
    url: 'https://yamo.lovable.app/rencontres',
    type: 'website'
  },
  
  massages: {
    title: 'Massages relaxants et thérapeutiques au Cameroun - Yamo',
    description: 'Trouvez des professionnels du massage au Cameroun. Massages relaxants, thérapeutiques et bien-être. Annonces vérifiées sur Yamo.',
    keywords: 'massage Cameroun, massage relaxant, massage thérapeutique, bien-être, spa Douala, spa Yaoundé',
    url: 'https://yamo.lovable.app/massages',
    type: 'website'
  },
  
  produits: {
    title: 'Produits adultes et accessoires intimes au Cameroun - Yamo',
    description: 'Découvrez notre sélection de produits adultes, lingerie et accessoires intimes au Cameroun. Achat discret et sécurisé sur Yamo.',
    keywords: 'produits adultes, lingerie, accessoires intimes, Cameroun, boutique adulte, achat discret',
    url: 'https://yamo.lovable.app/produits',
    type: 'website'
  },
  
  events: {
    title: 'Événements adultes au Cameroun - Yamo',
    description: 'Découvrez les événements adultes au Cameroun. Soirées, rencontres et événements spéciaux organisés par la communauté Yamo.',
    keywords: 'événements adultes Cameroun, soirées, rencontres événements, communauté adulte',
    url: 'https://yamo.lovable.app/events',
    type: 'website'
  },
  
  login: {
    title: 'Connexion à votre compte Yamo',
    description: 'Connectez-vous à votre compte Yamo pour accéder à vos annonces, messages et profil. Plateforme sécurisée au Cameroun.',
    keywords: 'connexion Yamo, login, compte utilisateur, accès sécurisé',
    url: 'https://yamo.lovable.app/login',
    type: 'website'
  },
  
  register: {
    title: 'Créer un compte Yamo - Inscription gratuite',
    description: 'Créez votre compte Yamo gratuitement pour publier des annonces et contacter d\'autres membres. Inscription simple et sécurisée.',
    keywords: 'inscription Yamo, créer compte, registration gratuite, nouveau membre',
    url: 'https://yamo.lovable.app/register',
    type: 'website'
  }
};

// Generate SEO for ad pages
export const generateAdSEO = (ad: any) => {
  const category = ad.category === 'rencontres' ? 'Rencontre' : 
                  ad.category === 'massages' ? 'Massage' : 
                  ad.category === 'produits' ? 'Produit' : 'Annonce';
  
  const location = ad.location ? ` à ${ad.location}` : ' au Cameroun';
  
  return {
    title: `${ad.title}${location} - ${category} sur Yamo`,
    description: ad.description ? 
      `${ad.description.substring(0, 140)}... Découvrez cette annonce${location} sur Yamo, plateforme sécurisée.` :
      `${category}${location} disponible sur Yamo. Contactez directement pour plus d'informations.`,
    keywords: `${ad.title}, ${ad.category}, ${ad.location || 'Cameroun'}, annonce adulte, Yamo`,
    url: `https://yamo.lovable.app/ad/${ad.id}`,
    type: 'article',
    image: ad.photos && ad.photos.length > 0 ? ad.photos[0] : undefined,
    publishedTime: ad.created_at,
    modifiedTime: ad.updated_at
  };
};

// Enhanced meta tag generation with location-specific optimization
export const generateLocationSEO = (location: string, category?: string) => {
  const locationName = location === 'douala' ? 'Douala' :
                      location === 'yaounde' ? 'Yaoundé' :
                      location === 'bafoussam' ? 'Bafoussam' :
                      location === 'bamenda' ? 'Bamenda' :
                      'Cameroun';
  
  const categoryName = category === 'rencontres' ? 'Rencontres' :
                      category === 'massages' ? 'Massages' :
                      category === 'produits' ? 'Produits' :
                      'Annonces';
  
  return {
    title: `${categoryName} à ${locationName} - Yamo`,
    description: `Découvrez les meilleures ${categoryName.toLowerCase()} à ${locationName}. Annonces vérifiées et sécurisées sur Yamo.`,
    keywords: `${categoryName.toLowerCase()} ${locationName}, annonces ${locationName}, ${categoryName.toLowerCase()} Cameroun`,
    url: `https://yamo.lovable.app/browse?location=${location}${category ? `&category=${category}` : ''}`
  };
};