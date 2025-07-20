import * as React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, X } from "lucide-react";

const SimpleHeader = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = React.useState(false);
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

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
          
          {/* Desktop Auth section */}
          <div className="hidden md:flex items-center space-x-4">
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

          {/* Mobile Menu - Only render when mounted */}
          {isMounted && (
          <div className="md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <nav className="flex flex-col space-y-4 mt-8">
                  <Link 
                    to="/browse" 
                    className="text-foreground hover:text-primary transition-colors p-2"
                    onClick={() => setIsOpen(false)}
                  >
                    Parcourir
                  </Link>
                  {user && (
                    <>
                      <Link 
                        to="/create-ad" 
                        className="text-foreground hover:text-primary transition-colors p-2"
                        onClick={() => setIsOpen(false)}
                      >
                        Créer une annonce
                      </Link>
                      <Link 
                        to="/dashboard" 
                        className="text-foreground hover:text-primary transition-colors p-2"
                        onClick={() => setIsOpen(false)}
                      >
                        Dashboard
                      </Link>
                    </>
                  )}
                  
                  <div className="border-t pt-4 mt-4">
                    {user ? (
                      <div className="space-y-4">
                        <p className="text-sm text-muted-foreground px-2">
                          Connecté en tant que: {user.email}
                        </p>
                        <Button
                          onClick={() => {
                            handleLogout();
                            setIsOpen(false);
                          }}
                          variant="destructive"
                          className="w-full"
                        >
                          Déconnexion
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Link to="/login" onClick={() => setIsOpen(false)}>
                          <Button variant="ghost" className="w-full">
                            Connexion
                          </Button>
                        </Link>
                        <Link to="/register" onClick={() => setIsOpen(false)}>
                          <Button className="w-full">
                            S'inscrire
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default SimpleHeader;