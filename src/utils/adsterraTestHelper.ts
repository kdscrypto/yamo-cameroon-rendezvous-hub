// src/utils/adsterraTestHelper.ts

/**
 * Utilitaires pour tester et déboguer le système Adsterra optimisé
 */

import { enableTestMode, isTestModeEnabled, shouldShowAds, ADSTERRA_KEY } from '@/config/adsterra';

/**
 * Active le mode test et affiche des informations de debug
 */
export const enableAdsterraTestMode = () => {
  enableTestMode();
  console.log('🔧 Mode test Adsterra activé');
  
  // Afficher le statut
  showAdsterraStatus();
  
  // Forcer le rafraîchissement des ads
  setTimeout(() => {
    window.location.reload();
  }, 1000);
};

/**
 * Désactive le mode test
 */
export const disableAdsterraTestMode = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('adsterra-dev-test');
    console.log('🔧 Mode test Adsterra désactivé');
    
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  }
};

/**
 * Affiche le statut actuel du système Adsterra
 */
export const showAdsterraStatus = () => {
  const status = {
    clé: ADSTERRA_KEY,
    environnement: process.env.NODE_ENV,
    modeTest: isTestModeEnabled(),
    afficherAds: shouldShowAds(),
    timestamp: new Date().toLocaleString()
  };
  
  console.table(status);
  
  return status;
};

/**
 * Teste la connectivité avec Adsterra
 */
export const testAdsterraConnectivity = (): Promise<boolean> => {
  return new Promise((resolve) => {
    const testUrl = `//www.topcreativeformat.com/${ADSTERRA_KEY}/invoke.js`;
    
    const script = document.createElement('script');
    script.src = testUrl;
    script.async = true;
    
    const timeout = setTimeout(() => {
      console.log('❌ Test de connectivité Adsterra : timeout');
      resolve(false);
    }, 5000);
    
    script.onload = () => {
      clearTimeout(timeout);
      console.log('✅ Test de connectivité Adsterra : succès');
      resolve(true);
    };
    
    script.onerror = () => {
      clearTimeout(timeout);
      console.log('❌ Test de connectivité Adsterra : échec');
      resolve(false);
    };
    
    // Ne pas ajouter le script au DOM pour éviter les effets de bord
    // On teste juste la connectivité
  });
};

/**
 * Fonction globale pour le debug (accessible depuis la console)
 */
if (typeof window !== 'undefined') {
  (window as any).adsterraDebug = {
    enable: enableAdsterraTestMode,
    disable: disableAdsterraTestMode,
    status: showAdsterraStatus,
    test: testAdsterraConnectivity
  };
  
  console.log('🔧 Debug Adsterra disponible : window.adsterraDebug');
}