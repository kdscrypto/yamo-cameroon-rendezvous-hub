
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Mail, User, CheckCircle, MessageCircle, MapPin, Users } from 'lucide-react';

const EventsWaitlistForm = () => {
  const [email, setEmail] = useState('');
  const [pseudonym, setPseudonym] = useState('');
  const [gender, setGender] = useState('');
  const [telegramUsername, setTelegramUsername] = useState('');
  const [city, setCity] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation pour les champs obligatoires
    if (!pseudonym) {
      toast({
        title: "Pseudonyme requis",
        description: "Veuillez saisir votre pseudonyme.",
        variant: "destructive"
      });
      return;
    }

    if (!gender) {
      toast({
        title: "Genre requis",
        description: "Veuillez sélectionner votre genre.",
        variant: "destructive"
      });
      return;
    }

    if (!telegramUsername) {
      toast({
        title: "Nom d'utilisateur Telegram requis",
        description: "Veuillez saisir votre nom d'utilisateur Telegram.",
        variant: "destructive"
      });
      return;
    }

    if (!city) {
      toast({
        title: "Ville requise",
        description: "Veuillez saisir votre ville.",
        variant: "destructive"
      });
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
        
        // Reset form
        setEmail('');
        setPseudonym('');
        setGender('');
        setTelegramUsername('');
        setCity('');
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

  if (isSuccess) {
    return (
      <div className="text-center py-8">
        <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
        <h3 className="text-2xl font-bold mb-4 text-yellow-400">Inscription confirmée !</h3>
        <p className="text-white mb-6">
          Merci de votre intérêt ! Nous vous contacterons dès que nos événements spéciaux seront disponibles.
        </p>
        <Button 
          onClick={() => setIsSuccess(false)}
          variant="outline"
          className="border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black"
        >
          Inscrire une autre personne
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="mb-6">
        <h3 className="text-2xl font-bold mb-2 text-yellow-400">Rejoignez notre liste d'attente</h3>
        <p className="text-white">
          Soyez parmi les premiers informés du lancement de nos événements exclusifs
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="pseudonym" className="flex items-center gap-2 mb-2 text-white">
            <User className="w-4 h-4" />
            Pseudonyme *
          </Label>
          <Input
            id="pseudonym"
            type="text"
            value={pseudonym}
            onChange={(e) => setPseudonym(e.target.value)}
            placeholder="Votre pseudonyme"
            required
            className="w-full bg-black/50 border-yellow-400/30 text-white placeholder:text-gray-400 focus:border-yellow-400"
          />
        </div>

        <div>
          <Label htmlFor="email" className="flex items-center gap-2 mb-2 text-white">
            <Mail className="w-4 h-4" />
            Adresse email (optionnel)
          </Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="votre@email.com"
            className="w-full bg-black/50 border-yellow-400/30 text-white placeholder:text-gray-400 focus:border-yellow-400"
          />
        </div>

        <div>
          <Label htmlFor="gender" className="flex items-center gap-2 mb-2 text-white">
            <Users className="w-4 h-4" />
            Genre *
          </Label>
          <Select value={gender} onValueChange={setGender} required>
            <SelectTrigger className="w-full bg-black/50 border-yellow-400/30 text-white focus:border-yellow-400">
              <SelectValue placeholder="Sélectionnez votre genre" />
            </SelectTrigger>
            <SelectContent className="bg-black border-yellow-400/30">
              <SelectItem value="homme" className="text-white hover:bg-yellow-400/20">Homme</SelectItem>
              <SelectItem value="femme" className="text-white hover:bg-yellow-400/20">Femme</SelectItem>
              <SelectItem value="couple" className="text-white hover:bg-yellow-400/20">Couple</SelectItem>
              <SelectItem value="autre" className="text-white hover:bg-yellow-400/20">Autre</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="telegramUsername" className="flex items-center gap-2 mb-2 text-white">
            <MessageCircle className="w-4 h-4" />
            Nom d'utilisateur Telegram *
          </Label>
          <Input
            id="telegramUsername"
            type="text"
            value={telegramUsername}
            onChange={(e) => setTelegramUsername(e.target.value)}
            placeholder="@votre_nom_telegram"
            required
            className="w-full bg-black/50 border-yellow-400/30 text-white placeholder:text-gray-400 focus:border-yellow-400"
          />
        </div>

        <div>
          <Label htmlFor="city" className="flex items-center gap-2 mb-2 text-white">
            <MapPin className="w-4 h-4" />
            Ville *
          </Label>
          <Input
            id="city"
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Votre ville"
            required
            className="w-full bg-black/50 border-yellow-400/30 text-white placeholder:text-gray-400 focus:border-yellow-400"
          />
        </div>

        <Button 
          type="submit" 
          disabled={isSubmitting}
          className="w-full bg-yellow-400 text-black font-semibold hover:bg-yellow-500 transition-colors shadow-lg hover:shadow-xl transform hover:scale-105 transition-transform"
        >
          {isSubmitting ? 'Inscription en cours...' : 'Rejoindre la liste d\'attente'}
        </Button>
      </form>

      <p className="text-xs text-gray-400 mt-4 text-center">
        En vous inscrivant, vous acceptez de recevoir des notifications concernant nos événements spéciaux. 
        Vous pourrez vous désinscrire à tout moment.
      </p>
    </div>
  );
};

export default EventsWaitlistForm;
