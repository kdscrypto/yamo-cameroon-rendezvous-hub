import { useEffect, useState } from 'react';

interface MobileOptimizationProps {
  enableAMP?: boolean;
  preloadCriticalResources?: boolean;
  optimizeForMobile?: boolean;
}

const useMobileOptimization = ({
  enableAMP = false,
  preloadCriticalResources = true,
  optimizeForMobile = true
}: MobileOptimizationProps = {}) => {
  const [isMobile, setIsMobile] = useState(false);
  const [connectionType, setConnectionType] = useState<string>('unknown');

  useEffect(() => {
    // Detect mobile device
    const checkMobile = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const mobileKeywords = ['mobile', 'android', 'iphone', 'ipad', 'tablet'];
      return mobileKeywords.some(keyword => userAgent.includes(keyword)) || 
             window.innerWidth <= 768;
    };

    setIsMobile(checkMobile());

    // Detect connection type
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      setConnectionType(connection?.effectiveType || 'unknown');
    }

    // Mobile-specific optimizations
    if (optimizeForMobile && checkMobile()) {
      // Add mobile-specific meta tags
      const addMobileMetaTags = () => {
        const metaTags = [
          { name: 'mobile-web-app-capable', content: 'yes' },
          { name: 'apple-mobile-web-app-capable', content: 'yes' },
          { name: 'apple-mobile-web-app-status-bar-style', content: 'default' },
          { name: 'apple-mobile-web-app-title', content: 'Yamo' },
          { name: 'application-name', content: 'Yamo' },
          { name: 'msapplication-TileColor', content: '#8B5CF6' },
          { name: 'theme-color', content: '#8B5CF6' },
          { name: 'color-scheme', content: 'dark light' }
        ];

        metaTags.forEach(tag => {
          if (!document.querySelector(`meta[name="${tag.name}"]`)) {
            const meta = document.createElement('meta');
            meta.name = tag.name;
            meta.content = tag.content;
            document.head.appendChild(meta);
          }
        });
      };

      addMobileMetaTags();

      // Preload critical resources for mobile
      if (preloadCriticalResources) {
        const criticalResources = [
          { rel: 'preload', href: '/fonts/inter.woff2', as: 'font', type: 'font/woff2', crossorigin: 'anonymous' },
          { rel: 'preload', href: '/images/logo.webp', as: 'image' },
          { rel: 'dns-prefetch', href: 'https://yamo.lovable.app' }
        ];

        criticalResources.forEach(resource => {
          const link = document.createElement('link');
          Object.assign(link, resource);
          document.head.appendChild(link);
        });
      }
    }

    // AMP optimization
    if (enableAMP) {
      const addAMPSupport = () => {
        if (!document.querySelector('link[rel="amphtml"]')) {
          const ampLink = document.createElement('link');
          ampLink.rel = 'amphtml';
          ampLink.href = `${window.location.href.replace('https://', 'https://amp.')}/amp`;
          document.head.appendChild(ampLink);
        }
      };

      addAMPSupport();
    }

  }, [enableAMP, preloadCriticalResources, optimizeForMobile]);

  return {
    isMobile,
    connectionType,
    isSlowConnection: connectionType === 'slow-2g' || connectionType === '2g'
  };
};

// Mobile SEO utilities
export const addMobileIndexingOptimizations = () => {
  // Add mobile-first indexing signals
  const mobileTags = [
    { name: 'robots', content: 'index, follow, mobile-friendly' },
    { name: 'googlebot', content: 'index, follow, mobile-friendly' },
    { name: 'bingbot', content: 'index, follow, mobile-friendly' },
    { name: 'viewport', content: 'width=device-width, initial-scale=1.0, viewport-fit=cover' }
  ];

  mobileTags.forEach(tag => {
    const existing = document.querySelector(`meta[name="${tag.name}"]`);
    if (existing) {
      existing.setAttribute('content', tag.content);
    } else {
      const meta = document.createElement('meta');
      meta.name = tag.name;
      meta.content = tag.content;
      document.head.appendChild(meta);
    }
  });
};

export const addStructuredDataForMobile = () => {
  const mobileApp = {
    "@context": "https://schema.org",
    "@type": "MobileApplication",
    "name": "Yamo",
    "operatingSystem": "Android, iOS",
    "applicationCategory": "LifestyleApplication",
    "url": "https://yamo.lovable.app",
    "description": "Plateforme d'annonces adultes au Cameroun",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "XAF"
    }
  };

  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(mobileApp);
  document.head.appendChild(script);
};

export default useMobileOptimization;