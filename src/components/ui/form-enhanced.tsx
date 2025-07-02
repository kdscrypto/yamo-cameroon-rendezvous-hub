
import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import {
  Controller,
  ControllerProps,
  FieldPath,
  FieldValues,
  FormProvider,
  useFormContext,
} from "react-hook-form"
import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"

const Form = FormProvider

type FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> = {
  name: TName
}

const FormFieldContext = React.createContext<FormFieldContextValue>(
  {} as FormFieldContextValue
)

const FormField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  ...props
}: ControllerProps<TFieldValues, TName>) => {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  )
}

const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext)
  const itemContext = React.useContext(FormItemContext)
  const { getFieldState, formState } = useFormContext()

  const fieldState = getFieldState(fieldContext.name, formState)

  if (!fieldContext) {
    throw new Error("useFormField should be used within <FormField>")
  }

  const { id } = itemContext

  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState,
  }
}

type FormItemContextValue = {
  id: string
}

const FormItemContext = React.createContext<FormItemContextValue>(
  {} as FormItemContextValue
)

const formItemVariants = cva(
  "space-y-2",
  {
    variants: {
      variant: {
        default: "",
        compact: "space-y-1",
        spacious: "space-y-4",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const FormItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof formItemVariants>
>(({ className, variant, ...props }, ref) => {
  const id = React.useId()

  return (
    <FormItemContext.Provider value={{ id }}>
      <div ref={ref} className={cn(formItemVariants({ variant }), className)} {...props} />
    </FormItemContext.Provider>
  )
})
FormItem.displayName = "FormItem"

const formLabelVariants = cva(
  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
  {
    variants: {
      variant: {
        default: "text-foreground",
        muted: "text-muted-foreground",
        accent: "text-primary",
        required: "text-foreground after:content-['*'] after:ml-1 after:text-destructive",
      },
      size: {
        sm: "text-xs",
        default: "text-sm",
        lg: "text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const FormLabel = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> & 
    VariantProps<typeof formLabelVariants>
>(({ className, variant, size, ...props }, ref) => {
  const { error, formItemId } = useFormField()

  return (
    <Label
      ref={ref}
      className={cn(
        formLabelVariants({ variant, size }),
        error && "text-destructive",
        className
      )}
      htmlFor={formItemId}
      {...props}
    />
  )
})
FormLabel.displayName = "FormLabel"

const FormControl = React.forwardRef<
  React.ElementRef<typeof Slot>,
  React.ComponentPropsWithoutRef<typeof Slot>
>(({ ...props }, ref) => {
  const { error, formItemId, formDescriptionId, formMessageId } = useFormField()

  return (
    <Slot
      ref={ref}
      id={formItemId}
      aria-describedby={
        !error
          ? `${formDescriptionId}`
          : `${formDescriptionId} ${formMessageId}`
      }
      aria-invalid={!!error}
      {...props}
    />
  )
})
FormControl.displayName = "FormControl"

const formDescriptionVariants = cva(
  "text-muted-foreground",
  {
    variants: {
      size: {
        sm: "text-xs",
        default: "text-sm",
      },
      variant: {
        default: "",
        hint: "italic",
        warning: "text-warning",
      },
    },
    defaultVariants: {
      size: "default",
      variant: "default",
    },
  }
)

const FormDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement> & VariantProps<typeof formDescriptionVariants>
>(({ className, size, variant, ...props }, ref) => {
  const { formDescriptionId } = useFormField()

  return (
    <p
      ref={ref}
      id={formDescriptionId}
      className={cn(formDescriptionVariants({ size, variant }), className)}
      {...props}
    />
  )
})
FormDescription.displayName = "FormDescription"

const formMessageVariants = cva(
  "text-sm font-medium",
  {
    variants: {
      variant: {
        destructive: "text-destructive",
        success: "text-success",
        warning: "text-warning",
        info: "text-info",
      },
    },
    defaultVariants: {
      variant: "destructive",
    },
  }
)

const FormMessage = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement> & VariantProps<typeof formMessageVariants>
>(({ className, variant, children, ...props }, ref) => {
  const { error, formMessageId } = useFormField()
  const body = error ? String(error?.message) : children

  if (!body) {
    return null
  }

  return (
    <p
      ref={ref}
      id={formMessageId}
      className={cn(formMessageVariants({ variant }), className)}
      {...props}
    >
      {body}
    </p>
  )
})
FormMessage.displayName = "FormMessage"

export {
  useFormField,
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  FormField,
  formItemVariants,
  formLabelVariants,
  formDescriptionVariants,
  formMessageVariants,
}
