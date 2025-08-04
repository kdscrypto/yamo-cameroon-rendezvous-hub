import { useEffect } from 'react';
import { logger } from '@/utils/environmentUtils';

interface PerformanceMetrics {
  loadTime: number;
  codeValidationTime: number;
  dataFetchTime: number;
  renderTime: number;
}

class ReferralPerformanceTracker {
  private metrics: PerformanceMetrics = {
    loadTime: 0,
    codeValidationTime: 0,
    dataFetchTime: 0,
    renderTime: 0
  };

  private startTimes: Map<string, number> = new Map();

  startTimer(operation: keyof PerformanceMetrics) {
    this.startTimes.set(operation, performance.now());
  }

  endTimer(operation: keyof PerformanceMetrics) {
    const startTime = this.startTimes.get(operation);
    if (startTime) {
      const duration = performance.now() - startTime;
      this.metrics[operation] = duration;
      this.startTimes.delete(operation);

      // Log si performance dégradée
      if (duration > this.getThreshold(operation)) {
        logger.warn(`Performance dégradée pour ${operation}: ${duration.toFixed(2)}ms`);
      }
    }
  }

  private getThreshold(operation: keyof PerformanceMetrics): number {
    const thresholds = {
      loadTime: 1000,      // 1s
      codeValidationTime: 500,   // 500ms
      dataFetchTime: 2000, // 2s
      renderTime: 100      // 100ms
    };
    return thresholds[operation];
  }

  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  reset() {
    this.metrics = {
      loadTime: 0,
      codeValidationTime: 0,
      dataFetchTime: 0,
      renderTime: 0
    };
    this.startTimes.clear();
  }

  reportMetrics() {
    if (process.env.NODE_ENV === 'production') {
      // En production, envoyer les métriques à un service d'analytics
      logger.info('Métriques de performance parrainage', this.metrics);
    }
  }
}

// Instance singleton
export const performanceTracker = new ReferralPerformanceTracker();

interface ReferralPerformanceMonitorProps {
  onMetricsUpdate?: (metrics: PerformanceMetrics) => void;
}

export const ReferralPerformanceMonitor: React.FC<ReferralPerformanceMonitorProps> = ({ 
  onMetricsUpdate 
}) => {
  useEffect(() => {
    performanceTracker.startTimer('loadTime');

    const handleLoad = () => {
      performanceTracker.endTimer('loadTime');
      const metrics = performanceTracker.getMetrics();
      onMetricsUpdate?.(metrics);
      performanceTracker.reportMetrics();
    };

    // Détecter quand le composant est complètement chargé
    const timeoutId = setTimeout(handleLoad, 100);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [onMetricsUpdate]);

  // Ce composant ne rend rien, il monitore juste les performances
  return null;
};