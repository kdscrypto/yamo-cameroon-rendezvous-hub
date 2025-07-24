
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { User, Mail, Lock, Eye, EyeOff, Phone, AlertCircle } from 'lucide-react';
import ReferralInput from '@/components/referral/ReferralInput';
import { validateEmail } from '@/utils/emailValidation';

interface RegistrationFormProps {
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

const RegistrationForm = ({ isLoading, setIsLoading }: RegistrationFormProps) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    phone: '',
    referralCode: '',
    acceptTerms: false,
    isAdult: false
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [phoneError, setPhoneError] = useState('');
  const [emailError, setEmailError] = useState('');
  
  const { signUp } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Fonction de validation du numéro de téléphone
  const validatePhoneNumber = (phone: string): boolean => {
    if (!phone.trim()) return true; // Le téléphone est optionnel

    // Formats acceptés : +33123456789, 0123456789, 01 23 45 67 89, +33 1 23 45 67 89
    const phoneRegex = /^(\+33|0)[1-9](\d{8}|\s?\d{2}\s?\d{2}\s?\d{2}\s?\d{2})$/;
    return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
  };

  const handlePhoneChange = (value: string) => {
    setFormData(prev => ({ ...prev, phone: value }));
    
    if (value.trim() && !validatePhoneNumber(value)) {
      setPhoneError('Format invalide. Ex: +33123456789 ou 0123456789');
    } else {
      setPhoneError('');
    }
  };

  const handleEmailChange = (value: string) => {
    setFormData(prev => ({ ...prev, email: value }));
    
    if (value.trim()) {
      const emailValidation = validateEmail(value);
      if (!emailValidation.isValid) {
        setEmailError(emailValidation.reason || 'Adresse email invalide');
      } else {
        setEmailError('');
      }
    } else {
      setEmailError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Erreur",
        description: "Les mots de passe ne correspondent pas.",
        variant: "destructive"
      });
      return;
    }

    if (!formData.acceptTerms || !formData.isAdult) {
      toast({
        title: "Erreur",
        description: "Vous devez accepter les conditions et certifier avoir plus de 18 ans.",
        variant: "destructive"
      });
      return;
    }

    // Validation finale de l'email
    const emailValidation = validateEmail(formData.email);
    if (!emailValidation.isValid) {
      toast({
        title: "Erreur",
        description: emailValidation.reason || "Adresse email invalide.",
        variant: "destructive"
      });
      return;
    }

    // Validation finale du téléphone
    if (formData.phone.trim() && !validatePhoneNumber(formData.phone)) {
      toast({
        title: "Erreur",
        description: "Le format du numéro de téléphone n'est pas valide.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await signUp(
        formData.email, 
        formData.password, 
        formData.fullName, 
        formData.phone.trim() || undefined,
        formData.referralCode.trim() || undefined
      );

      if (error) {
        let errorMessage = "Une erreur s'est produite lors de l'inscription.";
        
        if (error.message.includes('already registered')) {
          errorMessage = "Cette adresse email est déjà utilisée. Essayez de vous connecter.";
        } else if (error.message.includes('déjà utilisé')) {
          errorMessage = "Ce numéro de téléphone est déjà utilisé par un autre compte.";
        } else if (error.message.includes('format')) {
          errorMessage = error.message;
        } else if (error.message) {
          errorMessage = error.message;
        }

        toast({
          title: "Erreur d'inscription",
          description: errorMessage,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Inscription réussie",
          description: "Vérifiez votre email pour confirmer votre compte."
        });
        navigate('/login');
      }
    } catch (error) {
      console.error('Erreur inattendue lors de l\'inscription:', error);
      toast({
        title: "Erreur",
        description: "Une erreur inattendue s'est produite.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    if (field === 'phone') {
      handlePhoneChange(value as string);
    } else if (field === 'email') {
      handleEmailChange(value as string);
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="fullName" className="text-neutral-200 font-medium flex items-center gap-2">
          <User className="w-4 h-4 text-amber-500" />
          Nom complet
        </Label>
        <Input
          id="fullName"
          type="text"
          placeholder="Votre nom complet"
          value={formData.fullName}
          onChange={(e) => handleInputChange('fullName', e.target.value)}
          disabled={isLoading}
          className="h-12 bg-neutral-800/80 border-neutral-600 text-white placeholder:text-neutral-500 focus:border-amber-500 focus:ring-amber-500/20 transition-all duration-200"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email" className="text-neutral-200 font-medium flex items-center gap-2">
          <Mail className="w-4 h-4 text-amber-500" />
          Adresse email
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="votre@email.com"
          value={formData.email}
          onChange={(e) => handleInputChange('email', e.target.value)}
          required
          disabled={isLoading}
          className={`h-12 bg-neutral-800/80 border-neutral-600 text-white placeholder:text-neutral-500 focus:border-amber-500 focus:ring-amber-500/20 transition-all duration-200 ${
            emailError ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''
          }`}
        />
        {emailError && (
          <div className="flex items-center gap-2 text-red-400 text-sm">
            <AlertCircle className="w-4 h-4" />
            {emailError}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone" className="text-neutral-200 font-medium flex items-center gap-2">
          <Phone className="w-4 h-4 text-amber-500" />
          Numéro de téléphone (optionnel)
        </Label>
        <Input
          id="phone"
          type="tel"
          placeholder="+33 6 12 34 56 78 ou 06 12 34 56 78"
          value={formData.phone}
          onChange={(e) => handleInputChange('phone', e.target.value)}
          disabled={isLoading}
          className={`h-12 bg-neutral-800/80 border-neutral-600 text-white placeholder:text-neutral-500 focus:border-amber-500 focus:ring-amber-500/20 transition-all duration-200 ${
            phoneError ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''
          }`}
        />
        {phoneError && (
          <div className="flex items-center gap-2 text-red-400 text-sm">
            <AlertCircle className="w-4 h-4" />
            {phoneError}
          </div>
        )}
        <div className="text-xs text-neutral-500">
          Permet la connexion par téléphone et les notifications par SMS
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="password" className="text-neutral-200 font-medium flex items-center gap-2">
          <Lock className="w-4 h-4 text-amber-500" />
          Mot de passe
        </Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            value={formData.password}
            onChange={(e) => handleInputChange('password', e.target.value)}
            required
            disabled={isLoading}
            className="h-12 bg-neutral-800/80 border-neutral-600 text-white placeholder:text-neutral-500 focus:border-amber-500 focus:ring-amber-500/20 pr-12 transition-all duration-200"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-amber-400 transition-colors"
            disabled={isLoading}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="confirmPassword" className="text-neutral-200 font-medium flex items-center gap-2">
          <Lock className="w-4 h-4 text-amber-500" />
          Confirmer le mot de passe
        </Label>
        <div className="relative">
          <Input
            id="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            placeholder="••••••••"
            value={formData.confirmPassword}
            onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
            required
            disabled={isLoading}
            className="h-12 bg-neutral-800/80 border-neutral-600 text-white placeholder:text-neutral-500 focus:border-amber-500 focus:ring-amber-500/20 pr-12 transition-all duration-200"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-amber-400 transition-colors"
            disabled={isLoading}
          >
            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Code de parrainage */}
      <ReferralInput
        value={formData.referralCode}
        onChange={(value) => handleInputChange('referralCode', value)}
        disabled={isLoading}
      />
      
      <div className="space-y-4 pt-2">
        <div className="flex items-start space-x-3">
          <Checkbox 
            id="isAdult"
            checked={formData.isAdult}
            onCheckedChange={(checked) => handleInputChange('isAdult', checked as boolean)}
            disabled={isLoading}
            className="mt-1 border-neutral-600 data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500"
          />
          <Label htmlFor="isAdult" className="text-sm text-neutral-200 leading-relaxed">
            Je certifie avoir plus de 18 ans et comprendre que cette plateforme est réservée aux adultes
          </Label>
        </div>
        
        <div className="flex items-start space-x-3">
          <Checkbox 
            id="acceptTerms"
            checked={formData.acceptTerms}
            onCheckedChange={(checked) => handleInputChange('acceptTerms', checked as boolean)}
            disabled={isLoading}
            className="mt-1 border-neutral-600 data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500"
          />
          <Label htmlFor="acceptTerms" className="text-sm text-neutral-200 leading-relaxed">
            J'accepte les{' '}
            <Link to="/terms" className="text-amber-400 hover:text-amber-300 transition-colors font-medium hover:underline">
              conditions d'utilisation
            </Link>
            {' '}et la{' '}
            <Link to="/privacy" className="text-amber-400 hover:text-amber-300 transition-colors font-medium hover:underline">
              politique de confidentialité
            </Link>
          </Label>
        </div>
      </div>
      
      <Button 
        type="submit" 
        className="w-full h-14 text-lg font-bold bg-gradient-to-r from-amber-600 via-orange-600 to-red-700 text-white hover:from-amber-700 hover:via-orange-700 hover:to-red-800 shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 border-0 rounded-xl mt-6"
        disabled={!formData.acceptTerms || !formData.isAdult || isLoading || !!phoneError || !!emailError}
      >
        {isLoading ? (
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Création en cours...
          </div>
        ) : (
          <span className="drop-shadow-sm">CRÉER MON COMPTE</span>
        )}
      </Button>
      
      <div className="text-center pt-4 border-t border-neutral-700/50 mt-6">
        <div className="text-sm text-neutral-400">
          Déjà un compte ?{' '}
          <Link to="/login" className="text-amber-400 hover:text-amber-300 transition-colors font-semibold hover:underline">
            Se connecter
          </Link>
        </div>
      </div>
    </form>
  );
};

export default RegistrationForm;
