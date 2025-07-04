
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Eye, EyeOff, Mail, Lock, Phone, AlertCircle } from 'lucide-react';
import LoginTestPanel from './LoginTestPanel';

const LoginForm = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [identifierError, setIdentifierError] = useState('');
  const [showTestPanel, setShowTestPanel] = useState(false);
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

  const handleIdentifierChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setIdentifier(value);
    
    // Clear error when user starts typing
    if (identifierError) {
      setIdentifierError('');
    }
  };

  const getIdentifierType = (value: string) => {
    const phoneRegex = /^[\+]?[0-9\s\-\(\)]{8,}$/;
    return phoneRegex.test(value.trim()) ? 'phone' : 'email';
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
        type: getIdentifierType(identifier.trim())
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
        
        {/* Bouton pour afficher le panneau de test */}
        <button
          onClick={() => setShowTestPanel(!showTestPanel)}
          className="text-xs text-neutral-500 hover:text-amber-400 transition-colors mt-2"
        >
          {showTestPanel ? 'Masquer' : 'Afficher'} le panneau de test
        </button>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <LoginTestPanel showTestPanel={showTestPanel} />

        <form onSubmit={handleSubmit} className="space-y-5">
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
              onChange={handleIdentifierChange}
              required
              disabled={isLoading}
              className={`h-12 bg-neutral-800/80 border-neutral-600 text-white placeholder:text-neutral-500 focus:border-amber-500 focus:ring-amber-500/20 transition-all duration-200 ${
                identifierError ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''
              }`}
            />
            {identifierError && (
              <div className="flex items-center gap-2 text-red-400 text-sm">
                <AlertCircle className="w-4 h-4" />
                {identifierError}
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
          
          <Button 
            type="submit" 
            className="w-full h-14 text-lg font-bold bg-gradient-to-r from-amber-600 via-orange-600 to-red-700 text-white hover:from-amber-700 hover:via-orange-700 hover:to-red-800 shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 border-0 rounded-xl"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Connexion en cours...
              </div>
            ) : (
              <span className="drop-shadow-sm">SE CONNECTER</span>
            )}
          </Button>
        </form>
        
        <div className="space-y-4 pt-4 border-t border-neutral-700/50">
          <div className="text-center">
            <Link 
              to="/forgot-password" 
              className="text-sm text-amber-400 hover:text-amber-300 transition-colors font-medium hover:underline"
            >
              Mot de passe oublié ?
            </Link>
          </div>
          
          <div className="text-center">
            <span className="text-sm text-neutral-400">
              Pas encore de compte ?{' '}
            </span>
            <Link 
              to="/register" 
              className="text-sm text-amber-400 hover:text-amber-300 transition-colors font-semibold hover:underline"
            >
              Créer un compte
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LoginForm;
