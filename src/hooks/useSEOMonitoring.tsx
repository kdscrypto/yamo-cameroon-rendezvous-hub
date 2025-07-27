import { useEffect } from 'react';
import { trackSEOMetrics, validateSEO } from '@/utils/dynamicSEO';

export const useSEOMonitoring = (enabled: boolean = true) => {
  useEffect(() => {
    if (!enabled) return;

    const checkSEO = () => {
      const metrics = trackSEOMetrics();
      const issues = validateSEO();
      
      // Log SEO metrics in development
      if (process.env.NODE_ENV === 'development') {
        console.group('🔍 SEO Health Check');
        console.log('Metrics:', metrics);
        if (issues.length > 0) {
          console.warn('Issues found:', issues);
        } else {
          console.log('✅ No SEO issues detected');
        }
        console.groupEnd();
      }

      // Send metrics to analytics (in production)
      if (process.env.NODE_ENV === 'production' && (window as any).gtag) {
        (window as any).gtag('event', 'seo_check', {
          custom_parameter: {
            has_meta_description: metrics.hasMetaDescription,
            has_h1: metrics.hasH1,
            has_structured_data: metrics.hasStructuredData,
            images_without_alt: metrics.imageCount - metrics.imagesWithAlt,
            issues_count: issues.length
          }
        });
      }
    };

    // Check SEO after page load
    const timer = setTimeout(checkSEO, 1000);
    
    return () => clearTimeout(timer);
  }, [enabled]);
};

export default useSEOMonitoring;