
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { validatePasswordResetTokens } from '@/utils/tokenValidation';
import { usePasswordUpdate } from './usePasswordUpdate';

export const usePasswordReset = () => {
  const [isValidSession, setIsValidSession] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { updatePassword, isLoading } = usePasswordUpdate();

  useEffect(() => {
    const handlePasswordReset = async () => {
      try {
        const result = await validatePasswordResetTokens();
        
        if (result.isValid) {
          setIsValidSession(true);
        } else {
          setIsValidSession(false);
          
          const errorMessage = result.error || "Le lien de réinitialisation est invalide ou a expiré.";
          const errorTitle = result.error?.includes('expiré') ? "Lien expiré" : "Lien invalide";
          
          toast({
            title: errorTitle,
            description: errorMessage,
            variant: "destructive"
          });
          
          // Redirect after error
          setTimeout(() => {
            navigate('/forgot-password');
          }, 3000);
        }
      } catch (error: any) {
        console.error('PasswordReset: Unexpected error:', error);
        setIsValidSession(false);
        
        toast({
          title: "Erreur",
          description: "Une erreur inattendue s'est produite.",
          variant: "destructive"
        });
        
        setTimeout(() => {
          navigate('/forgot-password');
        }, 3000);
      } finally {
        setIsCheckingSession(false);
      }
    };

    handlePasswordReset();
  }, [navigate, toast]);

  return {
    isLoading,
    isValidSession,
    isCheckingSession,
    updatePassword
  };
};
