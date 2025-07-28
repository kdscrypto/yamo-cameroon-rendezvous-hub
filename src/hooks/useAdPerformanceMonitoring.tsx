import { useEffect, useRef, useState } from 'react';
import { ADSTERRA_CONFIG } from '@/config/adsterraConfig';

interface AdPerformanceMetrics {
  totalAds: number;
  loadedAds: number;
  failedAds: number;
  averageLoadTime: number;
  errors: string[];
  adBlockerDetected: boolean;
}

interface AdLoadEvent {
  timestamp: number;
  adKey: string;
  loadTime: number;
  success: boolean;
  error?: string;
}

export const useAdPerformanceMonitoring = () => {
  const loadEventsRef = useRef<AdLoadEvent[]>([]);
  const [metrics, setMetrics] = useState<AdPerformanceMetrics>({
    totalAds: 0,
    loadedAds: 0,
    failedAds: 0,
    averageLoadTime: 0,
    errors: [],
    adBlockerDetected: false
  });

  // Surveiller les bannières dans le DOM
  useEffect(() => {
    const checkAdElements = () => {
      const adElements = document.querySelectorAll('.adsterra-banner');
      const totalAds = adElements.length;
      
      // Détecter un bloqueur de publicité
      const adBlockerDetected = totalAds > 0 && 
        document.querySelectorAll('script[src*="highperformanceformat.com"]').length === 0;

      const loadedAds = Array.from(adElements).filter(el => {
        const loadingState = el.getAttribute('data-loading-state');
        if (loadingState) {
          try {
            const state = JSON.parse(loadingState);
            return state.loaded;
          } catch {
            return false;
          }
        }
        return false;
      }).length;

      const failedAds = totalAds - loadedAds;
      
      const averageLoadTime = loadEventsRef.current.length > 0 
        ? loadEventsRef.current
            .filter(event => event.success)
            .reduce((sum, event) => sum + event.loadTime, 0) / 
          loadEventsRef.current.filter(event => event.success).length
        : 0;

      const errors = loadEventsRef.current
        .filter(event => !event.success && event.error)
        .map(event => event.error!)
        .slice(-5); // Garder les 5 dernières erreurs

      setMetrics({
        totalAds,
        loadedAds,
        failedAds,
        averageLoadTime,
        errors,
        adBlockerDetected
      });
    };

    // Vérification initiale
    checkAdElements();

    // Observer les changements dans le DOM
    const observer = new MutationObserver(() => {
      checkAdElements();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['data-loading-state']
    });

    // Vérification périodique
    const interval = setInterval(checkAdElements, 5000);

    return () => {
      observer.disconnect();
      clearInterval(interval);
    };
  }, []);

  // Fonction pour enregistrer un événement de chargement
  const recordLoadEvent = (adKey: string, loadTime: number, success: boolean, error?: string) => {
    const event: AdLoadEvent = {
      timestamp: Date.now(),
      adKey,
      loadTime,
      success,
      error
    };

    loadEventsRef.current.push(event);

    // Garder seulement les 100 derniers événements
    if (loadEventsRef.current.length > 100) {
      loadEventsRef.current = loadEventsRef.current.slice(-100);
    }

    console.log('AdPerformanceMonitoring: Événement enregistré', event);
  };

  // Fonction pour obtenir les statistiques détaillées
  const getDetailedStats = () => {
    const events = loadEventsRef.current;
    const last24h = events.filter(event => 
      Date.now() - event.timestamp < 24 * 60 * 60 * 1000
    );

    const successRate = events.length > 0 
      ? (events.filter(e => e.success).length / events.length) * 100 
      : 0;

    const adKeyStats = Object.entries(
      events.reduce((acc, event) => {
        if (!acc[event.adKey]) {
          acc[event.adKey] = { total: 0, success: 0, avgLoadTime: 0, loadTimes: [] };
        }
        acc[event.adKey].total++;
        if (event.success) {
          acc[event.adKey].success++;
          acc[event.adKey].loadTimes.push(event.loadTime);
        }
        return acc;
      }, {} as Record<string, any>)
    ).map(([adKey, stats]: [string, any]) => ({
      adKey,
      total: stats.total,
      success: stats.success,
      successRate: (stats.success / stats.total) * 100,
      avgLoadTime: stats.loadTimes.length > 0 
        ? stats.loadTimes.reduce((a: number, b: number) => a + b, 0) / stats.loadTimes.length 
        : 0
    }));

    return {
      totalEvents: events.length,
      eventsLast24h: last24h.length,
      overallSuccessRate: successRate,
      adKeyStats,
      recentErrors: events
        .filter(e => !e.success && e.error)
        .slice(-10)
        .map(e => ({ timestamp: e.timestamp, error: e.error! }))
    };
  };

  // Fonction pour générer un rapport de performance
  const generatePerformanceReport = () => {
    const stats = getDetailedStats();
    const report = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      config: {
        loadDelay: ADSTERRA_CONFIG.SETTINGS.LOAD_DELAY,
        testMode: ADSTERRA_CONFIG.SETTINGS.TEST_MODE
      },
      metrics,
      detailedStats: stats,
      recommendations: []
    };

    // Ajouter des recommandations basées sur les métriques
    const recommendations: string[] = [];
    
    if (metrics.adBlockerDetected) {
      recommendations.push('Bloqueur de publicité détecté - considérer des messages informatifs');
    }
    
    if (stats.overallSuccessRate < 80) {
      recommendations.push('Taux de succès faible - vérifier la connectivité et les clés');
    }
    
    if (metrics.averageLoadTime > 5000) {
      recommendations.push('Temps de chargement élevé - optimiser la configuration');
    }
    
    if (metrics.errors.length > 3) {
      recommendations.push('Nombreuses erreurs - analyser les causes racines');
    }

    report.recommendations = recommendations;
    
    console.log('Rapport de performance Adsterra:', report);
    return report;
  };

  return {
    metrics,
    recordLoadEvent,
    getDetailedStats,
    generatePerformanceReport
  };
};