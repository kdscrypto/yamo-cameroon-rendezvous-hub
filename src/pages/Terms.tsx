
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Terms = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <div className="flex-1 container mx-auto px-4 py-12">
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-3xl text-center">Conditions d'utilisation</CardTitle>
            <p className="text-center text-muted-foreground">
              Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
            </p>
          </CardHeader>
          
          <CardContent className="prose prose-lg max-w-none space-y-6">
            <section>
              <h2 className="text-2xl font-semibold mb-4">1. Acceptation des conditions</h2>
              <p className="text-muted-foreground leading-relaxed">
                En utilisant Yamo, vous acceptez ces conditions d'utilisation. Si vous n'acceptez pas ces conditions, 
                veuillez ne pas utiliser notre plateforme.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">2. Description du service</h2>
              <p className="text-muted-foreground leading-relaxed">
                Yamo est une plateforme de rencontres et d'annonces pour adultes. Nos services incluent :
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Mise en relation entre adultes consentants</li>
                <li>Publication d'annonces de rencontres</li>
                <li>Services de massage et bien-être</li>
                <li>Vente de produits pour adultes</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">3. Conditions d'accès</h2>
              <p className="text-muted-foreground leading-relaxed">
                Pour utiliser Yamo, vous devez :
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Être âgé(e) de 18 ans minimum</li>
                <li>Fournir des informations exactes lors de votre inscription</li>
                <li>Respecter les lois en vigueur dans votre pays</li>
                <li>Ne pas utiliser la plateforme à des fins illégales</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">4. Règles de conduite</h2>
              <p className="text-muted-foreground leading-relaxed">
                Il est strictement interdit de :
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Publier du contenu illégal, offensant ou diffamatoire</li>
                <li>Harceler ou menacer d'autres utilisateurs</li>
                <li>Utiliser de fausses identités</li>
                <li>Faire de la publicité pour des services non autorisés</li>
                <li>Violer les droits de propriété intellectuelle</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">5. Vie privée et données</h2>
              <p className="text-muted-foreground leading-relaxed">
                Nous nous engageons à protéger votre vie privée. Vos données personnelles sont traitées 
                conformément à notre politique de confidentialité et au RGPD. Vous avez le droit d'accéder, 
                de modifier ou de supprimer vos données à tout moment.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">6. Responsabilité</h2>
              <p className="text-muted-foreground leading-relaxed">
                Yamo agit en tant qu'intermédiaire. Nous ne sommes pas responsables des interactions 
                entre utilisateurs ou des transactions effectuées en dehors de notre plateforme. 
                Chaque utilisateur est responsable de ses actions et de sa sécurité.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">7. Contenu des annonces</h2>
              <p className="text-muted-foreground leading-relaxed">
                Les annonces doivent respecter nos directives :
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Contenu réservé aux adultes uniquement</li>
                <li>Aucune référence à des services illégaux</li>
                <li>Photos respectueuses et non explicites</li>
                <li>Descriptions honnêtes et non trompeuses</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">8. Suspension et résiliation</h2>
              <p className="text-muted-foreground leading-relaxed">
                Nous nous réservons le droit de suspendre ou de supprimer tout compte qui ne respecte 
                pas ces conditions d'utilisation, sans préavis ni remboursement.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">9. Modifications</h2>
              <p className="text-muted-foreground leading-relaxed">
                Ces conditions peuvent être modifiées à tout moment. Les utilisateurs seront informés 
                des changements importants par email ou notification sur la plateforme.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">10. Contact</h2>
              <p className="text-muted-foreground leading-relaxed">
                Pour toute question concernant ces conditions d'utilisation, contactez-nous à : 
                <span className="font-medium"> contact@yamo.fr</span>
              </p>
            </section>

            <div className="border-t pt-6 mt-8">
              <p className="text-sm text-muted-foreground text-center">
                En utilisant Yamo, vous confirmez avoir lu, compris et accepté ces conditions d'utilisation.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Footer />
    </div>
  );
};

export default Terms;
