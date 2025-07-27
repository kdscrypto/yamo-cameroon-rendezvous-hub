import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAdNavigation } from '@/hooks/useAdNavigation';
import { ExternalLink, Bug } from 'lucide-react';

const AdNavigationDebugger = () => {
  const [testAdId, setTestAdId] = useState('');
  const { navigateToAd } = useAdNavigation();

  const testAds = [
    { id: 'viagra-2', title: 'Viagra 2' },
    { id: 'coco-samba', title: 'Coco samba' },
    { id: 'cafe-bio-herbs', title: 'Café bio herbs' }
  ];

  const handleTestNavigation = (adId: string, title: string) => {
    console.log(`Testing navigation to: ${title} (${adId})`);
    navigateToAd(adId, title);
  };

  const handleCustomNavigation = () => {
    if (testAdId.trim()) {
      console.log(`Testing custom navigation to: ${testAdId}`);
      navigateToAd(testAdId.trim(), `Test Ad ${testAdId}`);
    }
  };

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <Card className="fixed bottom-4 right-4 w-80 z-50 bg-background/95 backdrop-blur-sm border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Bug className="w-4 h-4" />
          Ad Navigation Debug
        </CardTitle>
        <CardDescription className="text-xs">
          Test navigation to specific ads
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          <p className="text-xs font-medium">Test problematic ads:</p>
          {testAds.map((ad) => (
            <Button
              key={ad.id}
              size="sm"
              variant="outline"
              className="w-full justify-between text-xs"
              onClick={() => handleTestNavigation(ad.id, ad.title)}
            >
              {ad.title}
              <ExternalLink className="w-3 h-3" />
            </Button>
          ))}
        </div>
        
        <div className="space-y-2">
          <p className="text-xs font-medium">Custom ad ID:</p>
          <div className="flex gap-2">
            <Input
              placeholder="Enter ad ID"
              value={testAdId}
              onChange={(e) => setTestAdId(e.target.value)}
              className="text-xs h-8"
            />
            <Button
              size="sm"
              onClick={handleCustomNavigation}
              disabled={!testAdId.trim()}
            >
              Go
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdNavigationDebugger;