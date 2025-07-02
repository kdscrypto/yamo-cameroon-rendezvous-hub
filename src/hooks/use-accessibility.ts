
import { useEffect, useRef, useCallback } from 'react';

export interface AccessibilityOptions {
  role?: string;
  ariaLabel?: string;
  ariaLabelledBy?: string;
  ariaDescribedBy?: string;
  autoFocus?: boolean;
  trapFocus?: boolean;
}

export const useAccessibility = ({
  role,
  ariaLabel,
  ariaLabelledBy,
  ariaDescribedBy,
  autoFocus = false,
  trapFocus = false,
}: AccessibilityOptions = {}) => {
  const ref = useRef<HTMLElement>(null);

  // Auto focus management
  useEffect(() => {
    if (autoFocus && ref.current) {
      const focusableElement = ref.current.querySelector(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      ) as HTMLElement;
      
      if (focusableElement) {
        setTimeout(() => focusableElement.focus(), 100);
      }
    }
  }, [autoFocus]);

  // Focus trap management
  useEffect(() => {
    if (!trapFocus || !ref.current) return;

    const container = ref.current;
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) as NodeListOf<HTMLElement>;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    container.addEventListener('keydown', handleTabKey);
    return () => container.removeEventListener('keydown', handleTabKey);
  }, [trapFocus]);

  // Generate accessibility props
  const getAccessibilityProps = useCallback(() => {
    const props: Record<string, any> = {};
    
    if (role) props.role = role;
    if (ariaLabel) props['aria-label'] = ariaLabel;
    if (ariaLabelledBy) props['aria-labelledby'] = ariaLabelledBy;
    if (ariaDescribedBy) props['aria-describedby'] = ariaDescribedBy;
    
    return props;
  }, [role, ariaLabel, ariaLabelledBy, ariaDescribedBy]);

  return {
    ref,
    accessibilityProps: getAccessibilityProps(),
  };
};

// Keyboard navigation hook
export const useKeyboardNavigation = (
  items: any[],
  onSelect?: (item: any, index: number) => void
) => {
  const activeIndexRef = useRef(0);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        activeIndexRef.current = Math.min(activeIndexRef.current + 1, items.length - 1);
        break;
      case 'ArrowUp':
        e.preventDefault();
        activeIndexRef.current = Math.max(activeIndexRef.current - 1, 0);
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (onSelect && items[activeIndexRef.current]) {
          onSelect(items[activeIndexRef.current], activeIndexRef.current);
        }
        break;
      case 'Home':
        e.preventDefault();
        activeIndexRef.current = 0;
        break;
      case 'End':
        e.preventDefault();
        activeIndexRef.current = items.length - 1;
        break;
    }
  }, [items, onSelect]);

  return {
    activeIndex: activeIndexRef.current,
    handleKeyDown,
  };
};
