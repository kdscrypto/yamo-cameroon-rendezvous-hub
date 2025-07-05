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
    <header className="bg-neutral-900 border-b border-primary/20 sticky top-0 z-50 shadow-lg backdrop-blur-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          {/* Logo avec amélioration visuelle */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 bg-gradient-to-r from-primary-400 to-primary-600 rounded-xl flex items-center justify-center p-2 shadow-lg group-hover:shadow-primary/25 transition-all duration-300">
              <img 
                src="/lovable-uploads/69763ec0-e661-4629-ba0e-0bfe2a747829.png" 
                alt="Yamo Logo" 
                className="w-full h-full object-contain filter brightness-110"
              />
            </div>
            <span className="text-3xl font-bold bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent hover:from-primary-300 hover:to-primary-500 transition-all duration-300">
              Yamo
            </span>
          </Link>

          {/* Search Bar avec amélioration */}
          <div className="flex-1 max-w-md mx-4">
            <div className="relative">
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                onSearch={handleSearch}
                placeholder="Rechercher des annonces..."
                className="bg-neutral-800 border-primary/30 focus:border-primary/60 text-neutral-100 placeholder:text-neutral-400"
              />
            </div>
          </div>

          {/* Navigation avec hiérarchie améliorée */}
          <nav className="flex items-center space-x-6">
            {!loading && (
              <>
                {user ? (
                  // Authenticated user menu
                  <div className="flex items-center space-x-6">
                    <button 
                      onClick={handleCreateAdClick}
                      className="px-6 py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold rounded-lg hover:from-primary-600 hover:to-primary-700 transition-all duration-300 shadow-md hover:shadow-lg hover:shadow-primary/25 transform hover:scale-105"
                    >
                      Publier une annonce
                    </button>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-12 w-12 rounded-full hover:bg-neutral-800 border-2 border-transparent hover:border-primary/30 transition-all duration-300">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={user.user_metadata?.avatar_url} />
                            <AvatarFallback className="bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold text-sm">
                              {getUserInitials()}
                            </AvatarFallback>
                          </Avatar>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-64 bg-neutral-850 border-primary/20 shadow-xl" align="end" forceMount>
                        <div className="flex items-center justify-start gap-3 p-4 border-b border-primary/10">
                          <div className="flex flex-col space-y-1 leading-none">
                            <p className="font-semibold text-neutral-100 text-base">{getUserDisplayName()}</p>
                            <p className="w-[200px] truncate text-sm text-neutral-400">
                              {user.email}
                            </p>
                          </div>
                        </div>
                        <DropdownMenuItem asChild>
                          <Link to="/dashboard" className="cursor-pointer text-neutral-200 hover:bg-neutral-800 hover:text-primary-400 transition-colors duration-200 flex items-center py-3 px-4">
                            <BarChart3 className="mr-3 h-5 w-5" />
                            <span className="font-medium">Tableau de bord</span>
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link to="/profile" className="cursor-pointer text-neutral-200 hover:bg-neutral-800 hover:text-primary-400 transition-colors duration-200 flex items-center py-3 px-4">
                            <Settings className="mr-3 h-5 w-5" />
                            <span className="font-medium">Profil</span>
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-neutral-200 hover:bg-neutral-800 hover:text-red-400 transition-colors duration-200 flex items-center py-3 px-4">
                          <LogOut className="mr-3 h-5 w-5" />
                          <span className="font-medium">Se déconnecter</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ) : (
                  // Guest user buttons avec hiérarchie claire
                  <div className="flex items-center space-x-4">
                    <Link 
                      to="/login" 
                      className="flex items-center px-5 py-2.5 text-neutral-200 hover:text-primary-400 transition-all duration-300 font-medium border border-transparent hover:border-primary/30 rounded-lg"
                    >
                      <User className="w-5 h-5 mr-2" />
                      Connexion
                    </Link>
                    <button 
                      onClick={handleCreateAdClick}
                      className="px-6 py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold rounded-lg hover:from-primary-600 hover:to-primary-700 transition-all duration-300 shadow-md hover:shadow-lg hover:shadow-primary/25 transform hover:scale-105"
                    >
                      Publier une annonce
                    </button>
                  </div>
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
