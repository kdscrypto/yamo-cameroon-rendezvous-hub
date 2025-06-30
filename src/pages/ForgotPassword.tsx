import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { ArrowLeft } from 'lucide-react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // CORRECTION CRITIQUE: Utiliser la bonne URL de redirection
      const redirectUrl = `${window.location.origin}/reset-password`;
      
      console.log('ForgotPassword: Envoi de l\'email de réinitialisation pour:', email);
      console.log('ForgotPassword: URL de redirection:', redirectUrl);
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl
      });

      if (error) {
        console.error('ForgotPassword: Erreur lors de l\'envoi de l\'email:', error);
        
        let errorMessage = error.message;
        if (error.message.includes('email not found') || error.message.includes('user not found')) {
          errorMessage = "Aucun compte associé à cette adresse email n'a été trouvé.";
        } else if (error.message.includes('rate limit')) {
          errorMessage = "Trop de tentatives. Veuillez attendre avant de réessayer.";
        }
        
        toast({
          title: "Erreur",
          description: errorMessage,
          variant: "destructive"
        });
      } else {
        console.log('ForgotPassword: Email de réinitialisation envoyé avec succès');
        setIsEmailSent(true);
        toast({
          title: "Email envoyé",
          description: "Vérifiez votre boîte email pour réinitialiser votre mot de passe."
        });
      }
    } catch (error: any) {
      console.error('ForgotPassword: Erreur lors de l\'envoi de l\'email:', error);
      toast({
        title: "Erreur",
        description: "Une erreur inattendue s'est produite. Veuillez réessayer.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendEmail = async () => {
    setIsEmailSent(false);
    setEmail('');
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
            <CardTitle className="text-2xl text-foreground">
              {isEmailSent ? 'Email envoyé' : 'Mot de passe oublié'}
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              {isEmailSent 
                ? 'Nous avons envoyé un lien de réinitialisation à votre adresse email'
                : 'Entrez votre adresse email pour recevoir un lien de réinitialisation'
              }
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {!isEmailSent ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-foreground">Adresse email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="votre@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                    className="bg-background border-border focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full gradient-gold text-black hover:opacity-90" 
                  disabled={isLoading || !email.trim()}
                >
                  {isLoading ? 'Envoi en cours...' : 'Envoyer le lien de réinitialisation'}
                </Button>
              </form>
            ) : (
              <div className="text-center space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">
                    📧 Un email a été envoyé à <strong>{email}</strong>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Cliquez sur le lien dans l'email pour réinitialiser votre mot de passe.
                  </p>
                </div>
                
                <p className="text-xs text-muted-foreground">
                  Si vous ne recevez pas l'email dans les prochaines minutes, vérifiez votre dossier spam.
                </p>
                
                <Button 
                  onClick={handleResendEmail}
                  variant="outline"
                  className="w-full"
                >
                  Renvoyer l'email
                </Button>
              </div>
            )}
            
            <div className="mt-6 text-center">
              <Link 
                to="/login" 
                className="inline-flex items-center text-sm text-primary hover:underline"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Retour à la connexion
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Footer />
    </div>
  );
};

export default ForgotPassword;
