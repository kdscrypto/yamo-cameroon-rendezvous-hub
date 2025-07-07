
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus, User } from "lucide-react";

interface AuthButtonsProps {
  isAuthenticated: boolean;
}

const AuthButtons = ({ isAuthenticated }: AuthButtonsProps) => {
  if (isAuthenticated) {
    return (
      <Button 
        className="bg-gradient-to-r from-amber-600 via-orange-600 to-red-700 text-white hover:from-amber-700 hover:via-orange-700 hover:to-red-800 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 rounded-full px-6 font-medium"
        asChild
      >
        <Link to="/create-ad">
          <Plus className="w-4 h-4 mr-2" />
          Publier une annonce
        </Link>
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <Button
        variant="ghost"
        className="text-amber-400 hover:text-amber-300 hover:bg-amber-400/10 transition-all duration-200 rounded-full px-4"
        asChild
      >
        <Link to="/login">
          <User className="w-4 h-4 mr-2" />
          Connexion
        </Link>
      </Button>
      <Button
        className="bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 rounded-full px-6 font-medium"
        asChild
      >
        <Link to="/create-ad">
          <Plus className="w-4 h-4 mr-2" />
          Publier une annonce
        </Link>
      </Button>
    </div>
  );
};

export default AuthButtons;
