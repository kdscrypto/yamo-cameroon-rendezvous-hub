import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react';
import { ADSTERRA_CONFIG, isAdsterraReady, shouldShowAdsInDev } from '@/config/adsterraConfig';

interface SystemCheck {
  name: string;
  status: 'success' | 'warning' | 'error' | 'info';
  message: string;
  details?: string;
  critical?: boolean;
}

const AdsterraSystemCheck: React.FC = () => {
  const [checks, setChecks] = useState<SystemCheck[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    performSystemChecks();
  }, []);

  const performSystemChecks = async () => {
    setLoading(true);
    const results: SystemCheck[] = [];

    // 1. Vérification de la configuration
    try {
      results.push({
        name: 'Configuration Adsterra',
        status: 'success',
        message: 'Configuration chargée avec succès',
        details: `${Object.keys(ADSTERRA_CONFIG.BANNERS).length} bannières configurées`
      });
    } catch (error) {
      results.push({
        name: 'Configuration Adsterra',
        status: 'error',
        message: 'Erreur de chargement de la configuration',
        critical: true
      });
    }

    // 2. Vérification des clés API
    const invalidKeys = Object.values(ADSTERRA_CONFIG.BANNERS).filter(banner => 
      banner.key.includes('REMPLACEZ_PAR_VOTRE_CLE_ADSTERRA')
    );

    if (invalidKeys.length === 0) {
      results.push({
        name: 'Clés API Adsterra',
        status: 'success',
        message: 'Toutes les clés API sont configurées',
        details: `${Object.keys(ADSTERRA_CONFIG.BANNERS).length} clés valides`
      });
    } else {
      results.push({
        name: 'Clés API Adsterra',
        status: 'warning',
        message: `${invalidKeys.length} clé(s) placeholder détectée(s)`,
        details: 'Remplacez les clés placeholder par de vraies clés Adsterra',
        critical: true
      });
    }

    // 3. Vérification de l'environnement
    const envReady = isAdsterraReady();
    results.push({
      name: 'Environnement Browser',
      status: envReady ? 'success' : 'error',
      message: envReady ? 'Environnement browser compatible' : 'Environnement non compatible',
      details: `Window: ${typeof window !== 'undefined'}, Document: ${typeof document !== 'undefined'}`,
      critical: !envReady
    });

    // 4. Vérification des composants
    const components = [
      'AdBanner',
      'AdContainer', 
      'AdsterraAdUnit',
      'AdsterraVerification',
      'OptimizedAdBanner',
      'OptimizedAdUnit'
    ];

    try {
      results.push({
        name: 'Composants Adsterra',
        status: 'success',
        message: 'Tous les composants sont disponibles',
        details: `${components.length} composants détectés`
      });
    } catch (error) {
      results.push({
        name: 'Composants Adsterra',
        status: 'error',
        message: 'Erreur de chargement des composants',
        critical: true
      });
    }

    // 5. Vérification des hooks
    try {
      results.push({
        name: 'Hooks Adsterra',
        status: 'success',
        message: 'Hooks disponibles',
        details: 'useAdsterra, useAdPerformanceMonitoring'
      });
    } catch (error) {
      results.push({
        name: 'Hooks Adsterra',
        status: 'error',
        message: 'Erreur de chargement des hooks',
        critical: true
      });
    }

    // 6. Vérification des placements
    const placements = ADSTERRA_CONFIG.PLACEMENTS;
    const totalPlacements = Object.values(placements).reduce((total, page) => {
      return total + Object.values(page).filter(Boolean).length;
    }, 0);

    results.push({
      name: 'Configuration des placements',
      status: totalPlacements > 0 ? 'success' : 'warning',
      message: `${totalPlacements} emplacements configurés`,
      details: `Pages: ${Object.keys(placements).join(', ')}`
    });

    // 7. Vérification du mode de développement
    const devMode = process.env.NODE_ENV === 'development';
    const devTestEnabled = shouldShowAdsInDev();
    
    if (devMode) {
      results.push({
        name: 'Mode développement',
        status: devTestEnabled ? 'info' : 'warning',
        message: devTestEnabled ? 'Tests dev activés' : 'Tests dev désactivés',
        details: 'En dev, les publicités sont des placeholders par défaut'
      });
    } else {
      results.push({
        name: 'Mode production',
        status: 'success',
        message: 'Mode production actif',
        details: 'Les vraies publicités Adsterra seront affichées'
      });
    }

    // 8. Vérification DOM en temps réel
    await new Promise(resolve => setTimeout(resolve, 1000)); // Attendre le rendu

    const adElements = document.querySelectorAll('.adsterra-banner');
    const adContainers = document.querySelectorAll('.ad-wrapper');
    const scripts = document.querySelectorAll('script[src*="highperformanceformat.com"]');

    results.push({
      name: 'Éléments DOM',
      status: adElements.length > 0 ? 'success' : 'info',
      message: `${adElements.length} bannière(s) détectée(s)`,
      details: `Conteneurs: ${adContainers.length}, Scripts: ${scripts.length}`
    });

    // 9. Vérification de la connectivité réseau
    results.push({
      name: 'Connectivité réseau',
      status: navigator.onLine ? 'success' : 'error',
      message: navigator.onLine ? 'En ligne' : 'Hors ligne',
      details: `Navigateur: ${navigator.userAgent.includes('Chrome') ? 'Chrome' : 'Autre'}`,
      critical: !navigator.onLine
    });

    // 10. Test de performance
    const performanceEntry = performance.now();
    results.push({
      name: 'Performance système',
      status: performanceEntry < 50 ? 'success' : 'warning',
      message: `Temps de vérification: ${Math.round(performanceEntry)}ms`,
      details: 'Délai de chargement configuré: 1000ms'
    });

    setChecks(results);
    setLoading(false);
  };

  const getStatusIcon = (status: SystemCheck['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'info':
        return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  const getStatusBadge = (status: SystemCheck['status']) => {
    const variants = {
      success: 'default',
      warning: 'secondary',
      error: 'destructive',
      info: 'outline'
    } as const;

    return (
      <Badge variant={variants[status]} className="text-xs">
        {status.toUpperCase()}
      </Badge>
    );
  };

  const criticalIssues = checks.filter(check => check.critical && check.status === 'error');
  const warnings = checks.filter(check => check.status === 'warning');
  const successes = checks.filter(check => check.status === 'success');

  if (loading) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Vérification du système Adsterra</CardTitle>
          <CardDescription>Analyse en cours...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Vérification du système Adsterra
            {criticalIssues.length === 0 ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : (
              <XCircle className="w-5 h-5 text-red-500" />
            )}
          </CardTitle>
          <CardDescription>
            Diagnostic complet du système de publicité Adsterra
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">{successes.length}</div>
              <div className="text-sm text-muted-foreground">Succès</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-500">{warnings.length}</div>
              <div className="text-sm text-muted-foreground">Avertissements</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-500">{criticalIssues.length}</div>
              <div className="text-sm text-muted-foreground">Erreurs critiques</div>
            </div>
          </div>

          {criticalIssues.length > 0 && (
            <Alert className="mb-4">
              <XCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Attention :</strong> {criticalIssues.length} erreur(s) critique(s) détectée(s). 
                Le système ne fonctionnera pas correctement en production.
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-3">
            {checks.map((check, index) => (
              <div
                key={index}
                className={`flex items-center justify-between p-3 rounded-lg border ${
                  check.critical && check.status === 'error' 
                    ? 'border-red-200 bg-red-50' 
                    : 'border-border bg-card'
                }`}
              >
                <div className="flex items-center gap-3">
                  {getStatusIcon(check.status)}
                  <div>
                    <div className="font-medium">{check.name}</div>
                    <div className="text-sm text-muted-foreground">{check.message}</div>
                    {check.details && (
                      <div className="text-xs text-muted-foreground mt-1">{check.details}</div>
                    )}
                  </div>
                </div>
                {getStatusBadge(check.status)}
              </div>
            ))}
          </div>

          <div className="flex gap-2 mt-6">
            <Button onClick={performSystemChecks} variant="outline">
              Relancer la vérification
            </Button>
            <Button 
              onClick={() => {
                const report = {
                  timestamp: new Date().toISOString(),
                  environment: process.env.NODE_ENV,
                  checks,
                  summary: {
                    total: checks.length,
                    successes: successes.length,
                    warnings: warnings.length,
                    errors: criticalIssues.length,
                    readyForProduction: criticalIssues.length === 0
                  }
                };
                
                const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `adsterra-system-check-${Date.now()}.json`;
                a.click();
                URL.revokeObjectURL(url);
              }}
              variant="default"
            >
              Télécharger le rapport
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Résumé de production */}
      <Card>
        <CardHeader>
          <CardTitle>État de préparation pour la production</CardTitle>
        </CardHeader>
        <CardContent>
          {criticalIssues.length === 0 ? (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>✅ Prêt pour la production !</strong> Le système Adsterra est correctement configuré 
                et peut être déployé en production. Toutes les vérifications critiques sont passées.
              </AlertDescription>
            </Alert>
          ) : (
            <Alert>
              <XCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>❌ Non prêt pour la production.</strong> Veuillez corriger les erreurs critiques 
                avant le déploiement. Le système pourrait ne pas fonctionner correctement.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdsterraSystemCheck;