import { useEffect } from 'react';

export const useAdsterraDimensionsFix = () => {
  useEffect(() => {
    // Fonction pour surveiller et corriger les dimensions des bannières Adsterra
    const fixAdsterraDimensions = () => {
      const adContainers = document.querySelectorAll('.adsterra-banner-container');
      
      adContainers.forEach((container) => {
        const slot = container.getAttribute('data-slot');
        if (!slot) return;

        // Dimensions attendues selon le slot
        const expectedDimensions = {
          'BANNER_728x90': { width: 728, height: 90 },
          'SIDEBAR_RECTANGLE': { width: 300, height: 250 },
          'CONTENT_RECTANGLE': { width: 336, height: 280 },
          'FOOTER_BANNER': { width: 728, height: 90 },
          'MOBILE_BANNER': { width: 320, height: 50 }
        };

        const dimensions = expectedDimensions[slot as keyof typeof expectedDimensions];
        if (!dimensions) return;

        // Vérifier si c'est mobile pour les bannières desktop
        const isMobile = window.innerWidth <= 768;
        let targetWidth = dimensions.width;
        let targetHeight = dimensions.height;

        if (isMobile && (slot === 'BANNER_728x90' || slot === 'FOOTER_BANNER')) {
          targetWidth = 320;
          targetHeight = 50;
        } else if (isMobile && (slot === 'SIDEBAR_RECTANGLE' || slot === 'CONTENT_RECTANGLE')) {
          targetWidth = 300;
          targetHeight = 250;
        }

        // Appliquer les dimensions au conteneur
        const element = container as HTMLElement;
        element.style.width = `${targetWidth}px`;
        element.style.height = `${targetHeight}px`;
        element.style.minWidth = `${targetWidth}px`;
        element.style.minHeight = `${targetHeight}px`;
        element.style.maxWidth = `${targetWidth}px`;
        element.style.maxHeight = `${targetHeight}px`;

        // Corriger aussi les éléments enfants (iframes, divs)
        const childElements = element.querySelectorAll('iframe, div');
        childElements.forEach((child) => {
          const childElement = child as HTMLElement;
          childElement.style.width = '100%';
          childElement.style.height = '100%';
          childElement.style.maxWidth = '100%';
          childElement.style.maxHeight = '100%';
          childElement.style.border = 'none';
          childElement.style.margin = '0';
          childElement.style.padding = '0';
        });

        console.log(`AdsterraDimensionsFix: Dimensions corrigées pour ${slot} - ${targetWidth}x${targetHeight}`);
      });
    };

    // Correction initiale
    fixAdsterraDimensions();

    // Observer les changements dans le DOM pour les nouvelles bannières
    const observer = new MutationObserver((mutations) => {
      let shouldFix = false;
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as Element;
              if (element.classList.contains('adsterra-banner-container') || 
                  element.querySelector('.adsterra-banner-container')) {
                shouldFix = true;
              }
            }
          });
        }
      });
      if (shouldFix) {
        setTimeout(fixAdsterraDimensions, 100);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    // Correction lors du redimensionnement de la fenêtre
    const handleResize = () => {
      setTimeout(fixAdsterraDimensions, 100);
    };

    window.addEventListener('resize', handleResize);

    // Correction périodique pour s'assurer que les bannières restent correctes
    const interval = setInterval(fixAdsterraDimensions, 5000);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', handleResize);
      clearInterval(interval);
    };
  }, []);

  return {
    fixDimensions: () => {
      // Fonction manuelle pour forcer la correction
      const adContainers = document.querySelectorAll('.adsterra-banner-container');
      console.log(`AdsterraDimensionsFix: Correction manuelle de ${adContainers.length} bannières`);
      
      adContainers.forEach((container) => {
        const slot = container.getAttribute('data-slot');
        if (slot) {
          container.dispatchEvent(new CustomEvent('adsterra-fix-dimensions'));
        }
      });
    }
  };
};