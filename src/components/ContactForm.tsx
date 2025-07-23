
import { useState, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { AlertCircle, CheckCircle, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { EmailValidator, SecurityUtils, rateLimiter } from '@/utils/productionConfig';

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
  const [emailValidation, setEmailValidation] = useState<{ isValid: boolean; error?: string } | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
  const { toast } = useToast();

  // Identifiant client pour le rate limiting
  const clientId = useMemo(() => SecurityUtils.getClientIdentifier(), []);

  const handleInputChange = useCallback((field: string, value: string) => {
    // Nettoyer l'entrée
    const cleanValue = SecurityUtils.sanitizeInput(value);
    setFormData(prev => ({ ...prev, [field]: cleanValue }));
    
    // Effacer l'erreur précédente pour ce champ
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({ ...prev, [field]: '' }));
    }
    
    // Validation en temps réel pour l'email
    if (field === 'email') {
      if (cleanValue.trim()) {
        const result = EmailValidator.validateEmail(cleanValue);
        setEmailValidation(result);
      } else {
        setEmailValidation(null);
      }
    }
  }, [fieldErrors]);

  // Validation d'email en temps réel
  const handleEmailBlur = useCallback(() => {
    if (formData.email.trim()) {
      const result = EmailValidator.validateEmail(formData.email);
      setEmailValidation(result);
    }
  }, [formData.email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Vérifier le rate limiting côté client
    if (!rateLimiter.isAllowed(clientId)) {
      toast({
        title: "Trop de tentatives",
        description: "Vous avez dépassé la limite d'envoi. Veuillez patienter avant de réessayer.",
        variant: "destructive"
      });
      return;
    }

    // Validation complète du formulaire
    const validation = EmailValidator.validateContactForm(formData);
    
    if (!validation.isValid) {
      // Afficher les erreurs
      const newErrors: { [key: string]: string } = {};
      validation.errors.forEach(error => {
        if (error.includes('Nom')) newErrors.name = error;
        if (error.includes('Email') || error.includes('email')) newErrors.email = error;
        if (error.includes('Sujet')) newErrors.subject = error;
        if (error.includes('Message')) newErrors.message = error;
      });
      
      setFieldErrors(newErrors);
      
      toast({
        title: "Données invalides",
        description: validation.errors[0],
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    setFieldErrors({});

    try {
      // Envoyer avec l'identifiant client pour le rate limiting côté serveur
      const { data, error } = await supabase.functions.invoke('send-contact-email', {
        body: {
          ...formData,
          clientId
        }
      });

      if (error) {
        throw error;
      }

      SecurityUtils.secureLog('info', 'Email de contact envoyé avec succès', { 
        trackingId: data?.trackingId,
        clientId 
      });

      toast({
        title: "Message envoyé ✅",
        description: `Votre message a été envoyé avec succès. ID de suivi: ${data?.trackingId?.slice(-8)}`
      });
      
      // Réinitialiser le formulaire
      setFormData({ name: '', email: '', subject: '', message: '' });
      setEmailValidation(null);
      setFieldErrors({});
      
    } catch (error: any) {
      SecurityUtils.secureLog('error', 'Erreur envoi email contact', error);
      
      let errorMessage = "Une erreur est survenue lors de l'envoi. Veuillez réessayer.";
      
      if (error.message) {
        // Messages d'erreur spécifiques du serveur
        if (error.message.includes('spam')) {
          errorMessage = "Votre message a été détecté comme potentiellement indésirable.";
        } else if (error.message.includes('rate limit') || error.message.includes('tentatives')) {
          errorMessage = "Trop de tentatives. Veuillez patienter avant de réessayer.";
        } else if (error.message.includes('email')) {
          errorMessage = "Problème avec l'adresse email fournie.";
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: "Erreur d'envoi",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`space-y-6 ${className || ''}`}>
      {/* Indicateur de sécurité */}
      <div className="flex items-center gap-2 text-sm text-neutral-400 bg-neutral-800/50 rounded-lg p-3">
        <Shield className="w-4 h-4 text-green-500" />
        <span>Formulaire sécurisé avec protection anti-spam et chiffrement</span>
      </div>

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
            maxLength={100}
            className={`text-white ${fieldErrors.name ? 'border-red-500' : ''}`}
          />
          {fieldErrors.name && (
            <p className="text-red-500 text-sm mt-1">{fieldErrors.name}</p>
          )}
        </div>
        <div>
          <Label htmlFor="email" className="text-white">Email</Label>
          <div className="relative">
            <Input
              id="email"
              type="text"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              onBlur={handleEmailBlur}
              placeholder="votre@email.com"
              required
              disabled={isLoading}
              maxLength={254}
              className={`text-white pr-10 ${
                emailValidation ? (emailValidation.isValid ? 'border-green-500' : 'border-red-500') : ''
              } ${fieldErrors.email ? 'border-red-500' : ''}`}
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
          {(emailValidation && !emailValidation.isValid) && (
            <p className="text-red-500 text-sm mt-1">{emailValidation.error}</p>
          )}
          {fieldErrors.email && (
            <p className="text-red-500 text-sm mt-1">{fieldErrors.email}</p>
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
          maxLength={200}
          className={`text-white ${fieldErrors.subject ? 'border-red-500' : ''}`}
        />
        {fieldErrors.subject && (
          <p className="text-red-500 text-sm mt-1">{fieldErrors.subject}</p>
        )}
        <p className="text-xs text-neutral-500 mt-1">
          {formData.subject.length}/200 caractères
        </p>
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
          maxLength={5000}
          className={`text-white ${fieldErrors.message ? 'border-red-500' : ''}`}
        />
        {fieldErrors.message && (
          <p className="text-red-500 text-sm mt-1">{fieldErrors.message}</p>
        )}
        <p className="text-xs text-neutral-500 mt-1">
          {formData.message.length}/5000 caractères
        </p>
      </div>

      <Button 
        type="submit" 
        className="w-full gradient-gold text-black hover:opacity-90 disabled:opacity-50"
        disabled={isLoading || (emailValidation && !emailValidation.isValid) || Object.keys(fieldErrors).length > 0}
      >
        {isLoading ? 'Envoi sécurisé en cours...' : 'Envoyer le message'}
      </Button>

      <div className="mt-2 text-sm text-neutral-400 space-y-2">
        <p>
          En soumettant ce formulaire, vous acceptez notre politique de confidentialité.
          Nous ne transmettrons jamais votre email à des tiers.
        </p>
        <div className="flex items-center gap-2 text-xs">
          <Shield className="w-3 h-3 text-green-500" />
          <span className="text-green-400">Protection anti-spam active • Limite: 5 messages/heure</span>
        </div>
      </div>
    </form>
  );
};

export default ContactForm;
