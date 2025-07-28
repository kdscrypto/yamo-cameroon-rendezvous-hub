import React from 'react';
import { ADSTERRA_CONFIG, isAdsterraReady, shouldShowAdsInDev, toggleDevTesting, forceDevAds } from '@/config/adsterraConfig';
import { useAdPerformanceMonitoring } from '@/hooks/useAdPerformanceMonitoring';

const AdsterraVerification: React.FC = () => {
  const { metrics, generatePerformanceReport } = useAdPerformanceMonitoring();
  const checkAdsterraStatus = () => {
    console.log('=== Vérification Adsterra Avancée ===');
    console.log('Configuration:', ADSTERRA_CONFIG);
    console.log('Environnement prêt:', isAdsterraReady());
    console.log('Mode test:', ADSTERRA_CONFIG.SETTINGS.TEST_MODE);
    console.log('Dev testing autorisé:', ADSTERRA_CONFIG.SETTINGS.ALLOW_DEV_TESTING);
    
    // Vérifier toutes les clés de bannières
    const bannerKeys = Object.entries(ADSTERRA_CONFIG.BANNERS);
    console.log('=== Vérification des clés Adsterra ===');
    bannerKeys.forEach(([name, config]) => {
      console.log(`${name}: ${config.key} (${config.width}x${config.height}, ${config.format})`);
    });
    
    // Vérifier s'il y a des scripts Adsterra chargés
    const adsterraScripts = document.querySelectorAll('script[src*="highperformanceformat.com"]');
    const invokeScripts = document.querySelectorAll('script[src*="invoke.js"]');
    console.log('Scripts Adsterra trouvés:', adsterraScripts.length);
    console.log('Scripts invoke trouvés:', invokeScripts.length);
    
    // Vérifier les bannières Adsterra présentes
    const adsElements = document.querySelectorAll('.adsterra-banner');
    const adContainers = document.querySelectorAll('.ad-wrapper');
    console.log('Éléments publicitaires trouvés:', adsElements.length);
    console.log('Conteneurs publicitaires trouvés:', adContainers.length);
    
    // Vérifier les clés invalides
    const invalidKeys = Object.values(ADSTERRA_CONFIG.BANNERS).filter(banner => 
      banner.key.includes('REMPLACEZ_PAR_VOTRE_CLE_ADSTERRA')
    ).length;
    
    // Vérifier la configuration des emplacements
    const placements = ADSTERRA_CONFIG.PLACEMENTS;
    console.log('=== Configuration des emplacements ===');
    Object.entries(placements).forEach(([page, config]) => {
      console.log(`${page}:`, config);
    });
    
    // Diagnostics réseau (tentative de vérifier la connectivité Adsterra)
    const networkStatus = {
      online: navigator.onLine,
      userAgent: navigator.userAgent.includes('Chrome') ? 'Chrome' : 
                navigator.userAgent.includes('Firefox') ? 'Firefox' : 'Autre',
      adBlockerPossible: adsterraScripts.length === 0 && adsElements.length > 0
    };
    
    console.log('=== Diagnostics réseau ===');
    console.log('En ligne:', networkStatus.online);
    console.log('Navigateur:', networkStatus.userAgent);
    console.log('Bloqueur de pub possible:', networkStatus.adBlockerPossible);
    
    return {
      ready: isAdsterraReady(),
      scripts: adsterraScripts.length,
      invokeScripts: invokeScripts.length,
      banners: adsElements.length,
      containers: adContainers.length,
      invalidKeys,
      testMode: ADSTERRA_CONFIG.SETTINGS.TEST_MODE,
      devTestingEnabled: shouldShowAdsInDev(),
      forceMode: localStorage.getItem('adsterra-force-dev') === 'true',
      networkStatus,
      bannerKeys: bannerKeys.length,
      placements: Object.keys(placements).length
    };
  };

  const results = checkAdsterraStatus();

  if (process.env.NODE_ENV === 'development') {
    return (
      <div className="fixed bottom-4 right-4 bg-card border border-border rounded-lg p-4 text-sm max-w-sm">
        <h3 className="font-semibold text-foreground mb-2">Status Adsterra Avancé</h3>
        <div className="space-y-1 text-muted-foreground text-xs">
          <div>✅ Environnement: {results.ready ? 'Prêt' : 'Non prêt'}</div>
          <div>📊 Mode: {results.testMode ? 'Test' : 'Production'}</div>
          <div>🧪 Test dev: {results.devTestingEnabled ? 'Activé' : 'Désactivé'}</div>
          <div>🚀 Force mode: {results.forceMode ? 'Activé' : 'Désactivé'}</div>
          <div>🔧 Scripts: {results.scripts} | Invoke: {results.invokeScripts}</div>
          <div>📺 Bannières: {results.banners} | Conteneurs: {results.containers}</div>
          <div>🔑 Clés config: {results.bannerKeys} | Pages: {results.placements}</div>
          <div className={results.invalidKeys > 0 ? 'text-red-500' : 'text-green-500'}>
            ⚠️ Clés invalides: {results.invalidKeys}
          </div>
          <div className={results.networkStatus.online ? 'text-green-500' : 'text-red-500'}>
            🌐 Réseau: {results.networkStatus.online ? 'OK' : 'Hors ligne'}
          </div>
          <div>🌍 Navigateur: {results.networkStatus.userAgent}</div>
          {results.networkStatus.adBlockerPossible && (
            <div className="text-orange-500">
              🚫 Bloqueur de pub détecté
            </div>
          )}
          <div className="border-t border-border/20 pt-2 mt-2">
            <div className="text-xs font-medium text-foreground mb-1">Performance en temps réel:</div>
            <div>📊 Chargées: {metrics.loadedAds}/{metrics.totalAds}</div>
            <div>❌ Échecs: {metrics.failedAds}</div>
            <div>⏱️ Temps moyen: {Math.round(metrics.averageLoadTime)}ms</div>
            {metrics.adBlockerDetected && (
              <div className="text-red-500">🚫 AdBlocker actif</div>
            )}
          </div>
          {!results.devTestingEnabled && (
            <div className="text-xs text-blue-500 mt-2">
              💡 En développement, vous voyez des placeholders.
              Les vraies pubs apparaîtront en production.
            </div>
          )}
        </div>
        <div className="space-y-2 mt-2">
          <button 
            onClick={() => {
              toggleDevTesting(true);
              window.location.reload();
            }}
            className={`px-2 py-1 text-xs rounded w-full ${
              results.devTestingEnabled ? 'bg-green-500 hover:bg-green-600' : 'bg-blue-500 hover:bg-blue-600'
            } text-white`}
            disabled={results.devTestingEnabled}
          >
            {results.devTestingEnabled ? '✅ Test activé' : '🧪 Activer test dev'}
          </button>
          <button 
            onClick={() => {
              forceDevAds(!results.forceMode);
              window.location.reload();
            }}
            className={`px-2 py-1 text-xs rounded w-full ${
              results.forceMode ? 'bg-orange-500 hover:bg-orange-600' : 'bg-purple-500 hover:bg-purple-600'
            } text-white`}
          >
            {results.forceMode ? '🔥 Désactiver force' : '🚀 Forcer pubs dev'}
          </button>
          <button 
            onClick={() => {
              const report = generatePerformanceReport();
              console.log('Rapport téléchargé:', report);
              // Télécharger le rapport en JSON
              const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `adsterra-report-${Date.now()}.json`;
              a.click();
              URL.revokeObjectURL(url);
            }}
            className="px-2 py-1 text-xs rounded w-full bg-green-500 hover:bg-green-600 text-white"
          >
            📊 Télécharger rapport
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default AdsterraVerification;