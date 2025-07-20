import * as React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

const SimpleHeader = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    const { error } = await signOut();
    if (error) {
      console.error("Erreur lors de la déconnexion:", error);
    } else {
      console.log("Vous êtes déconnecté.");
      navigate('/');
    }
  };

  return (
    <header className="bg-background border-b border-border sticky top-0 z-50 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo with Link */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-amber-600 via-orange-600 to-red-700 rounded-lg flex items-center justify-center shadow-lg border border-amber-500/20">
              <span className="text-white font-bold text-lg drop-shadow-lg">Y</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-amber-400 via-orange-500 to-red-600 bg-clip-text text-transparent">
              Yamo
            </span>
          </Link>

          {/* Navigation Menu */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/browse" className="text-foreground hover:text-primary transition-colors">
              Parcourir
            </Link>
            {user && (
              <>
                <Link to="/create-ad" className="text-foreground hover:text-primary transition-colors">
                  Créer une annonce
                </Link>
                <Link to="/dashboard" className="text-foreground hover:text-primary transition-colors">
                  Dashboard
                </Link>
              </>
            )}
          </nav>
          
          {/* Auth section */}
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-3">
                <span className="text-sm text-muted-foreground">
                  Bienvenue, {user.email}
                </span>
                <Button
                  onClick={handleLogout}
                  variant="destructive"
                  size="sm"
                >
                  Déconnexion
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    Connexion
                  </Button>
                </Link>
                <Link to="/register">
                  <Button size="sm">
                    S'inscrire
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default SimpleHeader;