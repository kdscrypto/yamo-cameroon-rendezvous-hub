
import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { Gift, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useReferralOptimization } from '@/hooks/useReferralOptimization';
import { useReferralRateLimit } from '@/hooks/useReferralRateLimit';
import { logger } from '@/utils/environmentUtils';

interface ReferralInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

const ReferralInput = ({ value, onChange, disabled = false }: ReferralInputProps) => {
  const [isValidating, setIsValidating] = useState(false);
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [referrerName, setReferrerName] = useState<string>('');
  
  const { validateReferralCode: optimizedValidate } = useReferralOptimization();
  const { checkRateLimit, isBlocked, getRemainingTime } = useReferralRateLimit({
    maxAttempts: 5,
    windowMs: 60000, // 1 minute
    blockDurationMs: 300000 // 5 minutes
  });

  useEffect(() => {
    // Vérifier si on a un code de parrainage dans l'URL
    const urlParams = new URLSearchParams(window.location.search);
    const refCode = urlParams.get('ref');
    if (refCode && !value) {
      onChange(refCode.toUpperCase());
    }
  }, []);

  useEffect(() => {
    if (value && value.length >= 4) {
      validateReferralCode(value);
    } else {
      setIsValid(null);
      setReferrerName('');
    }
  }, [value]);

  const validateReferralCode = async (code: string) => {
    // Vérifier les limitations de taux
    if (!checkRateLimit('code_validation')) {
      setIsValid(false);
      setReferrerName('');
      return;
    }

    setIsValidating(true);
    
    try {
      const normalizedCode = code.trim().toUpperCase();
      logger.info('Validation optimisée du code de parrainage');
      
      // Utiliser la validation optimisée avec cache
      const result = await optimizedValidate(normalizedCode);
      
      setIsValid(result.isValid);
      setReferrerName(result.referrerName || '');
      
      if (result.error) {
        logger.warn('Erreur validation code:', result.error);
      }
    } catch (error) {
      logger.error('Erreur inattendue lors de la validation:', error);
      setIsValid(false);
      setReferrerName('');
    } finally {
      setIsValidating(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Convertir automatiquement en majuscules et limiter à 8 caractères
    const normalizedValue = e.target.value.toUpperCase().slice(0, 8);
    onChange(normalizedValue);
  };

  const getStatusIcon = () => {
    if (isValidating) {
      return <div className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />;
    }
    if (isValid === true) {
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    }
    if (isValid === false) {
      return <XCircle className="w-4 h-4 text-red-500" />;
    }
    return <Gift className="w-4 h-4 text-amber-500" />;
  };

  const getStatusMessage = () => {
    if (isValidating) {
      return "Vérification...";
    }
    if (isValid === true && referrerName) {
      return `Code valide - Parrain : ${referrerName}`;
    }
    if (isValid === false && value && value.length >= 4) {
      return "Code de parrainage invalide";
    }
    return null;
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="referralCode" className="text-neutral-200 font-medium flex items-center gap-2">
        <Gift className="w-4 h-4 text-amber-500" />
        Code de parrainage (optionnel)
      </Label>
      <div className="relative">
        <Input
          id="referralCode"
          type="text"
          placeholder="Ex: ABC12345"
          value={value}
          onChange={handleInputChange}
          disabled={disabled}
          className={`h-12 bg-neutral-800/80 border-neutral-600 text-white placeholder:text-neutral-500 focus:border-amber-500 focus:ring-amber-500/20 pr-12 transition-all duration-200 ${
            isValid === true ? 'border-green-500 focus:border-green-500 focus:ring-green-500/20' : ''
          } ${
            isValid === false ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''
          }`}
          maxLength={8}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {getStatusIcon()}
        </div>
      </div>
      
      {isBlocked && (
        <Alert className="border-amber-500/50 bg-amber-500/10">
          <Clock className="h-4 w-4" />
          <AlertDescription className="text-amber-400">
            Trop de tentatives de validation. Réessayez dans {Math.ceil(getRemainingTime() / 1000)} secondes.
          </AlertDescription>
        </Alert>
      )}

      {getStatusMessage() && !isBlocked && (
        <div className={`flex items-center gap-2 text-sm ${
          isValid === true ? 'text-green-400' : 
          isValid === false ? 'text-red-400' : 
          'text-neutral-400'
        }`}>
          {getStatusMessage()}
        </div>
      )}
      
      <div className="text-xs text-neutral-500">
        En saisissant un code de parrainage, vous aidez un membre de la communauté
      </div>
    </div>
  );
};

export default ReferralInput;
