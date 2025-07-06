
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus, User } from "lucide-react";

interface AuthButtonsProps {
  isAuthenticated: boolean;
}

const AuthButtons = ({ isAuthenticated }: AuthButtonsProps) => {
  if (isAuthenticated) {
    return (
      <>
        <Button className="hidden sm:flex bg-gradient-to-r from-amber-600 via-orange-600 to-red-700 text-white hover:from-amber-700 hover:via-orange-700 hover:to-red-800 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 rounded-full px-6">
          <Plus className="w-4 h-4 mr-2" />
          Publier une annonce
        </Button>

        <Button
          variant="ghost"
          className="text-amber-400 hover:text-amber-300 hidden sm:flex items-center space-x-1"
        >
          <User className="w-4 h-4" />
          <span>Connexion</span>
        </Button>
      </>
    );
  }

  return (
    <>
      <Button
        variant="ghost"
        className="text-amber-400 hover:text-amber-300 hidden sm:flex items-center space-x-1"
        asChild
      >
        <Link to="/login">
          <User className="w-4 h-4" />
          <span>Connexion</span>
        </Link>
      </Button>
      <Button
        className="bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 rounded-full px-6"
        asChild
      >
        <Link to="/create-ad">
          Publier une annonce
        </Link>
      </Button>
    </>
  );
};

export default AuthButtons;
