import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface AdDebugInfo {
  slot: string;
  status: 'loading' | 'loaded' | 'error' | 'blocked';
  element: Element | null;
  dimensions: { width: number; height: number };
  hasContent: boolean;
}

const AdsterraDebugPanel: React.FC = () => {
  const [ads, setAds] = useState<AdDebugInfo[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  const scanAds = () => {
    const adContainers = document.querySelectorAll('.adsterra-banner-container');
    const adInfos: AdDebugInfo[] = [];

    adContainers.forEach((container) => {
      const slot = container.getAttribute('data-slot') || 'unknown';
      const rect = container.getBoundingClientRect();
      const hasScripts = container.querySelectorAll('script').length > 0;
      const hasIframes = container.querySelectorAll('iframe').length > 0;
      const hasContent = container.innerHTML.trim().length > 0;

      let status: AdDebugInfo['status'] = 'loading';
      if (hasIframes && hasContent) {
        status = 'loaded';
      } else if (hasScripts && !hasIframes) {
        status = 'loading';
      } else if (container.innerHTML.includes('Erreur') || container.innerHTML.includes('invalide')) {
        status = 'error';
      } else if (!hasContent) {
        status = 'blocked';
      }

      adInfos.push({
        slot,
        status,
        element: container,
        dimensions: { width: rect.width, height: rect.height },
        hasContent
      });
    });

    setAds(adInfos);
  };

  const refreshAd = (slot: string) => {
    const container = document.querySelector(`[data-slot="${slot}"]`);
    if (container) {
      // Nettoyer et relancer
      container.innerHTML = '';
      
      // Déclencher un re-render en modifiant un attribut
      const event = new CustomEvent('adsterra-refresh', { detail: { slot } });
      container.dispatchEvent(event);
      
      // Re-scanner après un délai
      setTimeout(scanAds, 1000);
    }
  };

  const enableDevTesting = () => {
    localStorage.setItem('adsterra-dev-test', 'true');
    window.location.reload();
  };

  const forceLoadAds = () => {
    localStorage.setItem('adsterra-force-dev', 'true');
    window.location.reload();
  };

  useEffect(() => {
    scanAds();
    const interval = setInterval(scanAds, 3000);
    return () => clearInterval(interval);
  }, []);

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const getStatusColor = (status: AdDebugInfo['status']) => {
    switch (status) {
      case 'loaded': return 'bg-green-500';
      case 'loading': return 'bg-yellow-500';
      case 'error': return 'bg-red-500';
      case 'blocked': return 'bg-gray-500';
      default: return 'bg-gray-400';
    }
  };

  const getStatusText = (status: AdDebugInfo['status']) => {
    switch (status) {
      case 'loaded': return 'Chargée';
      case 'loading': return 'Chargement';
      case 'error': return 'Erreur';
      case 'blocked': return 'Bloquée';
      default: return 'Inconnu';
    }
  };

  if (!isVisible) {
    return (
      <Button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 left-4 z-50 bg-blue-600 hover:bg-blue-700"
        size="sm"
      >
        Debug Adsterra ({ads.length})
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-4 left-4 z-50 w-96 max-h-96 overflow-y-auto">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">Debug Adsterra</CardTitle>
          <Button
            onClick={() => setIsVisible(false)}
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
          >
            ×
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex gap-2">
          <Button onClick={scanAds} size="sm" variant="outline">
            🔄 Scanner
          </Button>
          <Button onClick={enableDevTesting} size="sm" variant="outline">
            🧪 Activer Test
          </Button>
          <Button onClick={forceLoadAds} size="sm" variant="outline">
            🚀 Forcer
          </Button>
        </div>
        
        <div className="space-y-2">
          {ads.map((ad, index) => (
            <div key={index} className="flex items-center justify-between p-2 border rounded text-xs">
              <div className="flex-1">
                <div className="font-medium">{ad.slot}</div>
                <div className="text-muted-foreground">
                  {ad.dimensions.width}×{ad.dimensions.height}
                </div>
                <div className="text-muted-foreground">
                  Contenu: {ad.hasContent ? 'Oui' : 'Non'}
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <Badge className={`${getStatusColor(ad.status)} text-white text-xs`}>
                  {getStatusText(ad.status)}
                </Badge>
                <Button
                  onClick={() => refreshAd(ad.slot)}
                  size="sm"
                  variant="outline"
                  className="h-6 text-xs"
                >
                  🔄
                </Button>
              </div>
            </div>
          ))}
        </div>

        {ads.length === 0 && (
          <div className="text-center text-muted-foreground py-4">
            Aucune bannière détectée
          </div>
        )}

        <div className="border-t pt-2 mt-2">
          <div className="text-xs text-muted-foreground">
            • Verte: Bannière chargée avec contenu
            • Jaune: En cours de chargement
            • Rouge: Erreur de chargement
            • Gris: Bloquée ou vide
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdsterraDebugPanel;