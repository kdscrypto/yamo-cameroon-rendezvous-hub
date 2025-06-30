
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { usePasswordUpdate } from './usePasswordUpdate';

export const usePasswordReset = () => {
  const [isValidSession, setIsValidSession] = useState(true); // Commencer par true pour permettre l'essai
  const [isCheckingSession, setIsCheckingSession] = useState(false); // Plus de vérification automatique
  const { toast } = useToast();
  const navigate = useNavigate();
  const { updatePassword, isLoading } = usePasswordUpdate();

  // Supprimer la validation automatique au chargement
  // L'utilisateur peut maintenant essayer de définir son mot de passe
  // Si les tokens sont invalides, l'erreur sera gérée lors de la tentative de mise à jour

  return {
    isLoading,
    isValidSession,
    isCheckingSession,
    updatePassword
  };
};
