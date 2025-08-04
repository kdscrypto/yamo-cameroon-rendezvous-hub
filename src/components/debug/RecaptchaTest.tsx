import { useState } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const RecaptchaTest = () => {
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{
    success: boolean;
    message: string;
    details?: any;
  } | null>(null);
  const { toast } = useToast();

  const handleCaptchaChange = (token: string | null) => {
    setCaptchaToken(token);
    setVerificationResult(null);
  };

  const testCaptchaVerification = async () => {
    if (!captchaToken) {
      toast({
        title: "Erreur",
        description: "Veuillez d'abord compléter le reCAPTCHA",
        variant: "destructive"
      });
      return;
    }

    setIsVerifying(true);
    
    try {
      console.log('Testing captcha verification with token:', captchaToken.substring(0, 20) + '...');
      
      const { data, error } = await supabase.functions.invoke('verify-captcha', {
        body: { token: captchaToken }
      });

      console.log('Captcha verification response:', { data, error });

      if (error) {
        setVerificationResult({
          success: false,
          message: `Erreur Edge Function: ${error.message}`,
          details: error
        });
      } else if (data?.success) {
        setVerificationResult({
          success: true,
          message: "✅ Vérification reCAPTCHA réussie !",
          details: data
        });
      } else {
        setVerificationResult({
          success: false,
          message: "❌ Échec de la vérification reCAPTCHA",
          details: data
        });
      }
    } catch (err: any) {
      console.error('Captcha test error:', err);
      setVerificationResult({
        success: false,
        message: `Erreur de test: ${err.message}`,
        details: err
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const resetTest = () => {
    setCaptchaToken(null);
    setVerificationResult(null);
  };

  return (
    <Card className="w-full max-w-md mx-auto bg-neutral-800/50 backdrop-blur-xl border border-neutral-700/50">
      <CardHeader>
        <CardTitle className="text-center text-white flex items-center justify-center gap-2">
          <Shield className="w-5 h-5 text-amber-500" />
          Test reCAPTCHA Système
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Configuration Status */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-neutral-300">État de la configuration :</h3>
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-neutral-400">Site Key (Production)</span>
              <Badge variant="outline" className="text-green-400 border-green-400">
                <CheckCircle className="w-3 h-3 mr-1" />
                Configuré
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-neutral-400">Edge Function</span>
              <Badge variant="outline" className="text-green-400 border-green-400">
                <CheckCircle className="w-3 h-3 mr-1" />
                Déployé
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-neutral-400">Secret Key</span>
              <Badge variant="outline" className="text-green-400 border-green-400">
                <CheckCircle className="w-3 h-3 mr-1" />
                Configuré
              </Badge>
            </div>
          </div>
        </div>

        {/* reCAPTCHA Widget */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-neutral-300">Widget reCAPTCHA :</h3>
          <div className="flex justify-center">
            <ReCAPTCHA
              sitekey="6LdBZ5orAAAAAFz3fXNiRhQXUpTBR81NCcVxh_qH"
              onChange={handleCaptchaChange}
              theme="dark"
            />
          </div>
          {captchaToken && (
            <div className="text-xs text-green-400 text-center">
              ✓ Token reCAPTCHA obtenu
            </div>
          )}
        </div>

        {/* Test Button */}
        <Button 
          onClick={testCaptchaVerification}
          disabled={!captchaToken || isVerifying}
          className="w-full"
          variant={captchaToken ? "default" : "secondary"}
        >
          {isVerifying ? (
            <>
              <AlertTriangle className="w-4 h-4 mr-2 animate-spin" />
              Test en cours...
            </>
          ) : (
            <>
              <Shield className="w-4 h-4 mr-2" />
              Tester la vérification
            </>
          )}
        </Button>

        {/* Results */}
        {verificationResult && (
          <div className={`p-3 rounded-lg border ${
            verificationResult.success 
              ? 'bg-green-900/20 border-green-700 text-green-300' 
              : 'bg-red-900/20 border-red-700 text-red-300'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              {verificationResult.success ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <XCircle className="w-4 h-4" />
              )}
              <span className="text-sm font-medium">
                {verificationResult.success ? 'Succès' : 'Échec'}
              </span>
            </div>
            <p className="text-xs">{verificationResult.message}</p>
            {verificationResult.details && (
              <details className="mt-2">
                <summary className="text-xs cursor-pointer opacity-70">Détails techniques</summary>
                <pre className="text-xs mt-1 opacity-70 overflow-auto">
                  {JSON.stringify(verificationResult.details, null, 2)}
                </pre>
              </details>
            )}
          </div>
        )}

        {/* Reset Button */}
        {captchaToken && (
          <Button 
            onClick={resetTest}
            variant="outline"
            size="sm"
            className="w-full"
          >
            Réinitialiser le test
          </Button>
        )}

        {/* System Information */}
        <div className="text-xs text-neutral-500 space-y-1">
          <div>🔑 Site Key: 6LdBZ5orAAAAAFz3fXNiRhQXUpTBR81NCcVxh_qH</div>
          <div>🛡️ Theme: Dark</div>
          <div>🚀 Edge Function: verify-captcha</div>
          <div>📍 Environnement: Production</div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RecaptchaTest;