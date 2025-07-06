
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const useWaitlistForm = () => {
  const [email, setEmail] = useState('');
  const [pseudonym, setPseudonym] = useState('');
  const [gender, setGender] = useState('');
  const [telegramUsername, setTelegramUsername] = useState('');
  const [city, setCity] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();

  const validateForm = () => {
    if (!pseudonym) {
      toast({
        title: "Pseudonyme requis",
        description: "Veuillez saisir votre pseudonyme.",
        variant: "destructive"
      });
      return false;
    }

    if (!gender) {
      toast({
        title: "Genre requis",
        description: "Veuillez sélectionner votre genre.",
        variant: "destructive"
      });
      return false;
    }

    if (!telegramUsername) {
      toast({
        title: "Nom d'utilisateur Telegram requis",
        description: "Veuillez saisir votre nom d'utilisateur Telegram.",
        variant: "destructive"
      });
      return false;
    }

    if (!city) {
      toast({
        title: "Ville requise",
        description: "Veuillez saisir votre ville.",
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  const resetForm = () => {
    setEmail('');
    setPseudonym('');
    setGender('');
    setTelegramUsername('');
    setCity('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('event_waitlist')
        .insert([
          {
            email: email.trim().toLowerCase() || null,
            pseudonym: pseudonym.trim(),
            gender: gender,
            telegram_username: telegramUsername.trim(),
            city: city.trim()
          }
        ]);

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          toast({
            title: "Déjà inscrit",
            description: "Cette adresse email est déjà inscrite à la liste d'attente.",
            variant: "destructive"
          });
        } else {
          throw error;
        }
      } else {
        setIsSuccess(true);
        toast({
          title: "Inscription réussie !",
          description: "Vous avez été ajouté à notre liste d'attente. Nous vous contacterons dès que les événements seront disponibles."
        });
        
        resetForm();
      }
    } catch (error) {
      console.error('Erreur lors de l\'inscription:', error);
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de votre inscription. Veuillez réessayer.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    email,
    setEmail,
    pseudonym,
    setPseudonym,
    gender,
    setGender,
    telegramUsername,
    setTelegramUsername,
    city,
    setCity,
    isSubmitting,
    isSuccess,
    setIsSuccess,
    handleSubmit
  };
};
