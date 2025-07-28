import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Mail, TrendingUp, Shield, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface BounceAnalysis {
  email_address: string;
  bounce_count: number;
  total_emails: number;
  bounce_rate: number;
  last_bounce_date: string;
  risk_assessment: string;
}

interface EmailStats {
  total_emails: number;
  bounced_emails: number;
  bounce_rate: number;
  high_risk_emails: number;
}

const EmailBounceMonitor = () => {
  const [bounceData, setBounceData] = useState<BounceAnalysis[]>([]);
  const [emailStats, setEmailStats] = useState<EmailStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const fetchEmailStats = async () => {
    setIsLoading(true);
    try {
      // Récupérer les statistiques générales
      const { data: trackingData, error: trackingError } = await supabase
        .from('email_tracking')
        .select('status, email_address')
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      if (trackingError) throw trackingError;

      if (trackingData) {
        const total = trackingData.length;
        const bounced = trackingData.filter(email => email.status === 'bounced').length;
        const uniqueEmails = new Set(trackingData.map(email => email.email_address));
        const highRiskEmails = trackingData.filter(email => 
          email.status === 'bounced'
        ).reduce((acc, email) => {
          acc.add(email.email_address);
          return acc;
        }, new Set()).size;

        setEmailStats({
          total_emails: total,
          bounced_emails: bounced,
          bounce_rate: total > 0 ? Math.round((bounced / total) * 100) : 0,
          high_risk_emails: highRiskEmails
        });
      }

      // Récupérer l'analyse des bounces
      const { data: bounceAnalysis, error: bounceError } = await supabase
        .rpc('analyze_email_bounces', { days_back: 30 });

      if (bounceError) throw bounceError;

      setBounceData(bounceAnalysis || []);

    } catch (error: any) {
      console.error('Erreur lors du chargement des stats email:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les statistiques d'emails",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEmailStats();
  }, []);

  const getRiskBadgeVariant = (risk: string) => {
    switch (risk) {
      case 'HIGH_RISK': return 'destructive';
      case 'MEDIUM_RISK': return 'default';
      default: return 'secondary';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'HIGH_RISK': return 'text-red-600';
      case 'MEDIUM_RISK': return 'text-yellow-600';
      default: return 'text-green-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Statistiques générales */}
      {emailStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Emails</p>
                  <p className="text-2xl font-bold">{emailStats.total_emails}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Bounces</p>
                  <p className="text-2xl font-bold">{emailStats.bounced_emails}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-orange-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Taux Bounce</p>
                  <p className="text-2xl font-bold">{emailStats.bounce_rate}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-red-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Haut Risque</p>
                  <p className="text-2xl font-bold">{emailStats.high_risk_emails}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Analyse des bounces */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              Analyse des Bounces (30 derniers jours)
            </CardTitle>
            <Button 
              onClick={fetchEmailStats} 
              disabled={isLoading}
              variant="outline" 
              size="sm"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Actualiser
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {bounceData.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Mail className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Aucun bounce détecté récemment</p>
              <p className="text-sm">C'est une bonne nouvelle !</p>
            </div>
          ) : (
            <div className="space-y-4">
              {bounceData.map((bounce, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <code className="text-sm bg-muted px-2 py-1 rounded">
                        {bounce.email_address}
                      </code>
                      <Badge variant={getRiskBadgeVariant(bounce.risk_assessment)}>
                        {bounce.risk_assessment.replace('_', ' ')}
                      </Badge>
                    </div>
                    <div className="mt-2 text-sm text-muted-foreground">
                      <span>
                        {bounce.bounce_count} bounce(s) sur {bounce.total_emails} emails 
                      </span>
                      <span className="mx-2">•</span>
                      <span className={getRiskColor(bounce.risk_assessment)}>
                        {bounce.bounce_rate}% de taux de bounce
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Dernier bounce</p>
                    <p className="text-sm">
                      {new Date(bounce.last_bounce_date).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Instructions pour résoudre les bounces */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-500" />
            Comment résoudre les problèmes de bounce
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold mt-0.5">1</div>
              <div>
                <p className="font-medium">Configurer Resend comme fournisseur SMTP</p>
                <p className="text-muted-foreground">Aller dans Supabase → Auth → Settings → SMTP et configurer Resend</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold mt-0.5">2</div>
              <div>
                <p className="font-medium">Valider le domaine yamo.chat dans Resend</p>
                <p className="text-muted-foreground">Assurer que tous les enregistrements DNS sont correctement configurés</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold mt-0.5">3</div>
              <div>
                <p className="font-medium">Nettoyer les emails à haut risque</p>
                <p className="text-muted-foreground">Éviter d'envoyer à des adresses avec un taux de bounce élevé</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailBounceMonitor;