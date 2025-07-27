// Enhanced input validation and sanitization utilities
import { securityEnforcer } from './securityEnforcement';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  sanitizedValue?: any;
}

export interface SecurityValidationOptions {
  maxLength?: number;
  allowHtml?: boolean;
  allowSql?: boolean;
  requireAlphanumeric?: boolean;
  customPatterns?: RegExp[];
}

export class SecurityValidator {
  private static instance: SecurityValidator;

  static getInstance(): SecurityValidator {
    if (!SecurityValidator.instance) {
      SecurityValidator.instance = new SecurityValidator();
    }
    return SecurityValidator.instance;
  }

  // Validate and sanitize email addresses
  validateEmail(email: string): ValidationResult {
    const errors: string[] = [];
    
    if (!email || typeof email !== 'string') {
      return { isValid: false, errors: ['Email is required'] };
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      errors.push('Invalid email format');
    }

    // Length validation
    if (email.length > 254) {
      errors.push('Email too long');
    }

    // Security validation using security enforcer
    const sanitizedEmail = securityEnforcer.sanitizeInput(email);
    const threats = securityEnforcer.analyzeRequest({
      url: '/validate/email',
      method: 'POST',
      body: { email: sanitizedEmail }
    });

    if (threats.length > 0) {
      errors.push('Email contains potentially dangerous content');
    }

    return {
      isValid: errors.length === 0,
      errors,
      sanitizedValue: sanitizedEmail
    };
  }

  // Validate phone numbers with international support
  validatePhone(phone: string): ValidationResult {
    const errors: string[] = [];
    
    if (!phone || typeof phone !== 'string') {
      return { isValid: false, errors: ['Phone number is required'] };
    }

    // Remove all non-digit characters except + for international prefix
    const cleanPhone = phone.replace(/[^\d+]/g, '');
    
    // Basic phone validation (international format)
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    if (!phoneRegex.test(cleanPhone)) {
      errors.push('Invalid phone number format');
    }

    // Length validation
    if (cleanPhone.length < 7 || cleanPhone.length > 15) {
      errors.push('Phone number must be between 7 and 15 digits');
    }

    return {
      isValid: errors.length === 0,
      errors,
      sanitizedValue: cleanPhone
    };
  }

  // Validate passwords with security requirements
  validatePassword(password: string): ValidationResult {
    const errors: string[] = [];
    
    if (!password || typeof password !== 'string') {
      return { isValid: false, errors: ['Password is required'] };
    }

    // Minimum length
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }

    // Maximum length to prevent DoS
    if (password.length > 128) {
      errors.push('Password too long');
    }

    // Complexity requirements
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChars = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (!hasUppercase) {
      errors.push('Password must contain at least one uppercase letter');
    }
    if (!hasLowercase) {
      errors.push('Password must contain at least one lowercase letter');
    }
    if (!hasNumbers) {
      errors.push('Password must contain at least one number');
    }
    if (!hasSpecialChars) {
      errors.push('Password must contain at least one special character');
    }

    // Check for common weak passwords
    const commonPasswords = [
      'password', '123456', 'password123', 'admin', 'qwerty',
      'letmein', 'welcome', 'monkey', '1234567890'
    ];
    
    if (commonPasswords.includes(password.toLowerCase())) {
      errors.push('Password is too common, please choose a stronger password');
    }

    return {
      isValid: errors.length === 0,
      errors,
      sanitizedValue: password // Don't sanitize passwords, just validate
    };
  }

  // Validate text content (messages, ads, etc.)
  validateTextContent(content: string, options: SecurityValidationOptions = {}): ValidationResult {
    const errors: string[] = [];
    const {
      maxLength = 2000,
      allowHtml = false,
      allowSql = false,
      requireAlphanumeric = false,
      customPatterns = []
    } = options;

    if (!content || typeof content !== 'string') {
      return { isValid: false, errors: ['Content is required'] };
    }

    // Length validation
    if (content.length > maxLength) {
      errors.push(`Content too long (max ${maxLength} characters)`);
    }

    // Security sanitization
    let sanitizedContent = securityEnforcer.sanitizeInput(content);

    // HTML validation
    if (!allowHtml && /<[^>]*>/.test(sanitizedContent)) {
      errors.push('HTML content not allowed');
    }

    // SQL injection prevention
    if (!allowSql) {
      const sqlPatterns = [
        /\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b/i,
        /[';].*(-{2}|\/\*)/,
        /\b(OR|AND)\s+\d+\s*=\s*\d+/i
      ];
      
      for (const pattern of sqlPatterns) {
        if (pattern.test(sanitizedContent)) {
          errors.push('Content contains potentially dangerous SQL patterns');
          break;
        }
      }
    }

    // Alphanumeric requirement
    if (requireAlphanumeric && !/[a-zA-Z0-9]/.test(sanitizedContent)) {
      errors.push('Content must contain alphanumeric characters');
    }

    // Custom pattern validation
    for (const pattern of customPatterns) {
      if (!pattern.test(sanitizedContent)) {
        errors.push('Content does not match required pattern');
      }
    }

    // Analyze for security threats
    const threats = securityEnforcer.analyzeRequest({
      url: '/validate/content',
      method: 'POST',
      body: { content: sanitizedContent }
    });

    if (threats.length > 0) {
      const criticalThreats = threats.filter(t => t.severity === 'critical' || t.severity === 'high');
      if (criticalThreats.length > 0) {
        errors.push('Content contains security threats');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      sanitizedValue: sanitizedContent
    };
  }

  // Validate file uploads
  validateFileUpload(file: File, allowedTypes: string[] = [], maxSize: number = 5 * 1024 * 1024): ValidationResult {
    const errors: string[] = [];

    if (!file) {
      return { isValid: false, errors: ['File is required'] };
    }

    // File size validation
    if (file.size > maxSize) {
      errors.push(`File too large (max ${Math.round(maxSize / 1024 / 1024)}MB)`);
    }

    // File type validation
    if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
      errors.push(`File type not allowed. Allowed types: ${allowedTypes.join(', ')}`);
    }

    // File name validation
    const sanitizedFileName = securityEnforcer.sanitizeInput(file.name);
    if (sanitizedFileName !== file.name) {
      errors.push('File name contains invalid characters');
    }

    // Check for potentially dangerous file extensions
    const dangerousExtensions = ['.exe', '.bat', '.cmd', '.scr', '.pif', '.com', '.js', '.vbs'];
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    
    if (dangerousExtensions.includes(fileExtension)) {
      errors.push('File type not allowed for security reasons');
    }

    return {
      isValid: errors.length === 0,
      errors,
      sanitizedValue: {
        file,
        sanitizedName: sanitizedFileName
      }
    };
  }

  // Validate URLs
  validateUrl(url: string, allowedDomains: string[] = []): ValidationResult {
    const errors: string[] = [];

    if (!url || typeof url !== 'string') {
      return { isValid: false, errors: ['URL is required'] };
    }

    try {
      const urlObj = new URL(url);
      
      // Protocol validation
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        errors.push('Only HTTP and HTTPS URLs are allowed');
      }

      // Domain validation
      if (allowedDomains.length > 0) {
        const isAllowed = allowedDomains.some(domain => 
          urlObj.hostname === domain || urlObj.hostname.endsWith('.' + domain)
        );
        
        if (!isAllowed) {
          errors.push(`Domain not allowed. Allowed domains: ${allowedDomains.join(', ')}`);
        }
      }

      // Security validation
      const sanitizedUrl = securityEnforcer.sanitizeInput(url);
      const threats = securityEnforcer.analyzeRequest({
        url: '/validate/url',
        method: 'POST',
        body: { url: sanitizedUrl }
      });

      if (threats.length > 0) {
        errors.push('URL contains security threats');
      }

    } catch (error) {
      errors.push('Invalid URL format');
    }

    return {
      isValid: errors.length === 0,
      errors,
      sanitizedValue: url
    };
  }
}

// Export singleton instance
export const securityValidator = SecurityValidator.getInstance();

// Convenience functions for common validations
export const validateEmail = (email: string) => securityValidator.validateEmail(email);
export const validatePhone = (phone: string) => securityValidator.validatePhone(phone);
export const validatePassword = (password: string) => securityValidator.validatePassword(password);
export const validateTextContent = (content: string, options?: SecurityValidationOptions) => 
  securityValidator.validateTextContent(content, options);
export const validateFileUpload = (file: File, allowedTypes?: string[], maxSize?: number) => 
  securityValidator.validateFileUpload(file, allowedTypes, maxSize);
export const validateUrl = (url: string, allowedDomains?: string[]) => 
  securityValidator.validateUrl(url, allowedDomains);