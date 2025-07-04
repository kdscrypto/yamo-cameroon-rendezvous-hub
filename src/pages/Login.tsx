
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
  const [identifier, setIdentifier] = useState('');
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
      const { error } = await signIn(identifier, password);

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
          {/* Design moderne avec moins de jaune */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-600 via-orange-600 to-red-700 rounded-2xl flex items-center justify-center shadow-2xl border border-amber-500/20">
                <span className="text-white font-bold text-2xl drop-shadow-lg">Y</span>
              </div>
            </div>
            <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-amber-400 via-orange-500 to-red-600 bg-clip-text text-transparent">
              Bienvenue sur Yamo
            </h1>
            <p className="text-neutral-300 text-lg">Connectez-vous pour accéder à votre compte</p>
          </div>

          <Card className="bg-neutral-800/50 backdrop-blur-xl border border-neutral-700/50 shadow-2xl">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-2xl font-bold text-white">Connexion</CardTitle>
              <CardDescription className="text-neutral-400 text-base">
                Entrez votre email ou numéro de téléphone
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="identifier" className="text-neutral-200 font-medium flex items-center gap-2">
                    <Mail className="w-4 h-4 text-amber-500" />
                    Email ou téléphone
                  </Label>
                  <Input
                    id="identifier"
                    type="text"
                    placeholder="votre@email.com ou +33 6 12 34 56 78"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    required
                    disabled={isLoading}
                    className="h-12 bg-neutral-800/80 border-neutral-600 text-white placeholder:text-neutral-500 focus:border-amber-500 focus:ring-amber-500/20 transition-all duration-200"
                  />
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
          
          {/* Trust indicators avec design moderne */}
          <div className="text-center mt-6 space-y-2">
            <p className="text-xs text-neutral-500">
              En vous connectant, vous acceptez nos{' '}
              <Link to="/terms" className="text-amber-400 hover:text-amber-300 hover:underline transition-colors">
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
