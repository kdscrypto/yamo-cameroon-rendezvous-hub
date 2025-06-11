
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, User, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';

const Header = () => {
  const [searchQuery, setSearchQuery] = useState('');

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
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                type="text"
                placeholder="Rechercher des annonces..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-background border-border"
              />
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex items-center space-x-4">
            <Button variant="ghost" asChild>
              <Link to="/login">
                <User className="w-4 h-4 mr-2" />
                Connexion
              </Link>
            </Button>
            <Button asChild>
              <Link to="/create-ad">Publier une annonce</Link>
            </Button>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
