
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, CheckCircle, Mail, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { validateEmail } from '@/utils/emailValidation';

interface EmailMonitoringProps {
  userRole: 'admin' | 'moderator';
}

const EmailMonitoring = ({ userRole }: EmailMonitoringProps) => {
  const [testEmail, setTestEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [validationResult, setValidationResult] = useState<any>(null);
  const [testResult, setTestResult] = useState<any>(null);
  const { toast } = useToast();
  const [emailStats, setEmailStats] = useState<{
    sent: number;
    delivered: number;
    bounced: number;
    failed: number;
    bounceRate: number;
    deliveryRate: number;
  }>({
    sent: 0,
    delivered: 0,
    bounced: 0,
    failed: 0,
    bounceRate: 0,
    deliveryRate: 0
  });

  // Simuler les statistiques (à remplacer par les vraies données quand la table sera créée)
  useEffect(() => {
    // Simulons des données pour le moment
    setEmailStats({
      sent: 120,
      delivered: 112,
      bounced: 5,
      failed: 3,
      bounceRate: 4.2,
      deliveryRate: 93.3
    });
  }, []);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTestEmail(e.target.value);
    setValidationResult(null);
    setTestResult(null);
  };

  const handleValidate = async () => {
    // Validation côté client d'abord
    const clientValidation = validateEmail(testEmail);
    
    if (!clientValidation.isValid) {
      setValidationResult({
        isValid: false,
        reason: clientValidation.reason || "Email invalide",
        riskLevel: 'high',
        riskFactors: ["Format invalide"]
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('test-email-delivery', {
        body: {
          email: testEmail,
          mode: 'validate'
        }
      });

      if (error) {
        throw error;
      }

      setValidationResult(data);
    } catch (error: any) {
      console.error('Erreur de validation:', error);
      toast({
        title: "Erreur",
        description: "Impossible de valider cet email. Veuillez réessayer.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestSend = async () => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('test-email-delivery', {
        body: {
          email: testEmail,
          mode: 'test-send'
        }
      });

      if (error) {
        throw error;
      }

      setTestResult(data);
      
      if (data.success) {
        toast({
          title: "Email de test envoyé",
          description: "Un email de test a été envoyé à cette adresse."
        });
      } else {
        toast({
          title: "Échec d'envoi",
          description: data.message || "L'email de test n'a pas pu être envoyé.",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      console.error("Erreur d'envoi de test:", error);
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer l'email de test. Veuillez réessayer.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction pour formater le niveau de risque en texte
  const formatRiskLevel = (level: string) => {
    switch (level) {
      case 'low':
        return { text: 'Risque faible', className: 'text-green-500', icon: <CheckCircle className="w-4 h-4" /> };
      case 'medium':
        return { text: 'Risque modéré', className: 'text-amber-500', icon: <AlertTriangle className="w-4 h-4" /> };
      case 'high':
        return { text: 'Risque élevé', className: 'text-red-500', icon: <AlertCircle className="w-4 h-4" /> };
      default:
        return { text: 'Inconnu', className: 'text-gray-500', icon: null };
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Emails envoyés</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{emailStats.sent}</div>
            <p className="text-xs text-muted-foreground">Total sur 30 jours</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Taux de livraison</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{emailStats.deliveryRate.toFixed(1)}%</div>
            <p className={`text-xs ${emailStats.deliveryRate > 95 ? 'text-green-500' : 'text-amber-500'}`}>
              {emailStats.delivered} emails livrés
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Taux de bounce</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${emailStats.bounceRate > 5 ? 'text-red-500' : 'text-muted-foreground'}`}>
              {emailStats.bounceRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              {emailStats.bounced} emails rejetés
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Emails échoués</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{emailStats.failed}</div>
            <p className="text-xs text-muted-foreground">Erreurs techniques</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Test et validation d'email */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Test et validation d'email
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Validez une adresse email pour vérifier sa probabilité de bounce ou envoyez un email de test.
          </p>
          
          <div className="space-y-2">
            <Label htmlFor="test-email">Adresse email à tester</Label>
            <div className="flex space-x-2">
              <Input 
                id="test-email"
                type="text"
                placeholder="email@exemple.com"
                value={testEmail}
                onChange={handleEmailChange}
                className="flex-1"
                disabled={isLoading}
              />
              <Button 
                onClick={handleValidate} 
                disabled={!testEmail || isLoading}
                variant="outline"
              >
                Valider
              </Button>
              <Button 
                onClick={handleTestSend} 
                disabled={!testEmail || isLoading || (validationResult && !validationResult.isValid)}
              >
                Envoyer test
              </Button>
            </div>
          </div>
          
          {/* Résultat de validation */}
          {validationResult && (
            <div className={`p-4 border rounded-md ${validationResult.isValid ? 'border-green-200 bg-green-50/10' : 'border-red-200 bg-red-50/10'}`}>
              <div className="flex items-center gap-2 mb-2">
                {validationResult.isValid ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-500" />
                )}
                <h3 className="font-medium">
                  {validationResult.isValid ? 'Email valide' : 'Email invalide'}
                </h3>
              </div>
              
              {!validationResult.isValid && validationResult.reason && (
                <p className="text-sm mb-3">{validationResult.reason}</p>
              )}
              
              {validationResult.riskLevel && (
                <div className="flex items-center gap-1.5">
                  <span className="text-sm">Niveau de risque:</span>
                  <span className={`text-sm font-medium flex items-center gap-1 ${formatRiskLevel(validationResult.riskLevel).className}`}>
                    {formatRiskLevel(validationResult.riskLevel).icon}
                    {formatRiskLevel(validationResult.riskLevel).text}
                  </span>
                </div>
              )}
              
              {validationResult.riskFactors && validationResult.riskFactors.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm font-medium mb-1">Facteurs de risque:</p>
                  <ul className="text-sm list-disc pl-5 space-y-1">
                    {validationResult.riskFactors.map((factor: string, index: number) => (
                      <li key={index}>{factor}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
          
          {/* Résultat du test */}
          {testResult && (
            <div className={`p-4 border rounded-md mt-4 ${testResult.success ? 'border-green-200 bg-green-50/10' : 'border-red-200 bg-red-50/10'}`}>
              <div className="flex items-center gap-2 mb-2">
                {testResult.success ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-500" />
                )}
                <h3 className="font-medium">
                  {testResult.success ? 'Email de test envoyé' : 'Échec d\'envoi'}
                </h3>
              </div>
              
              {testResult.id && (
                <p className="text-sm">ID de suivi: {testResult.id}</p>
              )}
              
              {testResult.error && (
                <p className="text-sm text-red-500 mt-1">{testResult.error}</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Conseils pour réduire les bounces */}
      <Card>
        <CardHeader>
          <CardTitle>Conseils pour réduire les bounces</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-500 mt-1" />
              <span>Effectuez une double validation lors de l'inscription (confirmation par email)</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-500 mt-1" />
              <span>Nettoyez régulièrement votre liste d'emails (supprimez les adresses avec des bounces répétés)</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-500 mt-1" />
              <span>Utilisez un formulaire d'inscription avec validation en temps réel</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-500 mt-1" />
              <span>Évitez d'acheter des listes d'emails</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-500 mt-1" />
              <span>Configurez correctement les enregistrements SPF, DKIM et DMARC pour votre domaine</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailMonitoring;
