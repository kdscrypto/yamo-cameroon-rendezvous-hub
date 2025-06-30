
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { usePasswordUpdate } from './usePasswordUpdate';

export const usePasswordReset = () => {
  const [isValidSession, setIsValidSession] = useState(true);
  const [isCheckingSession, setIsCheckingSession] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { updatePassword, isLoading } = usePasswordUpdate();

  // Vérifier la présence de tokens dans l'URL au chargement
  useEffect(() => {
    const checkForTokens = () => {
      const hasHashTokens = window.location.hash.includes('access_token');
      const hasQueryTokens = window.location.search.includes('access_token');
      
      if (!hasHashTokens && !hasQueryTokens) {
        console.log('PasswordReset: No tokens found in URL');
        setIsValidSession(false);
        
        toast({
          title: "Lien manquant",
          description: "Aucun lien de réinitialisation détecté. Redirection vers la demande de nouveau lien...",
          variant: "destructive"
        });
        
        setTimeout(() => {
          navigate('/forgot-password');
        }, 3000);
      } else {
        console.log('PasswordReset: Tokens found in URL, ready for password reset');
        setIsValidSession(true);
      }
    };

    checkForTokens();
  }, [navigate, toast]);

  return {
    isLoading,
    isValidSession,
    isCheckingSession,
    updatePassword
  };
};
