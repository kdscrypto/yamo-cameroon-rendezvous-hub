
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';
import { Shield, Lock, Eye, Settings, AlertTriangle, Info } from 'lucide-react';

const ParentalControl = () => {
  return (
    <>
      <SEO 
        title="Contrôle Parental - Yamo"
        description="Guide complet pour bloquer l'accès au site Yamo et protéger les mineurs. Instructions détaillées pour tous les appareils et navigateurs."
        keywords="contrôle parental, bloquer site adulte, protection mineurs, filtrage web, sécurité enfants"
      />
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        
        <main className="flex-1 container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            {/* Header Section */}
            <div className="text-center mb-12">
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-full flex items-center justify-center shadow-2xl">
                  <Shield className="w-10 h-10 text-white" />
                </div>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-emerald-400 to-blue-500 bg-clip-text text-transparent">
                Contrôle Parental
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Protection des mineurs : Comment bloquer l'accès à ce site
              </p>
            </div>

            {/* Alert Section */}
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-6 mb-8">
              <div className="flex items-start space-x-4">
                <AlertTriangle className="w-6 h-6 text-amber-400 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-amber-400 mb-2">Important</h3>
                  <p className="text-amber-200/90">
                    Ce site contient du contenu destiné aux adultes uniquement. Si vous souhaitez empêcher l'accès 
                    à ce site pour protéger des mineurs, suivez les instructions ci-dessous.
                  </p>
                </div>
              </div>
            </div>

            {/* Methods Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              
              {/* Router Level Blocking */}
              <div className="bg-card/50 border border-border rounded-xl p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <Settings className="w-5 h-5 text-blue-400" />
                  </div>
                  <h3 className="text-xl font-semibold">Blocage au niveau du routeur</h3>
                </div>
                <p className="text-muted-foreground mb-4">
                  La méthode la plus efficace pour bloquer l'accès sur tous les appareils de votre réseau.
                </p>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                    <p>Accédez à l'interface de votre routeur (généralement 192.168.1.1)</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                    <p>Trouvez la section "Contrôle parental" ou "Filtrage de contenu"</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                    <p>Ajoutez "yamo.chat" à la liste des sites bloqués</p>
                  </div>
                </div>
              </div>

              {/* DNS Filtering */}
              <div className="bg-card/50 border border-border rounded-xl p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                    <Lock className="w-5 h-5 text-purple-400" />
                  </div>
                  <h3 className="text-xl font-semibold">Filtrage DNS</h3>
                </div>
                <p className="text-muted-foreground mb-4">
                  Utilisez des services DNS qui filtrent automatiquement le contenu adulte.
                </p>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                    <p><strong>OpenDNS FamilyShield:</strong> 208.67.222.123, 208.67.220.123</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                    <p><strong>CleanBrowsing:</strong> 185.228.168.168, 185.228.169.168</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                    <p>Configurez ces DNS dans les paramètres réseau de vos appareils</p>
                  </div>
                </div>
              </div>

              {/* Browser Extensions */}
              <div className="bg-card/50 border border-border rounded-xl p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                    <Eye className="w-5 h-5 text-green-400" />
                  </div>
                  <h3 className="text-xl font-semibold">Extensions de navigateur</h3>
                </div>
                <p className="text-muted-foreground mb-4">
                  Installez des extensions de contrôle parental sur les navigateurs.
                </p>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                    <p><strong>Chrome:</strong> BlockSite, Cold Turkey Blocker</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                    <p><strong>Firefox:</strong> LeechBlock NG, FoxFilter</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                    <p>Ajoutez "yamo.chat" à la liste des sites bloqués</p>
                  </div>
                </div>
              </div>

              {/* System Level */}
              <div className="bg-card/50 border border-border rounded-xl p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                    <Shield className="w-5 h-5 text-red-400" />
                  </div>
                  <h3 className="text-xl font-semibold">Contrôle parental système</h3>
                </div>
                <p className="text-muted-foreground mb-4">
                  Utilisez les fonctionnalités intégrées de votre système d'exploitation.
                </p>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                    <p><strong>Windows:</strong> Microsoft Family Safety</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                    <p><strong>macOS:</strong> Temps d'écran et restrictions</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                    <p><strong>Android/iOS:</strong> Contrôle parental intégré</p>
                  </div>
                </div>
              </div>

            </div>

            {/* Additional Resources */}
            <div className="bg-card/30 border border-border rounded-xl p-8">
              <div className="flex items-center space-x-3 mb-6">
                <Info className="w-6 h-6 text-blue-400" />
                <h3 className="text-2xl font-semibold">Ressources supplémentaires</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-primary mb-3">Applications de contrôle parental</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Qustodio (gratuit et payant)</li>
                    <li>• Net Nanny</li>
                    <li>• Kaspersky Safe Kids</li>
                    <li>• Circle Home Plus</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold text-primary mb-3">Guides détaillés</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Configuration du contrôle parental sur routeur</li>
                    <li>• Paramétrage DNS sécurisé</li>
                    <li>• Gestion des profils familiaux</li>
                    <li>• Surveillance de l'activité en ligne</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="text-center mt-12 p-6 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
              <h3 className="font-semibold text-emerald-400 mb-2">Besoin d'aide ?</h3>
              <p className="text-emerald-200/90 mb-4">
                Pour toute question concernant le contrôle parental ou la protection des mineurs, 
                n'hésitez pas à nous contacter.
              </p>
              <a 
                href="/contact" 
                className="text-emerald-400 hover:text-emerald-300 underline font-medium"
              >
                Contactez notre équipe support
              </a>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default ParentalControl;
