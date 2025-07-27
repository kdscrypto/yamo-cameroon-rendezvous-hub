import { generateSitemap, generateRobotsTxt } from './sitemapGenerator';

// Enhanced structured data for different page types
export const generateStructuredData = (pageType: string, data: any = {}) => {
  const baseOrganization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Yamo",
    "url": "https://yamo.lovable.app",
    "logo": "https://yamo.lovable.app/favicon.ico",
    "description": "Plateforme d'annonces adultes au Cameroun",
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer service",
      "url": "https://yamo.lovable.app/contact"
    }
  };

  switch (pageType) {
    case 'homepage':
      return {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "Yamo",
        "url": "https://yamo.lovable.app",
        "description": "Plateforme d'annonces adultes au Cameroun",
        "potentialAction": {
          "@type": "SearchAction",
          "target": "https://yamo.lovable.app/browse?q={search_term_string}",
          "query-input": "required name=search_term_string"
        },
        "publisher": baseOrganization
      };
      
    case 'ad':
      return {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": data.title || "Annonce",
        "description": data.description || "",
        "category": data.category || "",
        "url": `https://yamo.lovable.app/ad/${data.id}`,
        "datePublished": data.created_at,
        "dateModified": data.updated_at,
        "image": data.photos && data.photos.length > 0 ? data.photos[0] : null,
        "offers": {
          "@type": "Offer",
          "price": data.price || "0",
          "priceCurrency": "XAF",
          "availability": "https://schema.org/InStock",
          "priceValidUntil": new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        },
        "seller": {
          "@type": "Organization",
          "name": "Yamo",
          "url": "https://yamo.lovable.app"
        },
        "aggregateRating": data.rating ? {
          "@type": "AggregateRating",
          "ratingValue": data.rating,
          "reviewCount": data.reviewCount || 1
        } : undefined,
        "location": data.location ? {
          "@type": "Place",
          "name": data.location,
          "address": {
            "@type": "PostalAddress",
            "addressCountry": "CM",
            "addressRegion": data.location
          }
        } : undefined
      };
      
    case 'category':
      return {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": data.title || "Catégorie",
        "description": data.description || "",
        "url": data.url || "https://yamo.lovable.app",
        "mainEntity": {
          "@type": "ItemList",
          "name": data.title || "Liste d'annonces",
          "numberOfItems": data.itemCount || 0,
          "itemListElement": data.items?.map((item: any, index: number) => ({
            "@type": "ListItem",
            "position": index + 1,
            "item": {
              "@type": "Product",
              "name": item.title,
              "url": `https://yamo.lovable.app/ad/${item.id}`,
              "description": item.description,
              "offers": {
                "@type": "Offer",
                "price": item.price || "0",
                "priceCurrency": "XAF"
              }
            }
          })) || []
        },
        "breadcrumb": {
          "@type": "BreadcrumbList",
          "itemListElement": data.breadcrumbs || []
        },
        "isPartOf": {
          "@type": "WebSite",
          "name": "Yamo",
          "url": "https://yamo.lovable.app"
        }
      };
      
    case 'search':
      return {
        "@context": "https://schema.org",
        "@type": "SearchResultsPage",
        "name": `Résultats de recherche: ${data.query || ''}`,
        "description": `${data.totalResults || 0} résultats trouvés pour "${data.query || ''}"`,
        "url": data.url || "https://yamo.lovable.app/browse",
        "mainEntity": {
          "@type": "ItemList",
          "numberOfItems": data.totalResults || 0,
          "itemListElement": data.results?.map((item: any, index: number) => ({
            "@type": "ListItem",
            "position": index + 1,
            "item": {
              "@type": "Product",
              "name": item.title,
              "url": `https://yamo.lovable.app/ad/${item.id}`
            }
          })) || []
        }
      };
      
    default:
      return baseOrganization;
  }
};

// Generate breadcrumb structured data
export const generateBreadcrumbStructuredData = (breadcrumbs: Array<{name: string, url: string}>) => {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbs.map((crumb, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": crumb.name,
      "item": crumb.url
    }))
  };
};

// SEO meta tags generator
export const generateMetaTags = (config: {
  title: string;
  description: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
  locale?: string;
}) => {
  const {
    title,
    description,
    keywords = '',
    image = 'https://yamo.lovable.app/favicon.ico',
    url = 'https://yamo.lovable.app',
    type = 'website',
    locale = 'fr_FR'
  } = config;

  return {
    title,
    meta: [
      { name: 'description', content: description },
      { name: 'keywords', content: keywords },
      { name: 'robots', content: 'index, follow' },
      { name: 'author', content: 'Yamo' },
      { name: 'generator', content: 'Yamo Platform' },
      { name: 'application-name', content: 'Yamo' },
      { name: 'theme-color', content: '#8B5CF6' },
      
      // Open Graph
      { property: 'og:title', content: title },
      { property: 'og:description', content: description },
      { property: 'og:image', content: image },
      { property: 'og:url', content: url },
      { property: 'og:type', content: type },
      { property: 'og:locale', content: locale },
      { property: 'og:site_name', content: 'Yamo' },
      
      // Twitter
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: title },
      { name: 'twitter:description', content: description },
      { name: 'twitter:image', content: image },
      
      // Mobile
      { name: 'viewport', content: 'width=device-width, initial-scale=1.0' },
      { name: 'mobile-web-app-capable', content: 'yes' },
      { name: 'apple-mobile-web-app-capable', content: 'yes' },
      { name: 'apple-mobile-web-app-status-bar-style', content: 'default' },
      
      // Geographic
      { name: 'geo.region', content: 'CM' },
      { name: 'geo.placename', content: 'Cameroun' },
      { name: 'ICBM', content: '3.848, 11.502' }
    ],
    link: [
      { rel: 'canonical', href: url },
      { rel: 'alternate', hreflang: 'fr', href: url },
      { rel: 'alternate', hreflang: 'x-default', href: url }
    ]
  };
};

// Auto-generate and update sitemap with fresh data
export const updateSitemapWithFreshData = async (baseUrl: string = 'https://yamo.lovable.app') => {
  try {
    // This would typically fetch from your database
    // For now, we'll use a placeholder implementation
    const dynamicAds: Array<{id: string, updated_at: string}> = [];
    
    const sitemap = generateSitemap(baseUrl, dynamicAds);
    const robots = generateRobotsTxt(baseUrl);
    
    return { sitemap, robots };
  } catch (error) {
    console.error('Error generating fresh sitemap:', error);
    return { sitemap: generateSitemap(baseUrl), robots: generateRobotsTxt(baseUrl) };
  }
};