
import { Link } from 'react-router-dom';

const LoginFormLinks = () => {
  return (
    <div className="space-y-4 pt-4 border-t border-neutral-700/50">
      <div className="text-center">
        <Link 
          to="/forgot-password" 
          className="text-sm text-amber-400 hover:text-amber-300 transition-colors font-medium hover:underline"
        >
          Mot de passe oublié ?
        </Link>
      </div>
      
      <div className="text-center">
        <span className="text-sm text-neutral-400">
          Pas encore de compte ?{' '}
        </span>
        <Link 
          to="/register" 
          className="text-sm text-amber-400 hover:text-amber-300 transition-colors font-semibold hover:underline"
        >
          Créer un compte
        </Link>
      </div>
    </div>
  );
};

export default LoginFormLinks;
