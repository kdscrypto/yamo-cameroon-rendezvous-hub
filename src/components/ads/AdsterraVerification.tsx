import React from 'react';
import { ADSTERRA_CONFIG, isAdsterraReady } from '@/config/adsterraConfig';

const AdsterraVerification: React.FC = () => {
  const checkAdsterraStatus = () => {
    console.log('=== Vérification Adsterra ===');
    console.log('Configuration:', ADSTERRA_CONFIG);
    console.log('Environnement prêt:', isAdsterraReady());
    console.log('Mode test:', ADSTERRA_CONFIG.SETTINGS.TEST_MODE);
    console.log('Dev testing autorisé:', ADSTERRA_CONFIG.SETTINGS.ALLOW_DEV_TESTING);
    console.log('Clé principale:', ADSTERRA_CONFIG.BANNERS.HEADER_BANNER.key);
    
    // Vérifier s'il y a des scripts Adsterra chargés
    const adsterraScripts = document.querySelectorAll('script[src*="highperformanceformat.com"]');
    console.log('Scripts Adsterra trouvés:', adsterraScripts.length);
    
    // Vérifier les bannières Adsterra présentes
    const adsElements = document.querySelectorAll('.adsterra-banner');
    console.log('Éléments publicitaires trouvés:', adsElements.length);
    
    // Vérifier les clés invalides
    const invalidKeys = Object.values(ADSTERRA_CONFIG.BANNERS).filter(banner => 
      banner.key.includes('REMPLACEZ_PAR_VOTRE_CLE_ADSTERRA')
    ).length;
    
    return {
      ready: isAdsterraReady(),
      scripts: adsterraScripts.length,
      banners: adsElements.length,
      invalidKeys,
      testMode: ADSTERRA_CONFIG.SETTINGS.TEST_MODE,
      devTestingEnabled: localStorage.getItem('adsterra-dev-test') === 'true'
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
          <div>🧪 Test dev: {results.devTestingEnabled ? 'Activé' : 'Désactivé'}</div>
          <div>🔧 Scripts: {results.scripts}</div>
          <div>📺 Bannières: {results.banners}</div>
          <div className={results.invalidKeys > 0 ? 'text-red-500' : 'text-green-500'}>
            ⚠️ Clés invalides: {results.invalidKeys}
          </div>
          {!results.devTestingEnabled && (
            <div className="text-xs text-blue-500 mt-2">
              💡 En développement, vous voyez des placeholders.
              Les vraies pubs apparaîtront en production.
            </div>
          )}
        </div>
        <button 
          onClick={() => {
            localStorage.setItem('adsterra-dev-test', 'true');
            window.location.reload();
          }}
          className="mt-2 px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 w-full"
        >
          🧪 Activer test dev
        </button>
      </div>
    );
  }

  return null;
};

export default AdsterraVerification;