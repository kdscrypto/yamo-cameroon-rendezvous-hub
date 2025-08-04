import { useState, useRef, useCallback } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';
import { Label } from '@/components/ui/label';
import { Shield, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface EnhancedReCAPTCHAProps {
  onVerificationChange: (isVerified: boolean, token: string | null) => void;
  onValidationChange?: (validationData: any) => void;
  disabled?: boolean;
  debug?: boolean;
}

interface ValidationResult {
  success: boolean;
  score?: number;
  action?: string;
  challenge_ts?: string;
  hostname?: string;
  errors?: string[];
  test_id?: string;
}

const EnhancedReCAPTCHA = ({ 
  onVerificationChange, 
  onValidationChange, 
  disabled = false,
  debug = false 
}: EnhancedReCAPTCHAProps) => {
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  const { toast } = useToast();

  const handleVerification = useCallback(async (captchaToken: string | null) => {
    setError(null);
    setIsVerifying(true);
    
    if (!captchaToken) {
      setIsVerified(false);
      setToken(null);
      setValidationResult(null);
      onVerificationChange(false, null);
      setIsVerifying(false);
      return;
    }

    setToken(captchaToken);

    try {
      const { data, error: functionError } = await supabase.functions.invoke('verify-captcha', {
        body: { 
          token: captchaToken,
          debug,
          test_id: debug ? `test_${Date.now()}` : undefined
        }
      });

      if (functionError) {
        console.error('Edge Function error:', functionError);
        setError('Erreur de connexion au serveur de vérification');
        setIsVerified(false);
        onVerificationChange(false, null);
        
        if (debug) {
          toast({
            title: "Erreur Debug",
            description: `Erreur Edge Function: ${functionError.message}`,
            variant: "destructive"
          });
        }
        return;
      }

      const result: ValidationResult = data;
      setValidationResult(result);
      
      if (onValidationChange) {
        onValidationChange(result);
      }

      if (result.success) {
        setIsVerified(true);
        setError(null);
        onVerificationChange(true, captchaToken);
        
        if (debug) {
          toast({
            title: "CAPTCHA Vérifié",
            description: `Score: ${result.score || 'N/A'} - Action: ${result.action || 'N/A'}`,
          });
        }
      } else {
        setIsVerified(false);
        setError('Vérification échouée');
        onVerificationChange(false, null);
        
        if (debug && result.errors) {
          toast({
            title: "Échec CAPTCHA",
            description: result.errors.join(', '),
            variant: "destructive"
          });
        }
      }
    } catch (err) {
      console.error('Erreur lors de la vérification CAPTCHA:', err);
      setError('Erreur inattendue lors de la vérification');
      setIsVerified(false);
      onVerificationChange(false, null);
      
      if (debug) {
        toast({
          title: "Erreur CAPTCHA",
          description: err instanceof Error ? err.message : 'Erreur inconnue',
          variant: "destructive"
        });
      }
    } finally {
      setIsVerifying(false);
    }
  }, [onVerificationChange, onValidationChange, debug, toast]);

  const handleReset = useCallback(() => {
    if (recaptchaRef.current) {
      recaptchaRef.current.reset();
    }
    setIsVerified(false);
    setToken(null);
    setValidationResult(null);
    setError(null);
    onVerificationChange(false, null);
  }, [onVerificationChange]);

  const getStatusIcon = () => {
    if (isVerifying) return <RefreshCw className="w-4 h-4 animate-spin text-amber-500" />;
    if (error) return <AlertCircle className="w-4 h-4 text-red-400" />;
    if (isVerified) return <CheckCircle className="w-4 h-4 text-green-400" />;
    return <Shield className="w-4 h-4 text-amber-500" />;
  };

  const getStatusText = () => {
    if (isVerifying) return "Vérification en cours...";
    if (error) return error;
    if (isVerified) return "Vérification réussie";
    return "Vérification de sécurité";
  };

  const getStatusColor = () => {
    if (error) return "text-red-400";
    if (isVerified) return "text-green-400";
    return "text-amber-400";
  };

  return (
    <div className="space-y-3">
      <Label className={`text-sm font-medium flex items-center gap-2 ${getStatusColor()}`}>
        {getStatusIcon()}
        {getStatusText()}
      </Label>
      
      <div className="flex flex-col items-center space-y-3">
        <ReCAPTCHA
          ref={recaptchaRef}
          sitekey="6LdBZ5orAAAAAFz3fXNiRhQXUpTBR81NCcVxh_qH"
          onChange={handleVerification}
          theme="dark"
          size="normal"
        />
        
        {(error || (debug && validationResult)) && (
          <div className="text-center space-y-2">
            {error && (
              <div className="text-red-400 text-sm flex items-center justify-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}
            
            {debug && validationResult && (
              <div className="bg-neutral-800/50 border border-neutral-700 rounded-lg p-3 text-xs">
                <div className="text-neutral-300 space-y-1">
                  <div className="flex justify-between">
                    <span>Succès:</span>
                    <span className={validationResult.success ? "text-green-400" : "text-red-400"}>
                      {validationResult.success ? "Oui" : "Non"}
                    </span>
                  </div>
                  {validationResult.score !== undefined && (
                    <div className="flex justify-between">
                      <span>Score:</span>
                      <span className="text-amber-400">{validationResult.score}</span>
                    </div>
                  )}
                  {validationResult.action && (
                    <div className="flex justify-between">
                      <span>Action:</span>
                      <span className="text-blue-400">{validationResult.action}</span>
                    </div>
                  )}
                  {validationResult.test_id && (
                    <div className="flex justify-between">
                      <span>Test ID:</span>
                      <span className="text-purple-400">{validationResult.test_id}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      
      {(error || debug) && (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={handleReset}
            disabled={disabled || isVerifying}
            className="text-xs text-amber-400 hover:text-amber-300 underline transition-colors"
          >
            Réinitialiser le CAPTCHA
          </button>
        </div>
      )}
    </div>
  );
};

export default EnhancedReCAPTCHA;