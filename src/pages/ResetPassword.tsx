
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
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const handlePasswordReset = async () => {
      console.log('ResetPassword: Starting password reset validation');
      console.log('ResetPassword: Current URL:', window.location.href);
      
      try {
        // Check URL hash first (most common for Supabase auth)
        const hashFragment = window.location.hash.substring(1);
        console.log('ResetPassword: Hash fragment:', hashFragment);
        
        if (hashFragment) {
          const hashParams = new URLSearchParams(hashFragment);
          const accessToken = hashParams.get('access_token');
          const refreshToken = hashParams.get('refresh_token');
          const type = hashParams.get('type');
          
          console.log('ResetPassword: Hash params:', { 
            hasAccessToken: !!accessToken, 
            hasRefreshToken: !!refreshToken, 
            type 
          });

          if (accessToken && type === 'recovery') {
            console.log('ResetPassword: Setting session with recovery tokens...');
            
            const { data, error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken || ''
            });

            if (error) {
              console.error('ResetPassword: Session error:', error);
              throw new Error(`Erreur de session: ${error.message}`);
            }

            console.log('ResetPassword: Session set successfully:', data);
            setIsValidSession(true);
            setIsCheckingSession(false);
            
            // Clean up the URL
            window.history.replaceState({}, document.title, '/reset-password');
            return;
          }
        }

        // Check query parameters as fallback
        const searchParams = new URLSearchParams(window.location.search);
        const accessToken = searchParams.get('access_token');
        const refreshToken = searchParams.get('refresh_token');
        const type = searchParams.get('type');
        
        console.log('ResetPassword: Query params:', { 
          hasAccessToken: !!accessToken, 
          hasRefreshToken: !!refreshToken, 
          type 
        });

        if (accessToken && type === 'recovery') {
          console.log('ResetPassword: Setting session with recovery tokens from query...');
          
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken || ''
          });

          if (error) {
            console.error('ResetPassword: Session error:', error);
            throw new Error(`Erreur de session: ${error.message}`);
          }

          console.log('ResetPassword: Session set successfully:', data);
          setIsValidSession(true);
          setIsCheckingSession(false);
          
          // Clean up the URL
          window.history.replaceState({}, document.title, '/reset-password');
          return;
        }

        // If no tokens found, this might be an invalid link
        console.log('ResetPassword: No recovery tokens found');
        throw new Error('Aucun token de récupération trouvé dans l\'URL');

      } catch (error) {
        console.error('ResetPassword: Error during validation:', error);
        setIsCheckingSession(false);
        setIsValidSession(false);
        
        toast({
          title: "Lien invalide",
          description: "Le lien de réinitialisation est invalide ou a expiré. Veuillez demander un nouveau lien.",
          variant: "destructive"
        });
        
        // Redirect after a short delay to show the error message
        setTimeout(() => {
          navigate('/forgot-password');
        }, 3000);
      }
    };

    handlePasswordReset();
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
      console.log('ResetPassword: Updating password...');
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) {
        console.error('ResetPassword: Error updating password:', error);
        toast({
          title: "Erreur",
          description: error.message,
          variant: "destructive"
        });
      } else {
        console.log('ResetPassword: Password updated successfully');
        toast({
          title: "Mot de passe modifié",
          description: "Votre mot de passe a été mis à jour avec succès."
        });
        
        // Sign out the user so they can log in with their new password
        await supabase.auth.signOut();
        navigate('/login');
      }
    } catch (error) {
      console.error('ResetPassword: Unexpected error:', error);
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
  if (isCheckingSession) {
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

  if (!isValidSession) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <div className="flex-1 flex items-center justify-center px-4 py-12">
          <Card className="w-full max-w-md bg-card border-border">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-muted-foreground mb-4">
                  Le lien de réinitialisation est invalide ou a expiré.
                </p>
                <p className="text-sm text-muted-foreground">
                  Vous allez être redirigé vers la page de demande de réinitialisation...
                </p>
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
