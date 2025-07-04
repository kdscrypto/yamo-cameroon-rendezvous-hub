
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, Phone, AlertCircle } from 'lucide-react';
import { isPhoneNumberFormat } from '@/utils/phoneUtils';

interface IdentifierFieldProps {
  identifier: string;
  onIdentifierChange: (value: string) => void;
  error: string;
  isLoading: boolean;
}

const IdentifierField = ({ identifier, onIdentifierChange, error, isLoading }: IdentifierFieldProps) => {
  const getIdentifierType = (value: string) => {
    return isPhoneNumberFormat(value.trim()) ? 'phone' : 'email';
  };

  const validateIdentifier = (value: string) => {
    if (!value.trim()) {
      return 'Ce champ est requis';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[\+]?[0-9\s\-\(\)]{8,}$/;
    
    if (!emailRegex.test(value) && !phoneRegex.test(value)) {
      return 'Veuillez saisir un email valide ou un numéro de téléphone';
    }

    return '';
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="identifier" className="text-neutral-200 font-medium flex items-center gap-2">
        {getIdentifierType(identifier) === 'phone' ? (
          <Phone className="w-4 h-4 text-amber-500" />
        ) : (
          <Mail className="w-4 h-4 text-amber-500" />
        )}
        Email ou téléphone
      </Label>
      <Input
        id="identifier"
        type="text"
        placeholder="exemple@email.com ou +33 6 12 34 56 78"
        value={identifier}
        onChange={(e) => onIdentifierChange(e.target.value)}
        required
        disabled={isLoading}
        className={`h-12 bg-neutral-800/80 border-neutral-600 text-white placeholder:text-neutral-500 focus:border-amber-500 focus:ring-amber-500/20 transition-all duration-200 ${
          error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''
        }`}
      />
      {error && (
        <div className="flex items-center gap-2 text-red-400 text-sm">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}
      <div className="text-xs text-neutral-500 mt-1">
        {identifier && getIdentifierType(identifier) === 'phone' ? (
          <span className="text-amber-400">📱 Mode téléphone détecté</span>
        ) : identifier && getIdentifierType(identifier) === 'email' ? (
          <span className="text-blue-400">📧 Mode email détecté</span>
        ) : (
          <span>Saisissez votre email ou numéro de téléphone</span>
        )}
      </div>
    </div>
  );
};

export default IdentifierField;
