
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Handle the authentication tokens from URL fragment or search params
    const handleAuthTokens = () => {
      // Check URL fragment first (this is where Supabase usually puts the tokens)
      const fragment = window.location.hash.substring(1);
      const params = new URLSearchParams(fragment);
      
      let accessToken = params.get('access_token');
      let refreshToken = params.get('refresh_token');
      
      // If not in fragment, check search params
      if (!accessToken) {
        accessToken = searchParams.get('access_token');
        refreshToken = searchParams.get('refresh_token');
      }
      
      console.log('Auth tokens found:', { accessToken: !!accessToken, refreshToken: !!refreshToken });
      
      if (accessToken && refreshToken) {
        // Set the session with the tokens
        console.log('Setting session with tokens...');
        supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken
        }).then(({ data, error }) => {
          if (error) {
            console.error('Error setting session:', error);
            toast({
              title: "Erreur",
              description: "Le lien de réinitialisation est invalide ou a expiré.",
              variant: "destructive"
            });
            navigate('/forgot-password');
          } else {
            console.log('Session set successfully:', data);
          }
        });
      } else {
        console.log('No auth tokens found, redirecting to forgot-password');
        toast({
          title: "Lien invalide",
          description: "Le lien de réinitialisation est invalide ou a expiré.",
          variant: "destructive"
        });
        navigate('/forgot-password');
      }
    };

    handleAuthTokens();
  }, [searchParams, navigate, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({
        title: "Erreur",
        description: "Les mots de passe ne correspondent pas.",
        variant: "destructive"
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Erreur",
        description: "Le mot de passe doit contenir au moins 6 caractères.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      console.log('Updating password...');
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) {
        console.error('Error updating password:', error);
        toast({
          title: "Erreur",
          description: error.message,
          variant: "destructive"
        });
      } else {
        console.log('Password updated successfully');
        toast({
          title: "Mot de passe modifié",
          description: "Votre mot de passe a été mis à jour avec succès."
        });
        navigate('/login');
      }
    } catch (error) {
      console.error('Unexpected error:', error);
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
      
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md bg-card border-border">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 gradient-gold rounded-lg flex items-center justify-center">
                <span className="text-black font-bold text-xl">Y</span>
              </div>
            </div>
            <CardTitle className="text-2xl text-foreground">Nouveau mot de passe</CardTitle>
            <CardDescription className="text-muted-foreground">
              Choisissez un nouveau mot de passe sécurisé
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground">Nouveau mot de passe</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="bg-background border-border focus:ring-2 focus:ring-primary focus:border-transparent"
                  minLength={6}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-foreground">Confirmer le mot de passe</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="bg-background border-border focus:ring-2 focus:ring-primary focus:border-transparent"
                  minLength={6}
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full gradient-gold text-black hover:opacity-90"
                disabled={isLoading || !password || !confirmPassword}
              >
                {isLoading ? 'Mise à jour...' : 'Mettre à jour le mot de passe'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
      
      <Footer />
    </div>
  );
};

export default ResetPassword;
