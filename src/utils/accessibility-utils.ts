
// Utilitaires pour l'accessibilité et la conformité WCAG

export const AccessibilityUtils = {
  // Génère un ID unique pour les éléments associés
  generateId: (prefix: string = 'element'): string => {
    return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
  },

  // Vérifie le contraste des couleurs
  checkColorContrast: (foreground: string, background: string): {
    ratio: number;
    wcagAA: boolean;
    wcagAAA: boolean;
  } => {
    // Calcul simplifié du ratio de contraste
    const getLuminance = (hex: string): number => {
      const rgb = hex.match(/\w\w/g)?.map(x => parseInt(x, 16)) || [0, 0, 0];
      const [r, g, b] = rgb.map(c => {
        c = c / 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
      });
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };

    const l1 = getLuminance(foreground);
    const l2 = getLuminance(background);
    const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);

    return {
      ratio,
      wcagAA: ratio >= 4.5,
      wcagAAA: ratio >= 7,
    };
  },

  // Annonce les changements aux lecteurs d'écran
  announceToScreenReader: (message: string, priority: 'polite' | 'assertive' = 'polite'): void => {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.setAttribute('class', 'sr-only');
    announcement.textContent = message;

    document.body.appendChild(announcement);

    // Nettoyer après 1 seconde
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  },

  // Gère le focus trap pour les modales
  trapFocus: (container: HTMLElement): (() => void) => {
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

    // Focuser le premier élément
    firstElement?.focus();

    // Retourner la fonction de nettoyage
    return () => {
      container.removeEventListener('keydown', handleTabKey);
    };
  },

  // Valide les attributs ARIA
  validateAriaAttributes: (element: HTMLElement): string[] => {
    const errors: string[] = [];
    const ariaAttributes = Array.from(element.attributes).filter(attr => 
      attr.name.startsWith('aria-')
    );

    ariaAttributes.forEach(attr => {
      switch (attr.name) {
        case 'aria-labelledby':
        case 'aria-describedby':
          const ids = attr.value.split(' ');
          ids.forEach(id => {
            if (!document.getElementById(id)) {
              errors.push(`Élément référencé par ${attr.name} avec l'ID "${id}" non trouvé`);
            }
          });
          break;
        
        case 'aria-expanded':
          if (!['true', 'false'].includes(attr.value)) {
            errors.push(`aria-expanded doit être "true" ou "false", reçu: "${attr.value}"`);
          }
          break;
        
        case 'aria-hidden':
          if (!['true', 'false'].includes(attr.value)) {
            errors.push(`aria-hidden doit être "true" ou "false", reçu: "${attr.value}"`);
          }
          break;
      }
    });

    return errors;
  },

  // Utilitaire pour les annonces de changement d'état
  announceStateChange: (elementId: string, newState: string): void => {
    const element = document.getElementById(elementId);
    if (element) {
      element.setAttribute('aria-live', 'polite');
      element.setAttribute('aria-atomic', 'true');
      
      // Utiliser un timeout pour s'assurer que le changement est annoncé
      setTimeout(() => {
        AccessibilityUtils.announceToScreenReader(
          `État changé pour ${elementId}: ${newState}`
        );
      }, 100);
    }
  }
};

export default AccessibilityUtils;
