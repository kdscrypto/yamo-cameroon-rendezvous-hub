import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Loader2, TestTube } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface TestResult {
  success: boolean;
  status: string;
  details: any;
  error?: string;
}

const ResendTestButton = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const { toast } = useToast();

  const testResendConnection = async () => {
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
          title: "✅ Test réussi",
          description: "Resend est correctement configuré et fonctionnel",
        });
      } else {
        toast({
          title: "❌ Test échoué",
          description: data.error || "Problème de configuration Resend",
          variant: "destructive"
        });
      }

    } catch (error: any) {
      console.error('Error testing Resend:', error);
      const errorResult = {
        success: false,
        status: 'failed',
        error: error.message,
        details: { timestamp: new Date().toISOString() }
      };
      setTestResult(errorResult);
      
      toast({
        title: "❌ Erreur de test",
        description: error.message || "Impossible de tester la connexion Resend",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'bg-green-500';
      case 'failed': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (success: boolean) => {
    if (success) {
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    }
    return <XCircle className="w-5 h-5 text-red-500" />;
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-yellow-400">
          <TestTube className="w-5 h-5" />
          Test Resend
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={testResendConnection} 
          disabled={isLoading}
          className="w-full"
          variant="outline"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Test en cours...
            </>
          ) : (
            <>
              <TestTube className="w-4 h-4 mr-2" />
              Tester la connexion Resend
            </>
          )}
        </Button>

        {testResult && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              {getStatusIcon(testResult.success)}
              <Badge className={getStatusColor(testResult.status)}>
                {testResult.status === 'connected' ? 'Connecté' : 'Échec'}
              </Badge>
            </div>

            {testResult.success ? (
              <div className="text-sm space-y-1">
                <p className="text-green-400 font-medium">✅ Connexion réussie</p>
                <p className="text-gray-300">Email de test envoyé avec succès</p>
                {testResult.details?.emailId && (
                  <p className="text-xs text-gray-400">ID: {testResult.details.emailId}</p>
                )}
              </div>
            ) : (
              <div className="text-sm space-y-1">
                <p className="text-red-400 font-medium">❌ Connexion échouée</p>
                <p className="text-gray-300">{testResult.error}</p>
                {testResult.details?.suggestion && (
                  <p className="text-xs text-yellow-400">
                    💡 {testResult.details.suggestion}
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        <div className="text-xs text-gray-400 space-y-1">
          <p>Ce test vérifie :</p>
          <ul className="list-disc list-inside space-y-0.5 ml-2">
            <li>Configuration de la clé API</li>
            <li>Capacité d'envoi d'emails</li>
            <li>Fonctionnement de l'intégration</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default ResendTestButton;