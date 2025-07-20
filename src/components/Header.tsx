
import * as React from "react";
import { useAuth } from "@/hooks/useAuth";
// import { useToast } from "@/hooks/use-toast"; // Temporairement désactivé
import { useGetUnreadMessagesCount } from "@/hooks/useGetUnreadMessagesCount";
// import { useIsMobile } from "@/hooks/use-mobile"; // Temporairement désactivé
import Logo from "./Header/Logo";
import SearchBar from "./Header/SearchBar";
import AuthButtons from "./Header/AuthButtons";
import UserDropdown from "./Header/UserDropdown";
import MobileMenu from "./Header/MobileMenu";
import MobileHeader from "./Header/MobileHeader";

const Header = () => {
  // Temporary fallbacks to avoid React hook issues during initialization
  const user = null;
  const signOut = async () => ({ error: null });
  const unreadCount = 0;
  const isMobile = false; // Temporairement désactivé - assume desktop
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
    }
  };

  // Don't render until mounted to avoid hydration issues
  if (!isMounted) {
    return (
      <header className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border/40 sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Logo />
          </div>
        </div>
      </header>
    );
  }

  // Use mobile-optimized header on mobile devices
  if (isMobile) {
    return (
      <MobileHeader 
        user={user}
        unreadCount={unreadCount}
        onLogout={handleLogout}
      />
    );
  }

  // Desktop header layout
  return (
    <header className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border/40 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Logo />
          <SearchBar />
          
          <div className="flex items-center space-x-4">
            <AuthButtons isAuthenticated={!!user} />
            
            {user && (
              <UserDropdown 
                user={user} 
                unreadCount={unreadCount} 
                onLogout={handleLogout} 
              />
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
