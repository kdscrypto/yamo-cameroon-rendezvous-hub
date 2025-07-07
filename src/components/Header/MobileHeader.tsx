
import { useState } from "react";
import { Link } from "react-router-dom";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Menu, Search, Plus, User as UserIcon } from "lucide-react";
import Logo from "./Logo";
import UserDropdown from "./UserDropdown";

interface MobileHeaderProps {
  user: User | null;
  unreadCount: number;
  onLogout: () => void;
}

const MobileHeader = ({ user, unreadCount, onLogout }: MobileHeaderProps) => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement search functionality
    console.log("Search:", searchValue);
    setSearchOpen(false);
  };

  return (
    <header className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border/40 sticky top-0 z-50">
      <div className="px-4 py-3">
        {/* Main header row */}
        <div className="flex items-center justify-between mb-3">
          <Logo />
          
          <div className="flex items-center gap-2">
            {/* Search toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSearchOpen(!searchOpen)}
              className="h-9 w-9"
            >
              <Search className="h-4 w-4" />
            </Button>

            {/* User dropdown or login */}
            {user ? (
              <UserDropdown 
                user={user} 
                unreadCount={unreadCount} 
                onLogout={onLogout} 
              />
            ) : (
              <Button
                variant="ghost"
                size="icon"
                asChild
                className="h-9 w-9"
              >
                <Link to="/login">
                  <UserIcon className="h-4 w-4" />
                </Link>
              </Button>
            )}

            {/* Mobile menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Menu className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <SheetHeader>
                  <SheetTitle>Menu</SheetTitle>
                </SheetHeader>
                <MobileMenuContent user={user} />
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Action buttons row */}
        <div className="flex items-center gap-2">
          {user ? (
            <Button 
              className="flex-1 bg-gradient-to-r from-amber-600 via-orange-600 to-red-700 text-white hover:from-amber-700 hover:via-orange-700 hover:to-red-800 shadow-lg hover:shadow-xl transition-all duration-300 rounded-full font-medium"
              asChild
            >
              <Link to="/create-ad">
                <Plus className="w-4 h-4 mr-2" />
                Publier une annonce
              </Link>
            </Button>
          ) : (
            <>
              <Button
                variant="ghost"
                className="flex-1 text-amber-400 hover:text-amber-300 border border-amber-400/20 hover:border-amber-300/30 rounded-full"
                asChild
              >
                <Link to="/login">
                  <UserIcon className="w-4 h-4 mr-2" />
                  Connexion
                </Link>
              </Button>
              <Button
                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-300 rounded-full font-medium"
                asChild
              >
                <Link to="/create-ad">
                  <Plus className="w-4 h-4 mr-2" />
                  Publier
                </Link>
              </Button>
            </>
          )}
        </div>

        {/* Expandable search bar */}
        {searchOpen && (
          <div className="mt-3 animate-slide-down">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                type="text"
                placeholder="Rechercher des annonces..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-muted/50 border-muted-foreground/20 focus:border-amber-500 focus:ring-amber-500/20 rounded-full"
                autoFocus
              />
            </form>
          </div>
        )}
      </div>
    </header>
  );
};

const MobileMenuContent = ({ user }: { user: User | null }) => {
  const navItems = [
    { label: "Parcourir", href: "/browse" },
    { label: "Événements", href: "/events" },
  ];

  return (
    <nav className="flex flex-col space-y-4 mt-6">
      {navItems.map((item) => (
        <Link
          key={item.href}
          to={item.href}
          className="text-muted-foreground hover:text-foreground transition-colors duration-200 font-medium py-2 px-3 rounded-lg hover:bg-muted/50"
        >
          {item.label}
        </Link>
      ))}
      
      {user && (
        <>
          <hr className="border-muted-foreground/20 my-2" />
          <Link 
            to="/dashboard" 
            className="text-muted-foreground hover:text-foreground transition-colors duration-200 font-medium py-2 px-3 rounded-lg hover:bg-muted/50"
          >
            Tableau de bord
          </Link>
          <Link 
            to="/profile" 
            className="text-muted-foreground hover:text-foreground transition-colors duration-200 font-medium py-2 px-3 rounded-lg hover:bg-muted/50"
          >
            Profil
          </Link>
          <Link 
            to="/referral" 
            className="text-muted-foreground hover:text-foreground transition-colors duration-200 font-medium py-2 px-3 rounded-lg hover:bg-muted/50"
          >
            Parrainage
          </Link>
        </>
      )}
    </nav>
  );
};

export default MobileHeader;
