
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button-enhanced';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card-enhanced';
import { FormFieldEnhanced } from '@/components/ui/form-field-enhanced';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useEffect } from 'react';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Redirect if user is already logged in
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await signIn(email, password);

      if (error) {
        toast({
          title: "Erreur de connexion",
          description: error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Connexion réussie",
          description: "Vous êtes maintenant connecté."
        });
        navigate('/');
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

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <div className="flex-1 flex items-center justify-center container-spacing section-spacing">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 gradient-luxe rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-black font-bold text-2xl">Y</span>
              </div>
            </div>
            <h1 className="heading-md mb-2">Bienvenue sur Yamo</h1>
            <p className="body-md">Connectez-vous pour accéder à votre compte</p>
          </div>

          <Card variant="glass" size="default">
            <CardHeader size="default">
              <CardTitle variant="gradient" size="default">Connexion</CardTitle>
              <CardDescription>
                Entrez vos identifiants pour vous connecter
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-5">
                <FormFieldEnhanced
                  id="email"
                  type="email"
                  label="Adresse email"
                  placeholder="votre@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  inputSize="lg"
                  startIcon={<Mail className="w-4 h-4" />}
                  labelVariant="required"
                />
                
                <FormFieldEnhanced
                  id="password"
                  type={showPassword ? "text" : "password"}
                  label="Mot de passe"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  inputSize="lg"
                  startIcon={<Lock className="w-4 h-4" />}
                  endIcon={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                      disabled={isLoading}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  }
                  labelVariant="required"
                />
                
                <Button 
                  type="submit" 
                  variant="luxury"
                  size="xl"
                  animation="lift"
                  className="w-full font-semibold" 
                  disabled={isLoading}
                  loading={isLoading}
                >
                  Se connecter
                </Button>
              </form>
              
              <div className="space-y-4 pt-4 border-t border-border/50">
                <div className="text-center">
                  <Link 
                    to="/forgot-password" 
                    className="text-sm text-primary hover:text-primary/80 transition-colors font-medium"
                  >
                    Mot de passe oublié ?
                  </Link>
                </div>
                
                <div className="text-center">
                  <span className="text-sm text-muted-foreground">
                    Pas encore de compte ?{' '}
                  </span>
                  <Link 
                    to="/register" 
                    className="text-sm text-primary hover:text-primary/80 transition-colors font-semibold"
                  >
                    Créer un compte
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="text-center mt-6 space-y-2">
            <p className="text-xs text-muted-foreground">
              En vous connectant, vous acceptez nos{' '}
              <Link to="/terms" className="text-primary hover:underline">
                conditions d'utilisation
              </Link>
            </p>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Login;
