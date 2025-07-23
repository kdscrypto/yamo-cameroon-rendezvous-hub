// Système de monitoring et gestion d'erreurs pour la production
import { SecurityUtils } from './productionConfig';

// Types pour le monitoring
interface SecurityEvent {
  type: 'spam_detected' | 'rate_limit_exceeded' | 'invalid_email' | 'xss_attempt' | 'general_error';
  timestamp: number;
  clientId: string;
  data?: any;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

interface PerformanceMetric {
  action: string;
  duration: number;
  timestamp: number;
  success: boolean;
}

// Gestionnaire d'événements de sécurité
class SecurityMonitor {
  private static instance: SecurityMonitor;
  private events: SecurityEvent[] = [];
  private metrics: PerformanceMetric[] = [];
  private maxEvents = 1000;
  private maxMetrics = 500;

  static getInstance(): SecurityMonitor {
    if (!SecurityMonitor.instance) {
      SecurityMonitor.instance = new SecurityMonitor();
    }
    return SecurityMonitor.instance;
  }

  // Enregistrer un événement de sécurité
  logSecurityEvent(event: Omit<SecurityEvent, 'timestamp' | 'clientId'>): void {
    const fullEvent: SecurityEvent = {
      ...event,
      timestamp: Date.now(),
      clientId: SecurityUtils.getClientIdentifier()
    };

    this.events.unshift(fullEvent);
    
    // Limiter le nombre d'événements stockés
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(0, this.maxEvents);
    }

    // Log selon la sévérité
    if (fullEvent.severity === 'critical' || fullEvent.severity === 'high') {
      SecurityUtils.secureLog('error', `Événement de sécurité ${fullEvent.type}`, fullEvent);
    } else {
      SecurityUtils.secureLog('warn', `Événement de sécurité ${fullEvent.type}`, fullEvent);
    }

    // En production, on pourrait envoyer les événements critiques à un service de monitoring
    if (SecurityUtils.isProduction() && fullEvent.severity === 'critical') {
      this.sendToMonitoringService(fullEvent);
    }
  }

  // Enregistrer une métrique de performance
  logPerformanceMetric(metric: PerformanceMetric): void {
    this.metrics.unshift(metric);
    
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(0, this.maxMetrics);
    }

    // Logger les performances lentes
    if (metric.duration > 5000) { // Plus de 5 secondes
      SecurityUtils.secureLog('warn', `Opération lente détectée: ${metric.action}`, metric);
    }
  }

  // Obtenir les statistiques de sécurité
  getSecurityStats(): {
    totalEvents: number;
    eventsByType: Record<string, number>;
    eventsBySeverity: Record<string, number>;
    recentEvents: SecurityEvent[];
  } {
    const eventsByType: Record<string, number> = {};
    const eventsBySeverity: Record<string, number> = {};

    this.events.forEach(event => {
      eventsByType[event.type] = (eventsByType[event.type] || 0) + 1;
      eventsBySeverity[event.severity] = (eventsBySeverity[event.severity] || 0) + 1;
    });

    return {
      totalEvents: this.events.length,
      eventsByType,
      eventsBySeverity,
      recentEvents: this.events.slice(0, 10)
    };
  }

  // Obtenir les métriques de performance
  getPerformanceStats(): {
    totalMetrics: number;
    averageDuration: number;
    successRate: number;
    recentMetrics: PerformanceMetric[];
  } {
    if (this.metrics.length === 0) {
      return {
        totalMetrics: 0,
        averageDuration: 0,
        successRate: 0,
        recentMetrics: []
      };
    }

    const totalDuration = this.metrics.reduce((sum, metric) => sum + metric.duration, 0);
    const successCount = this.metrics.filter(metric => metric.success).length;

    return {
      totalMetrics: this.metrics.length,
      averageDuration: totalDuration / this.metrics.length,
      successRate: (successCount / this.metrics.length) * 100,
      recentMetrics: this.metrics.slice(0, 10)
    };
  }

  // Envoyer à un service de monitoring (simulation)
  private async sendToMonitoringService(event: SecurityEvent): Promise<void> {
    try {
      // En production réelle, ceci enverrait les données à un service comme Sentry, LogRocket, etc.
      console.error('[SECURITY ALERT]', {
        timestamp: new Date(event.timestamp).toISOString(),
        type: event.type,
        severity: event.severity,
        clientId: event.clientId.slice(-8), // Seulement les 8 derniers caractères pour la confidentialité
        data: event.data
      });
    } catch (error) {
      SecurityUtils.secureLog('error', 'Erreur envoi monitoring', error);
    }
  }

  // Nettoyer les anciens événements
  cleanup(): void {
    const cutoff = Date.now() - (24 * 60 * 60 * 1000); // 24 heures
    this.events = this.events.filter(event => event.timestamp > cutoff);
    this.metrics = this.metrics.filter(metric => metric.timestamp > cutoff);
  }
}

// Décorateur pour mesurer les performances des fonctions
export function measurePerformance(actionName: string) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const startTime = Date.now();
      let success = false;
      
      try {
        const result = await method.apply(this, args);
        success = true;
        return result;
      } catch (error) {
        success = false;
        throw error;
      } finally {
        const duration = Date.now() - startTime;
        securityMonitor.logPerformanceMetric({
          action: actionName,
          duration,
          timestamp: startTime,
          success
        });
      }
    };

    return descriptor;
  };
}

// Gestionnaire d'erreurs global
export class GlobalErrorHandler {
  static initialize(): void {
    // Gestionnaire d'erreurs JavaScript non catchées
    window.addEventListener('error', (event) => {
      securityMonitor.logSecurityEvent({
        type: 'general_error',
        severity: 'high',
        data: {
          message: event.message,
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
          stack: event.error?.stack
        }
      });
    });

    // Gestionnaire de promesses rejetées non catchées
    window.addEventListener('unhandledrejection', (event) => {
      securityMonitor.logSecurityEvent({
        type: 'general_error',
        severity: 'high',
        data: {
          reason: event.reason,
          promise: event.promise
        }
      });
    });

    // Détection de tentatives XSS basiques
    const originalSetAttribute = Element.prototype.setAttribute;
    Element.prototype.setAttribute = function(name: string, value: string) {
      if (typeof value === 'string' && (value.includes('<script') || value.includes('javascript:'))) {
        securityMonitor.logSecurityEvent({
          type: 'xss_attempt',
          severity: 'critical',
          data: { attribute: name, content: value.slice(0, 100) }
        });
        return;
      }
      return originalSetAttribute.call(this, name, value);
    };

    SecurityUtils.secureLog('info', 'Gestionnaire d\'erreurs global initialisé');
  }

  static reportError(error: Error, context?: string): void {
    securityMonitor.logSecurityEvent({
      type: 'general_error',
      severity: 'medium',
      data: {
        message: error.message,
        stack: error.stack,
        context
      }
    });
  }
}

// Utilitaires pour la production
export const ProductionUtils = {
  // Vérifier l'intégrité de l'application
  async checkApplicationIntegrity(): Promise<boolean> {
    try {
      // Vérifier que les services essentiels sont disponibles
      const checks = [
        // Vérifier Supabase
        fetch('https://lusovklxvtzhluekrhwvu.supabase.co/rest/v1/', { method: 'HEAD' }),
        // Vérifier le domaine
        fetch('https://yamo.chat/health.json', { method: 'HEAD' }).catch(() => null)
      ];

      const results = await Promise.allSettled(checks);
      const failedChecks = results.filter(result => result.status === 'rejected').length;
      
      if (failedChecks > 0) {
        securityMonitor.logSecurityEvent({
          type: 'general_error',
          severity: 'high',
          data: { failedChecks, total: checks.length }
        });
      }

      return failedChecks === 0;
    } catch (error) {
      SecurityUtils.secureLog('error', 'Erreur vérification intégrité', error);
      return false;
    }
  },

  // Obtenir les informations sur l'environnement de manière sécurisée
  getEnvironmentInfo(): {
    isProduction: boolean;
    domain: string;
    userAgent: string;
    timestamp: string;
  } {
    return {
      isProduction: SecurityUtils.isProduction(),
      domain: window.location.hostname,
      userAgent: navigator.userAgent.slice(0, 100), // Limiter pour éviter le fingerprinting
      timestamp: new Date().toISOString()
    };
  },

  // Démarrer le monitoring de production
  startProductionMonitoring(): void {
    // Initialiser le gestionnaire d'erreurs
    GlobalErrorHandler.initialize();

    // Vérifier l'intégrité périodiquement
    setInterval(() => {
      this.checkApplicationIntegrity();
    }, 300000); // 5 minutes

    // Nettoyer les logs périodiquement
    setInterval(() => {
      securityMonitor.cleanup();
    }, 3600000); // 1 heure

    SecurityUtils.secureLog('info', 'Monitoring de production démarré');
  }
};

// Exporter l'instance du moniteur
export const securityMonitor = SecurityMonitor.getInstance();

// Hook React pour utiliser le monitoring
export const useProductionMonitoring = () => {
  return {
    logSecurityEvent: securityMonitor.logSecurityEvent.bind(securityMonitor),
    logPerformanceMetric: securityMonitor.logPerformanceMetric.bind(securityMonitor),
    getSecurityStats: securityMonitor.getSecurityStats.bind(securityMonitor),
    getPerformanceStats: securityMonitor.getPerformanceStats.bind(securityMonitor),
    reportError: GlobalErrorHandler.reportError
  };
};