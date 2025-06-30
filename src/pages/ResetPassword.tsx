
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { UnifiedPasswordResetForm } from '@/components/auth/UnifiedPasswordResetForm';
import { useSimplePasswordReset } from '@/hooks/useSimplePasswordReset';
import { supabase } from '@/integrations/supabase/client';

const ResetPassword = () => {
  const [hasValidSession, setHasValidSession] = useState<boolean | null>(null);
  const { isLoading, updatePassword } = useSimplePasswordReset();
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      console.log('ResetPassword: Checking for valid session');
      
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error || !session) {
          console.log('ResetPassword: No valid session found, redirecting to forgot password');
          setHasValidSession(false);
          navigate('/forgot-password', {
            state: { error: 'Session expirée. Veuillez demander un nouveau lien de réinitialisation.' }
          });
        } else {
          console.log('ResetPassword: Valid session found');
          setHasValidSession(true);
        }
      } catch (error) {
        console.error('ResetPassword: Error checking session:', error);
        setHasValidSession(false);
        navigate('/forgot-password');
      }
    };

    checkSession();
  }, [navigate]);

  const handleRequestNewLink = () => {
    navigate('/forgot-password');
  };

  // Affichage de chargement pendant la vérification
  if (hasValidSession === null) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <div className="flex-1 flex items-center justify-center px-4 py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Vérification de la session...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Si on arrive ici, c'est qu'on a une session valide
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <UnifiedPasswordResetForm 
          onSubmit={updatePassword}
          onRequestNewLink={handleRequestNewLink}
          isLoading={isLoading}
          isValidLink={true}
          isCheckingLink={false}
        />
      </div>
      
      <Footer />
    </div>
  );
};

export default ResetPassword;
