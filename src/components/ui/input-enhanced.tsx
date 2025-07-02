
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const inputVariants = cva(
  "flex w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors duration-200 md:text-sm",
  {
    variants: {
      variant: {
        default: "border-border bg-background",
        filled: "border-border bg-muted/30",
        flushed: "border-0 border-b-2 border-border rounded-none bg-transparent focus-visible:border-primary focus-visible:ring-0 focus-visible:ring-offset-0",
        outline: "border-2 border-border bg-transparent focus-visible:border-primary",
        ghost: "border-0 bg-transparent focus-visible:bg-muted/30",
      },
      size: {
        sm: "h-8 px-2 text-xs",
        default: "h-10 px-3 py-2",
        lg: "h-12 px-4 py-3 text-base",
        xl: "h-14 px-5 py-4 text-lg",
      },
      state: {
        default: "",
        error: "border-destructive focus-visible:ring-destructive",
        success: "border-success focus-visible:ring-success",
        warning: "border-warning focus-visible:ring-warning",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      state: "default",
    },
  }
)

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof inputVariants> {
  startIcon?: React.ReactNode
  endIcon?: React.ReactNode
  loading?: boolean
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, variant, size, state, startIcon, endIcon, loading, ...props }, ref) => {
    const hasStartIcon = startIcon || loading
    const hasEndIcon = endIcon

    if (hasStartIcon || hasEndIcon) {
      return (
        <div className="relative">
          {hasStartIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {loading ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                startIcon
              )}
            </div>
          )}
          <input
            type={type}
            className={cn(
              inputVariants({ variant, size, state }),
              hasStartIcon && "pl-10",
              hasEndIcon && "pr-10",
              className
            )}
            ref={ref}
            {...props}
          />
          {hasEndIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {endIcon}
            </div>
          )}
        </div>
      )
    }

    return (
      <input
        type={type}
        className={cn(inputVariants({ variant, size, state }), className)}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input, inputVariants }
