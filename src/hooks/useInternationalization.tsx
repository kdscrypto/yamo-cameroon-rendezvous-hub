interface InternationalizationProps {
  supportedLanguages?: string[];
  defaultLanguage?: string;
  enableHreflang?: boolean;
}

const useInternationalization = ({
  supportedLanguages = ['fr', 'en'],
  defaultLanguage = 'fr',
  enableHreflang = true
}: InternationalizationProps = {}) => {
  
  const addHreflangTags = () => {
    if (!enableHreflang) return;

    // Remove existing hreflang tags
    document.querySelectorAll('link[hreflang]').forEach(tag => tag.remove());

    const currentUrl = window.location.href.replace(window.location.search, '');
    const baseUrl = currentUrl.replace(/\/(fr|en)\//, '/');

    supportedLanguages.forEach(lang => {
      const link = document.createElement('link');
      link.rel = 'alternate';
      link.hreflang = lang;
      
      if (lang === defaultLanguage) {
        link.href = baseUrl;
      } else {
        link.href = `${baseUrl}${lang}/`;
      }
      
      document.head.appendChild(link);
    });

    // Add x-default hreflang
    const defaultLink = document.createElement('link');
    defaultLink.rel = 'alternate';
    defaultLink.hreflang = 'x-default';
    defaultLink.href = baseUrl;
    document.head.appendChild(defaultLink);
  };

  const addLanguageMetaTags = () => {
    // Set content language
    document.documentElement.lang = defaultLanguage;
    
    // Add or update meta tags
    const metaTags = [
      { httpEquiv: 'Content-Language', content: defaultLanguage },
      { name: 'language', content: defaultLanguage },
      { property: 'og:locale', content: defaultLanguage === 'fr' ? 'fr_FR' : 'en_US' }
    ];

    metaTags.forEach(tag => {
      const existing = document.querySelector(`meta[${tag.httpEquiv ? 'http-equiv' : tag.property ? 'property' : 'name'}="${tag.httpEquiv || tag.property || tag.name}"]`);
      
      if (existing) {
        existing.setAttribute('content', tag.content);
      } else {
        const meta = document.createElement('meta');
        if (tag.httpEquiv) meta.setAttribute('http-equiv', tag.httpEquiv);
        else if (tag.property) meta.setAttribute('property', tag.property);
        else meta.name = tag.name!;
        meta.content = tag.content;
        document.head.appendChild(meta);
      }
    });
  };

  const generateMultilingualSitemap = () => {
    const sitemapLinks = supportedLanguages.map(lang => {
      const url = lang === defaultLanguage ? 
        'https://yamo.lovable.app/sitemap.xml' : 
        `https://yamo.lovable.app/${lang}/sitemap.xml`;
      
      return `<sitemap><loc>${url}</loc></sitemap>`;
    }).join('\n');

    return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapLinks}
</sitemapindex>`;
  };

  const addStructuredDataForLanguages = () => {
    const organizationData = {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "Yamo",
      "url": "https://yamo.lovable.app",
      "sameAs": supportedLanguages.map(lang => 
        lang === defaultLanguage ? 
          'https://yamo.lovable.app' : 
          `https://yamo.lovable.app/${lang}`
      ),
      "availableLanguage": supportedLanguages.map(lang => ({
        "@type": "Language",
        "name": lang === 'fr' ? 'Français' : 'English',
        "alternateName": lang
      }))
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(organizationData);
    document.head.appendChild(script);
  };

  return {
    addHreflangTags,
    addLanguageMetaTags,
    generateMultilingualSitemap,
    addStructuredDataForLanguages,
    currentLanguage: defaultLanguage,
    supportedLanguages
  };
};

// Geographic targeting enhancements
export const addGeographicTargeting = () => {
  const geoTags = [
    { name: 'geo.region', content: 'CM' },
    { name: 'geo.country', content: 'Cameroon' },
    { name: 'geo.placename', content: 'Cameroun' },
    { name: 'ICBM', content: '3.848, 11.502' }, // Coordinates for Cameroon
    { name: 'geo.position', content: '3.848;11.502' },
    { property: 'og:country-name', content: 'Cameroun' },
    { property: 'og:region', content: 'Central Africa' }
  ];

  geoTags.forEach(tag => {
    const existing = document.querySelector(`meta[${tag.property ? 'property' : 'name'}="${tag.property || tag.name}"]`);
    
    if (!existing) {
      const meta = document.createElement('meta');
      if (tag.property) meta.setAttribute('property', tag.property);
      else meta.name = tag.name;
      meta.content = tag.content;
      document.head.appendChild(meta);
    }
  });
};

// Regional structured data
export const addRegionalStructuredData = () => {
  const regions = [
    { name: 'Douala', coordinates: '4.0483, 9.7043' },
    { name: 'Yaoundé', coordinates: '3.8480, 11.5021' },
    { name: 'Bafoussam', coordinates: '5.4781, 10.4199' },
    { name: 'Bamenda', coordinates: '5.9597, 10.1494' }
  ];

  const serviceArea = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "Services d'annonces adultes",
    "provider": {
      "@type": "Organization",
      "name": "Yamo"
    },
    "areaServed": regions.map(region => ({
      "@type": "City",
      "name": region.name,
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": region.coordinates.split(', ')[0],
        "longitude": region.coordinates.split(', ')[1]
      },
      "containedInPlace": {
        "@type": "Country",
        "name": "Cameroun",
        "alternateName": "CM"
      }
    }))
  };

  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(serviceArea);
  document.head.appendChild(script);
};

export default useInternationalization;