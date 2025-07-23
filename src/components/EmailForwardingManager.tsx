
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Loader2, Mail, Settings, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ForwardingStatus {
  success: boolean;
  action: string;
  status?: {
    fromAddress: string;
    toAddress: string;
    configured: boolean;
    active: boolean;
    lastChecked: string;
  };
  message?: string;
  error?: string;
}

const EmailForwardingManager = () => {
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [forwardingStatus, setForwardingStatus] = useState<ForwardingStatus | null>(null);
  const { toast } = useToast();

  const handleForwardingAction = async (action: 'create' | 'verify' | 'status') => {
    setIsLoading(action);
    setForwardingStatus(null);

    try {
      const { data, error } = await supabase.functions.invoke('setup-email-forwarding', {
        body: { action }
      });

      if (error) {
        throw error;
      }

      setForwardingStatus(data);
      
      if (data.success) {
        let message = '';
        switch (action) {
          case 'create':
            message = "✅ Email forwarding configuré avec succès!";
            break;
          case 'verify':
            message = "✅ Vérification réussie - Le forwarding fonctionne!";
            break;
          case 'status':
            message = "📊 Statut récupéré avec succès";
            break;
        }
        
        toast({
          title: message,
          description: data.message,
        });
      } else {
        toast({
          title: "❌ Erreur",
          description: data.error || "Problème lors de l'opération",
          variant: "destructive"
        });
      }

    } catch (error: any) {
      console.error('Error with email forwarding:', error);
      const errorResult = {
        success: false,
        action,
        error: error.message
      };
      setForwardingStatus(errorResult);
      
      toast({
        title: "❌ Erreur",
        description: error.message || "Impossible d'effectuer l'opération",
        variant: "destructive"
      });
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          <Settings className="w-6 h-6" />
          Gestion Email Forwarding
        </CardTitle>
        <p className="text-muted-foreground">
          Configuration et test du système d'email professionnel
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Configuration Overview */}
        <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
          <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
            Configuration Email Professionnelle
          </h3>
          <div className="flex items-center gap-2 text-sm text-blue-800 dark:text-blue-200">
            <Mail className="w-4 h-4" />
            <span className="font-mono">contact@yamo.chat</span>
            <ArrowRight className="w-4 h-4" />
            <span className="font-mono">contactyamoo@gmail.com</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button 
            onClick={() => handleForwardingAction('create')} 
            disabled={isLoading !== null}
            className="w-full"
            variant="default"
          >
            {isLoading === 'create' ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Configuration...
              </>
            ) : (
              <>
                <Settings className="w-4 h-4 mr-2" />
                Configurer
              </>
            )}
          </Button>

          <Button 
            onClick={() => handleForwardingAction('verify')} 
            disabled={isLoading !== null}
            className="w-full"
            variant="outline"
          >
            {isLoading === 'verify' ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Vérification...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Vérifier
              </>
            )}
          </Button>

          <Button 
            onClick={() => handleForwardingAction('status')} 
            disabled={isLoading !== null}
            className="w-full"
            variant="secondary"
          >
            {isLoading === 'status' ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Statut...
              </>
            ) : (
              <>
                <Mail className="w-4 h-4 mr-2" />
                Statut
              </>
            )}
          </Button>
        </div>

        {/* Results */}
        {forwardingStatus && (
          <div className="space-y-4 p-4 border rounded-lg">
            <div className="flex items-center gap-2">
              {forwardingStatus.success ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <XCircle className="w-5 h-5 text-red-500" />
              )}
              <Badge variant={forwardingStatus.success ? "default" : "destructive"}>
                {forwardingStatus.success ? 'Succès' : 'Échec'}
              </Badge>
              <span className="text-sm text-muted-foreground">
                Action: {forwardingStatus.action}
              </span>
            </div>

            {forwardingStatus.success ? (
              <div className="space-y-3">
                {forwardingStatus.action === 'status' && forwardingStatus.status && (
                  <div className="bg-green-50 dark:bg-green-950/30 p-4 rounded-lg">
                    <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">
                      📊 Statut Actuel
                    </h4>
                    <div className="space-y-2 text-sm text-green-700 dark:text-green-300">
                      <p>📧 <strong>De:</strong> {forwardingStatus.status.fromAddress}</p>
                      <p>📨 <strong>Vers:</strong> {forwardingStatus.status.toAddress}</p>
                      <p>⚙️ <strong>Configuré:</strong> {forwardingStatus.status.configured ? '✅ Oui' : '❌ Non'}</p>
                      <p>🟢 <strong>Actif:</strong> {forwardingStatus.status.active ? '✅ Oui' : '❌ Non'}</p>
                      <p>⏰ <strong>Dernière vérification:</strong> {new Date(forwardingStatus.status.lastChecked).toLocaleString('fr-FR')}</p>
                    </div>
                  </div>
                )}
                
                {forwardingStatus.message && (
                  <p className="text-green-600 font-medium">✅ {forwardingStatus.message}</p>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-red-600 font-medium">❌ Opération échouée</p>
                <p className="text-sm text-muted-foreground">{forwardingStatus.error}</p>
              </div>
            )}
          </div>
        )}

        {/* Info Section */}
        <div className="text-xs text-muted-foreground bg-muted/50 p-4 rounded-lg space-y-2">
          <p className="font-medium mb-2">📋 Fonctionnalités de cette configuration :</p>
          <ul className="space-y-1">
            <li>✓ Adresse email professionnelle contact@yamo.chat</li>
            <li>✓ Forwarding automatique vers votre Gmail personnel</li>
            <li>✓ Protection contre l'accès direct à votre email personnel</li>
            <li>✓ Maintien de tous les filtres de sécurité et rate limiting</li>
            <li>✓ Apparence professionnelle pour les utilisateurs</li>
          </ul>
          
          <div className="mt-3 pt-2 border-t border-muted-foreground/20">
            <p className="font-medium">🔧 Configuration DNS requise :</p>
            <p>Assurez-vous que votre domaine yamo.chat est correctement configuré dans Resend.</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmailForwardingManager;
