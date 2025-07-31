import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, AlertTriangle, ArrowRight, ExternalLink } from 'lucide-react';
import { ADSTERRA_CONFIG } from '@/config/adsterraConfig';
import { validateAdsterraKeys } from '@/utils/adsterraProductionConfig';

interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  status: 'completed' | 'pending' | 'failed';
  critical: boolean;
  action?: () => void;
  externalLink?: string;
}

const AdsterraPreDeploymentChecklist: React.FC = () => {
  const [checklist, setChecklist] = useState<ChecklistItem[]>([
    {
      id: 'keys',
      title: 'Vérification des clés Adsterra',
      description: 'Remplacer les clés placeholder par de vraies clés Adsterra',
      status: (() => {
        const keyValidation = validateAdsterraKeys();
        return keyValidation.isValid ? 'completed' : 'failed';
      })(),
      critical: true,
      externalLink: 'https://publisher.adsterra.com/'
    },
    {
      id: 'connectivity',
      title: 'Test de connectivité',
      description: 'Vérifier l\'accès à highperformanceformat.com',
      status: 'pending',
      critical: true,
      action: () => testConnectivity()
    },
    {
      id: 'formats',
      title: 'Validation des formats',
      description: 'S\'assurer que les dimensions correspondent aux specs Adsterra',
      status: validateFormats() ? 'completed' : 'failed',
      critical: false
    },
    {
      id: 'system-test',
      title: 'Diagnostic système complet',
      description: 'Exécuter le test système complet via /adsterra-test',
      status: 'pending',
      critical: true,
      action: () => window.open('/adsterra-test', '_blank')
    },
    {
      id: 'domain-setup',
      title: 'Configuration du domaine',
      description: 'Autoriser le domaine de production dans Adsterra',
      status: 'pending',
      critical: true,
      externalLink: 'https://publisher.adsterra.com/sites'
    },
    {
      id: 'csp-headers',
      title: 'En-têtes CSP',
      description: 'Configurer les Content Security Policy pour Adsterra',
      status: 'pending',
      critical: false
    }
  ]);

  const testConnectivity = async () => {
    setChecklist(prev => prev.map(item => 
      item.id === 'connectivity' 
        ? { ...item, status: 'pending' }
        : item
    ));

    try {
      // Test avec timeout optimisé
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('timeout')), 5000)
      );

      const fetchPromise = fetch('https://www.highperformanceformat.com/js/', {
        method: 'HEAD',
        mode: 'no-cors',
        cache: 'no-cache'
      });

      await Promise.race([fetchPromise, timeoutPromise]);
      
      setChecklist(prev => prev.map(item => 
        item.id === 'connectivity' 
          ? { ...item, status: 'completed' }
          : item
      ));
    } catch (error) {
      // En développement, on considère que c'est normal
      const status = process.env.NODE_ENV === 'development' ? 'pending' : 'failed';
      
      setChecklist(prev => prev.map(item => 
        item.id === 'connectivity' 
          ? { ...item, status }
          : item
      ));
    }
  };

  function validateFormats(): boolean {
    const adsterraStandardFormats = [
      '728x90', '300x250', '320x50', '160x600', 
      '468x60', '250x250', '300x600'
    ];
    
    return Object.values(ADSTERRA_CONFIG.BANNERS).every(banner => 
      adsterraStandardFormats.includes(`${banner.width}x${banner.height}`)
    );
  }

  const getStatusIcon = (status: ChecklistItem['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'pending':
        return <AlertTriangle className="w-4 h-4 text-orange-500" />;
    }
  };

  const getStatusBadge = (status: ChecklistItem['status']) => {
    const variants = {
      completed: 'default',
      failed: 'destructive',
      pending: 'secondary'
    } as const;

    const labels = {
      completed: 'TERMINÉ',
      failed: 'ÉCHEC',
      pending: 'EN ATTENTE'
    };

    return (
      <Badge variant={variants[status]} className="text-xs">
        {labels[status]}
      </Badge>
    );
  };

  const completedItems = checklist.filter(item => item.status === 'completed').length;
  const failedCritical = checklist.filter(item => item.critical && item.status === 'failed').length;
  const readyForDeployment = failedCritical === 0 && completedItems >= checklist.filter(item => item.critical).length;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Checklist pré-déploiement Adsterra
            {readyForDeployment ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : (
              <XCircle className="w-5 h-5 text-red-500" />
            )}
          </CardTitle>
          <CardDescription>
            Vérifications obligatoires avant le déploiement en production
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">{completedItems}</div>
              <div className="text-sm text-muted-foreground">Terminés</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-500">
                {checklist.filter(item => item.status === 'pending').length}
              </div>
              <div className="text-sm text-muted-foreground">En attente</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-500">{failedCritical}</div>
              <div className="text-sm text-muted-foreground">Échecs critiques</div>
            </div>
          </div>

          {readyForDeployment ? (
            <Alert className="mb-4">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>✅ Prêt pour le déploiement !</strong> Toutes les vérifications critiques sont passées.
              </AlertDescription>
            </Alert>
          ) : (
            <Alert className="mb-4">
              <XCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>❌ Non prêt pour le déploiement.</strong> Veuillez compléter les éléments critiques.
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-3">
            {checklist.map((item) => (
              <div
                key={item.id}
                className={`flex items-center justify-between p-4 rounded-lg border ${
                  item.critical && item.status === 'failed'
                    ? 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20'
                    : 'border-border bg-card'
                }`}
              >
                <div className="flex items-center gap-3">
                  {getStatusIcon(item.status)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{item.title}</span>
                      {item.critical && (
                        <Badge variant="outline" className="text-xs">CRITIQUE</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {getStatusBadge(item.status)}
                  
                  {item.action && (
                    <Button
                      onClick={item.action}
                      size="sm"
                      variant="outline"
                      className="ml-2"
                    >
                      <ArrowRight className="w-3 h-3" />
                    </Button>
                  )}
                  
                  {item.externalLink && (
                    <Button
                      onClick={() => window.open(item.externalLink, '_blank')}
                      size="sm"
                      variant="ghost"
                      className="ml-2"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-muted rounded-lg">
            <h4 className="font-medium mb-2">Actions post-déploiement :</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Surveiller les logs de console pour les erreurs Adsterra</li>
              <li>• Vérifier l'affichage des publicités en navigation privée</li>
              <li>• Contrôler les métriques de revenus dans le dashboard Adsterra</li>
              <li>• Tester sur différents appareils et navigateurs</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdsterraPreDeploymentChecklist;