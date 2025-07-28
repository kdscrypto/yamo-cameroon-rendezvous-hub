
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Loader2, TestTube, Mail } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import EmailForwardingManager from '@/components/EmailForwardingManager';
import EmailBounceMonitor from '@/components/EmailBounceMonitor';

interface TestResult {
  success: boolean;
  status: string;
  details: any;
  error?: string;
}

const EmailTest = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const { toast } = useToast();

  const testEmailSending = async () => {
    setIsLoading(true);
    setTestResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('test-resend-connection', {
        body: {}
      });

      if (error) {
        throw error;
      }

      setTestResult(data);
      
      if (data.success) {
        toast({
          title: "✅ Test réussi !",
          description: "Email envoyé avec succès depuis yamo.chat",
        });
      } else {
        toast({
          title: "❌ Test échoué",
          description: data.error || "Problème lors de l'envoi",
          variant: "destructive"
        });
      }

    } catch (error: any) {
      console.error('Error testing email:', error);
      const errorResult = {
        success: false,
        status: 'failed',
        error: error.message,
        details: { timestamp: new Date().toISOString() }
      };
      setTestResult(errorResult);
      
      toast({
        title: "❌ Erreur",
        description: error.message || "Impossible de tester l'envoi d'email",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <div className="flex-1 container-spacing section-spacing">
        <div className="max-w-4xl mx-auto space-y-8">
          
          {/* Email Forwarding Management */}
          <div className="flex justify-center">
            <EmailForwardingManager />
          </div>

          {/* Email Bounce Monitor */}
          <EmailBounceMonitor />

          {/* Original Email Test */}
          <div className="flex justify-center">
            <Card className="w-full max-w-lg">
              <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center gap-2 text-primary">
                  <Mail className="w-6 h-6" />
                  Test Email Domaine Vérifié
                </CardTitle>
                <p className="text-muted-foreground">
                  Testez l'envoi d'emails depuis yamo.chat
                </p>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div className="text-center space-y-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium">yamo.chat</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Domaine vérifié et configuré dans Resend
                  </p>
                </div>

                <Button 
                  onClick={testEmailSending} 
                  disabled={isLoading}
                  className="w-full"
                  size="lg"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Envoi en cours...
                    </>
                  ) : (
                    <>
                      <TestTube className="w-4 h-4 mr-2" />
                      Envoyer Email de Test
                    </>
                  )}
                </Button>

                {testResult && (
                  <div className="space-y-4 p-4 border rounded-lg">
                    <div className="flex items-center gap-2">
                      {testResult.success ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-500" />
                      )}
                      <Badge variant={testResult.success ? "default" : "destructive"}>
                        {testResult.success ? 'Succès' : 'Échec'}
                      </Badge>
                    </div>

                    {testResult.success ? (
                      <div className="space-y-2">
                        <p className="text-green-600 font-medium">✅ Email envoyé avec succès !</p>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <p>📧 Destinataire: contactyamoo@gmail.com</p>
                          <p>🌐 Domaine: {testResult.details?.verifiedDomain}</p>
                          {testResult.details?.emailId && (
                            <p>🆔 ID Email: {testResult.details.emailId}</p>
                          )}
                          <p>⏰ {new Date(testResult.details?.timestamp).toLocaleString('fr-FR')}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <p className="text-red-600 font-medium">❌ Échec de l'envoi</p>
                        <p className="text-sm text-muted-foreground">{testResult.error}</p>
                      </div>
                    )}
                  </div>
                )}

                <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">
                  <p className="font-medium mb-2">Ce test vérifie :</p>
                  <ul className="space-y-1">
                    <li>✓ Configuration DNS du domaine yamo.chat</li>
                    <li>✓ Authentification DKIM/SPF</li>
                    <li>✓ Fonctionnement de l'API Resend</li>
                    <li>✓ Livraison des emails</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Instructions de configuration SMTP */}
          <Card className="w-full max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle className="text-red-600 flex items-center gap-2">
                <Mail className="w-6 h-6" />
                🚨 Action Requise: Configurer Resend comme SMTP Supabase
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <p className="text-red-800 font-medium mb-2">
                  Pour résoudre les bounces, vous DEVEZ configurer Resend comme fournisseur SMTP dans Supabase :
                </p>
                <ol className="text-sm text-red-700 space-y-2 ml-4">
                  <li>1. Allez sur <a href="https://supabase.com/dashboard/project/lusovklxvtzhluekhwvu/settings/auth" className="underline text-blue-600" target="_blank">Settings → Auth → SMTP</a></li>
                  <li>2. Activez "Enable custom SMTP"</li>
                  <li>3. Configurez :</li>
                  <ul className="ml-4 space-y-1">
                    <li>• Host: smtp.resend.com</li>
                    <li>• Port: 587</li>
                    <li>• User: resend</li>
                    <li>• Password: [Votre clé API Resend]</li>
                    <li>• Sender email: noreply@yamo.chat</li>
                    <li>• Sender name: Yamo</li>
                  </ul>
                  <li>4. Testez la configuration</li>
                </ol>
              </div>
              <p className="text-sm text-muted-foreground">
                Sans cette configuration, Supabase continue d'utiliser son service d'email par défaut qui cause les bounces.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default EmailTest;
