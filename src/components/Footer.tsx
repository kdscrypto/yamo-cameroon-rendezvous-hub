
import { Link } from 'react-router-dom';
import AdContainer from '@/components/ads/AdContainer';
import AdBanner from '@/components/ads/AdBanner';

const Footer = () => {
  return (
    <footer className="bg-card border-t border-border mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo et description */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-amber-600 via-orange-600 to-red-700 rounded-lg flex items-center justify-center shadow-lg border border-amber-500/20">
                <span className="text-white font-bold text-lg drop-shadow-lg">Y</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-amber-400 via-orange-500 to-red-600 bg-clip-text text-transparent">Yamo</span>
            </div>
            <p className="text-muted-foreground text-sm">
              La plateforme de référence pour les annonces adultes au Cameroun.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="font-semibold mb-4 text-foreground">Navigation</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/browse?category=rencontres" className="text-muted-foreground hover:text-primary transition-colors">Rencontres</Link></li>
              <li><Link to="/browse?category=massages" className="text-muted-foreground hover:text-primary transition-colors">Massages</Link></li>
              <li><Link to="/browse?category=produits" className="text-muted-foreground hover:text-primary transition-colors">Produits adultes</Link></li>
            </ul>
          </div>

          {/* Compte */}
          <div>
            <h4 className="font-semibold mb-4 text-foreground">Compte</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/login" className="text-muted-foreground hover:text-primary transition-colors">Connexion</Link></li>
              <li><Link to="/register" className="text-muted-foreground hover:text-primary transition-colors">Inscription</Link></li>
              <li><Link to="/dashboard" className="text-muted-foreground hover:text-primary transition-colors">Mon compte</Link></li>
            </ul>
          </div>

          {/* Légal */}
          <div>
            <h4 className="font-semibold mb-4 text-foreground">Informations légales</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/terms" className="text-muted-foreground hover:text-primary transition-colors">CGU</Link></li>
              <li><Link to="/privacy" className="text-muted-foreground hover:text-primary transition-colors">Confidentialité</Link></li>
              <li><Link to="/contact" className="text-muted-foreground hover:text-primary transition-colors">Contact</Link></li>
            </ul>
          </div>
        </div>

        {/* Footer Advertisement */}
        <div className="my-8">
          <AdContainer variant="transparent">
            <AdBanner placement="footer" />
          </AdContainer>
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center">
          <p className="text-muted-foreground text-sm">
            © 2024 Yamo. Tous droits réservés. Plateforme réservée aux adultes de plus de 18 ans.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
