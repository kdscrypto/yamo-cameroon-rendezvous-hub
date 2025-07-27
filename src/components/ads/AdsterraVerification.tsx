import React from 'react';
import { ADSTERRA_CONFIG, isAdsterraReady } from '@/config/adsterraConfig';

const AdsterraVerification: React.FC = () => {
  const checkAdsterraStatus = () => {
    console.log('=== Vérification Adsterra ===');
    console.log('Configuration:', ADSTERRA_CONFIG);
    console.log('Environnement prêt:', isAdsterraReady());
    console.log('Mode test:', ADSTERRA_CONFIG.SETTINGS.TEST_MODE);
    console.log('Clé principale:', ADSTERRA_CONFIG.BANNERS.HEADER_BANNER.key);
    
    // Vérifier s'il y a des scripts Adsterra chargés
    const adsterraScripts = document.querySelectorAll('script[src*="highperformanceformat.com"]');
    console.log('Scripts Adsterra trouvés:', adsterraScripts.length);
    
    // Vérifier les bannières Adsterra présentes
    const adsElements = document.querySelectorAll('.adsterra-banner');
    console.log('Éléments publicitaires trouvés:', adsElements.length);
    
    return {
      ready: isAdsterraReady(),
      scripts: adsterraScripts.length,
      banners: adsElements.length,
      testMode: ADSTERRA_CONFIG.SETTINGS.TEST_MODE
    };
  };

  const results = checkAdsterraStatus();

  if (process.env.NODE_ENV === 'development') {
    return (
      <div className="fixed bottom-4 right-4 bg-card border border-border rounded-lg p-4 text-sm max-w-xs">
        <h3 className="font-semibold text-foreground mb-2">Status Adsterra</h3>
        <div className="space-y-1 text-muted-foreground">
          <div>✅ Configuration: OK</div>
          <div>✅ Environnement: {results.ready ? 'Prêt' : 'Non prêt'}</div>
          <div>📊 Mode: {results.testMode ? 'Test' : 'Production'}</div>
          <div>🔧 Scripts: {results.scripts}</div>
          <div>📺 Bannières: {results.banners}</div>
        </div>
      </div>
    );
  }

  return null;
};

export default AdsterraVerification;