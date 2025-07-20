import * as React from "react";
import { useAuth } from "@/hooks/useAuth";

const SimpleHeader = () => {
  const { user, signOut } = useAuth();

  const handleLogout = async () => {
    const { error } = await signOut();
    if (error) {
      console.error("Erreur lors de la déconnexion:", error);
    } else {
      console.log("Vous êtes déconnecté.");
    }
  };

  return (
    <header className="bg-background border-b border-border sticky top-0 z-50 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Simple Logo without Link */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-amber-600 via-orange-600 to-red-700 rounded-lg flex items-center justify-center shadow-lg border border-amber-500/20">
              <span className="text-white font-bold text-lg drop-shadow-lg">Y</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-amber-400 via-orange-500 to-red-600 bg-clip-text text-transparent">
              Yamo
            </span>
          </div>
          
          {/* Auth section */}
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-3">
                <span className="text-sm text-muted-foreground">
                  Bienvenue, {user.email}
                </span>
                <button
                  onClick={handleLogout}
                  className="text-sm px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700 transition-colors"
                >
                  Déconnexion
                </button>
              </div>
            ) : (
              <span className="text-muted-foreground text-sm">
                Non connecté
              </span>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default SimpleHeader;