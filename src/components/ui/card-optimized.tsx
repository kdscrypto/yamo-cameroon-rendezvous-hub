
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { useIntersectionObserver, usePerformantAnimation } from "@/hooks/use-performance"
import { useAccessibility } from "@/hooks/use-accessibility"

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

export interface CardOptimizedProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  asChild?: boolean
  lazyLoad?: boolean
  ariaLabel?: string
  interactive?: boolean
  onInteraction?: () => void
}

const CardOptimized = React.memo(React.forwardRef<HTMLDivElement, CardOptimizedProps>(
  ({ 
    className, 
    variant, 
    size, 
    lazyLoad = false, 
    ariaLabel,
    interactive = false,
    onInteraction,
    children,
    ...props 
  }, ref) => {
    const [isVisible, setIsVisible] = React.useState(!lazyLoad);
    const [hasInteracted, setHasInteracted] = React.useState(false);
    
    const { accessibilityProps } = useAccessibility({
      ariaLabel,
      role: interactive ? 'button' : undefined,
    });

    const intersectionRef = useIntersectionObserver(
      React.useCallback((isIntersecting) => {
        if (isIntersecting && !isVisible) {
          setIsVisible(true);
        }
      }, [isVisible]),
      { threshold: 0.1, rootMargin: '50px' }
    );

    const animationRef = usePerformantAnimation(isVisible);

    const handleInteraction = React.useCallback((e: React.MouseEvent | React.KeyboardEvent) => {
      if (!interactive) return;
      
      if ('key' in e && e.key !== 'Enter' && e.key !== ' ') return;
      
      setHasInteracted(true);
      onInteraction?.();
    }, [interactive, onInteraction]);

    // Combiner les refs
    const combinedRef = React.useCallback((node: HTMLDivElement) => {
      if (ref) {
        if (typeof ref === 'function') {
          ref(node);
        } else {
          ref.current = node;
        }
      }
      
      if (intersectionRef.current !== node) {
        intersectionRef.current = node;
      }
      
      if (animationRef.current !== node) {
        animationRef.current = node;
      }
    }, [ref, intersectionRef, animationRef]);

    if (lazyLoad && !isVisible) {
      return (
        <div
          ref={combinedRef}
          className={cn(cardVariants({ variant, size }), "min-h-[200px] bg-muted/20 animate-pulse", className)}
          {...accessibilityProps}
        />
      );
    }

    return (
      <div
        ref={combinedRef}
        className={cn(
          cardVariants({ variant, size }), 
          interactive && "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          hasInteracted && "animate-scale-in",
          className
        )}
        onClick={handleInteraction}
        onKeyDown={handleInteraction}
        tabIndex={interactive ? 0 : undefined}
        {...accessibilityProps}
        {...props}
      >
        {isVisible && children}
      </div>
    )
  }
))
CardOptimized.displayName = "CardOptimized"

const CardHeader = React.memo(React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 pb-4", className)}
    {...props}
  />
)))
CardHeader.displayName = "CardHeader"

const CardTitle = React.memo(React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("text-2xl font-semibold leading-none tracking-tight", className)}
    {...props}
  />
)))
CardTitle.displayName = "CardTitle"

const CardDescription = React.memo(React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
)))
CardDescription.displayName = "CardDescription"

const CardContent = React.memo(React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("pt-0", className)} {...props} />
)))
CardContent.displayName = "CardContent"

const CardFooter = React.memo(React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center pt-4", className)}
    {...props}
  />
)))
CardFooter.displayName = "CardFooter"

export { 
  CardOptimized, 
  CardHeader, 
  CardFooter, 
  CardTitle, 
  CardDescription, 
  CardContent,
  cardVariants 
}
