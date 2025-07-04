
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Mail, User, CheckCircle } from 'lucide-react';

const EventsWaitlistForm = () => {
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: "Email requis",
        description: "Veuillez saisir votre adresse email.",
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
            email: email.trim().toLowerCase(),
            full_name: fullName.trim() || null
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
        setFullName('');
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
        <h3 className="text-2xl font-bold mb-4 text-green-600">Inscription confirmée !</h3>
        <p className="text-muted-foreground mb-6">
          Merci de votre intérêt ! Nous vous contacterons dès que nos événements spéciaux seront disponibles.
        </p>
        <Button 
          onClick={() => setIsSuccess(false)}
          variant="outline"
        >
          Inscrire une autre personne
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="mb-6">
        <h3 className="text-2xl font-bold mb-2">Rejoignez notre liste d'attente</h3>
        <p className="text-muted-foreground">
          Soyez parmi les premiers informés du lancement de nos événements exclusifs
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="fullName" className="flex items-center gap-2 mb-2">
            <User className="w-4 h-4" />
            Nom complet (optionnel)
          </Label>
          <Input
            id="fullName"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Votre nom complet"
            className="w-full"
          />
        </div>

        <div>
          <Label htmlFor="email" className="flex items-center gap-2 mb-2">
            <Mail className="w-4 h-4" />
            Adresse email *
          </Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="votre@email.com"
            required
            className="w-full"
          />
        </div>

        <Button 
          type="submit" 
          disabled={isSubmitting}
          className="w-full gradient-gold text-black hover:opacity-90"
        >
          {isSubmitting ? 'Inscription en cours...' : 'Rejoindre la liste d\'attente'}
        </Button>
      </form>

      <p className="text-xs text-muted-foreground mt-4 text-center">
        En vous inscrivant, vous acceptez de recevoir des notifications concernant nos événements spéciaux. 
        Vous pourrez vous désinscrire à tout moment.
      </p>
    </div>
  );
};

export default EventsWaitlistForm;
