
import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Gift, CheckCircle, XCircle } from 'lucide-react';

interface ReferralInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

const ReferralInput = ({ value, onChange, disabled = false }: ReferralInputProps) => {
  const [isValidating, setIsValidating] = useState(false);
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [referrerName, setReferrerName] = useState<string>('');

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
    setIsValidating(true);
    
    try {
      // Normaliser le code en majuscules pour la validation
      const normalizedCode = code.trim().toUpperCase();
      
      console.log('Validation du code de parrainage:', normalizedCode);
      
      // Vérifier si le code de parrainage existe et est actif
      const { data: referralData, error } = await supabase
        .from('referral_codes')
        .select(`
          code,
          user_id,
          profiles:user_id (full_name, email)
        `)
        .eq('code', normalizedCode)
        .eq('is_active', true)
        .maybeSingle();

      if (error) {
        console.error('Erreur lors de la validation du code:', error);
        setIsValid(false);
        setReferrerName('');
      } else if (referralData) {
        console.log('Code valide trouvé:', referralData);
        setIsValid(true);
        // Extraire le nom du parrain
        const profile = referralData.profiles as any;
        const name = profile?.full_name || profile?.email?.split('@')[0] || 'Utilisateur';
        setReferrerName(name);
      } else {
        console.log('Aucun code trouvé pour:', normalizedCode);
        setIsValid(false);
        setReferrerName('');
      }
    } catch (error) {
      console.error('Erreur inattendue lors de la validation:', error);
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
      
      {getStatusMessage() && (
        <div className={`flex items-center gap-2 text-sm ${
          isValid === true ? 'text-green-400' : 
          isValid === false ? 'text-red-400' : 
          'text-neutral-400'
        }`}>
          {getStatusMessage()}
        </div>
      )}
      
      {isValid === true && (
        <Badge className="bg-green-100 text-green-800">
          Vous et votre parrain recevrez des points de parrainage !
        </Badge>
      )}
      
      <div className="text-xs text-neutral-500">
        En saisissant un code de parrainage, vous aidez un membre de la communauté
      </div>
    </div>
  );
};

export default ReferralInput;
