
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Phone, MapPin, Clock } from 'lucide-react';
import ContactForm from '@/components/ContactForm';

const Contact = () => {
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
                <ContactForm />

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
