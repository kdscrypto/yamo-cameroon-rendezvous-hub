
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const cardVariants = cva(
  "rounded-lg border text-card-foreground shadow-sm transition-all duration-200",
  {
    variants: {
      variant: {
        default: "bg-card border-border",
        elevated: "bg-card border-border shadow-md hover:shadow-lg",
        interactive: "bg-card border-border hover:border-primary/30 cursor-pointer transform hover:scale-[1.02] active:scale-[0.98]",
        premium: "bg-gradient-to-br from-card/90 to-primary/5 border-primary/20 shadow-md",
        glass: "bg-card/80 backdrop-blur-lg border-border/50 shadow-lg",
        luxury: "gradient-luxe text-black border-primary/30 shadow-luxury",
      },
      size: {
        sm: "p-3",
        default: "p-6",
        lg: "p-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const cardHeaderVariants = cva(
  "flex flex-col space-y-1.5",
  {
    variants: {
      size: {
        sm: "pb-2",
        default: "pb-4",
        lg: "pb-6",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
)

const cardTitleVariants = cva(
  "font-semibold leading-none tracking-tight",
  {
    variants: {
      size: {
        sm: "text-lg",
        default: "text-2xl",
        lg: "text-3xl",
      },
      variant: {
        default: "text-foreground",
        gradient: "text-gradient-luxe",
        accent: "text-gradient-accent",
      },
    },
    defaultVariants: {
      size: "default",
      variant: "default",
    },
  }
)

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  asChild?: boolean
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, size, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(cardVariants({ variant, size }), className)}
      {...props}
    />
  )
)
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof cardHeaderVariants>
>(({ className, size, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(cardHeaderVariants({ size }), className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement> & VariantProps<typeof cardTitleVariants>
>(({ className, size, variant, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(cardTitleVariants({ size, variant }), className)}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center pt-4", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { 
  Card, 
  CardHeader, 
  CardFooter, 
  CardTitle, 
  CardDescription, 
  CardContent,
  cardVariants,
  cardTitleVariants 
}
