
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAccessibility } from "@/hooks/use-accessibility"
import { AccessibilityUtils } from "@/utils/accessibility-utils"

const notificationVariants = cva(
  "fixed z-50 flex items-start gap-3 rounded-lg border p-4 shadow-lg transition-all duration-300 ease-out transform",
  {
    variants: {
      variant: {
        default: "bg-card text-card-foreground border-border",
        success: "bg-green-50 text-green-900 border-green-200 dark:bg-green-900/10 dark:text-green-400 dark:border-green-800",
        error: "bg-red-50 text-red-900 border-red-200 dark:bg-red-900/10 dark:text-red-400 dark:border-red-800",
        warning: "bg-yellow-50 text-yellow-900 border-yellow-200 dark:bg-yellow-900/10 dark:text-yellow-400 dark:border-yellow-800",
        info: "bg-blue-50 text-blue-900 border-blue-200 dark:bg-blue-900/10 dark:text-blue-400 dark:border-blue-800",
      },
      position: {
        "top-right": "top-4 right-4",
        "top-left": "top-4 left-4",
        "bottom-right": "bottom-4 right-4",
        "bottom-left": "bottom-4 left-4",
        "top-center": "top-4 left-1/2 -translate-x-1/2",
        "bottom-center": "bottom-4 left-1/2 -translate-x-1/2",
      },
      size: {
        sm: "max-w-sm",
        default: "max-w-md",
        lg: "max-w-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      position: "top-right",
      size: "default",
    },
  }
)

const iconMap = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
  default: Info,
}

export interface NotificationProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'>,
    VariantProps<typeof notificationVariants> {
  title?: string
  description?: string
  icon?: React.ReactNode
  dismissible?: boolean
  autoClose?: boolean
  duration?: number
  onDismiss?: () => void
  actions?: React.ReactNode
}

export const Notification = React.memo(React.forwardRef<HTMLDivElement, NotificationProps>(
  ({
    className,
    variant = "default",
    position = "top-right",
    size = "default",
    title,
    description,
    icon,
    dismissible = true,
    autoClose = true,
    duration = 5000,
    onDismiss,
    actions,
    ...props
  }, ref) => {
    const [isVisible, setIsVisible] = React.useState(true)
    const timeoutRef = React.useRef<NodeJS.Timeout>()
    
    const { ref: accessibilityRef, accessibilityProps } = useAccessibility({
      role: "alert",
      ariaLabel: `${variant} notification: ${title || description}`,
    })

    // Auto close functionality
    React.useEffect(() => {
      if (autoClose && duration > 0) {
        timeoutRef.current = setTimeout(() => {
          handleDismiss()
        }, duration)
      }

      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
        }
      }
    }, [autoClose, duration])

    // Announce to screen readers
    React.useEffect(() => {
      if (title || description) {
        AccessibilityUtils.announceToScreenReader(
          `${title ? title + ': ' : ''}${description || ''}`,
          variant === 'error' ? 'assertive' : 'polite'
        )
      }
    }, [title, description, variant])

    const handleDismiss = React.useCallback(() => {
      setIsVisible(false)
      setTimeout(() => {
        onDismiss?.()
      }, 300) // Wait for animation to complete
    }, [onDismiss])

    const IconComponent = icon ? null : iconMap[variant || 'default']

    if (!isVisible) return null

    return (
      <div
        ref={(node) => {
          if (ref) {
            if (typeof ref === 'function') ref(node)
            else ref.current = node
          }
          if (accessibilityRef.current !== node) {
            accessibilityRef.current = node
          }
        }}
        className={cn(
          notificationVariants({ variant, position, size }),
          isVisible ? "animate-fade-in" : "animate-fade-out",
          className
        )}
        {...accessibilityProps}
        {...props}
      >
        {/* Icon */}
        <div className="flex-shrink-0 mt-0.5">
          {icon || (IconComponent && <IconComponent className="h-5 w-5" />)}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {title && (
            <h3 className="text-sm font-medium mb-1">
              {title}
            </h3>
          )}
          {description && (
            <p className="text-sm opacity-90">
              {description}
            </p>
          )}
          {actions && (
            <div className="mt-3 flex gap-2">
              {actions}
            </div>
          )}
        </div>

        {/* Dismiss button */}
        {dismissible && (
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 ml-2 p-1 rounded-md hover:bg-black/5 dark:hover:bg-white/5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Fermer la notification"
          >
            <X className="h-4 w-4" />
          </button>
        )}

        {/* Auto-close progress bar */}
        {autoClose && duration > 0 && (
          <div 
            className="absolute bottom-0 left-0 h-1 bg-current opacity-30 rounded-b-lg animate-shrink"
            style={{ 
              animationDuration: `${duration}ms`,
              animationTimingFunction: 'linear'
            }}
          />
        )}
      </div>
    )
  }
))
Notification.displayName = "Notification"

// Notification Manager Context
interface NotificationItem extends NotificationProps {
  id: string
}

interface NotificationContextValue {
  notifications: NotificationItem[]
  addNotification: (notification: Omit<NotificationItem, 'id'>) => string
  removeNotification: (id: string) => void
  clearAll: () => void
}

const NotificationContext = React.createContext<NotificationContextValue | undefined>(undefined)

export function NotificationProvider({ children }: { children: React.ReactNode }) {  
  const [notifications, setNotifications] = React.useState<NotificationItem[]>([])

  const addNotification = React.useCallback((notification: Omit<NotificationItem, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newNotification = { ...notification, id }
    
    setNotifications(prev => [...prev, newNotification])
    
    return id
  }, [])

  const removeNotification = React.useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id))
  }, [])

  const clearAll = React.useCallback(() => {
    setNotifications([])
  }, [])

  return (
    <NotificationContext.Provider value={{
      notifications,
      addNotification,
      removeNotification,
      clearAll
    }}>
      {children}
      <div className="fixed inset-0 pointer-events-none z-50">
        {notifications.map((notification) => (
          <Notification
            key={notification.id}
            {...notification}
            onDismiss={() => removeNotification(notification.id)}
            className="pointer-events-auto"
          />
        ))}
      </div>
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const context = React.useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
}

// Utility hook for common notification patterns
export function useNotificationActions() {
  const { addNotification } = useNotifications()

  return React.useMemo(() => ({
    success: (title: string, description?: string) =>
      addNotification({ variant: 'success', title, description }),
    
    error: (title: string, description?: string) =>
      addNotification({ variant: 'error', title, description, autoClose: false }),
    
    warning: (title: string, description?: string) =>
      addNotification({ variant: 'warning', title, description }),
    
    info: (title: string, description?: string) =>
      addNotification({ variant: 'info', title, description }),
  }), [addNotification])
}

export { notificationVariants }
