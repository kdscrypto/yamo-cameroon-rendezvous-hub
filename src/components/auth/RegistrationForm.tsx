
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import FormField from './FormField';
import AgreementCheckboxes from './AgreementCheckboxes';

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
    acceptTerms: false,
    isAdult: false
  });
  
  const { signUp } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

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

    setIsLoading(true);

    try {
      const { error } = await signUp(formData.email, formData.password, formData.fullName);

      if (error) {
        if (error.message.includes('already registered')) {
          toast({
            title: "Compte existant",
            description: "Cette adresse email est déjà utilisée. Essayez de vous connecter.",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Erreur d'inscription",
            description: error.message,
            variant: "destructive"
          });
        }
      } else {
        toast({
          title: "Inscription réussie",
          description: "Vérifiez votre email pour confirmer votre compte."
        });
        navigate('/login');
      }
    } catch (error) {
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
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormField
        id="fullName"
        label="Nom complet"
        type="text"
        placeholder="Votre nom complet"
        value={formData.fullName}
        onChange={(value) => handleInputChange('fullName', value)}
        disabled={isLoading}
      />

      <FormField
        id="email"
        label="Email"
        type="email"
        placeholder="votre@email.com"
        value={formData.email}
        onChange={(value) => handleInputChange('email', value)}
        disabled={isLoading}
        required
      />
      
      <FormField
        id="password"
        label="Mot de passe"
        type="password"
        placeholder="••••••••"
        value={formData.password}
        onChange={(value) => handleInputChange('password', value)}
        disabled={isLoading}
        required
      />
      
      <FormField
        id="confirmPassword"
        label="Confirmer le mot de passe"
        type="password"
        placeholder="••••••••"
        value={formData.confirmPassword}
        onChange={(value) => handleInputChange('confirmPassword', value)}
        disabled={isLoading}
        required
      />
      
      <AgreementCheckboxes
        isAdult={formData.isAdult}
        acceptTerms={formData.acceptTerms}
        onIsAdultChange={(checked) => handleInputChange('isAdult', checked)}
        onAcceptTermsChange={(checked) => handleInputChange('acceptTerms', checked)}
        disabled={isLoading}
      />
      
      <Button 
        type="submit" 
        className="w-full gradient-gold text-black hover:opacity-90"
        disabled={!formData.acceptTerms || !formData.isAdult || isLoading}
      >
        {isLoading ? 'Inscription...' : "S'inscrire"}
      </Button>
      
      <div className="mt-6 text-center">
        <div className="text-sm text-muted-foreground">
          Déjà un compte ?{' '}
          <Link to="/login" className="text-primary hover:underline">
            Se connecter
          </Link>
        </div>
      </div>
    </form>
  );
};

export default RegistrationForm;
