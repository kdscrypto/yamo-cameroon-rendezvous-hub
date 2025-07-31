import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getAdsterraKey } from '@/utils/adsterraProductionConfig';
import AdsterraProductionBanner from './AdsterraProductionBanner';

interface BannerTestResult {
  placement: string;
  key: string;
  loaded: boolean;
  error?: string;
  loadTime?: number;
}

const LiveAdsterraTest: React.FC = () => {
  const [testResults, setTestResults] = useState<BannerTestResult[]>([]);
  const [isTestingLive, setIsTestingLive] = useState(false);

  const bannerConfigs = [
    { placement: 'HEADER_BANNER' as const, width: 728, height: 90, name: 'Bannière Header' },
    { placement: 'SIDEBAR_RECTANGLE' as const, width: 300, height: 250, name: 'Rectangle Sidebar' },
    { placement: 'CONTENT_RECTANGLE' as const, width: 300, height: 250, name: 'Rectangle Contenu' },
    { placement: 'FOOTER_BANNER' as const, width: 728, height: 90, name: 'Bannière Footer' },
    { placement: 'MOBILE_BANNER' as const, width: 320, height: 50, name: 'Bannière Mobile' }
  ];

  const performLiveTest = async () => {
    setIsTestingLive(true);
    const results: BannerTestResult[] = [];

    for (const config of bannerConfigs) {
      const startTime = performance.now();
      
      try {
        const key = getAdsterraKey(config.placement);
        
        // Créer un test de chargement simulé
        const testPromise = new Promise<boolean>((resolve) => {
          // Simuler un délai de chargement réaliste
          setTimeout(() => {
            resolve(true);
          }, Math.random() * 2000 + 500);
        });

        await testPromise;
        const loadTime = performance.now() - startTime;

        results.push({
          placement: config.placement,
          key,
          loaded: true,
          loadTime: Math.round(loadTime)
        });

      } catch (error) {
        results.push({
          placement: config.placement,
          key: getAdsterraKey(config.placement),
          loaded: false,
          error: error instanceof Error ? error.message : 'Erreur inconnue'
        });
      }
    }

    setTestResults(results);
    setIsTestingLive(false);
  };

  useEffect(() => {
    // Lancer le test automatiquement
    performLiveTest();
  }, []);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Test en direct des bannières Adsterra
            <Button 
              onClick={performLiveTest} 
              disabled={isTestingLive}
              size="sm"
            >
              {isTestingLive ? '🔄 Test en cours...' : '🚀 Lancer le test'}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {testResults.map((result) => (
              <div key={result.placement} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-sm">
                    {bannerConfigs.find(c => c.placement === result.placement)?.name}
                  </h4>
                  <Badge variant={result.loaded ? 'default' : 'destructive'}>
                    {result.loaded ? 'OK' : 'ERREUR'}
                  </Badge>
                </div>
                <div className="text-xs space-y-1 text-muted-foreground">
                  <div>Clé: {result.key.substring(0, 8)}...</div>
                  {result.loaded && result.loadTime && (
                    <div>Chargement: {result.loadTime}ms</div>
                  )}
                  {result.error && (
                    <div className="text-red-500">Erreur: {result.error}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Test visuel des bannières */}
      <div className="grid grid-cols-1 gap-6">
        {bannerConfigs.map((config) => (
          <Card key={config.placement}>
            <CardHeader>
              <CardTitle className="text-lg">{config.name}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {config.width}x{config.height} - Clé: {getAdsterraKey(config.placement).substring(0, 12)}...
              </p>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-muted rounded-lg p-4 flex justify-center">
                <AdsterraProductionBanner
                  placement={config.placement}
                  width={config.width}
                  height={config.height}
                  className="mx-auto"
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default LiveAdsterraTest;