
import * as React from "react"
import { VariantProps } from "class-variance-authority"
import { FormItem, FormLabel, FormControl, FormDescription, FormMessage, formItemVariants, formLabelVariants } from "@/components/ui/form-enhanced"
import { Input, inputVariants } from "@/components/ui/input-enhanced"
import { cn } from "@/lib/utils"

interface FormFieldEnhancedProps extends 
  React.InputHTMLAttributes<HTMLInputElement>,
  VariantProps<typeof inputVariants>,
  VariantProps<typeof formItemVariants>,
  VariantProps<typeof formLabelVariants> {
  label?: string
  description?: string
  error?: string
  labelVariant?: VariantProps<typeof formLabelVariants>['variant']
  labelSize?: VariantProps<typeof formLabelVariants>['size']
  itemVariant?: VariantProps<typeof formItemVariants>['variant']
  inputVariant?: VariantProps<typeof inputVariants>['variant']
  inputSize?: VariantProps<typeof inputVariants>['size']
  inputState?: VariantProps<typeof inputVariants>['state']
  startIcon?: React.ReactNode
  endIcon?: React.ReactNode
  loading?: boolean
  required?: boolean
}

const FormFieldEnhanced = React.forwardRef<HTMLInputElement, FormFieldEnhancedProps>(
  ({ 
    className,
    label,
    description,
    error,
    labelVariant = "default",
    labelSize = "default",
    itemVariant = "default",
    inputVariant = "default",
    inputSize = "default",
    inputState = "default",
    startIcon,
    endIcon,
    loading,
    required,
    id,
    ...props 
  }, ref) => {
    const inputId = id || React.useId()
    const finalLabelVariant = required ? "required" : labelVariant
    const finalInputState = error ? "error" : inputState

    return (
      <FormItem variant={itemVariant}>
        {label && (
          <FormLabel 
            htmlFor={inputId}
            variant={finalLabelVariant}
            size={labelSize}
          >
            {label}
          </FormLabel>
        )}
        <FormControl>
          <Input
            id={inputId}
            ref={ref}
            variant={inputVariant}
            size={inputSize}
            state={finalInputState}
            startIcon={startIcon}
            endIcon={endIcon}
            loading={loading}
            className={className}
            {...props}
          />
        </FormControl>
        {description && (
          <FormDescription>
            {description}
          </FormDescription>
        )}
        {error && (
          <FormMessage>
            {error}
          </FormMessage>
        )}
      </FormItem>
    )
  }
)
FormFieldEnhanced.displayName = "FormFieldEnhanced"

export { FormFieldEnhanced }
