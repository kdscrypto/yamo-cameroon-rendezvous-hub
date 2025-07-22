
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { validateEmail } from '@/utils/emailValidation';

interface ContactFormProps {
  className?: string;
}

const ContactForm = ({ className }: ContactFormProps) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [emailValidation, setEmailValidation] = useState<{ isValid: boolean; reason?: string } | null>(null);
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Réinitialiser la validation d'email si c'est ce champ qui est modifié
    if (field === 'email') {
      if (value.trim()) {
        const result = validateEmail(value);
        setEmailValidation(result);
      } else {
        setEmailValidation(null);
      }
    }
  };

  // Validation d'email en temps réel
  const handleEmailBlur = () => {
    if (formData.email.trim()) {
      const result = validateEmail(formData.email);
      setEmailValidation(result);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Valider l'email
    if (formData.email) {
      const validationResult = validateEmail(formData.email);
      setEmailValidation(validationResult);
      
      if (!validationResult.isValid) {
        toast({
          title: "Email invalide",
          description: validationResult.reason || "Veuillez fournir une adresse email valide.",
          variant: "destructive"
        });
        return;
      }
    }
    
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('send-contact-email', {
        body: formData
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Message envoyé",
        description: "Nous vous répondrons dans les plus brefs délais."
      });
      setFormData({ name: '', email: '', subject: '', message: '' });
      setEmailValidation(null);
    } catch (error: any) {
      console.error('Error sending contact email:', error);
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de l'envoi. Veuillez réessayer.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`space-y-6 ${className || ''}`}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name" className="text-white">Nom complet</Label>
          <Input
            id="name"
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="Votre nom"
            required
            disabled={isLoading}
            className="text-white"
          />
        </div>
        <div>
          <Label htmlFor="email" className="text-white">Email</Label>
          <div className="relative">
            <Input
              id="email"
              type="text" // Utiliser "text" au lieu de "email" pour gérer nous-même la validation
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              onBlur={handleEmailBlur}
              placeholder="votre@email.com"
              required
              disabled={isLoading}
              className={`text-white pr-10 ${
                emailValidation ? (emailValidation.isValid ? 'border-green-500' : 'border-red-500') : ''
              }`}
            />
            {emailValidation && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                {emailValidation.isValid ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-500" />
                )}
              </div>
            )}
          </div>
          {emailValidation && !emailValidation.isValid && (
            <p className="text-red-500 text-sm mt-1">{emailValidation.reason}</p>
          )}
        </div>
      </div>

      <div>
        <Label htmlFor="subject" className="text-white">Sujet</Label>
        <Input
          id="subject"
          type="text"
          value={formData.subject}
          onChange={(e) => handleInputChange('subject', e.target.value)}
          placeholder="Objet de votre message"
          required
          disabled={isLoading}
          className="text-white"
        />
      </div>

      <div>
        <Label htmlFor="message" className="text-white">Message</Label>
        <Textarea
          id="message"
          value={formData.message}
          onChange={(e) => handleInputChange('message', e.target.value)}
          placeholder="Décrivez votre demande en détail..."
          rows={6}
          required
          disabled={isLoading}
          className="text-white"
        />
      </div>

      <Button 
        type="submit" 
        className="w-full gradient-gold text-black hover:opacity-90"
        disabled={isLoading || (emailValidation && !emailValidation.isValid)}
      >
        {isLoading ? 'Envoi en cours...' : 'Envoyer le message'}
      </Button>

      <div className="mt-2 text-sm text-neutral-400">
        En soumettant ce formulaire, vous acceptez notre politique de confidentialité.
        Nous ne transmettrons jamais votre email à des tiers.
      </div>
    </form>
  );
};

export default ContactForm;
