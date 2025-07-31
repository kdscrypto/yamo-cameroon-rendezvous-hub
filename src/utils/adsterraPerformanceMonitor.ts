// Monitoring des performances Adsterra optimisé
export interface PerformanceMetrics {
  loadTime: number;
  domReadyTime: number;
  scriptCount: number;
  elementCount: number;
  errors: string[];
  warnings: string[];
}

export const performAdsterraPerformanceCheck = async (): Promise<PerformanceMetrics> => {
  const startTime = performance.now();
  const metrics: PerformanceMetrics = {
    loadTime: 0,
    domReadyTime: 0,
    scriptCount: 0,
    elementCount: 0,
    errors: [],
    warnings: []
  };

  try {
    // 1. Mesure du temps de préparation DOM
    const domStartTime = performance.now();
    
    // Attendre que le DOM soit stable
    await new Promise(resolve => {
      if (document.readyState === 'complete') {
        resolve(void 0);
      } else {
        window.addEventListener('load', () => resolve(void 0), { once: true });
      }
    });
    
    metrics.domReadyTime = performance.now() - domStartTime;

    // 2. Comptage des éléments Adsterra
    const adsterraElements = document.querySelectorAll('.adsterra-banner, [data-placement]');
    const adsterraScripts = document.querySelectorAll('script[src*="highperformanceformat"], script[data-placement]');
    
    metrics.elementCount = adsterraElements.length;
    metrics.scriptCount = adsterraScripts.length;

    // 3. Validation des éléments
    if (metrics.elementCount === 0) {
      metrics.warnings.push('Aucun élément de bannière Adsterra détecté');
    }

    if (metrics.scriptCount === 0) {
      metrics.warnings.push('Aucun script Adsterra externe détecté');
    }

    // 4. Vérification de la configuration
    adsterraElements.forEach((element, index) => {
      const placement = element.getAttribute('data-placement');
      const adKey = element.getAttribute('data-adsterra-key');
      
      if (!placement) {
        metrics.errors.push(`Élément ${index + 1}: attribut data-placement manquant`);
      }
      
      if (!adKey) {
        metrics.errors.push(`Élément ${index + 1}: clé Adsterra manquante`);
      }
      
      // Vérifier si l'élément a des dimensions valides
      const rect = element.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) {
        metrics.warnings.push(`Élément ${placement || index + 1}: dimensions nulles détectées`);
      }
    });

    // 5. Temps total
    metrics.loadTime = performance.now() - startTime;

    // 6. Seuils de performance
    if (metrics.loadTime > 5000) {
      metrics.errors.push(`Temps de vérification critique: ${Math.round(metrics.loadTime)}ms (seuil: 5000ms)`);
    } else if (metrics.loadTime > 2000) {
      metrics.warnings.push(`Temps de vérification élevé: ${Math.round(metrics.loadTime)}ms`);
    }

  } catch (error) {
    metrics.errors.push(`Erreur lors du monitoring: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    metrics.loadTime = performance.now() - startTime;
  }

  return metrics;
};

export const getPerformanceStatus = (metrics: PerformanceMetrics): 'success' | 'warning' | 'error' => {
  if (metrics.errors.length > 0) {
    return 'error';
  }
  if (metrics.warnings.length > 0) {
    return 'warning';
  }
  return 'success';
};

export const getPerformanceMessage = (metrics: PerformanceMetrics): string => {
  const status = getPerformanceStatus(metrics);
  
  if (status === 'error') {
    return `Performance critique - ${metrics.errors.length} erreur(s) détectée(s)`;
  }
  
  if (status === 'warning') {
    return `Performance acceptable - ${metrics.warnings.length} avertissement(s)`;
  }
  
  return `Performance optimale - ${Math.round(metrics.loadTime)}ms`;
};

export const formatPerformanceDetails = (metrics: PerformanceMetrics): string => {
  const details = [
    `Temps total: ${Math.round(metrics.loadTime)}ms`,
    `Éléments détectés: ${metrics.elementCount}`,
    `Scripts externes: ${metrics.scriptCount}`
  ];
  
  if (metrics.errors.length > 0) {
    details.push(`Erreurs: ${metrics.errors.join(', ')}`);
  }
  
  if (metrics.warnings.length > 0) {
    details.push(`Avertissements: ${metrics.warnings.join(', ')}`);
  }
  
  return details.join(' | ');
};