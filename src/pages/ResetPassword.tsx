
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const [isValidSession, setIsValidSession] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthTokens = async () => {
      try {
        // Check if we have tokens in the URL fragment
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        const type = hashParams.get('type');

        console.log('URL fragment params:', { 
          accessToken: !!accessToken, 
          refreshToken: !!refreshToken, 
          type 
        });

        if (accessToken && refreshToken && type === 'recovery') {
          console.log('Setting session with recovery tokens...');
          
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });

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
            setIsValidSession(true);
            // Clear the URL hash to clean up the URL
            window.history.replaceState(null, '', window.location.pathname);
          }
        } else {
          // Check if user already has a valid session
          const { data: { session } } = await supabase.auth.getSession();
          if (session) {
            console.log('Valid session found');
            setIsValidSession(true);
          } else {
            console.log('No valid session or recovery tokens found');
            toast({
              title: "Lien invalide",
              description: "Le lien de réinitialisation est invalide ou a expiré.",
              variant: "destructive"
            });
            navigate('/forgot-password');
          }
        }
      } catch (error) {
        console.error('Error handling auth tokens:', error);
        toast({
          title: "Erreur",
          description: "Une erreur s'est produite lors de la vérification du lien.",
          variant: "destructive"
        });
        navigate('/forgot-password');
      }
    };

    handleAuthTokens();
  }, [navigate, toast]);

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
        
        // Sign out the user so they can log in with their new password
        await supabase.auth.signOut();
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

  // Show loading state while we're validating the session
  if (!isValidSession) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <div className="flex-1 flex items-center justify-center px-4 py-12">
          <Card className="w-full max-w-md bg-card border-border">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Vérification du lien de réinitialisation...</p>
              </div>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

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
