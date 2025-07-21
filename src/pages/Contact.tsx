
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Mail, Phone, MapPin, Clock } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
    } catch (error: any) {
      console.error('Error sending contact email:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'envoi. Veuillez réessayer.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <div className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4 text-yellow-400">Contactez-nous</h1>
            <p className="text-xl text-white">
              Une question ? Un problème ? Notre équipe est là pour vous aider.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Informations de contact */}
            <div className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-yellow-400">
                    <Mail className="w-5 h-5" />
                    Informations de contact
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-primary mt-1" />
                    <div>
                      <h3 className="font-semibold text-yellow-400">Email</h3>
                      <p className="text-white">contactyamoo@gmail.com</p>
                      <p className="text-sm text-white">Support général</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-primary mt-1" />
                    <div>
                      <h3 className="font-semibold text-yellow-400">Téléphone</h3>
                      <p className="text-white">+237 6XX XXX XXX</p>
                      <p className="text-sm text-white">Lun-Ven: 9h-18h</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-primary mt-1" />
                    <div>
                      <h3 className="font-semibold text-yellow-400">Adresse</h3>
                      <p className="text-white">
                        Douala, Cameroun<br />
                        Bonanjo, Rue de la République
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-primary mt-1" />
                    <div>
                      <h3 className="font-semibold text-yellow-400">Horaires</h3>
                      <p className="text-white">
                        Lundi - Vendredi: 9h00 - 18h00<br />
                        Samedi: 10h00 - 16h00<br />
                        Dimanche: Fermé
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-yellow-400">Contacts spécialisés</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-yellow-400">Support technique</h3>
                    <p className="text-white">support@yamo.fr</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-yellow-400">Signalements</h3>
                    <p className="text-white">report@yamo.fr</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-yellow-400">Données personnelles</h3>
                    <p className="text-white">privacy@yamo.fr</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-yellow-400">Partenariats</h3>
                    <p className="text-white">partners@yamo.fr</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Formulaire de contact */}
            <Card>
              <CardHeader>
                <CardTitle className="text-yellow-400">Envoyez-nous un message</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
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
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="votre@email.com"
                        required
                        disabled={isLoading}
                        className="text-white"
                      />
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
                    disabled={isLoading}
                  >
                    {isLoading ? 'Envoi en cours...' : 'Envoyer le message'}
                  </Button>
                </form>

                <div className="mt-6 p-4 bg-muted rounded-lg">
                  <p className="text-sm text-white">
                    <strong>Temps de réponse :</strong> Nous nous engageons à répondre à tous 
                    les messages dans les 24h ouvrées. Pour les demandes urgentes, 
                    utilisez notre ligne téléphonique.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Contact;
