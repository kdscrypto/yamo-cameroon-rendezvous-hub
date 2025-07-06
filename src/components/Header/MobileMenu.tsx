
import { Link } from "react-router-dom";
import { User } from "@supabase/supabase-js";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Menu, Search } from "lucide-react";

interface MobileMenuProps {
  user: User | null;
}

const navItems = [
  { label: "Parcourir", href: "/browse" },
  { label: "Événements", href: "/events" },
];

const MobileMenu = ({ user }: MobileMenuProps) => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>Menu</SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col space-y-4 mt-4">
          {/* Barre de recherche mobile */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              type="text"
              placeholder="Rechercher des annonces..."
              className="w-full pl-10 pr-4 py-2 bg-muted/50 border-muted-foreground/20 focus:border-amber-500 focus:ring-amber-500/20 rounded-full"
            />
          </div>
          
          {navItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className="text-muted-foreground hover:text-foreground transition-colors duration-200 font-medium"
            >
              {item.label}
            </Link>
          ))}
          {user && (
            <>
              <Link to="/create-ad" className="text-muted-foreground hover:text-foreground transition-colors duration-200 font-medium">
                Publier une annonce
              </Link>
              <Link to="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors duration-200 font-medium">
                Tableau de bord
              </Link>
              <Link to="/profile" className="text-muted-foreground hover:text-foreground transition-colors duration-200 font-medium">
                Profil
              </Link>
              <Link to="/referral" className="text-muted-foreground hover:text-foreground transition-colors duration-200 font-medium">
                Parrainage
              </Link>
            </>
          )}
        </nav>
      </SheetContent>
    </Sheet>
  );
};

export default MobileMenu;
