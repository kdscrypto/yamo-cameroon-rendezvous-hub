// Système de renforcement de la sécurité avancé
import { securityMonitor } from './productionMonitoring';
import { rateLimiter } from './rateLimiting';

interface SecurityThreat {
  type: 'xss' | 'sql_injection' | 'csrf' | 'brute_force' | 'suspicious_pattern';
  severity: 'low' | 'medium' | 'high' | 'critical';
  source: string;
  description: string;
  data: any;
}

interface SecurityPolicy {
  name: string;
  enabled: boolean;
  config: any;
}

class SecurityEnforcer {
  private static instance: SecurityEnforcer;
  private policies = new Map<string, SecurityPolicy>();
  private blockedIPs = new Set<string>();
  private suspiciousPatterns = new Map<string, number>();

  static getInstance(): SecurityEnforcer {
    if (!SecurityEnforcer.instance) {
      SecurityEnforcer.instance = new SecurityEnforcer();
    }
    return SecurityEnforcer.instance;
  }

  // Initialiser les politiques de sécurité
  initializePolicies() {
    this.policies.set('input_validation', {
      name: 'Input Validation',
      enabled: true,
      config: {
        maxLength: 10000,
        allowedTags: [],
        stripHtml: true
      }
    });

    this.policies.set('rate_limiting', {
      name: 'Rate Limiting',
      enabled: true,
      config: {
        strictMode: true,
        banThreshold: 10
      }
    });

    this.policies.set('content_security', {
      name: 'Content Security',
      enabled: true,
      config: {
        scanUploads: true,
        maxFileSize: 10 * 1024 * 1024, // 10MB
        allowedTypes: ['image/jpeg', 'image/png', 'image/webp']
      }
    });
  }

  // Analyser une requête pour des menaces potentielles
  analyzeRequest(data: {
    url: string;
    method: string;
    headers: Record<string, string>;
    body?: any;
    userAgent?: string;
    ip?: string;
  }): SecurityThreat[] {
    const threats: SecurityThreat[] = [];

    // Vérifier l'IP bloquée
    if (data.ip && this.blockedIPs.has(data.ip)) {
      threats.push({
        type: 'suspicious_pattern',
        severity: 'high',
        source: data.ip,
        description: 'Request from blocked IP address',
        data: { ip: data.ip }
      });
    }

    // Analyser l'URL pour des patterns suspects
    const urlThreats = this.analyzeURL(data.url);
    threats.push(...urlThreats);

    // Analyser le User-Agent
    if (data.userAgent) {
      const uaThreats = this.analyzeUserAgent(data.userAgent);
      threats.push(...uaThreats);
    }

    // Analyser le contenu du body
    if (data.body) {
      const bodyThreats = this.analyzeContent(data.body);
      threats.push(...bodyThreats);
    }

    return threats;
  }

  // Analyser l'URL pour des tentatives d'injection
  private analyzeURL(url: string): SecurityThreat[] {
    const threats: SecurityThreat[] = [];
    const suspiciousPatterns = [
      { pattern: /<script/i, type: 'xss' as const, severity: 'high' as const },
      { pattern: /javascript:/i, type: 'xss' as const, severity: 'high' as const },
      { pattern: /union.*select/i, type: 'sql_injection' as const, severity: 'critical' as const },
      { pattern: /drop.*table/i, type: 'sql_injection' as const, severity: 'critical' as const },
      { pattern: /\.\.\/\.\.\//g, type: 'suspicious_pattern' as const, severity: 'medium' as const },
    ];

    suspiciousPatterns.forEach(({ pattern, type, severity }) => {
      if (pattern.test(url)) {
        threats.push({
          type,
          severity,
          source: 'url',
          description: `Suspicious pattern detected in URL: ${pattern}`,
          data: { url, pattern: pattern.toString() }
        });
      }
    });

    return threats;
  }

  // Analyser le User-Agent pour des bots malveillants
  private analyzeUserAgent(userAgent: string): SecurityThreat[] {
    const threats: SecurityThreat[] = [];
    const suspiciousBots = [
      'sqlmap', 'nikto', 'nmap', 'masscan', 'zap', 'w3af',
      'burpsuite', 'owasp', 'pentest', 'hack', 'exploit'
    ];

    const lowerUA = userAgent.toLowerCase();
    suspiciousBots.forEach(bot => {
      if (lowerUA.includes(bot)) {
        threats.push({
          type: 'suspicious_pattern',
          severity: 'high',
          source: 'user-agent',
          description: `Suspicious bot detected: ${bot}`,
          data: { userAgent, bot }
        });
      }
    });

    return threats;
  }

  // Analyser le contenu pour des tentatives d'injection
  private analyzeContent(content: any): SecurityThreat[] {
    const threats: SecurityThreat[] = [];
    const contentStr = typeof content === 'string' ? content : JSON.stringify(content);

    // Patterns XSS
    const xssPatterns = [
      /<script[^>]*>[\s\S]*?<\/script>/gi,
      /javascript:/gi,
      /onload\s*=/gi,
      /onerror\s*=/gi,
      /onclick\s*=/gi,
    ];

    xssPatterns.forEach(pattern => {
      if (pattern.test(contentStr)) {
        threats.push({
          type: 'xss',
          severity: 'high',
          source: 'content',
          description: 'XSS pattern detected in content',
          data: { pattern: pattern.toString(), content: contentStr.substring(0, 200) }
        });
      }
    });

    // Patterns SQL Injection
    const sqlPatterns = [
      /union\s+select/gi,
      /drop\s+table/gi,
      /delete\s+from/gi,
      /insert\s+into/gi,
      /update\s+set/gi,
      /exec\s*\(/gi,
    ];

    sqlPatterns.forEach(pattern => {
      if (pattern.test(contentStr)) {
        threats.push({
          type: 'sql_injection',
          severity: 'critical',
          source: 'content',
          description: 'SQL injection pattern detected',
          data: { pattern: pattern.toString(), content: contentStr.substring(0, 200) }
        });
      }
    });

    return threats;
  }

  // Nettoyer et valider l'input utilisateur
  sanitizeInput(input: string): string {
    if (!this.policies.get('input_validation')?.enabled) {
      return input;
    }

    const config = this.policies.get('input_validation')?.config;
    
    // Limiter la longueur
    if (input.length > config.maxLength) {
      throw new Error(`Input too long. Maximum ${config.maxLength} characters allowed.`);
    }

    // Supprimer les balises HTML dangereuses
    if (config.stripHtml) {
      input = input.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
      input = input.replace(/<[^>]+>/g, '');
    }

    // Encoder les caractères spéciaux
    input = input
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');

    return input;
  }

  // Bloquer une IP suspecte
  blockIP(ip: string, reason: string) {
    this.blockedIPs.add(ip);
    
    securityMonitor.logSecurityEvent({
      type: 'suspicious_pattern',
      severity: 'high',
      data: {
        ip,
        reason,
        action: 'ip_blocked',
        timestamp: Date.now()
      }
    });
  }

  // Traiter les menaces détectées
  handleThreats(threats: SecurityThreat[], context: { ip?: string; userId?: string }) {
    if (threats.length === 0) return;

    threats.forEach(threat => {
      // Logger la menace
      securityMonitor.logSecurityEvent({
        type: threat.type,
        severity: threat.severity,
        data: {
          ...threat.data,
          context,
          timestamp: Date.now()
        }
      });

      // Actions automatiques
      if (threat.severity === 'critical' || threat.severity === 'high') {
        if (context.ip) {
          // Augmenter le compteur de suspicion
          const current = this.suspiciousPatterns.get(context.ip) || 0;
          this.suspiciousPatterns.set(context.ip, current + 1);

          // Bloquer après plusieurs tentatives
          if (current >= 5) {
            this.blockIP(context.ip, `Multiple security threats: ${threat.type}`);
          }
        }
      }
    });
  }

  // Obtenir les métriques de sécurité
  getSecurityMetrics() {
    return {
      blockedIPs: Array.from(this.blockedIPs),
      suspiciousActivity: Array.from(this.suspiciousPatterns.entries()),
      activePolicies: Array.from(this.policies.values()).filter(p => p.enabled),
      threatStats: securityMonitor.getSecurityStats()
    };
  }

  // Débloquer une IP
  unblockIP(ip: string) {
    this.blockedIPs.delete(ip);
    this.suspiciousPatterns.delete(ip);
    
    securityMonitor.logSecurityEvent({
      type: 'general_error',
      severity: 'low',
      data: {
        ip,
        action: 'ip_unblocked',
        timestamp: Date.now()
      }
    });
  }
}

// Instance globale
export const securityEnforcer = SecurityEnforcer.getInstance();

// Initialiser les politiques
securityEnforcer.initializePolicies();

export default securityEnforcer;