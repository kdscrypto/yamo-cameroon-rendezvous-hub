import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { User, LogOut, Settings, BarChart3 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import SearchBar from '@/components/SearchBar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const Header = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { user, signOut, loading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      const { error } = await signOut();
      if (error) {
        console.error('Erreur de déconnexion:', error);
        toast({
          title: "Erreur",
          description: "Impossible de se déconnecter. Veuillez réessayer.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Déconnexion réussie",
          description: "À bientôt !"
        });
        navigate('/');
      }
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      toast({
        title: "Erreur",
        description: "Une erreur inattendue s'est produite lors de la déconnexion.",
        variant: "destructive"
      });
    }
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/browse?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/browse');
    }
  };

  const handleCreateAdClick = () => {
    if (!user) {
      toast({
        title: "Connexion requise",
        description: "Vous devez être connecté pour créer une annonce.",
        variant: "destructive",
      });
      navigate('/login');
    } else {
      navigate('/create-ad');
    }
  };

  const getUserDisplayName = () => {
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name;
    }
    return user?.email?.split('@')[0] || 'Utilisateur';
  };

  const getUserInitials = () => {
    const name = getUserDisplayName();
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <header className="bg-card border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 gradient-gold rounded-lg flex items-center justify-center">
              <span className="text-black font-bold text-lg">Y</span>
            </div>
            <span className="text-2xl font-bold text-gradient-gold">Yamo</span>
          </Link>

          {/* Search Bar */}
          <div className="flex-1 max-w-md mx-4">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              onSearch={handleSearch}
              placeholder="Rechercher des annonces..."
            />
          </div>

          {/* Navigation */}
          <nav className="flex items-center space-x-4">
            {!loading && (
              <>
                {user ? (
                  // Authenticated user menu
                  <div className="flex items-center space-x-4">
                    <button 
                      onClick={handleCreateAdClick}
                      className="px-4 py-2 text-white hover:text-orange-300 transition-colors duration-200"
                    >
                      Publier une annonce
                    </button>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:bg-muted">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={user.user_metadata?.avatar_url} />
                            <AvatarFallback className="bg-primary text-primary-foreground">{getUserInitials()}</AvatarFallback>
                          </Avatar>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-56 bg-card border-border" align="end" forceMount>
                        <div className="flex items-center justify-start gap-2 p-2">
                          <div className="flex flex-col space-y-1 leading-none">
                            <p className="font-medium text-foreground">{getUserDisplayName()}</p>
                            <p className="w-[200px] truncate text-sm text-muted-foreground">
                              {user.email}
                            </p>
                          </div>
                        </div>
                        <DropdownMenuItem asChild>
                          <Link to="/dashboard" className="cursor-pointer text-foreground hover:bg-muted">
                            <BarChart3 className="mr-2 h-4 w-4" />
                            <span>Tableau de bord</span>
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link to="/profile" className="cursor-pointer text-foreground hover:bg-muted">
                            <Settings className="mr-2 h-4 w-4" />
                            <span>Profil</span>
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-foreground hover:bg-muted">
                          <LogOut className="mr-2 h-4 w-4" />
                          <span>Se déconnecter</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ) : (
                  // Guest user buttons
                  <>
                    <Link 
                      to="/login" 
                      className="flex items-center px-4 py-2 text-white hover:text-orange-300 transition-colors duration-200"
                    >
                      <User className="w-4 h-4 mr-2" />
                      Connexion
                    </Link>
                    <button 
                      onClick={handleCreateAdClick}
                      className="px-4 py-2 text-white hover:text-orange-300 transition-colors duration-200"
                    >
                      Publier une annonce
                    </button>
                  </>
                )}
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
