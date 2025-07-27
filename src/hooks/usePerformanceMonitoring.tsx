import { useEffect, useState } from 'react';

interface PerformanceMetrics {
  // Core Web Vitals
  LCP: number | null; // Largest Contentful Paint
  FID: number | null; // First Input Delay
  CLS: number | null; // Cumulative Layout Shift
  
  // Additional metrics
  FCP: number | null; // First Contentful Paint
  TTFB: number | null; // Time to First Byte
  
  // SEO-specific metrics
  timeToInteractive: number | null;
  totalBlockingTime: number | null;
  speedIndex: number | null;
}

interface SEOPerformanceData {
  metrics: PerformanceMetrics;
  pageScore: number;
  recommendations: string[];
  timestamp: number;
}

const usePerformanceMonitoring = (enabled: boolean = true) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    LCP: null,
    FID: null,
    CLS: null,
    FCP: null,
    TTFB: null,
    timeToInteractive: null,
    totalBlockingTime: null,
    speedIndex: null
  });

  const [performanceData, setPerformanceData] = useState<SEOPerformanceData | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const measurePerformance = async () => {
      try {
        // Import web-vitals dynamically to avoid bundle size issues
        const vitals = await import('web-vitals');

        const newMetrics: PerformanceMetrics = { ...metrics };

        // Measure Core Web Vitals
        if (vitals.onCLS) {
          vitals.onCLS((metric) => {
            newMetrics.CLS = metric.value;
            setMetrics({ ...newMetrics });
          });
        }

        if (vitals.onFCP) {
          vitals.onFCP((metric) => {
            newMetrics.FCP = metric.value;
            setMetrics({ ...newMetrics });
          });
        }

        if (vitals.onLCP) {
          vitals.onLCP((metric) => {
            newMetrics.LCP = metric.value;
            setMetrics({ ...newMetrics });
          });
        }

        if (vitals.onTTFB) {
          vitals.onTTFB((metric) => {
            newMetrics.TTFB = metric.value;
            setMetrics({ ...newMetrics });
          });
        }

        // FID might not be available in some versions
        if (vitals.onINP) {
          vitals.onINP((metric) => {
            newMetrics.FID = metric.value;
            setMetrics({ ...newMetrics });
          });
        }

        // Additional performance measurements
        if ('performance' in window) {
          const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
          
          if (navigation) {
            newMetrics.timeToInteractive = navigation.domInteractive - navigation.fetchStart;
            setMetrics({ ...newMetrics });
          }
        }

      } catch (error) {
        console.warn('Web Vitals not available:', error);
        
        // Fallback performance measurements
        if ('performance' in window) {
          const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
          
          if (navigation) {
            const fallbackMetrics: PerformanceMetrics = {
              LCP: navigation.loadEventEnd - navigation.fetchStart,
              FID: null,
              CLS: null,
              FCP: navigation.responseEnd - navigation.fetchStart,
              TTFB: navigation.responseStart - navigation.fetchStart,
              timeToInteractive: navigation.domInteractive - navigation.fetchStart,
              totalBlockingTime: null,
              speedIndex: null
            };
            
            setMetrics(fallbackMetrics);
          }
        }
      }
    };

    // Wait for page load to measure performance
    if (document.readyState === 'complete') {
      measurePerformance();
    } else {
      window.addEventListener('load', measurePerformance);
      return () => window.removeEventListener('load', measurePerformance);
    }
  }, [enabled]);

  // Calculate performance score and recommendations
  useEffect(() => {
    if (metrics.LCP && metrics.FCP && metrics.TTFB) {
      const score = calculatePerformanceScore(metrics);
      const recommendations = generateRecommendations(metrics);
      
      setPerformanceData({
        metrics,
        pageScore: score,
        recommendations,
        timestamp: Date.now()
      });

      // Send to analytics in production
      if (process.env.NODE_ENV === 'production') {
        sendPerformanceToAnalytics(metrics, score);
      }
    }
  }, [metrics]);

  return {
    metrics,
    performanceData,
    isGoodPerformance: performanceData ? performanceData.pageScore > 75 : null
  };
};

const calculatePerformanceScore = (metrics: PerformanceMetrics): number => {
  let score = 100;
  
  // LCP scoring (0-4s optimal)
  if (metrics.LCP) {
    if (metrics.LCP > 4000) score -= 30;
    else if (metrics.LCP > 2500) score -= 15;
  }
  
  // FCP scoring (0-2s optimal)
  if (metrics.FCP) {
    if (metrics.FCP > 3000) score -= 20;
    else if (metrics.FCP > 1800) score -= 10;
  }
  
  // TTFB scoring (0-200ms optimal)
  if (metrics.TTFB) {
    if (metrics.TTFB > 600) score -= 20;
    else if (metrics.TTFB > 300) score -= 10;
  }
  
  // CLS scoring (0-0.1 optimal)
  if (metrics.CLS) {
    if (metrics.CLS > 0.25) score -= 15;
    else if (metrics.CLS > 0.1) score -= 8;
  }
  
  return Math.max(0, score);
};

const generateRecommendations = (metrics: PerformanceMetrics): string[] => {
  const recommendations: string[] = [];
  
  if (metrics.LCP && metrics.LCP > 2500) {
    recommendations.push('Optimize Largest Contentful Paint by compressing images and improving server response time');
  }
  
  if (metrics.FCP && metrics.FCP > 1800) {
    recommendations.push('Improve First Contentful Paint by reducing render-blocking resources');
  }
  
  if (metrics.TTFB && metrics.TTFB > 300) {
    recommendations.push('Reduce Time to First Byte by optimizing server performance');
  }
  
  if (metrics.CLS && metrics.CLS > 0.1) {
    recommendations.push('Minimize Cumulative Layout Shift by setting image dimensions and avoiding dynamic content injection');
  }
  
  if (metrics.FID && metrics.FID > 100) {
    recommendations.push('Improve First Input Delay by reducing JavaScript execution time');
  }
  
  return recommendations;
};

const sendPerformanceToAnalytics = (metrics: PerformanceMetrics, score: number) => {
  try {
    if ((window as any).gtag) {
      (window as any).gtag('event', 'performance_metrics', {
        custom_parameter: {
          lcp: metrics.LCP,
          fid: metrics.FID,
          cls: metrics.CLS,
          fcp: metrics.FCP,
          ttfb: metrics.TTFB,
          performance_score: score,
          page_url: window.location.pathname
        }
      });
    }
  } catch (error) {
    console.warn('Failed to send performance data to analytics:', error);
  }
};

export default usePerformanceMonitoring;