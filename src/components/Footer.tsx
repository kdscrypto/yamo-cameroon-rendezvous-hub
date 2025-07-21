
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-card border-t border-border mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo et description */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 gradient-gold rounded-lg flex items-center justify-center">
                <span className="text-black font-bold text-lg">Y</span>
              </div>
              <span className="text-xl font-bold text-gradient-gold">Yamo</span>
            </div>
            <p className="text-white text-sm">
              La plateforme de référence pour les annonces adultes au Cameroun.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="font-semibold mb-4">Navigation</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/rencontres" className="text-white hover:text-primary transition-colors">Rencontres</Link></li>
              <li><Link to="/massages" className="text-white hover:text-primary transition-colors">Massages</Link></li>
              <li><Link to="/produits" className="text-white hover:text-primary transition-colors">Produits adultes</Link></li>
            </ul>
          </div>

          {/* Compte */}
          <div>
            <h4 className="font-semibold mb-4">Compte</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/login" className="text-white hover:text-primary transition-colors">Connexion</Link></li>
              <li><Link to="/register" className="text-white hover:text-primary transition-colors">Inscription</Link></li>
              <li><Link to="/dashboard" className="text-white hover:text-primary transition-colors">Mon compte</Link></li>
            </ul>
          </div>

          {/* Légal */}
          <div>
            <h4 className="font-semibold mb-4">Informations légales</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/terms" className="text-white hover:text-primary transition-colors">CGU</Link></li>
              <li><Link to="/privacy" className="text-white hover:text-primary transition-colors">Confidentialité</Link></li>
              <li><Link to="/contact" className="text-white hover:text-primary transition-colors">Contact</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center">
          <p className="text-white text-sm">
            © 2024 Yamo. Tous droits réservés. Plateforme réservée aux adultes de plus de 18 ans.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
