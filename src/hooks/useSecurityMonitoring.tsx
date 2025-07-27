// Hook de monitoring de sécurité en temps réel
import React, { useEffect, useState, useCallback } from 'react';
import { securityMonitor } from '@/utils/productionMonitoring';
import { securityEnforcer } from '@/utils/securityEnforcement';
import { rateLimiter, initializeRateLimiting } from '@/utils/rateLimiting';

interface SecurityMetrics {
  totalEvents: number;
  criticalEvents: number;
  rateLimitViolations: number;
  blockedIPs: string[];
  recentThreats: Array<{
    type: string;
    severity: string;
    timestamp: number;
    source: string;
  }>;
}

interface SecurityAlert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  message: string;
  timestamp: number;
  data?: any;
}

export const useSecurityMonitoring = () => {
  const [metrics, setMetrics] = useState<SecurityMetrics>({
    totalEvents: 0,
    criticalEvents: 0,
    rateLimitViolations: 0,
    blockedIPs: [],
    recentThreats: []
  });
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);

  // Initialiser le monitoring
  const startMonitoring = useCallback(() => {
    if (isMonitoring) return;
    
    setIsMonitoring(true);
    initializeRateLimiting();
    
    // Monitoring périodique
    const interval = setInterval(() => {
      updateMetrics();
      checkForThreats();
    }, 10000); // Toutes les 10 secondes

    return () => {
      clearInterval(interval);
      setIsMonitoring(false);
    };
  }, [isMonitoring]);

  // Mettre à jour les métriques
  const updateMetrics = useCallback(() => {
    try {
      const securityStats = securityMonitor.getSecurityStats();
      const securityMetrics = securityEnforcer.getSecurityMetrics();
      const rateLimitStats = rateLimiter.getStats();

      const newMetrics: SecurityMetrics = {
        totalEvents: securityStats.totalEvents,
        criticalEvents: securityStats.eventsBySeverity?.critical || 0,
        rateLimitViolations: rateLimitStats.activeEntries,
        blockedIPs: securityMetrics.blockedIPs,
        recentThreats: securityStats.recentEvents.slice(0, 10).map(event => ({
          type: event.type,
          severity: event.severity,
          timestamp: event.timestamp,
          source: event.data?.source || 'unknown'
        }))
      };

      setMetrics(newMetrics);
    } catch (error) {
      console.error('Error updating security metrics:', error);
    }
  }, []);

  // Vérifier les menaces critiques
  const checkForThreats = useCallback(() => {
    const securityStats = securityMonitor.getSecurityStats();
    const recentEvents = securityStats.recentEvents.filter(
      event => Date.now() - event.timestamp < 60000 // Dernière minute
    );

    // Alertes pour événements critiques
    const criticalEvents = recentEvents.filter(event => event.severity === 'critical');
    if (criticalEvents.length > 0) {
      const alert: SecurityAlert = {
        id: `critical_${Date.now()}`,
        type: 'critical',
        message: `${criticalEvents.length} critical security event(s) detected`,
        timestamp: Date.now(),
        data: criticalEvents
      };
      
      setAlerts(prev => [alert, ...prev.slice(0, 19)]); // Garder 20 alertes max
    }

    // Alertes pour rate limiting
    const rateLimitEvents = recentEvents.filter(event => event.type === 'rate_limit_exceeded');
    if (rateLimitEvents.length > 5) {
      const alert: SecurityAlert = {
        id: `rate_limit_${Date.now()}`,
        type: 'warning',
        message: `High rate limit violations: ${rateLimitEvents.length} in last minute`,
        timestamp: Date.now(),
        data: rateLimitEvents
      };
      
      setAlerts(prev => [alert, ...prev.slice(0, 19)]);
    }
  }, []);

  // Analyser une requête en temps réel
  const analyzeRequest = useCallback((requestData: {
    url: string;
    method: string;
    headers?: Record<string, string>;
    body?: any;
    userAgent?: string;
    ip?: string;
  }) => {
    try {
      const threats = securityEnforcer.analyzeRequest(requestData);
      
      if (threats.length > 0) {
        securityEnforcer.handleThreats(threats, {
          ip: requestData.ip,
          userId: undefined // À implémenter selon le contexte
        });

        // Créer une alerte si nécessaire
        const highSeverityThreats = threats.filter(t => 
          t.severity === 'high' || t.severity === 'critical'
        );
        
        if (highSeverityThreats.length > 0) {
          const alert: SecurityAlert = {
            id: `threat_${Date.now()}`,
            type: highSeverityThreats.some(t => t.severity === 'critical') ? 'critical' : 'warning',
            message: `Security threat detected: ${threats.map(t => t.type).join(', ')}`,
            timestamp: Date.now(),
            data: threats
          };
          
          setAlerts(prev => [alert, ...prev.slice(0, 19)]);
        }
      }

      return {
        threats,
        safe: threats.length === 0 || threats.every(t => t.severity === 'low')
      };
    } catch (error) {
      console.error('Error analyzing request:', error);
      return { threats: [], safe: true };
    }
  }, []);

  // Nettoyer une alerte
  const dismissAlert = useCallback((alertId: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
  }, []);

  // Obtenir le niveau de sécurité global
  const getSecurityLevel = useCallback((): 'low' | 'medium' | 'high' | 'critical' => {
    if (metrics.criticalEvents > 0) return 'critical';
    if (metrics.blockedIPs.length > 5) return 'high';
    if (metrics.rateLimitViolations > 10) return 'medium';
    return 'low';
  }, [metrics]);

  // Initialiser au montage
  useEffect(() => {
    const cleanup = startMonitoring();
    return cleanup;
  }, [startMonitoring]);

  return {
    metrics,
    alerts,
    isMonitoring,
    securityLevel: getSecurityLevel(),
    analyzeRequest,
    dismissAlert,
    updateMetrics,
    startMonitoring
  };
};

// Hook pour surveiller une page spécifique
export const usePageSecurityMonitoring = (pageName: string) => {
  const { analyzeRequest } = useSecurityMonitoring();

  useEffect(() => {
    // Surveiller les changements de page
    securityMonitor.logPerformanceMetric({
      action: 'page_visit',
      duration: 0,
      timestamp: Date.now(),
      success: true
    });

    // Analyser l'URL actuelle
    const currentUrl = window.location.href;
    analyzeRequest({
      url: currentUrl,
      method: 'GET',
      headers: {},
      userAgent: navigator.userAgent,
    });
  }, [pageName, analyzeRequest]);

  return { pageName };
};

export default useSecurityMonitoring;