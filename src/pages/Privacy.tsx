
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Privacy = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <div className="flex-1 container mx-auto px-4 py-12">
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-3xl text-center text-yellow-400">Politique de confidentialité</CardTitle>
            <p className="text-center text-white">
              Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
            </p>
          </CardHeader>
          
          <CardContent className="prose prose-lg max-w-none space-y-6">
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-yellow-400">1. Introduction</h2>
              <p className="text-white leading-relaxed">
                Yamo s'engage à protéger la confidentialité de ses utilisateurs. Cette politique 
                explique comment nous collectons, utilisons et protégeons vos données personnelles.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-yellow-400">2. Données collectées</h2>
              <p className="text-white leading-relaxed">
                Nous collectons les données suivantes :
              </p>
              <ul className="list-disc pl-6 text-white space-y-2">
                <li>Informations d'inscription (email, nom, âge)</li>
                <li>Données de profil et annonces publiées</li>
                <li>Historique de navigation sur la plateforme</li>
                <li>Données de géolocalisation (si autorisée)</li>
                <li>Messages et communications</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-yellow-400">3. Utilisation des données</h2>
              <p className="text-white leading-relaxed">
                Vos données sont utilisées pour :
              </p>
              <ul className="list-disc pl-6 text-white space-y-2">
                <li>Fournir et améliorer nos services</li>
                <li>Personnaliser votre expérience</li>
                <li>Assurer la sécurité de la plateforme</li>
                <li>Vous envoyer des notifications importantes</li>
                <li>Respecter nos obligations légales</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-yellow-400">4. Partage des données</h2>
              <p className="text-white leading-relaxed">
                Nous ne partageons vos données qu'avec :
              </p>
              <ul className="list-disc pl-6 text-white space-y-2">
                <li>D'autres utilisateurs (selon vos paramètres de confidentialité)</li>
                <li>Nos prestataires de services techniques</li>
                <li>Les autorités légales en cas d'obligation légale</li>
              </ul>
              <p className="text-white leading-relaxed mt-4">
                Nous ne vendons jamais vos données à des tiers.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-yellow-400">5. Sécurité des données</h2>
              <p className="text-white leading-relaxed">
                Nous mettons en place des mesures de sécurité appropriées :
              </p>
              <ul className="list-disc pl-6 text-white space-y-2">
                <li>Chiffrement des données sensibles</li>
                <li>Accès restreint aux données personnelles</li>
                <li>Surveillance continue de la sécurité</li>
                <li>Sauvegardes régulières et sécurisées</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-yellow-400">6. Vos droits (RGPD)</h2>
              <p className="text-white leading-relaxed">
                Conformément au RGPD, vous avez le droit de :
              </p>
              <ul className="list-disc pl-6 text-white space-y-2">
                <li>Accéder à vos données personnelles</li>
                <li>Rectifier des données inexactes</li>
                <li>Demander la suppression de vos données</li>
                <li>Limiter le traitement de vos données</li>
                <li>Obtenir la portabilité de vos données</li>
                <li>Vous opposer au traitement</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-yellow-400">7. Cookies et technologies similaires</h2>
              <p className="text-white leading-relaxed">
                Nous utilisons des cookies pour améliorer votre expérience. Vous pouvez gérer 
                vos préférences de cookies dans les paramètres de votre navigateur.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-yellow-400">8. Conservation des données</h2>
              <p className="text-white leading-relaxed">
                Nous conservons vos données aussi longtemps que nécessaire pour fournir nos services 
                ou conformément aux obligations légales. Les données inactives sont supprimées 
                automatiquement après 2 ans d'inactivité.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-yellow-400">9. Transferts internationaux</h2>
              <p className="text-white leading-relaxed">
                Vos données peuvent être transférées vers des pays offrant un niveau de protection 
                adéquat. Nous nous assurons que tous les transferts respectent les réglementations 
                en vigueur.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-yellow-400">10. Contact</h2>
              <p className="text-white leading-relaxed">
                Pour toute question concernant cette politique de confidentialité ou pour exercer 
                vos droits, contactez notre délégué à la protection des données : 
                <span className="font-medium text-yellow-400"> privacy@yamo.fr</span>
              </p>
            </section>

            <div className="border-t pt-6 mt-8">
              <p className="text-sm text-white text-center">
                Cette politique peut être mise à jour périodiquement. Nous vous informerons des 
                changements importants par email ou notification.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Footer />
    </div>
  );
};

export default Privacy;
