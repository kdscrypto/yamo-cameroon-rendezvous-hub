
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { isPhoneNumberFormat } from '@/utils/phoneUtils';
import IdentifierField from './IdentifierField';
import PasswordField from './PasswordField';
import LoginSubmitButton from './LoginSubmitButton';
import LoginFormLinks from './LoginFormLinks';

const LoginForm = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [identifierError, setIdentifierError] = useState('');
  const { signIn } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Validate identifier format
  const validateIdentifier = (value: string) => {
    if (!value.trim()) {
      setIdentifierError('Ce champ est requis');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[\+]?[0-9\s\-\(\)]{8,}$/;
    
    if (!emailRegex.test(value) && !phoneRegex.test(value)) {
      setIdentifierError('Veuillez saisir un email valide ou un numéro de téléphone');
      return false;
    }

    setIdentifierError('');
    return true;
  };

  const handleIdentifierChange = (value: string) => {
    setIdentifier(value);
    
    // Clear error when user starts typing
    if (identifierError) {
      setIdentifierError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateIdentifier(identifier)) {
      return;
    }

    if (!password.trim()) {
      toast({
        title: "Erreur",
        description: "Le mot de passe est requis.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      console.log('Attempting login with:', { 
        identifier: identifier.trim(), 
        type: isPhoneNumberFormat(identifier.trim()) ? 'phone' : 'email'
      });

      const { error } = await signIn(identifier.trim(), password);

      if (error) {
        console.error('Login error:', error);
        
        // Provide specific error messages based on error type
        let errorMessage = "Une erreur s'est produite lors de la connexion.";
        
        if (error.message.includes('Invalid login credentials')) {
          errorMessage = "Email/téléphone ou mot de passe incorrect.";
        } else if (error.message.includes('Email not confirmed')) {
          errorMessage = "Veuillez confirmer votre email avant de vous connecter.";
        } else if (error.message.includes('Aucun compte trouvé')) {
          errorMessage = "Aucun compte n'est associé à ce numéro de téléphone.";
        } else if (error.message) {
          errorMessage = error.message;
        }

        toast({
          title: "Erreur de connexion",
          description: errorMessage,
          variant: "destructive"
        });
      } else {
        console.log('Login successful');
        toast({
          title: "Connexion réussie",
          description: "Vous êtes maintenant connecté."
        });
        navigate('/');
      }
    } catch (error) {
      console.error('Unexpected login error:', error);
      toast({
        title: "Erreur",
        description: "Une erreur inattendue s'est produite.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="bg-neutral-800/50 backdrop-blur-xl border border-neutral-700/50 shadow-2xl">
      <CardHeader className="text-center pb-6">
        <CardTitle className="text-2xl font-bold text-white">Connexion</CardTitle>
        <CardDescription className="text-neutral-400 text-base">
          Utilisez votre email ou votre numéro de téléphone
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <IdentifierField
            identifier={identifier}
            onIdentifierChange={handleIdentifierChange}
            error={identifierError}
            isLoading={isLoading}
          />
          
          <PasswordField
            password={password}
            onPasswordChange={setPassword}
            isLoading={isLoading}
          />
          
          <LoginSubmitButton isLoading={isLoading} />
        </form>
        
        <LoginFormLinks />
      </CardContent>
    </Card>
  );
};

export default LoginForm;
