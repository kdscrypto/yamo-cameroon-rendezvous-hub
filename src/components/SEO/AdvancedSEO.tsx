import React, { useEffect } from 'react';
import useMobileOptimization, { addMobileIndexingOptimizations, addStructuredDataForMobile } from '@/hooks/useMobileOptimization';
import usePerformanceMonitoring from '@/hooks/usePerformanceMonitoring';
import useInternationalization, { addGeographicTargeting, addRegionalStructuredData } from '@/hooks/useInternationalization';
import { generateAdSocialImage, generateCategorySocialImage } from '@/utils/socialImageGenerator';

interface AdvancedSEOProps {
  pageType?: 'homepage' | 'category' | 'ad' | 'search';
  data?: any;
  enablePerformanceMonitoring?: boolean;
  enableMobileOptimization?: boolean;
  enableInternationalization?: boolean;
}

const AdvancedSEO = ({ 
  pageType = 'homepage',
  data = {},
  enablePerformanceMonitoring = true,
  enableMobileOptimization = true,
  enableInternationalization = true
}: AdvancedSEOProps) => {
  
  // Initialize advanced optimization hooks
  const { isMobile, isSlowConnection } = useMobileOptimization({
    enableAMP: false,
    preloadCriticalResources: true,
    optimizeForMobile: enableMobileOptimization
  });

  const { performanceData, isGoodPerformance } = usePerformanceMonitoring(enablePerformanceMonitoring);

  const { 
    addHreflangTags, 
    addLanguageMetaTags, 
    addStructuredDataForLanguages 
  } = useInternationalization({
    supportedLanguages: ['fr'],
    defaultLanguage: 'fr',
    enableHreflang: enableInternationalization
  });

  useEffect(() => {
    // Add mobile optimizations
    if (enableMobileOptimization) {
      addMobileIndexingOptimizations();
      addStructuredDataForMobile();
    }

    // Add internationalization
    if (enableInternationalization) {
      addHreflangTags();
      addLanguageMetaTags();
      addStructuredDataForLanguages();
    }

    // Add geographic targeting
    addGeographicTargeting();
    addRegionalStructuredData();

    // Add social media optimizations based on page type
    addSocialMediaOptimizations(pageType, data);

    // Add performance optimization hints
    if (isSlowConnection) {
      addSlowConnectionOptimizations();
    }

  }, [pageType, data, enableMobileOptimization, enableInternationalization, isSlowConnection]);

  // Performance monitoring logging
  useEffect(() => {
    if (performanceData && process.env.NODE_ENV === 'development') {
      console.group('🚀 Advanced SEO Performance Report');
      console.log('Page Type:', pageType);
      console.log('Performance Score:', performanceData.pageScore);
      console.log('Is Mobile:', isMobile);
      console.log('Connection Type:', isSlowConnection ? 'Slow' : 'Fast');
      console.log('Core Web Vitals:', {
        LCP: performanceData.metrics.LCP,
        FID: performanceData.metrics.FID,
        CLS: performanceData.metrics.CLS
      });
      if (performanceData.recommendations.length > 0) {
        console.log('Recommendations:', performanceData.recommendations);
      }
      console.groupEnd();
    }
  }, [performanceData, pageType, isMobile, isSlowConnection]);

  return null; // This component only manages SEO, no visual output
};

// Social media optimization utilities
const addSocialMediaOptimizations = (pageType: string, data: any) => {
  let socialImage = '/lovable-uploads/69763ec0-e661-4629-ba0e-0bfe2a747829.png';
  
  try {
    switch (pageType) {
      case 'ad':
        if (data.id) {
          socialImage = generateAdSocialImage(data);
        }
        break;
      case 'category':
        if (data.category) {
          socialImage = generateCategorySocialImage(data.category, data.itemCount || 0);
        }
        break;
    }
  } catch (error) {
    console.warn('Failed to generate social image:', error);
  }

  // Update social media meta tags
  const socialTags = [
    { property: 'og:image', content: socialImage },
    { property: 'og:image:width', content: '1200' },
    { property: 'og:image:height', content: '630' },
    { property: 'og:image:type', content: 'image/png' },
    { name: 'twitter:image', content: socialImage },
    { name: 'twitter:card', content: 'summary_large_image' }
  ];

  socialTags.forEach(tag => {
    const existing = document.querySelector(`meta[${tag.property ? 'property' : 'name'}="${tag.property || tag.name}"]`);
    if (existing) {
      existing.setAttribute('content', tag.content);
    }
  });
};

// Optimizations for slow connections
const addSlowConnectionOptimizations = () => {
  // Add resource hints for critical resources
  const resourceHints = [
    { rel: 'dns-prefetch', href: '//fonts.googleapis.com' },
    { rel: 'preconnect', href: 'https://yamo.lovable.app' },
    { rel: 'prefetch', href: '/api/ads?limit=5' } // Prefetch critical API calls
  ];

  resourceHints.forEach(hint => {
    if (!document.querySelector(`link[href="${hint.href}"]`)) {
      const link = document.createElement('link');
      Object.assign(link, hint);
      document.head.appendChild(link);
    }
  });

  // Add meta tag for reduced data usage
  const dataHint = document.createElement('meta');
  dataHint.httpEquiv = 'Accept-CH';
  dataHint.content = 'Save-Data, Viewport-Width, Width';
  document.head.appendChild(dataHint);
};

export default AdvancedSEO;