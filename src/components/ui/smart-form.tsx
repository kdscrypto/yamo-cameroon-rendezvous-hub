
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { useAsyncState } from "@/hooks/use-async-state"
import { ValidationUtils, type ValidationResult } from "@/utils/validation-utils"
import { useNotificationActions } from "./notification-system"
import { FormFieldEnhanced } from "./form-field-enhanced"
import { ButtonAccessible } from "./button-accessible"
import { Loader2 } from "lucide-react"

const formVariants = cva(
  "space-y-6",
  {
    variants: {
      size: {
        sm: "max-w-sm",
        default: "max-w-md",
        lg: "max-w-lg",
        xl: "max-w-xl",
        full: "w-full",
      },
      layout: {
        vertical: "flex flex-col",
        horizontal: "grid grid-cols-1 md:grid-cols-2 gap-4",
        inline: "flex flex-wrap gap-4 items-end",
      },
    },
    defaultVariants: {
      size: "default",
      layout: "vertical",
    },
  }
)

export interface FormField {
  name: string
  label?: string
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'textarea' | 'select'
  placeholder?: string
  description?: string
  required?: boolean
  disabled?: boolean
  options?: Array<{ value: string; label: string }>
  validation?: {
    required?: boolean
    minLength?: number
    maxLength?: number
    pattern?: RegExp
    custom?: (value: any) => string | null
  }
  defaultValue?: any
  autoComplete?: string
  startIcon?: React.ReactNode
  endIcon?: React.ReactNode
}

export interface SmartFormProps
  extends Omit<React.FormHTMLAttributes<HTMLFormElement>, 'onSubmit'>,
    VariantProps<typeof formVariants> {
  fields: FormField[]
  onSubmit: (data: Record<string, any>) => Promise<void> | void
  submitText?: string
  resetText?: string
  showReset?: boolean
  validateOnChange?: boolean
  validateOnBlur?: boolean
  autoSave?: boolean
  autoSaveDelay?: number
  persistData?: boolean
  storageKey?: string
}

export const SmartForm = React.memo(React.forwardRef<HTMLFormElement, SmartFormProps>(
  ({
    className,
    size = "default",
    layout = "vertical",
    fields,
    onSubmit,
    submitText = "Soumettre",
    resetText = "Réinitialiser",
    showReset = false,
    validateOnChange = true,
    validateOnBlur = true,
    autoSave = false,
    autoSaveDelay = 2000,
    persistData = false,
    storageKey,
    ...props
  }, ref) => {
    const [formData, setFormData] = React.useState<Record<string, any>>({})
    const [fieldErrors, setFieldErrors] = React.useState<Record<string, string>>({})
    const [touched, setTouched] = React.useState<Record<string, boolean>>({})
    const [submitState, submitActions] = useAsyncState()
    const { success, error: notifyError } = useNotificationActions()
    
    const autoSaveTimeoutRef = React.useRef<NodeJS.Timeout>()
    const formId = React.useId()
    const effectiveStorageKey = storageKey || `smart-form-${formId}`

    // Initialize form data
    React.useEffect(() => {
      const initialData: Record<string, any> = {}
      
      // Load from localStorage if persistence is enabled
      if (persistData && effectiveStorageKey) {
        const saved = localStorage.getItem(effectiveStorageKey)
        if (saved) {
          try {
            Object.assign(initialData, JSON.parse(saved))
          } catch (e) {
            console.warn('Impossible de charger les données sauvegardées:', e)
          }
        }
      }
      
      // Apply default values
      fields.forEach(field => {
        if (initialData[field.name] === undefined && field.defaultValue !== undefined) {
          initialData[field.name] = field.defaultValue
        }
      })
      
      setFormData(initialData)
    }, [fields, persistData, effectiveStorageKey])

    // Auto-save functionality
    React.useEffect(() => {
      if (!autoSave || !formData || Object.keys(formData).length === 0) return

      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current)
      }

      autoSaveTimeoutRef.current = setTimeout(() => {
        if (persistData && effectiveStorageKey) {
          localStorage.setItem(effectiveStorageKey, JSON.stringify(formData))
        }
        
        // Trigger auto-save callback if provided
        console.log('Auto-sauvegarde:', formData)
      }, autoSaveDelay)

      return () => {
        if (autoSaveTimeoutRef.current) {
          clearTimeout(autoSaveTimeoutRef.current)
        }
      }
    }, [formData, autoSave, autoSaveDelay, persistData, effectiveStorageKey])

    // Validation function
    const validateField = React.useCallback((field: FormField, value: any): string | null => {
      const { validation } = field
      if (!validation) return null

      // Required validation
      if (validation.required && (!value || (typeof value === 'string' && !value.trim()))) {
        return `${field.label || field.name} est requis`
      }

      // Skip other validations if value is empty and not required
      if (!value || (typeof value === 'string' && !value.trim())) {
        return null
      }

      // Length validations
      if (typeof value === 'string') {
        if (validation.minLength && value.length < validation.minLength) {
          return `${field.label || field.name} doit contenir au moins ${validation.minLength} caractères`
        }
        if (validation.maxLength && value.length > validation.maxLength) {
          return `${field.label || field.name} ne peut pas dépasser ${validation.maxLength} caractères`
        }
      }

      // Pattern validation
      if (validation.pattern && typeof value === 'string' && !validation.pattern.test(value)) {
        return `Format invalide pour ${field.label || field.name}`
      }

      // Custom validation
      if (validation.custom) {
        return validation.custom(value)
      }

      return null
    }, [])

    // Handle field change
    const handleFieldChange = React.useCallback((fieldName: string, value: any) => {
      setFormData(prev => ({ ...prev, [fieldName]: value }))

      if (validateOnChange) {
        const field = fields.find(f => f.name === fieldName)
        if (field) {
          const error = validateField(field, value)
          setFieldErrors(prev => ({
            ...prev,
            [fieldName]: error || ''
          }))
        }
      }
    }, [fields, validateOnChange, validateField])

    // Handle field blur
    const handleFieldBlur = React.useCallback((fieldName: string) => {
      setTouched(prev => ({ ...prev, [fieldName]: true }))

      if (validateOnBlur) {
        const field = fields.find(f => f.name === fieldName)
        if (field) {
          const error = validateField(field, formData[fieldName])
          setFieldErrors(prev => ({
            ...prev,
            [fieldName]: error || ''
          }))
        }
      }
    }, [fields, formData, validateOnBlur, validateField])

    // Validate entire form
    const validateForm = React.useCallback((): boolean => {
      const newErrors: Record<string, string> = {}
      let hasErrors = false

      fields.forEach(field => {
        const error = validateField(field, formData[field.name])
        if (error) {
          newErrors[field.name] = error
          hasErrors = true
        }
      })

      setFieldErrors(newErrors)
      return !hasErrors
    }, [fields, formData, validateField])

    // Handle form submission
    const handleSubmit = React.useCallback(async (e: React.FormEvent) => {
      e.preventDefault()

      // Mark all fields as touched
      const newTouched: Record<string, boolean> = {}
      fields.forEach(field => {
        newTouched[field.name] = true
      })
      setTouched(newTouched)

      // Validate form
      if (!validateForm()) {
        notifyError('Erreur de validation', 'Veuillez corriger les erreurs dans le formulaire')
        return
      }

      // Sanitize data
      const sanitizedData: Record<string, any> = {}
      Object.keys(formData).forEach(key => {
        const value = formData[key]
        sanitizedData[key] = typeof value === 'string' ? ValidationUtils.sanitizeInput(value) : value
      })

      try {
        await submitActions.execute(async () => {
          await onSubmit(sanitizedData)
          
          success('Succès', 'Formulaire soumis avec succès')
          
          // Clear persisted data on successful submission
          if (persistData && effectiveStorageKey) {
            localStorage.removeItem(effectiveStorageKey)
          }
        })
      } catch (error) {
        console.error('Erreur lors de la soumission:', error)
        notifyError(
          'Erreur de soumission',
          error instanceof Error ? error.message : 'Une erreur inattendue s\'est produite'
        )
      }
    }, [fields, formData, validateForm, onSubmit, submitActions, success, notifyError, persistData, effectiveStorageKey])

    // Handle form reset
    const handleReset = React.useCallback(() => {
      const initialData: Record<string, any> = {}
      fields.forEach(field => {
        if (field.defaultValue !== undefined) {
          initialData[field.name] = field.defaultValue
        }
      })
      
      setFormData(initialData)
      setFieldErrors({})
      setTouched({})
      
      if (persistData && effectiveStorageKey) {
        localStorage.removeItem(effectiveStorageKey)
      }
      
      submitActions.reset()
    }, [fields, persistData, effectiveStorageKey, submitActions])

    // Render field component
    const renderField = React.useCallback((field: FormField) => {
      const fieldError = fieldErrors[field.name]
      const isFieldTouched = touched[field.name]
      const showError = isFieldTouched && fieldError

      if (field.type === 'textarea') {
        return (
          <div key={field.name}>
            <label htmlFor={field.name} className="form-label">
              {field.label}
              {field.required && <span className="text-destructive ml-1">*</span>}
            </label>
            <textarea
              id={field.name}
              name={field.name}
              placeholder={field.placeholder}
              required={field.required}
              disabled={field.disabled || submitState.loading}
              value={formData[field.name] || ''}
              onChange={(e) => handleFieldChange(field.name, e.target.value)}
              onBlur={() => handleFieldBlur(field.name)}
              className={cn(
                "form-input min-h-[100px] resize-vertical",
                showError && "border-destructive focus:border-destructive"
              )}
              autoComplete={field.autoComplete}
            />
            {field.description && (
              <p className="form-helper">{field.description}</p>
            )}
            {showError && (
              <p className="form-error">{fieldError}</p>
            )}
          </div>
        )
      }

      if (field.type === 'select' && field.options) {
        return (
          <div key={field.name}>
            <label htmlFor={field.name} className="form-label">
              {field.label}
              {field.required && <span className="text-destructive ml-1">*</span>}
            </label>
            <select
              id={field.name}
              name={field.name}
              required={field.required}
              disabled={field.disabled || submitState.loading}
              value={formData[field.name] || ''}
              onChange={(e) => handleFieldChange(field.name, e.target.value)}
              onBlur={() => handleFieldBlur(field.name)}
              className={cn(
                "form-input",
                showError && "border-destructive focus:border-destructive"
              )}
            >
              <option value="">Sélectionner...</option>
              {field.options.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {field.description && (
              <p className="form-helper">{field.description}</p>
            )}
            {showError && (
              <p className="form-error">{fieldError}</p>
            )}
          </div>
        )
      }

      return (
        <FormFieldEnhanced
          key={field.name}
          id={field.name}
          name={field.name}
          type={field.type || 'text'}
          label={field.label}
          placeholder={field.placeholder}
          description={field.description}
          required={field.required}
          disabled={field.disabled || submitState.loading}
          value={formData[field.name] || ''}
          error={showError ? fieldError : undefined}
          startIcon={field.startIcon}
          endIcon={field.endIcon}
          autoComplete={field.autoComplete}
          onChange={(e) => handleFieldChange(field.name, e.target.value)}
          onBlur={() => handleFieldBlur(field.name)}
          inputState={showError ? "error" : "default"}
        />
      )
    }, [formData, fieldErrors, touched, submitState.loading, handleFieldChange, handleFieldBlur])

    return (
      <form
        ref={ref}
        className={cn(formVariants({ size, layout }), className)}
        onSubmit={handleSubmit}
        noValidate
        {...props}
      >
        {fields.map(renderField)}
        
        <div className="flex gap-4 pt-4">
          <ButtonAccessible
            type="submit"
            loading={submitState.loading}
            disabled={submitState.loading}
            loadingText="Soumission en cours..."
            className="flex-1"
          >
            {submitState.loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {submitText}
          </ButtonAccessible>
          
          {showReset && (
            <ButtonAccessible
              type="button"
              variant="outline"
              onClick={handleReset}
              disabled={submitState.loading}
            >
              {resetText}
            </ButtonAccessible>
          )}
        </div>

        {/* Auto-save indicator */}
        {autoSave && (
          <div className="text-xs text-muted-foreground text-center">
            Les données sont sauvegardées automatiquement
          </div>
        )}
      </form>
    )
  }
))
SmartForm.displayName = "SmartForm"

export { formVariants }
