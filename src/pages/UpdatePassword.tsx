
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const UpdatePassword = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isValidSession, setIsValidSession] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleAuthTokens = async () => {
      console.log('UpdatePassword: Starting token handling');
      console.log('UpdatePassword: Current URL:', window.location.href);
      console.log('UpdatePassword: Location pathname:', location.pathname);
      console.log('UpdatePassword: Location hash:', window.location.hash);
      console.log('UpdatePassword: Location search:', location.search);

      try {
        // Check for tokens in URL search params (query parameters)
        const searchParams = new URLSearchParams(location.search);
        const searchAccessToken = searchParams.get('access_token');
        const searchRefreshToken = searchParams.get('refresh_token');
        const searchType = searchParams.get('type');

        console.log('UpdatePassword: Search params found:', { 
          hasAccessToken: !!searchAccessToken, 
          hasRefreshToken: !!searchRefreshToken, 
          type: searchType 
        });

        // Also check hash params as backup
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const hashAccessToken = hashParams.get('access_token');
        const hashRefreshToken = hashParams.get('refresh_token');
        const hashType = hashParams.get('type');

        console.log('UpdatePassword: Hash params found:', { 
          hasAccessToken: !!hashAccessToken, 
          hasRefreshToken: !!hashRefreshToken, 
          type: hashType 
        });

        // Prioritize search params over hash params
        const finalAccessToken = searchAccessToken || hashAccessToken;
        const finalRefreshToken = searchRefreshToken || hashRefreshToken;
        const finalType = searchType || hashType;

        if (finalAccessToken && finalType === 'recovery') {
          console.log('UpdatePassword: Setting session with recovery tokens...');
          
          // For password recovery, we might not always have a refresh token
          const sessionData = finalRefreshToken 
            ? { access_token: finalAccessToken, refresh_token: finalRefreshToken }
            : { access_token: finalAccessToken, refresh_token: '' };
          
          const { data, error } = await supabase.auth.setSession(sessionData);

          if (error) {
            console.error('UpdatePassword: Error setting session:', error);
            toast({
              title: "Erreur",
              description: "Le lien de réinitialisation est invalide ou a expiré.",
              variant: "destructive"
            });
            navigate('/forgot-password');
          } else {
            console.log('UpdatePassword: Session set successfully:', data);
            setIsValidSession(true);
            // Clear the URL params to clean up the URL
            window.history.replaceState(null, '', window.location.pathname);
          }
        } else {
          console.log('UpdatePassword: No recovery tokens found, checking existing session...');
          
          // Check if user already has a valid session
          const { data: { session }, error: sessionError } = await supabase.auth.getSession();
          
          if (sessionError) {
            console.error('UpdatePassword: Error getting session:', sessionError);
          }
          
          if (session) {
            console.log('UpdatePassword: Valid existing session found');
            setIsValidSession(true);
          } else {
            console.log('UpdatePassword: No valid session found, redirecting to forgot password');
            toast({
              title: "Lien invalide",
              description: "Le lien de réinitialisation est invalide ou a expiré. Veuillez demander un nouveau lien.",
              variant: "destructive"
            });
            navigate('/forgot-password');
          }
        }
      } catch (error) {
        console.error('UpdatePassword: Error handling auth tokens:', error);
        toast({
          title: "Erreur",
          description: "Une erreur s'est produite lors de la vérification du lien.",
          variant: "destructive"
        });
        navigate('/forgot-password');
      } finally {
        setIsCheckingSession(false);
      }
    };

    handleAuthTokens();
  }, [navigate, toast, location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!newPassword || !confirmPassword) {
      toast({
        title: "Erreur",
        description: "Les mots de passe ne correspondent pas ou sont vides. Veuillez réessayer.",
        variant: "destructive"
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Erreur",
        description: "Les mots de passe ne correspondent pas ou sont vides. Veuillez réessayer.",
        variant: "destructive"
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Erreur",
        description: "Le mot de passe doit contenir au moins 6 caractères.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      console.log('UpdatePassword: Updating password...');
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        console.error('UpdatePassword: Error updating password:', error);
        toast({
          title: "Erreur",
          description: error.message,
          variant: "destructive"
        });
      } else {
        console.log('UpdatePassword: Password updated successfully');
        toast({
          title: "Succès",
          description: "Votre mot de passe a été mis à jour. Vous allez être redirigé."
        });
        
        // Sign out the user so they can log in with their new password
        await supabase.auth.signOut();
        navigate('/login');
      }
    } catch (error) {
      console.error('UpdatePassword: Unexpected error:', error);
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
                <p className="text-muted-foreground mb-4">Redirection vers la page de demande de réinitialisation...</p>
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
                <Label htmlFor="newPassword" className="text-foreground">Entrez votre nouveau mot de passe</Label>
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="Entrez votre nouveau mot de passe"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="bg-background border-border focus:ring-2 focus:ring-primary focus:border-transparent"
                  minLength={6}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-foreground">Confirmez le nouveau mot de passe</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirmez le nouveau mot de passe"
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
                disabled={isLoading || !newPassword || !confirmPassword}
              >
                {isLoading ? 'Enregistrement...' : 'Enregistrer le nouveau mot de passe'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
      
      <Footer />
    </div>
  );
};

export default UpdatePassword;
