import { useState, useCallback } from 'react';
import { 
  validateEmail, 
  validatePhone, 
  validatePassword, 
  validateTextContent,
  validateFileUpload,
  validateUrl,
  type ValidationResult,
  type SecurityValidationOptions 
} from '@/utils/securityValidation';

export interface FormValidationState {
  isValid: boolean;
  errors: Record<string, string[]>;
  isValidating: boolean;
}

export interface UseSecureFormValidationReturn {
  validationState: FormValidationState;
  validateField: (fieldName: string, value: any, options?: any) => Promise<ValidationResult>;
  validateForm: (formData: Record<string, any>, rules: ValidationRules) => Promise<boolean>;
  clearFieldError: (fieldName: string) => void;
  clearAllErrors: () => void;
  getFieldError: (fieldName: string) => string | undefined;
  hasErrors: boolean;
}

export interface ValidationRules {
  [fieldName: string]: {
    type: 'email' | 'phone' | 'password' | 'text' | 'file' | 'url';
    required?: boolean;
    options?: SecurityValidationOptions | string[] | number; // For file types or URL domains or max size
  };
}

export const useSecureFormValidation = (): UseSecureFormValidationReturn => {
  const [validationState, setValidationState] = useState<FormValidationState>({
    isValid: true,
    errors: {},
    isValidating: false
  });

  const updateFieldError = useCallback((fieldName: string, errors: string[]) => {
    setValidationState(prev => ({
      ...prev,
      errors: {
        ...prev.errors,
        [fieldName]: errors
      },
      isValid: Object.keys({ ...prev.errors, [fieldName]: errors }).every(
        key => !prev.errors[key] || prev.errors[key].length === 0
      )
    }));
  }, []);

  const clearFieldError = useCallback((fieldName: string) => {
    setValidationState(prev => {
      const newErrors = { ...prev.errors };
      delete newErrors[fieldName];
      
      return {
        ...prev,
        errors: newErrors,
        isValid: Object.keys(newErrors).every(key => newErrors[key].length === 0)
      };
    });
  }, []);

  const clearAllErrors = useCallback(() => {
    setValidationState({
      isValid: true,
      errors: {},
      isValidating: false
    });
  }, []);

  const validateField = useCallback(async (
    fieldName: string, 
    value: any, 
    options?: any
  ): Promise<ValidationResult> => {
    setValidationState(prev => ({ ...prev, isValidating: true }));

    try {
      let result: ValidationResult;

      switch (fieldName) {
        case 'email':
          result = validateEmail(value);
          break;
        case 'phone':
          result = validatePhone(value);
          break;
        case 'password':
          result = validatePassword(value);
          break;
        case 'text':
        case 'message':
        case 'content':
        case 'description':
        case 'title':
          result = validateTextContent(value, options);
          break;
        case 'file':
        case 'image':
        case 'attachment':
          if (value instanceof File) {
            const allowedTypes = Array.isArray(options) ? options : [];
            const maxSize = typeof options === 'number' ? options : undefined;
            result = validateFileUpload(value, allowedTypes, maxSize);
          } else {
            result = { isValid: false, errors: ['Invalid file'] };
          }
          break;
        case 'url':
        case 'link':
        case 'website':
          const allowedDomains = Array.isArray(options) ? options : [];
          result = validateUrl(value, allowedDomains);
          break;
        default:
          // Default text validation for unknown fields
          result = validateTextContent(value, options);
          break;
      }

      updateFieldError(fieldName, result.errors);
      return result;

    } catch (error) {
      const errorResult = {
        isValid: false,
        errors: ['Validation error occurred']
      };
      updateFieldError(fieldName, errorResult.errors);
      return errorResult;
    } finally {
      setValidationState(prev => ({ ...prev, isValidating: false }));
    }
  }, [updateFieldError]);

  const validateForm = useCallback(async (
    formData: Record<string, any>, 
    rules: ValidationRules
  ): Promise<boolean> => {
    setValidationState(prev => ({ ...prev, isValidating: true }));

    try {
      const validationPromises = Object.entries(rules).map(async ([fieldName, rule]) => {
        const value = formData[fieldName];
        
        // Check if field is required
        if (rule.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
          updateFieldError(fieldName, [`${fieldName} is required`]);
          return false;
        }

        // Skip validation if field is empty and not required
        if (!value || (typeof value === 'string' && value.trim() === '')) {
          clearFieldError(fieldName);
          return true;
        }

        // Perform type-specific validation
        let result: ValidationResult;

        switch (rule.type) {
          case 'email':
            result = validateEmail(value);
            break;
          case 'phone':
            result = validatePhone(value);
            break;
          case 'password':
            result = validatePassword(value);
            break;
          case 'text':
            result = validateTextContent(value, rule.options as SecurityValidationOptions);
            break;
          case 'file':
            if (value instanceof File) {
              const allowedTypes = Array.isArray(rule.options) ? rule.options : [];
              const maxSize = typeof rule.options === 'number' ? rule.options : undefined;
              result = validateFileUpload(value, allowedTypes, maxSize);
            } else {
              result = { isValid: false, errors: ['Invalid file'] };
            }
            break;
          case 'url':
            const allowedDomains = Array.isArray(rule.options) ? rule.options : [];
            result = validateUrl(value, allowedDomains);
            break;
          default:
            result = { isValid: true, errors: [] };
            break;
        }

        updateFieldError(fieldName, result.errors);
        return result.isValid;
      });

      const results = await Promise.all(validationPromises);
      const isFormValid = results.every(isValid => isValid);

      setValidationState(prev => ({
        ...prev,
        isValid: isFormValid,
        isValidating: false
      }));

      return isFormValid;

    } catch (error) {
      setValidationState(prev => ({
        ...prev,
        isValid: false,
        isValidating: false
      }));
      return false;
    }
  }, [updateFieldError, clearFieldError]);

  const getFieldError = useCallback((fieldName: string): string | undefined => {
    const errors = validationState.errors[fieldName];
    return errors && errors.length > 0 ? errors[0] : undefined;
  }, [validationState.errors]);

  const hasErrors = Object.keys(validationState.errors).some(
    key => validationState.errors[key] && validationState.errors[key].length > 0
  );

  return {
    validationState: {
      ...validationState,
      isValid: validationState.isValid && !hasErrors
    },
    validateField,
    validateForm,
    clearFieldError,
    clearAllErrors,
    getFieldError,
    hasErrors
  };
};

// Predefined validation rules for common forms
export const commonValidationRules = {
  // User registration form
  registration: {
    email: { type: 'email' as const, required: true },
    password: { type: 'password' as const, required: true },
    fullName: { 
      type: 'text' as const, 
      required: true,
      options: { maxLength: 100, requireAlphanumeric: true }
    },
    phone: { type: 'phone' as const, required: false }
  },

  // User login form
  login: {
    email: { type: 'email' as const, required: true },
    password: { type: 'password' as const, required: true }
  },

  // Ad creation form
  adCreation: {
    title: { 
      type: 'text' as const, 
      required: true,
      options: { maxLength: 200, requireAlphanumeric: true }
    },
    description: { 
      type: 'text' as const, 
      required: true,
      options: { maxLength: 2000 }
    },
    price: { type: 'text' as const, required: false },
    location: { 
      type: 'text' as const, 
      required: false,
      options: { maxLength: 100 }
    },
    phone: { type: 'phone' as const, required: false },
    whatsapp: { type: 'phone' as const, required: false }
  },

  // Contact form
  contact: {
    name: { 
      type: 'text' as const, 
      required: true,
      options: { maxLength: 100, requireAlphanumeric: true }
    },
    email: { type: 'email' as const, required: true },
    subject: { 
      type: 'text' as const, 
      required: true,
      options: { maxLength: 200 }
    },
    message: { 
      type: 'text' as const, 
      required: true,
      options: { maxLength: 2000 }
    }
  },

  // Message composition
  message: {
    content: { 
      type: 'text' as const, 
      required: true,
      options: { maxLength: 2000 }
    },
    attachment: { 
      type: 'file' as const, 
      required: false,
      options: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf']
    }
  },

  // Profile update
  profile: {
    fullName: { 
      type: 'text' as const, 
      required: false,
      options: { maxLength: 100, requireAlphanumeric: true }
    },
    phone: { type: 'phone' as const, required: false },
    avatarUrl: { 
      type: 'url' as const, 
      required: false,
      options: ['trusted-domain.com'] // Add your trusted image domains
    }
  }
} as const;