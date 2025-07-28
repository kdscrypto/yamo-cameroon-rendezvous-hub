import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, XCircle, AlertCircle, Mail, Send, Shield, Activity } from 'lucide-react';
import EmailBounceMonitor from '@/components/EmailBounceMonitor';
import EmailForwardingManager from '@/components/EmailForwardingManager';
import ResendTestButton from '@/components/ResendTestButton';

interface VerificationResult {
  component: string;
  status: 'success' | 'warning' | 'error';
  message: string;
  details?: string;
}

interface EmailTestResult {
  success: boolean;
  status: string;
  details?: string;
  error?: string;
}

const EmailVerification = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [verificationResults, setVerificationResults] = useState<VerificationResult[]>([]);
  const [testEmail, setTestEmail] = useState('');
  const [emailTestResult, setEmailTestResult] = useState<EmailTestResult | null>(null);
  const { toast } = useToast();

  // Vérifications automatiques au chargement
  useEffect(() => {
    performSystemChecks();
  }, []);

  const performSystemChecks = async () => {
    setIsLoading(true);
    const results: VerificationResult[] = [];

    try {
      // 1. Vérifier la connexion Supabase
      const { data: healthCheck, error: healthError } = await supabase
        .from('email_tracking')
        .select('id')
        .limit(1);

      if (healthError) {
        results.push({
          component: 'Base de données',
          status: 'error',
          message: 'Erreur de connexion à la base de données',
          details: healthError.message
        });
      } else {
        results.push({
          component: 'Base de données',
          status: 'success',
          message: 'Connexion à la base de données active'
        });
      }

      // 2. Tester la fonction Resend
      try {
        const { data: resendTest, error: resendError } = await supabase.functions.invoke('test-resend-connection');
        
        if (resendError) {
          results.push({
            component: 'Service Resend',
            status: 'error',
            message: 'Erreur de connexion au service Resend',
            details: resendError.message
          });
        } else if (resendTest?.success) {
          results.push({
            component: 'Service Resend',
            status: 'success',
            message: 'Connexion au service Resend opérationnelle'
          });
        } else {
          results.push({
            component: 'Service Resend',
            status: 'warning',
            message: 'Service Resend configuré mais non testé',
            details: resendTest?.details || 'Réponse inattendue'
          });
        }
      } catch (error: any) {
        results.push({
          component: 'Service Resend',
          status: 'error',
          message: 'Impossible de tester le service Resend',
          details: error.message
        });
      }

      // 3. Vérifier les statistiques email
      try {
        const { data: emailStats, error: statsError } = await supabase
          .rpc('analyze_email_bounces', { days_back: 7 });

        if (statsError) {
          results.push({
            component: 'Statistiques Email',
            status: 'warning',
            message: 'Impossible de récupérer les statistiques',
            details: statsError.message
          });
        } else {
          const highRiskEmails = emailStats?.filter((stat: any) => stat.risk_assessment === 'HIGH_RISK').length || 0;
          results.push({
            component: 'Statistiques Email',
            status: highRiskEmails > 0 ? 'warning' : 'success',
            message: `${emailStats?.length || 0} emails analysés, ${highRiskEmails} à haut risque`
          });
        }
      } catch (error: any) {
        results.push({
          component: 'Statistiques Email',
          status: 'error',
          message: 'Erreur lors de l\'analyse des emails',
          details: error.message
        });
      }

      // 4. Vérifier les Edge Functions
      const edgeFunctionTests = [
        'test-resend-connection',
        'email-bounce-webhook',
        'send-contact-email'
      ];

      for (const functionName of edgeFunctionTests) {
        try {
          const { error } = await supabase.functions.invoke(functionName, {
            body: { test: true }
          });
          
          results.push({
            component: `Edge Function: ${functionName}`,
            status: error ? 'warning' : 'success',
            message: error ? 'Fonction accessible mais erreur de test' : 'Fonction opérationnelle'
          });
        } catch (error: any) {
          results.push({
            component: `Edge Function: ${functionName}`,
            status: 'error',
            message: 'Fonction inaccessible',
            details: error.message
          });
        }
      }

    } catch (error: any) {
      results.push({
        component: 'Système général',
        status: 'error',
        message: 'Erreur système générale',
        details: error.message
      });
    }

    setVerificationResults(results);
    setIsLoading(false);

    // Toast résumé
    const errors = results.filter(r => r.status === 'error').length;
    const warnings = results.filter(r => r.status === 'warning').length;
    
    if (errors > 0) {
      toast({
        title: 'Vérifications terminées',
        description: `${errors} erreur(s) et ${warnings} avertissement(s) détectés`,
        variant: 'destructive'
      });
    } else if (warnings > 0) {
      toast({
        title: 'Vérifications terminées',
        description: `${warnings} avertissement(s) détectés`,
      });
    } else {
      toast({
        title: 'Système opérationnel',
        description: 'Toutes les vérifications sont passées avec succès',
      });
    }
  };

  const testEmailDelivery = async () => {
    if (!testEmail) {
      toast({
        title: 'Email requis',
        description: 'Veuillez saisir une adresse email pour le test',
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('test-email-delivery', {
        body: { 
          email: testEmail,
          mode: 'test-send'
        }
      });

      if (error) {
        setEmailTestResult({
          success: false,
          status: 'Erreur',
          error: error.message
        });
        toast({
          title: 'Erreur lors du test',
          description: error.message,
          variant: 'destructive'
        });
      } else {
        setEmailTestResult({
          success: data.success,
          status: data.success ? 'Envoyé avec succès' : 'Échec d\'envoi',
          details: data.details || data.error
        });
        toast({
          title: data.success ? 'Email envoyé' : 'Échec d\'envoi',
          description: data.success ? `Email de test envoyé à ${testEmail}` : data.error,
          variant: data.success ? 'default' : 'destructive'
        });
      }
    } catch (error: any) {
      setEmailTestResult({
        success: false,
        status: 'Exception',
        error: error.message
      });
      toast({
        title: 'Erreur système',
        description: error.message,
        variant: 'destructive'
      });
    }
    setIsLoading(false);
  };

  const getStatusIcon = (status: 'success' | 'warning' | 'error') => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
    }
  };

  const getStatusBadgeVariant = (status: 'success' | 'warning' | 'error') => {
    switch (status) {
      case 'success':
        return 'default';
      case 'warning':
        return 'secondary';
      case 'error':
        return 'destructive';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Vérification du Système Email</h1>
            <p className="text-muted-foreground">
              Vérification complète de la configuration SMTP et des services email
            </p>
          </div>

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
              <TabsTrigger value="test">Test d'envoi</TabsTrigger>
              <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
              <TabsTrigger value="management">Gestion</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5" />
                      État du Système
                    </CardTitle>
                    <CardDescription>
                      Résultats des vérifications automatiques
                    </CardDescription>
                  </div>
                  <Button 
                    onClick={performSystemChecks} 
                    disabled={isLoading}
                    variant="outline"
                  >
                    {isLoading ? 'Vérification...' : 'Actualiser'}
                  </Button>
                </CardHeader>
                <CardContent>
                  {verificationResults.length > 0 ? (
                    <div className="space-y-4">
                      {verificationResults.map((result, index) => (
                        <div key={index} className="flex items-start gap-3 p-4 border rounded-lg">
                          {getStatusIcon(result.status)}
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium">{result.component}</h4>
                              <Badge variant={getStatusBadgeVariant(result.status)}>
                                {result.status === 'success' ? 'OK' : 
                                 result.status === 'warning' ? 'Attention' : 'Erreur'}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {result.message}
                            </p>
                            {result.details && (
                              <p className="text-xs text-muted-foreground bg-muted p-2 rounded">
                                {result.details}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">
                        {isLoading ? 'Vérifications en cours...' : 'Aucune vérification effectuée'}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="test" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Send className="h-5 w-5" />
                    Test d'Envoi d'Email
                  </CardTitle>
                  <CardDescription>
                    Testez l'envoi d'email vers une adresse spécifique
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="test-email">Adresse email de test</Label>
                    <Input
                      id="test-email"
                      type="email"
                      placeholder="test@example.com"
                      value={testEmail}
                      onChange={(e) => setTestEmail(e.target.value)}
                    />
                  </div>
                  
                  <Button 
                    onClick={testEmailDelivery}
                    disabled={isLoading || !testEmail}
                    className="w-full"
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    {isLoading ? 'Envoi en cours...' : 'Envoyer Email de Test'}
                  </Button>

                  {emailTestResult && (
                    <Alert className={emailTestResult.success ? 'border-green-200' : 'border-red-200'}>
                      {emailTestResult.success ? 
                        <CheckCircle className="h-4 w-4 text-green-500" /> : 
                        <XCircle className="h-4 w-4 text-red-500" />
                      }
                      <AlertTitle>{emailTestResult.status}</AlertTitle>
                      <AlertDescription>
                        {emailTestResult.details || emailTestResult.error}
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>

              <ResendTestButton />
            </TabsContent>

            <TabsContent value="monitoring">
              <EmailBounceMonitor />
            </TabsContent>

            <TabsContent value="management">
              <EmailForwardingManager />
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default EmailVerification;