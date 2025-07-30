import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertTriangle, Wrench, RefreshCw, Play } from 'lucide-react';
import { validateAdsterraKeys, testAdsterraConnectivity, isDomainAllowed } from '@/utils/adsterraProductionConfig';
import { adsterraMonitor } from '@/utils/adsterraSystemMonitor';

interface AutoFixIssue {
  id: string;
  title: string;
  description: string;
  status: 'checking' | 'resolved' | 'error' | 'manual';
  severity: 'critical' | 'warning' | 'info';
  autoFixAvailable: boolean;
  fixFunction?: () => Promise<boolean>;
}

const AdsterraAutoFix: React.FC = () => {
  const [issues, setIssues] = useState<AutoFixIssue[]>([]);
  const [isFixing, setIsFixing] = useState(false);
  const [autoFixResults, setAutoFixResults] = useState<Record<string, string>>({});

  // Définir les problèmes à vérifier et corriger automatiquement
  const initializeIssues = (): AutoFixIssue[] => [
    {
      id: 'keys-validation',
      title: 'Validation des clés Adsterra',
      description: 'Vérifier l\'unicité et la validité des clés de configuration',
      status: 'checking',
      severity: 'critical',
      autoFixAvailable: true,
      fixFunction: async () => {
        const validation = validateAdsterraKeys();
        if (!validation.isValid) {
          setAutoFixResults(prev => ({
            ...prev,
            'keys-validation': `Erreurs détectées: ${validation.errors.join(', ')}`
          }));
          return false;
        }
        
        if (validation.warnings.length > 0) {
          setAutoFixResults(prev => ({
            ...prev,
            'keys-validation': `Clés valides avec avertissements: ${validation.warnings.join(', ')}`
          }));
          return true;
        }
        
        setAutoFixResults(prev => ({
          ...prev,
          'keys-validation': 'Toutes les clés sont uniques et valides'
        }));
        return true;
      }
    },
    {
      id: 'dom-banner-detection',
      title: 'Détection des bannières DOM',
      description: 'Initialiser et vérifier la présence des conteneurs de bannières',
      status: 'checking',
      severity: 'warning',
      autoFixAvailable: true,
      fixFunction: async () => {
        try {
          // Attendre un peu pour que les composants se montent
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const bannerContainers = document.querySelectorAll('[data-placement]');
          const adsterraScripts = document.querySelectorAll('script[src*="highperformanceformat.com"]');
          
          if (bannerContainers.length === 0) {
            setAutoFixResults(prev => ({
              ...prev,
              'dom-banner-detection': 'Aucun conteneur de bannière détecté - vérifier l\'intégration des composants'
            }));
            return false;
          }
          
          setAutoFixResults(prev => ({
            ...prev,
            'dom-banner-detection': `${bannerContainers.length} conteneur(s) et ${adsterraScripts.length} script(s) détectés`
          }));
          
          // Initialiser le tracking global
          if (!window.adsterraLoaded) {
            window.adsterraLoaded = (placement: string, key: string) => {
              console.log(`Adsterra banner loaded: ${placement} (${key})`);
            };
          }
          
          return bannerContainers.length > 0;
        } catch (error) {
          setAutoFixResults(prev => ({
            ...prev,
            'dom-banner-detection': `Erreur lors de la détection: ${error instanceof Error ? error.message : 'Inconnue'}`
          }));
          return false;
        }
      }
    },
    {
      id: 'connectivity-test',
      title: 'Test de connectivité Adsterra',
      description: 'Vérifier et optimiser la connexion aux serveurs Adsterra',
      status: 'checking',
      severity: 'critical',
      autoFixAvailable: true,
      fixFunction: async () => {
        try {
          const result = await testAdsterraConnectivity();
          if (result.success) {
            setAutoFixResults(prev => ({
              ...prev,
              'connectivity-test': `✅ Connectivité établie via ${result.method} (${result.latency}ms)`
            }));
            return true;
          } else {
            setAutoFixResults(prev => ({
              ...prev,
              'connectivity-test': `❌ ${result.error || 'Connectivité échouée'} (${result.latency}ms)`
            }));
            return false;
          }
        } catch (error) {
          setAutoFixResults(prev => ({
            ...prev,
            'connectivity-test': `❌ Erreur de test: ${error instanceof Error ? error.message : 'Inconnue'}`
          }));
          return false;
        }
      }
    },
    {
      id: 'domain-validation',
      title: 'Validation du domaine',
      description: 'Vérifier que le domaine actuel est autorisé',
      status: 'checking',
      severity: 'warning',
      autoFixAvailable: true,
      fixFunction: async () => {
        const allowed = isDomainAllowed();
        if (!allowed) {
          setAutoFixResults(prev => ({
            ...prev,
            'domain-validation': `Domaine ${window.location.hostname} non autorisé - ajouter à la configuration`
          }));
        } else {
          setAutoFixResults(prev => ({
            ...prev,
            'domain-validation': `Domaine ${window.location.hostname} autorisé`
          }));
        }
        return allowed;
      }
    },
    {
      id: 'performance-optimization',
      title: 'Optimisation des performances',
      description: 'Optimiser les délais de chargement et la performance',
      status: 'checking',
      severity: 'info',
      autoFixAvailable: true,
      fixFunction: async () => {
        const startTime = performance.now();
        const optimizations = [];
        
        // Optimiser les délais de chargement
        if (localStorage.getItem('adsterra-timeout-optimized') !== 'true') {
          localStorage.setItem('adsterra-timeout-optimized', 'true');
          localStorage.setItem('adsterra-load-timeout', '3000'); // 3s au lieu de 5s
          optimizations.push('Timeouts réduits (3s)');
        }
        
        // Activer le pré-chargement DNS
        if (!document.querySelector('link[rel="dns-prefetch"][href*="highperformanceformat.com"]')) {
          const link = document.createElement('link');
          link.rel = 'dns-prefetch';
          link.href = 'https://www.highperformanceformat.com';
          document.head.appendChild(link);
          optimizations.push('DNS prefetch activé');
        }
        
        // Optimiser la détection des bannières
        if (localStorage.getItem('adsterra-fast-detection') !== 'true') {
          localStorage.setItem('adsterra-fast-detection', 'true');
          optimizations.push('Détection rapide activée');
        }
        
        // Activer la mise en cache des scripts
        if (localStorage.getItem('adsterra-cache-enabled') !== 'true') {
          localStorage.setItem('adsterra-cache-enabled', 'true');
          optimizations.push('Cache des scripts activé');
        }
        
        const executionTime = Math.round(performance.now() - startTime);
        
        setAutoFixResults(prev => ({
          ...prev,
          'performance-optimization': optimizations.length > 0 
            ? `✅ Optimisations appliquées (${executionTime}ms): ${optimizations.join(', ')}`
            : `✅ Déjà optimisé (${executionTime}ms)`
        }));
        
        return true;
      }
    },
    {
      id: 'csp-headers',
      title: 'Configuration CSP',
      description: 'Vérifier les en-têtes Content Security Policy',
      status: 'checking',
      severity: 'warning',
      autoFixAvailable: false // Nécessite une intervention côté serveur
    }
  ];

  useEffect(() => {
    setIssues(initializeIssues());
    performAutoCheck();
  }, []);

  const performAutoCheck = async () => {
    const issueList = initializeIssues();
    
    for (const issue of issueList) {
      if (issue.fixFunction) {
        try {
          const resolved = await issue.fixFunction();
          issue.status = resolved ? 'resolved' : 'error';
        } catch (error) {
          issue.status = 'error';
          setAutoFixResults(prev => ({
            ...prev,
            [issue.id]: `Erreur: ${error instanceof Error ? error.message : 'Inconnue'}`
          }));
        }
      } else {
        issue.status = 'manual';
      }
    }
    
    setIssues([...issueList]);
  };

  const runAutoFix = async () => {
    setIsFixing(true);
    setAutoFixResults({});
    
    try {
      // Utiliser le nouveau système de monitoring
      const healthReport = await adsterraMonitor.performHealthCheck();
      const autoFixResult = await adsterraMonitor.autoFixIssues();
      
      // Mettre à jour les résultats avec les détails du système de monitoring
      const combinedResults: Record<string, string> = {};
      
      autoFixResult.details.forEach((detail, index) => {
        combinedResults[`monitor-fix-${index}`] = detail;
      });
      
      if (autoFixResult.fixed > 0) {
        combinedResults['summary'] = `✅ ${autoFixResult.fixed} problème(s) corrigé(s), ${autoFixResult.failed} échec(s)`;
      }
      
      if (healthReport.isOperational) {
        combinedResults['operational-status'] = `🎉 Système opérationnel (Score: ${healthReport.score}/100)`;
      } else {
        combinedResults['operational-status'] = `⚠️ Système non opérationnel (Score: ${healthReport.score}/100)`;
      }
      
      setAutoFixResults(combinedResults);
      
      // Relancer la vérification classique
      await performAutoCheck();
      
    } catch (error) {
      setAutoFixResults({
        error: `Erreur lors de la correction automatique: ${error instanceof Error ? error.message : 'Inconnue'}`
      });
    }
    
    setIsFixing(false);
  };

  const startSystemMonitoring = () => {
    adsterraMonitor.startMonitoring(30000); // Surveillance toutes les 30 secondes
    setAutoFixResults(prev => ({
      ...prev,
      'monitoring': '🔄 Surveillance système démarrée (30s)'
    }));
  };

  const getStatusIcon = (status: AutoFixIssue['status']) => {
    switch (status) {
      case 'resolved':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'checking':
        return <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'manual':
        return <AlertTriangle className="w-4 h-4 text-orange-500" />;
    }
  };

  const getStatusBadge = (status: AutoFixIssue['status']) => {
    const variants = {
      resolved: 'default',
      error: 'destructive',
      checking: 'secondary',
      manual: 'outline'
    } as const;

    const labels = {
      resolved: 'RÉSOLU',
      error: 'ERREUR',
      checking: 'VÉRIFICATION',
      manual: 'MANUEL'
    };

    return (
      <Badge variant={variants[status]} className="text-xs">
        {labels[status]}
      </Badge>
    );
  };

  const getSeverityBadge = (severity: AutoFixIssue['severity']) => {
    const variants = {
      critical: 'destructive',
      warning: 'secondary',
      info: 'outline'
    } as const;

    const labels = {
      critical: 'CRITIQUE',
      warning: 'ATTENTION',
      info: 'INFO'
    };

    return (
      <Badge variant={variants[severity]} className="text-xs">
        {labels[severity]}
      </Badge>
    );
  };

  const resolvedIssues = issues.filter(issue => issue.status === 'resolved').length;
  const errorIssues = issues.filter(issue => issue.status === 'error').length;
  const criticalErrors = issues.filter(issue => issue.status === 'error' && issue.severity === 'critical').length;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="w-5 h-5" />
            Correction automatique Adsterra
            {criticalErrors === 0 ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : (
              <XCircle className="w-5 h-5 text-red-500" />
            )}
          </CardTitle>
          <CardDescription>
            Diagnostic et correction automatique des problèmes Adsterra
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">{resolvedIssues}</div>
              <div className="text-sm text-muted-foreground">Résolus</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-500">{errorIssues}</div>
              <div className="text-sm text-muted-foreground">Erreurs</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-500">{criticalErrors}</div>
              <div className="text-sm text-muted-foreground">Critiques</div>
            </div>
          </div>

          {criticalErrors > 0 && (
            <Alert className="mb-4">
              <XCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Attention :</strong> {criticalErrors} erreur(s) critique(s) détectée(s). 
                Le système pourrait ne pas fonctionner correctement en production.
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-3">
            {issues.map((issue) => (
              <div
                key={issue.id}
                className={`flex items-center justify-between p-4 rounded-lg border ${
                  issue.status === 'error' && issue.severity === 'critical'
                    ? 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20'
                    : 'border-border bg-card'
                }`}
              >
                <div className="flex items-center gap-3">
                  {getStatusIcon(issue.status)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{issue.title}</span>
                      {getSeverityBadge(issue.severity)}
                    </div>
                    <p className="text-sm text-muted-foreground">{issue.description}</p>
                    {autoFixResults[issue.id] && (
                      <p className="text-xs text-muted-foreground mt-1 font-mono">
                        {autoFixResults[issue.id]}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {getStatusBadge(issue.status)}
                  {issue.autoFixAvailable && (
                    <Badge variant="outline" className="text-xs">
                      AUTO-FIX
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-2 mt-6 flex-wrap">
            <Button 
              onClick={runAutoFix} 
              disabled={isFixing}
              className="flex items-center gap-2"
            >
              {isFixing ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Wrench className="w-4 h-4" />
              )}
              {isFixing ? 'Correction en cours...' : 'Correction automatique complète'}
            </Button>
            
            <Button 
              onClick={performAutoCheck} 
              variant="outline"
              disabled={isFixing}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Nouvelle vérification
            </Button>

            <Button 
              onClick={startSystemMonitoring} 
              variant="secondary"
              disabled={isFixing}
            >
              <Play className="w-4 h-4 mr-2" />
              Surveillance continue
            </Button>
          </div>

          {resolvedIssues === issues.length - issues.filter(i => i.status === 'manual').length && (
            <Alert className="mt-4">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>✅ Système opérationnel !</strong> Tous les problèmes automatiquement corrigeables ont été résolus.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdsterraAutoFix;