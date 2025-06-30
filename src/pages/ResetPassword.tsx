
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { UnifiedPasswordResetForm } from '@/components/auth/UnifiedPasswordResetForm';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const ResetPassword = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isReady, setIsReady] = useState(false); // Par défaut, le formulaire n'est pas prêt
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Vérification patiente de la session au chargement de la page
  useEffect(() => {
    const checkSession = async () => {
      console.log('ResetPassword: Vérification patiente de la session');
      
      try {
        // On demande poliment à Supabase s'il y a une session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        console.log('ResetPassword: Résultat de la vérification:', { 
          hasSession: !!session, 
          hasError: !!error 
        });

        if (session) {
          // SUCCÈS ! Une session valide (créée par la page de callback) existe
          console.log('ResetPassword: Session valide trouvée, activation du formulaire');
          setIsReady(true);
        } else {
          // ÉCHEC. Aucune session valide. L'utilisateur est arrivé ici sans passer par un lien valide
          console.log('ResetPassword: Aucune session valide, redirection vers forgot-password');
          toast({ 
            title: "Erreur", 
            description: "Session invalide ou expirée. Veuillez demander un nouveau lien.", 
            variant: "destructive" 
          });
          setTimeout(() => navigate('/forgot-password'), 3000);
        }
      } catch (error) {
        console.error('ResetPassword: Erreur lors de la vérification de session:', error);
        toast({ 
          title: "Erreur", 
          description: "Une erreur est survenue. Veuillez réessayer.", 
          variant: "destructive" 
        });
        setTimeout(() => navigate('/forgot-password'), 3000);
      } finally {
        setIsCheckingSession(false);
      }
    };

    checkSession();
  }, [navigate, toast]);

  // Fonction pour mettre à jour le mot de passe
  const handleUpdatePassword = async (password: string, confirmPassword: string): Promise<boolean> => {
    if (!isReady) return false;
    
    console.log('ResetPassword: Début de la mise à jour du mot de passe');
    
    // Validation côté client
    if (password !== confirmPassword) {
      toast({
        title: "Erreur",
        description: "Les mots de passe ne correspondent pas.",
        variant: "destructive"
      });
      return false;
    }

    if (password.length < 6) {
      toast({
        title: "Erreur",
        description: "Le mot de passe doit contenir au moins 6 caractères.",
        variant: "destructive"
      });
      return false;
    }

    setIsLoading(true);

    try {
      // Vérifier qu'on a toujours une session valide
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.error('ResetPassword: Session perdue pendant la mise à jour');
        toast({
          title: "Erreur",
          description: "Session expirée. Veuillez demander un nouveau lien.",
          variant: "destructive"
        });
        setTimeout(() => navigate('/forgot-password'), 2000);
        return false;
      }

      console.log('ResetPassword: Mise à jour du mot de passe avec Supabase');
      
      // Mettre à jour le mot de passe
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) {
        console.error('ResetPassword: Erreur lors de la mise à jour:', error);
        toast({
          title: "Erreur",
          description: "Impossible de mettre à jour le mot de passe. Veuillez réessayer.",
          variant: "destructive"
        });
        return false;
      }

      console.log('ResetPassword: Mot de passe mis à jour avec succès');
      toast({
        title: "Succès !",
        description: "Votre mot de passe a été mis à jour avec succès."
      });

      // Déconnexion pour sécurité
      await supabase.auth.signOut();
      
      // Redirection vers la page de connexion
      setTimeout(() => {
        navigate('/login');
      }, 2000);

      return true;
      
    } catch (error: any) {
      console.error('ResetPassword: Erreur inattendue:', error);
      toast({
        title: "Erreur",
        description: "Une erreur inattendue s'est produite.",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestNewLink = () => {
    navigate('/forgot-password');
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <UnifiedPasswordResetForm 
          onSubmit={handleUpdatePassword}
          onRequestNewLink={handleRequestNewLink}
          isLoading={isLoading}
          isValidLink={isReady}
          isCheckingLink={isCheckingSession}
        />
      </div>
      
      <Footer />
    </div>
  );
};

export default ResetPassword;
