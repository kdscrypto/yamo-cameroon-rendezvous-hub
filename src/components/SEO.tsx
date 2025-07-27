
import { Helmet } from 'react-helmet-async';

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
  const fullUrl = url.startsWith('http') ? url : `https://yamo.lovable.app${url}`;
  const fullImage = image.startsWith('http') ? image : `https://yamo.lovable.app${image}`;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content={author} />
      <meta name="generator" content="Yamo Platform" />
      <meta name="application-name" content="Yamo" />
      <meta name="theme-color" content="#8B5CF6" />
      <meta name="robots" content="index, follow" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta httpEquiv="Content-Language" content="fr" />
      
      {/* Mobile Optimization */}
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      
      {/* Canonical URL */}
      <link rel="canonical" href={fullUrl} />
      
      {/* Open Graph Meta Tags */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImage} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content="fr_FR" />
      
      {publishedTime && <meta property="article:published_time" content={publishedTime} />}
      {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
      {author && <meta property="article:author" content={author} />}
      
      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImage} />
      <meta name="twitter:url" content={fullUrl} />
      
      {/* Additional SEO Meta Tags */}
      <meta name="geo.region" content="CM" />
      <meta name="geo.country" content="Cameroon" />
      <meta name="geo.placename" content="Cameroun" />
      
      {/* JSON-LD Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          "name": siteName,
          "url": fullUrl,
          "description": description,
          "inLanguage": "fr",
          "potentialAction": {
            "@type": "SearchAction",
            "target": `${fullUrl}/browse?q={search_term_string}`,
            "query-input": "required name=search_term_string"
          },
          "publisher": {
            "@type": "Organization",
            "name": siteName,
            "url": fullUrl,
            "logo": {
              "@type": "ImageObject",
              "url": fullImage
            }
          }
        })}
      </script>
    </Helmet>
  );
};

export default SEO;
