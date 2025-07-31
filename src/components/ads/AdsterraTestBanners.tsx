import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AdsterraProductionBanner from './AdsterraProductionBanner';

const AdsterraTestBanners: React.FC = () => {
  const bannerConfigs = [
    { placement: 'HEADER_BANNER' as const, width: 728, height: 90, name: 'Bannière Header' },
    { placement: 'SIDEBAR_RECTANGLE' as const, width: 300, height: 250, name: 'Rectangle Sidebar' },
    { placement: 'CONTENT_RECTANGLE' as const, width: 300, height: 250, name: 'Rectangle Contenu' },
    { placement: 'FOOTER_BANNER' as const, width: 728, height: 90, name: 'Bannière Footer' },
    { placement: 'MOBILE_BANNER' as const, width: 320, height: 50, name: 'Bannière Mobile' }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bannières de test Adsterra</CardTitle>
        <p className="text-sm text-muted-foreground">
          Bannières actives pour validation du système de diagnostic
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {bannerConfigs.map((config) => (
            <div key={config.placement} className="space-y-2">
              <h4 className="font-medium text-sm">{config.name}</h4>
              <div className="border rounded-lg p-4 bg-muted/20 flex justify-center">
                <AdsterraProductionBanner
                  placement={config.placement}
                  width={config.width}
                  height={config.height}
                />
              </div>
              <p className="text-xs text-muted-foreground text-center">
                {config.width}x{config.height} pixels
              </p>
            </div>
          ))}
        </div>
        
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
          <h4 className="font-medium text-sm mb-2">ℹ️ Information</h4>
          <p className="text-xs text-muted-foreground">
            Ces bannières sont automatiquement détectées par le système de diagnostic. 
            Elles utilisent les clés de production configurées et permettent de valider 
            le bon fonctionnement de l'intégration Adsterra.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdsterraTestBanners;