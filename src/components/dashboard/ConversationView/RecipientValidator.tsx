
import { supabase } from '@/integrations/supabase/client';

interface RecipientValidationResult {
  isValid: boolean;
  error?: string;
  recipientProfile?: {
    id: string;
    full_name: string | null;
    email: string | null;
  };
}

export const validateRecipient = async (
  recipientId: string,
  senderId: string
): Promise<RecipientValidationResult> => {
  try {
    // Check if recipient exists and get their profile
    const { data: recipientProfile, error: profileError } = await supabase
      .from('profiles')
      .select('id, full_name, email')
      .eq('id', recipientId)
      .single();

    if (profileError || !recipientProfile) {
      return {
        isValid: false,
        error: 'Destinataire non trouvé'
      };
    }

    // Check if sender is trying to message themselves
    if (recipientId === senderId) {
      return {
        isValid: false,
        error: 'Vous ne pouvez pas vous envoyer un message à vous-même'
      };
    }

    // Check if recipient has blocked sender (future enhancement)
    // For now, we'll assume all valid users can be contacted

    // Count active conversations for sender (limit to prevent spam)
    const { count: conversationCount } = await supabase
      .from('conversations')
      .select('*', { count: 'exact', head: true })
      .contains('participants', JSON.stringify([senderId]));

    const MAX_CONVERSATIONS = 50; // Reasonable limit per user
    if (conversationCount && conversationCount >= MAX_CONVERSATIONS) {
      return {
        isValid: false,
        error: 'Limite de conversations atteinte. Veuillez archiver d\'anciennes conversations.'
      };
    }

    return {
      isValid: true,
      recipientProfile
    };
  } catch (error) {
    console.error('Error validating recipient:', error);
    return {
      isValid: false,
      error: 'Erreur lors de la validation du destinataire'
    };
  }
};

export const validateMessageContent = (content: string): { isValid: boolean; error?: string } => {
  const trimmedContent = content.trim();
  
  if (!trimmedContent) {
    return {
      isValid: false,
      error: 'Le message ne peut pas être vide'
    };
  }

  if (trimmedContent.length > 2000) {
    return {
      isValid: false,
      error: 'Le message ne peut pas dépasser 2000 caractères'
    };
  }

  // Basic spam detection (repeated characters)
  const repeatedCharPattern = /(.)\1{10,}/;
  if (repeatedCharPattern.test(trimmedContent)) {
    return {
      isValid: false,
      error: 'Message détecté comme spam (caractères répétés)'
    };
  }

  return { isValid: true };
};
