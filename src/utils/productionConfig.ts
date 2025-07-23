// Configuration sécurisée pour la production
import { ENV, logger } from './environmentUtils';

// Configuration de sécurité pour la production
export const PRODUCTION_CONFIG = {
  // Limitation de taux pour les emails
  EMAIL_RATE_LIMIT: {
    maxEmails: 5, // Maximum 5 emails par IP
    timeWindow: 3600000, // 1 heure en millisecondes
    blockDuration: 3600000, // Bloquer pendant 1 heure
  },
  
  // Validation stricte des emails
  EMAIL_VALIDATION: {
    maxLength: 254, // RFC 5321 limite
    maxSubjectLength: 200,
    maxMessageLength: 5000,
    maxNameLength: 100,
  },
  
  // Domaines email interdits
  BLOCKED_DOMAINS: [
    'example.com',
    'test.com',
    'localhost',
    'tempmail.com',
    '10minutemail.com',
    'guerrillamail.com',
    'mailinator.com',
    'throwaway.email',
    'temp-mail.org',
  ],
  
  // Mots-clés de spam détectés dans les messages
  SPAM_KEYWORDS: [
    'viagra',
    'casino',
    'lottery',
    'winner',
    'congratulations',
    'free money',
    'click here',
    'act now',
    'limited time',
    'urgent',
  ],
  
  // Configuration CSP (Content Security Policy)
  CSP_HEADERS: {
    'default-src': "'self'",
    'script-src': "'self' 'unsafe-inline' https://yamo.chat",
    'style-src': "'self' 'unsafe-inline'",
    'img-src': "'self' data: https:",
    'font-src': "'self' https:",
    'connect-src': "'self' https://lusovklxvtzhluekrhwvu.supabase.co wss://lusovklxvtzhluekrhwvu.supabase.co",
    'frame-ancestors': "'none'",
    'base-uri': "'self'",
    'form-action': "'self'",
  },
};

// Classe pour gérer la limitation de taux
class RateLimiter {
  private static instance: RateLimiter;
  private attempts: Map<string, { count: number; firstAttempt: number; blocked?: number }> = new Map();

  static getInstance(): RateLimiter {
    if (!RateLimiter.instance) {
      RateLimiter.instance = new RateLimiter();
    }
    return RateLimiter.instance;
  }

  // Vérifier si une IP est autorisée à envoyer un email
  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const record = this.attempts.get(identifier);
    
    if (!record) {
      // Première tentative
      this.attempts.set(identifier, { count: 1, firstAttempt: now });
      return true;
    }

    // Vérifier si l'IP est bloquée
    if (record.blocked && now - record.blocked < PRODUCTION_CONFIG.EMAIL_RATE_LIMIT.blockDuration) {
      logger.warn(`IP bloquée: ${identifier}`);
      return false;
    }

    // Réinitialiser le compteur si la fenêtre de temps est dépassée
    if (now - record.firstAttempt > PRODUCTION_CONFIG.EMAIL_RATE_LIMIT.timeWindow) {
      this.attempts.set(identifier, { count: 1, firstAttempt: now });
      return true;
    }

    // Vérifier la limite
    if (record.count >= PRODUCTION_CONFIG.EMAIL_RATE_LIMIT.maxEmails) {
      // Bloquer l'IP
      record.blocked = now;
      logger.warn(`IP dépassé la limite et bloquée: ${identifier}`);
      return false;
    }

    // Incrémenter le compteur
    record.count++;
    return true;
  }

  // Nettoyer les anciens enregistrements (à appeler périodiquement)
  cleanup(): void {
    const now = Date.now();
    const cutoff = now - PRODUCTION_CONFIG.EMAIL_RATE_LIMIT.timeWindow;
    
    for (const [key, record] of this.attempts.entries()) {
      if (record.firstAttempt < cutoff && (!record.blocked || now - record.blocked > PRODUCTION_CONFIG.EMAIL_RATE_LIMIT.blockDuration)) {
        this.attempts.delete(key);
      }
    }
  }
}

// Validation sécurisée des emails
export class EmailValidator {
  private static spamRegex = new RegExp(
    PRODUCTION_CONFIG.SPAM_KEYWORDS.join('|'),
    'gi'
  );

  static validateEmail(email: string): { isValid: boolean; error?: string } {
    if (!email || typeof email !== 'string') {
      return { isValid: false, error: 'Email requis' };
    }

    if (email.length > PRODUCTION_CONFIG.EMAIL_VALIDATION.maxLength) {
      return { isValid: false, error: 'Email trop long' };
    }

    // Validation RFC 5322
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    
    if (!emailRegex.test(email)) {
      return { isValid: false, error: 'Format d\'email invalide' };
    }

    // Vérifier les domaines bloqués
    const domain = email.split('@')[1]?.toLowerCase();
    if (PRODUCTION_CONFIG.BLOCKED_DOMAINS.includes(domain)) {
      return { isValid: false, error: 'Domaine email non autorisé' };
    }

    return { isValid: true };
  }

  static validateMessage(message: string): { isValid: boolean; error?: string } {
    if (!message || typeof message !== 'string') {
      return { isValid: false, error: 'Message requis' };
    }

    if (message.length > PRODUCTION_CONFIG.EMAIL_VALIDATION.maxMessageLength) {
      return { isValid: false, error: 'Message trop long' };
    }

    // Détection de spam basique
    if (this.spamRegex.test(message)) {
      logger.warn('Message potentiellement spam détecté');
      return { isValid: false, error: 'Message détecté comme spam' };
    }

    return { isValid: true };
  }

  static validateContactForm(data: {
    name: string;
    email: string;
    subject: string;
    message: string;
  }): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validation du nom
    if (!data.name || data.name.length > PRODUCTION_CONFIG.EMAIL_VALIDATION.maxNameLength) {
      errors.push('Nom invalide ou trop long');
    }

    // Validation de l'email
    const emailValidation = this.validateEmail(data.email);
    if (!emailValidation.isValid) {
      errors.push(emailValidation.error!);
    }

    // Validation du sujet
    if (!data.subject || data.subject.length > PRODUCTION_CONFIG.EMAIL_VALIDATION.maxSubjectLength) {
      errors.push('Sujet invalide ou trop long');
    }

    // Validation du message
    const messageValidation = this.validateMessage(data.message);
    if (!messageValidation.isValid) {
      errors.push(messageValidation.error!);
    }

    return { isValid: errors.length === 0, errors };
  }
}

// Utilitaires de sécurité pour la production
export const SecurityUtils = {
  // Obtenir l'identifiant client (IP simulée côté client)
  getClientIdentifier(): string {
    // En production réelle, ceci serait géré côté serveur
    // Ici on utilise une combinaison de facteurs côté client
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx?.fillText('fingerprint', 10, 10);
    const fingerprint = canvas.toDataURL();
    
    return btoa(
      [
        navigator.userAgent.slice(0, 50),
        navigator.language,
        screen.width + 'x' + screen.height,
        fingerprint.slice(-20),
        new Date().toDateString(), // Réinitialise chaque jour
      ].join('|')
    ).slice(0, 32);
  },

  // Nettoyer les données d'entrée
  sanitizeInput(input: string): string {
    return input
      .trim()
      .replace(/[<>]/g, '') // Supprimer les balises HTML de base
      .replace(/javascript:/gi, '') // Supprimer les tentatives de XSS
      .slice(0, 10000); // Limiter la longueur maximale
  },

  // Vérifier si on est en mode production
  isProduction(): boolean {
    return ENV.isProduction && window.location.hostname === 'yamo.chat';
  },

  // Logger sécurisé pour la production
  secureLog(level: 'info' | 'warn' | 'error', message: string, data?: any): void {
    if (this.isProduction()) {
      // En production, ne logger que les erreurs
      if (level === 'error') {
        console.error(`[YAMO] ${message}`, data);
      }
    } else {
      // En développement, logger tout
      console[level](`[YAMO] ${message}`, data);
    }
  }
};

// Exporter l'instance du rate limiter
export const rateLimiter = RateLimiter.getInstance();

// Nettoyer le rate limiter toutes les heures
if (typeof window !== 'undefined') {
  setInterval(() => {
    rateLimiter.cleanup();
  }, 3600000); // 1 heure
}