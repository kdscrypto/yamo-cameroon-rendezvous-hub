import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  FileText, 
  Download, 
  Calendar, 
  Clock,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Mail
} from 'lucide-react';

export const SecurityReports = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');

  const reports = [
    {
      id: '1',
      title: 'Rapport de Sécurité Mensuel',
      description: 'Analyse complète des incidents et métriques de sécurité',
      type: 'security',
      status: 'ready',
      generatedAt: new Date(),
      size: '2.4 MB'
    },
    {
      id: '2', 
      title: 'Audit de Compliance RGPD',
      description: 'Vérification de conformité aux réglementations',
      type: 'compliance',
      status: 'ready',
      generatedAt: new Date(Date.now() - 86400000),
      size: '1.8 MB'
    },
    {
      id: '3',
      title: 'Analyse des Menaces IA',
      description: 'Détections et prédictions par intelligence artificielle',
      type: 'threat',
      status: 'generating',
      generatedAt: new Date(),
      size: 'En cours...'
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ready': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'generating': return <Clock className="h-4 w-4 text-yellow-500 animate-spin" />;
      default: return <AlertTriangle className="h-4 w-4 text-red-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Rapports de Sécurité</span>
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Quotidien</SelectItem>
                  <SelectItem value="weekly">Hebdomadaire</SelectItem>
                  <SelectItem value="monthly">Mensuel</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm">
                <Mail className="h-4 w-4 mr-2" />
                Programmer
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Reports List */}
      <div className="grid gap-4">
        {reports.map((report) => (
          <Card key={report.id}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {getStatusIcon(report.status)}
                  <div>
                    <h3 className="font-medium">{report.title}</h3>
                    <p className="text-sm text-muted-foreground">{report.description}</p>
                    <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {report.generatedAt.toLocaleDateString()}
                      </span>
                      <span>{report.size}</span>
                      <Badge variant="outline">{report.type}</Badge>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {report.status === 'ready' && (
                    <>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        PDF
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Excel
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Actions Rapides</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 flex-col">
              <FileText className="h-6 w-6 mb-2" />
              <span>Rapport Instantané</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <TrendingUp className="h-6 w-6 mb-2" />
              <span>Analyse Tendances</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <CheckCircle className="h-6 w-6 mb-2" />
              <span>Audit Compliance</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <Mail className="h-6 w-6 mb-2" />
              <span>Envoyer Rapport</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};