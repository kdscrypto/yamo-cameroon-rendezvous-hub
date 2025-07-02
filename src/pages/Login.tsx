
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
          {/* Enhanced visual hierarchy and spacing */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 gradient-gold rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-black font-bold text-2xl">Y</span>
              </div>
            </div>
            <h1 className="heading-md mb-2">Bienvenue sur Yamo</h1>
            <p className="body-md">Connectez-vous pour accéder à votre compte</p>
          </div>

          <Card className="card-elevated bg-card/95 backdrop-blur-sm border-border/50">
            <CardHeader className="text-center pb-6">
              <CardTitle className="heading-sm">Connexion</CardTitle>
              <CardDescription className="body-sm">
                Entrez vos identifiants pour vous connecter
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="form-label flex items-center gap-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    Adresse email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="votre@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                    className="form-input h-12"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password" className="form-label flex items-center gap-2">
                    <Lock className="w-4 h-4 text-muted-foreground" />
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
                      className="form-input h-12 pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      disabled={isLoading}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full h-12 btn-primary gradient-gold text-black hover:opacity-90 font-semibold shadow-md" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                      Connexion...
                    </div>
                  ) : (
                    'Se connecter'
                  )}
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
          
          {/* Additional trust indicators */}
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
