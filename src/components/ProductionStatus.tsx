// Composant d'indicateur de statut de production
import { useState, useEffect } from 'react';
import { Shield, CheckCircle, AlertTriangle } from 'lucide-react';
import { useProductionMonitoring } from '@/utils/productionMonitoring';
import { SecurityUtils } from '@/utils/productionConfig';

const ProductionStatus = () => {
  const [isVisible, setIsVisible] = useState(false);
  const { getSecurityStats } = useProductionMonitoring();

  useEffect(() => {
    // Afficher seulement en développement ou si problème critique
    const stats = getSecurityStats();
    const hasCriticalEvents = stats.eventsBySeverity.critical > 0;
    setIsVisible(!SecurityUtils.isProduction() || hasCriticalEvents);
  }, [getSecurityStats]);

  if (!isVisible) return null;

  const stats = getSecurityStats();
  const isHealthy = stats.eventsBySeverity.critical === 0;

  return (
    <div className={`fixed bottom-4 right-4 p-3 rounded-lg shadow-lg text-sm ${
      isHealthy ? 'bg-green-900/80 text-green-200' : 'bg-red-900/80 text-red-200'
    }`}>
      <div className="flex items-center gap-2">
        {isHealthy ? (
          <>
            <CheckCircle className="w-4 h-4" />
            <span>Système sécurisé</span>
          </>
        ) : (
          <>
            <AlertTriangle className="w-4 h-4" />
            <span>Incidents détectés</span>
          </>
        )}
        <Shield className="w-4 h-4" />
      </div>
    </div>
  );
};

export default ProductionStatus;