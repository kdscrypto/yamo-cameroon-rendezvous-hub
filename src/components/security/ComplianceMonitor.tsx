import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Award, Shield, CheckCircle, AlertTriangle, Clock } from 'lucide-react';

export const ComplianceMonitor = () => {
  const complianceChecks = [
    { name: 'RGPD', status: 'compliant', score: 98, lastCheck: '2 heures' },
    { name: 'ISO 27001', status: 'compliant', score: 95, lastCheck: '1 jour' },
    { name: 'SOC 2', status: 'warning', score: 87, lastCheck: '3 heures' },
    { name: 'NIST', status: 'compliant', score: 92, lastCheck: '1 jour' }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'compliant': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default: return <AlertTriangle className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'compliant': return 'default';
      case 'warning': return 'secondary';
      default: return 'destructive';
    }
  };

  return (
    <div className="space-y-6">
      {/* Overall Score */}
      <Card className="border-l-4 border-l-green-500">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Award className="h-5 w-5 text-green-500" />
            <span>Score de Compliance Global</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold text-green-600 mb-2">98%</div>
          <Progress value={98} className="h-3 mb-4" />
          <p className="text-sm text-muted-foreground">
            Excellent niveau de conformité. Système entièrement opérationnel.
          </p>
        </CardContent>
      </Card>

      {/* Compliance Standards */}
      <Card>
        <CardHeader>
          <CardTitle>Standards de Conformité</CardTitle>
          <CardDescription>
            Vérification automatique des principales réglementations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {complianceChecks.map((check) => (
              <div key={check.name} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(check.status)}
                  <div>
                    <h3 className="font-medium">{check.name}</h3>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge variant={getStatusBadge(check.status)}>
                        {check.status === 'compliant' ? 'Conforme' : 'Attention'}
                      </Badge>
                      <span className="text-xs text-muted-foreground flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        il y a {check.lastCheck}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">{check.score}%</div>
                  <Progress value={check.score} className="w-20 h-2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Implementation Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>État d'Implémentation</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3">✅ Fonctionnalités Actives</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />Rate Limiting</li>
                <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />Chiffrement des données</li>
                <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />Audit complet</li>
                <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />Détection IA</li>
                <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />Rapports automatisés</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-3">🎯 Recommandations</h4>
              <ul className="space-y-2 text-sm">
                <li>• Audit trimestriel externe</li>
                <li>• Formation équipe sécurité</li>
                <li>• Tests de pénétration</li>
                <li>• Mise à jour documentation</li>
                <li>• Sauvegarde hors site</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};