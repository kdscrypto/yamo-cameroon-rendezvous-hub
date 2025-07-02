
import { AccessibilityUtils } from './accessibility-utils';

export interface ValidationRule {
  validator: (value: any) => boolean;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ValidationWarning {
  field: string;
  message: string;
  code: string;
}

export class ValidationUtils {
  // Validation des formulaires avec accessibilité
  static validateForm(
    data: Record<string, any>,
    rules: Record<string, ValidationRule[]>
  ): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    Object.keys(rules).forEach(field => {
      const value = data[field];
      const fieldRules = rules[field];

      fieldRules.forEach(rule => {
        if (!rule.validator(value)) {
          const validationItem = {
            field,
            message: rule.message,
            code: `${field}_${rule.severity}`
          };

          if (rule.severity === 'error') {
            errors.push(validationItem);
          } else if (rule.severity === 'warning') {
            warnings.push(validationItem);
          }
        }
      });
    });

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  // Validation d'accessibilité des éléments
  static validateAccessibility(element: HTMLElement): string[] {
    const issues: string[] = [];

    // Vérifier les attributs ARIA
    const ariaIssues = AccessibilityUtils.validateAriaAttributes(element);
    issues.push(...ariaIssues);

    // Vérifier les labels des inputs
    if (element.tagName === 'INPUT' && !element.getAttribute('aria-label') && !element.getAttribute('aria-labelledby')) {
      const associatedLabel = document.querySelector(`label[for="${element.id}"]`);
      if (!associatedLabel) {
        issues.push('Input manque un label accessible');
      }
    }

    // Vérifier le contraste des couleurs
    const computedStyle = window.getComputedStyle(element);
    const color = computedStyle.color;
    const backgroundColor = computedStyle.backgroundColor;
    
    if (color && backgroundColor) {
      const contrast = AccessibilityUtils.checkColorContrast(color, backgroundColor);
      if (!contrast.wcagAA) {
        issues.push('Contraste insuffisant pour WCAG AA');
      }
    }

    // Vérifier la navigation au clavier
    const isInteractive = ['BUTTON', 'A', 'INPUT', 'SELECT', 'TEXTAREA'].includes(element.tagName);
    if (isInteractive && element.tabIndex < 0) {
      issues.push('Élément interactif non accessible au clavier');
    }

    return issues;
  }

  // Validation des données d'annonces
  static validateAdData(adData: any): ValidationResult {
    const rules: Record<string, ValidationRule[]> = {
      title: [
        {
          validator: (value: string) => value && value.length >= 5,
          message: 'Le titre doit contenir au moins 5 caractères',
          severity: 'error'
        },
        {
          validator: (value: string) => value && value.length <= 100,
          message: 'Le titre ne peut pas dépasser 100 caractères',
          severity: 'error'
        }
      ],
      description: [
        {
          validator: (value: string) => value && value.length >= 20,
          message: 'La description doit contenir au moins 20 caractères',
          severity: 'error'
        },
        {
          validator: (value: string) => value && value.length <= 1000,
          message: 'La description ne peut pas dépasser 1000 caractères',
          severity: 'warning'
        }
      ],
      category: [
        {
          validator: (value: string) => ['rencontres', 'massages', 'produits'].includes(value),
          message: 'Catégorie non valide',
          severity: 'error'
        }
      ],
      price: [
        {
          validator: (value: number) => !value || (value > 0 && value <= 10000),
          message: 'Le prix doit être entre 1 et 10000 euros',
          severity: 'warning'
        }
      ]
    };

    return this.validateForm(adData, rules);
  }

  // Validation des données utilisateur
  static validateUserData(userData: any): ValidationResult {
    const rules: Record<string, ValidationRule[]> = {
      email: [
        {
          validator: (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
          message: 'Format d\'email invalide',
          severity: 'error'
        }
      ],
      password: [
        {
          validator: (value: string) => value && value.length >= 8,
          message: 'Le mot de passe doit contenir au moins 8 caractères',
          severity: 'error'
        },
        {
          validator: (value: string) => /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value),
          message: 'Le mot de passe doit contenir une majuscule, une minuscule et un chiffre',
          severity: 'warning'
        }
      ],
      full_name: [
        {
          validator: (value: string) => value && value.trim().length >= 2,
          message: 'Le nom complet doit contenir au moins 2 caractères',
          severity: 'error'
        }
      ]
    };

    return this.validateForm(userData, rules);
  }

  // Nettoyage et sanitisation des données
  static sanitizeInput(input: string): string {
    return input
      .trim()
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '');
  }

  // Validation des fichiers uploadés
  static validateFileUpload(file: File): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Vérifier la taille
    if (file.size > 5 * 1024 * 1024) { // 5MB
      errors.push({
        field: 'file',
        message: 'Le fichier ne peut pas dépasser 5MB',
        code: 'file_size_error'
      });
    }

    // Vérifier le type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      errors.push({
        field: 'file',
        message: 'Format de fichier non supporté. Utilisez JPG, PNG ou WebP',
        code: 'file_type_error'
      });
    }

    // Vérifier le nom du fichier
    if (file.name.length > 100) {
      warnings.push({
        field: 'file',
        message: 'Nom de fichier très long',
        code: 'filename_warning'
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
}

export default ValidationUtils;
