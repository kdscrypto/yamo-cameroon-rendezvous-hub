
import { Button } from '@/components/ui/button';

interface LoginSubmitButtonProps {
  isLoading: boolean;
}

const LoginSubmitButton = ({ isLoading }: LoginSubmitButtonProps) => {
  return (
    <Button 
      type="submit" 
      className="w-full h-14 text-lg font-bold bg-gradient-to-r from-amber-600 via-orange-600 to-red-700 text-white hover:from-amber-700 hover:via-orange-700 hover:to-red-800 shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 border-0 rounded-xl"
      disabled={isLoading}
    >
      {isLoading ? (
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          Connexion en cours...
        </div>
      ) : (
        <span className="drop-shadow-sm">SE CONNECTER</span>
      )}
    </Button>
  );
};

export default LoginSubmitButton;
