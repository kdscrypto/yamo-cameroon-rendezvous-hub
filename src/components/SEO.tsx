
import * as React from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  siteName?: string;
}

const SEO = ({
  title = "Yamo - Plateforme d'annonces adultes au Cameroun",
  description = "Découvrez Yamo, la plateforme de référence pour les annonces adultes au Cameroun. Rencontres, massages, produits adultes en toute discrétion et sécurité.",
  keywords = "annonces adultes, Cameroun, rencontres, massages, escort, Douala, Yaoundé, plateforme sécurisée",
  image = "/lovable-uploads/69763ec0-e661-4629-ba0e-0bfe2a747829.png",
  url = "https://yamo.lovable.app",
  type = "website",
  publishedTime,
  modifiedTime,
  author = "Yamo",
  siteName = "Yamo"
}: SEOProps) => {
  const fullTitle = title.includes('Yamo') ? title : `${title} | Yamo`;

  // Update document title
  React.useEffect(() => {
    document.title = fullTitle;
    
    // Update meta description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', description);
    
    // Update meta keywords
    let metaKeywords = document.querySelector('meta[name="keywords"]');
    if (!metaKeywords) {
      metaKeywords = document.createElement('meta');
      metaKeywords.setAttribute('name', 'keywords');
      document.head.appendChild(metaKeywords);
    }
    metaKeywords.setAttribute('content', keywords);
  }, [fullTitle, description, keywords]);

  // Return null as this component only handles side effects
  return null;
};

export default SEO;
