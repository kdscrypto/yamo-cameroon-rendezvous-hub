
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and description */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 gradient-stripe rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">Y</span>
              </div>
              <span className="text-2xl font-bold text-gradient-stripe">Yamo</span>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              La plateforme de référence pour les annonces adultes au Cameroun.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="font-semibold mb-6 text-foreground text-lg">Navigation</h4>
            <ul className="space-y-3">
              <li><Link to="/rencontres" className="text-muted-foreground hover:text-primary transition-colors">Rencontres</Link></li>
              <li><Link to="/massages" className="text-muted-foreground hover:text-primary transition-colors">Massages</Link></li>
              <li><Link to="/produits" className="text-muted-foreground hover:text-primary transition-colors">Produits adultes</Link></li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <h4 className="font-semibold mb-6 text-foreground text-lg">Compte</h4>
            <ul className="space-y-3">
              <li><Link to="/login" className="text-muted-foreground hover:text-primary transition-colors">Connexion</Link></li>
              <li><Link to="/register" className="text-muted-foreground hover:text-primary transition-colors">Inscription</Link></li>
              <li><Link to="/dashboard" className="text-muted-foreground hover:text-primary transition-colors">Mon compte</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold mb-6 text-foreground text-lg">Informations légales</h4>
            <ul className="space-y-3">
              <li><Link to="/terms" className="text-muted-foreground hover:text-primary transition-colors">CGU</Link></li>
              <li><Link to="/privacy" className="text-muted-foreground hover:text-primary transition-colors">Confidentialité</Link></li>
              <li><Link to="/contact" className="text-muted-foreground hover:text-primary transition-colors">Contact</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 mt-12 pt-8 text-center">
          <p className="text-muted-foreground">
            © 2024 Yamo. Tous droits réservés. Plateforme réservée aux adultes de plus de 18 ans.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
