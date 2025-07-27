import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Target, 
  Globe, 
  Users, 
  MapPin, 
  Calendar,
  TrendingUp,
  AlertCircle,
  Shield,
  Search,
  RefreshCw,
  Database,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ThreatIntel {
  id: string;
  type: 'ip' | 'domain' | 'hash' | 'pattern';
  value: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  source: string;
  description: string;
  firstSeen: Date;
  lastSeen: Date;
  confidence: number;
  tags: string[];
  geolocation?: {
    country: string;
    city: string;
    latitude: number;
    longitude: number;
  };
}

interface AttackVector {
  id: string;
  name: string;
  category: string;
  frequency: number;
  trend: 'up' | 'down' | 'stable';
  description: string;
  mitigation: string[];
}

export const ThreatIntelligence = () => {
  const [threatIntel, setThreatIntel] = useState<ThreatIntel[]>([]);
  const [attackVectors, setAttackVectors] = useState<AttackVector[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTab, setSelectedTab] = useState('indicators');

  useEffect(() => {
    loadThreatIntelligence();
    loadAttackVectors();
  }, []);

  const loadThreatIntelligence = async () => {
    setIsLoading(true);
    try {
      // Simulation de données de threat intelligence
      const mockData: ThreatIntel[] = [
        {
          id: '1',
          type: 'ip',
          value: '192.168.1.100',
          severity: 'high',
          source: 'Internal Honeypot',
          description: 'Multiple failed authentication attempts',
          firstSeen: new Date(Date.now() - 86400000),
          lastSeen: new Date(Date.now() - 3600000),
          confidence: 85,
          tags: ['brute-force', 'authentication'],
          geolocation: {
            country: 'Unknown',
            city: 'Unknown',
            latitude: 0,
            longitude: 0
          }
        },
        {
          id: '2',
          type: 'domain',
          value: 'suspicious-domain.com',
          severity: 'medium',
          source: 'External Feed',
          description: 'Known phishing domain',
          firstSeen: new Date(Date.now() - 172800000),
          lastSeen: new Date(Date.now() - 7200000),
          confidence: 92,
          tags: ['phishing', 'malware'],
        },
        {
          id: '3',
          type: 'pattern',
          value: 'SQL Injection Pattern',
          severity: 'critical',
          source: 'Behavioral Analysis',
          description: 'Detected SQL injection attempts in user inputs',
          firstSeen: new Date(Date.now() - 43200000),
          lastSeen: new Date(Date.now() - 1800000),
          confidence: 97,
          tags: ['sql-injection', 'web-attack'],
        }
      ];
      setThreatIntel(mockData);
    } catch (error) {
      console.error('Erreur lors du chargement de la threat intelligence:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadAttackVectors = async () => {
    try {
      const mockVectors: AttackVector[] = [
        {
          id: '1',
          name: 'Brute Force Authentication',
          category: 'Credential Access',
          frequency: 45,
          trend: 'up',
          description: 'Tentatives répétées de connexion avec différents mots de passe',
          mitigation: ['Rate limiting', 'Account lockout', 'Multi-factor authentication']
        },
        {
          id: '2',
          name: 'SQL Injection',
          category: 'Initial Access',
          frequency: 32,
          trend: 'stable',
          description: 'Injection de code SQL malveillant dans les champs de saisie',
          mitigation: ['Input validation', 'Prepared statements', 'WAF rules']
        },
        {
          id: '3',
          name: 'XSS Attacks',
          category: 'Execution',
          frequency: 28,
          trend: 'down',
          description: 'Injection de scripts malveillants dans les pages web',
          mitigation: ['Content Security Policy', 'Input sanitization', 'Output encoding']
        }
      ];
      setAttackVectors(mockVectors);
    } catch (error) {
      console.error('Erreur lors du chargement des vecteurs d\'attaque:', error);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-500';
      case 'high': return 'text-orange-500';
      case 'medium': return 'text-yellow-500';
      case 'low': return 'text-green-500';
      default: return 'text-gray-500';
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'default';
      default: return 'outline';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'ip': return Globe;
      case 'domain': return Globe;
      case 'hash': return Database;
      case 'pattern': return Target;
      default: return Shield;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return 'text-red-500';
      case 'down': return 'text-green-500';
      case 'stable': return 'text-yellow-500';
      default: return 'text-gray-500';
    }
  };

  const filteredThreatIntel = threatIntel.filter(intel =>
    intel.value.toLowerCase().includes(searchQuery.toLowerCase()) ||
    intel.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    intel.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Indicateurs</CardTitle>
            <Target className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{threatIntel.length}</div>
            <p className="text-xs text-muted-foreground">Indicateurs actifs</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vecteurs</CardTitle>
            <Zap className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{attackVectors.length}</div>
            <p className="text-xs text-muted-foreground">Vecteurs d'attaque</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Confiance Moy.</CardTitle>
            <Shield className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(threatIntel.reduce((acc, intel) => acc + intel.confidence, 0) / threatIntel.length) || 0}%
            </div>
            <p className="text-xs text-muted-foreground">Niveau de confiance</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sources</CardTitle>
            <Database className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(threatIntel.map(intel => intel.source)).size}
            </div>
            <p className="text-xs text-muted-foreground">Sources actives</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Search className="h-5 w-5" />
            <span>Recherche dans la Threat Intelligence</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2">
            <Input
              placeholder="Rechercher des indicateurs, descriptions, tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
            <Button onClick={loadThreatIntelligence} disabled={isLoading} variant="outline">
              <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs defaultValue="indicators" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="indicators">Indicateurs</TabsTrigger>
          <TabsTrigger value="vectors">Vecteurs d'Attaque</TabsTrigger>
          <TabsTrigger value="geolocation">Géolocalisation</TabsTrigger>
        </TabsList>

        <TabsContent value="indicators" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Indicateurs de Compromission (IoCs)</CardTitle>
              <CardDescription>
                Liste des indicateurs de menaces identifiés et leur analyse
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-4">
                  {filteredThreatIntel.map((intel) => {
                    const IconComponent = getTypeIcon(intel.type);
                    
                    return (
                      <Alert key={intel.id} className="border-l-4" style={{
                        borderLeftColor: intel.severity === 'critical' ? 'rgb(239 68 68)' :
                                       intel.severity === 'high' ? 'rgb(249 115 22)' :
                                       intel.severity === 'medium' ? 'rgb(234 179 8)' : 'rgb(34 197 94)'
                      }}>
                        <div className="flex items-start space-x-3">
                          <IconComponent className={cn("h-5 w-5 mt-0.5", getSeverityColor(intel.severity))} />
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <Badge variant={getSeverityBadge(intel.severity)}>
                                  {intel.severity.toUpperCase()}
                                </Badge>
                                <Badge variant="outline">
                                  {intel.type.toUpperCase()}
                                </Badge>
                                <span className="text-sm text-muted-foreground">
                                  Confiance: {intel.confidence}%
                                </span>
                              </div>
                              <div className="flex items-center text-sm text-muted-foreground">
                                <Calendar className="h-4 w-4 mr-1" />
                                {intel.lastSeen.toLocaleDateString()}
                              </div>
                            </div>
                            <div>
                              <div className="font-mono text-sm bg-muted p-2 rounded">
                                {intel.value}
                              </div>
                            </div>
                            <AlertDescription>
                              <strong>{intel.source}:</strong> {intel.description}
                            </AlertDescription>
                            <div className="flex flex-wrap gap-1">
                              {intel.tags.map((tag) => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </Alert>
                    );
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vectors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Vecteurs d'Attaque Identifiés</CardTitle>
              <CardDescription>
                Techniques et tactiques utilisées par les attaquants
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {attackVectors.map((vector) => (
                  <Card key={vector.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{vector.name}</CardTitle>
                        <div className="flex items-center space-x-2">
                          <TrendingUp className={cn("h-4 w-4", getTrendIcon(vector.trend))} />
                          <Badge variant="outline">{vector.category}</Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center space-x-4">
                        <div className="flex-1">
                          <div className="flex justify-between text-sm mb-1">
                            <span>Fréquence</span>
                            <span>{vector.frequency}%</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div 
                              className="bg-primary h-2 rounded-full" 
                              style={{ width: `${vector.frequency}%` }}
                            />
                          </div>
                        </div>
                      </div>
                      
                      <p className="text-sm text-muted-foreground">
                        {vector.description}
                      </p>
                      
                      <div>
                        <h4 className="text-sm font-medium mb-2">Mesures de Protection:</h4>
                        <div className="flex flex-wrap gap-1">
                          {vector.mitigation.map((measure, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {measure}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="geolocation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="h-5 w-5" />
                <span>Analyse Géographique</span>
              </CardTitle>
              <CardDescription>
                Répartition géographique des menaces détectées
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Carte des menaces en développement</p>
                <p className="text-sm">Visualisation géographique des sources de menaces</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};