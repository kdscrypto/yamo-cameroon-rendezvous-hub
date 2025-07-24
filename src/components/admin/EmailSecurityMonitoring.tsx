import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Shield, AlertTriangle, Search, TrendingUp, Mail, Users, Clock, Eye } from 'lucide-react';

interface SuspiciousPattern {
  pattern: string;
  count: number;
  risk_level: 'low' | 'medium' | 'high';
  description: string;
  examples: string[];
}

interface EmailAnalysis {
  patterns: SuspiciousPattern[];
  totalAnalyzed: number;
  timeframe: string;
}

interface DomainCheck {
  domain: string;
  riskLevel: 'low' | 'medium' | 'high';
  issues: string[];
  isDisposable: boolean;
  isTypo: boolean;
}

const EmailSecurityMonitoring: React.FC = () => {
  const [analysis, setAnalysis] = useState<EmailAnalysis | null>(null);
  const [domainCheck, setDomainCheck] = useState<DomainCheck | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [timeframe, setTimeframe] = useState('24h');
  const [domainToCheck, setDomainToCheck] = useState('');
  const { toast } = useToast();

  const analyzePatterns = async (selectedTimeframe: string = timeframe) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('email-monitoring', {
        body: {
          action: 'analyze-patterns',
          timeframe: selectedTimeframe
        }
      });

      if (error) throw error;

      if (data.success) {
        setAnalysis(data.data);
        toast({
          title: "Analyse terminée",
          description: `${data.data.totalAnalyzed} comptes analysés pour la période ${selectedTimeframe}.`
        });
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Erreur lors de l\'analyse:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'effectuer l'analyse des patterns.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const checkDomain = async () => {
    if (!domainToCheck.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez entrer un domaine à vérifier.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('email-monitoring', {
        body: {
          action: 'check-domain',
          domain: domainToCheck.toLowerCase().trim()
        }
      });

      if (error) throw error;

      if (data.success) {
        setDomainCheck(data.data);
        toast({
          title: "Vérification terminée",
          description: `Domaine ${domainToCheck} analysé.`
        });
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Erreur lors de la vérification:', error);
      toast({
        title: "Erreur",
        description: "Impossible de vérifier le domaine.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getRiskBadgeVariant = (riskLevel: string) => {
    switch (riskLevel) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  const getRiskIcon = (riskLevel: string) => {
    switch (riskLevel) {
      case 'high': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'medium': return <TrendingUp className="w-4 h-4 text-yellow-500" />;
      case 'low': return <Shield className="w-4 h-4 text-green-500" />;
      default: return <Shield className="w-4 h-4" />;
    }
  };

  useEffect(() => {
    analyzePatterns();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Shield className="w-8 h-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold text-foreground">Surveillance de Sécurité Email</h1>
          <p className="text-muted-foreground">Monitoring des patterns suspects et validation des domaines</p>
        </div>
      </div>

      <Tabs defaultValue="analysis" className="space-y-4">
        <TabsList>
          <TabsTrigger value="analysis">Analyse des Patterns</TabsTrigger>
          <TabsTrigger value="domain-check">Vérification de Domaine</TabsTrigger>
        </TabsList>

        <TabsContent value="analysis" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Analyse des Patterns Suspects
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Select value={timeframe} onValueChange={setTimeframe}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="24h">24 heures</SelectItem>
                      <SelectItem value="7d">7 jours</SelectItem>
                      <SelectItem value="30d">30 jours</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button 
                    onClick={() => analyzePatterns(timeframe)}
                    disabled={isLoading}
                    variant="outline"
                  >
                    <Search className="w-4 h-4 mr-2" />
                    Analyser
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {analysis && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                          <Users className="w-5 h-5 text-blue-500" />
                          <div>
                            <p className="text-sm text-muted-foreground">Comptes Analysés</p>
                            <p className="text-2xl font-bold">{analysis.totalAnalyzed}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="w-5 h-5 text-orange-500" />
                          <div>
                            <p className="text-sm text-muted-foreground">Patterns Détectés</p>
                            <p className="text-2xl font-bold">{analysis.patterns.length}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                          <Clock className="w-5 h-5 text-green-500" />
                          <div>
                            <p className="text-sm text-muted-foreground">Période</p>
                            <p className="text-2xl font-bold">{analysis.timeframe}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {analysis.patterns.length > 0 ? (
                    <div className="space-y-3">
                      <h3 className="text-lg font-semibold">Patterns Suspects Détectés</h3>
                      {analysis.patterns.map((pattern, index) => (
                        <Alert key={index} className="border-l-4 border-l-orange-500">
                          <AlertDescription>
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                {getRiskIcon(pattern.risk_level)}
                                <span className="font-medium">{pattern.description}</span>
                                <Badge variant={getRiskBadgeVariant(pattern.risk_level)}>
                                  {pattern.risk_level.toUpperCase()}
                                </Badge>
                              </div>
                              <span className="text-sm font-medium">{pattern.count} cas</span>
                            </div>
                            {pattern.examples.length > 0 && (
                              <div className="mt-2">
                                <p className="text-sm text-muted-foreground mb-1">Exemples:</p>
                                <div className="text-sm font-mono bg-muted p-2 rounded">
                                  {pattern.examples.join(', ')}
                                </div>
                              </div>
                            )}
                          </AlertDescription>
                        </Alert>
                      ))}
                    </div>
                  ) : (
                    <Alert>
                      <Shield className="w-4 h-4" />
                      <AlertDescription>
                        Aucun pattern suspect détecté pour la période sélectionnée.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="domain-check" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Vérification de Domaine Email
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <div className="flex-1">
                  <Label htmlFor="domain">Domaine à vérifier</Label>
                  <Input
                    id="domain"
                    placeholder="exemple.com"
                    value={domainToCheck}
                    onChange={(e) => setDomainToCheck(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && checkDomain()}
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={checkDomain} disabled={isLoading}>
                    <Eye className="w-4 h-4 mr-2" />
                    Vérifier
                  </Button>
                </div>
              </div>

              {domainCheck && (
                <Alert className="border-l-4 border-l-blue-500">
                  <AlertDescription>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Domaine: {domainCheck.domain}</span>
                        <div className="flex items-center gap-2">
                          {getRiskIcon(domainCheck.riskLevel)}
                          <Badge variant={getRiskBadgeVariant(domainCheck.riskLevel)}>
                            {domainCheck.riskLevel.toUpperCase()}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Jetable: </span>
                          <span className={domainCheck.isDisposable ? 'text-red-600' : 'text-green-600'}>
                            {domainCheck.isDisposable ? 'Oui' : 'Non'}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium">Typo possible: </span>
                          <span className={domainCheck.isTypo ? 'text-orange-600' : 'text-green-600'}>
                            {domainCheck.isTypo ? 'Oui' : 'Non'}
                          </span>
                        </div>
                      </div>

                      {domainCheck.issues.length > 0 && (
                        <div>
                          <p className="font-medium text-sm mb-1">Problèmes détectés:</p>
                          <ul className="list-disc list-inside text-sm text-muted-foreground">
                            {domainCheck.issues.map((issue, index) => (
                              <li key={index}>{issue}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EmailSecurityMonitoring;