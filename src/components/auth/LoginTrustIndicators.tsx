
import { Link } from 'react-router-dom';
import { Mail, Phone } from 'lucide-react';

const LoginTrustIndicators = () => {
  return (
    <div className="text-center mt-6 space-y-2">
      <div className="flex items-center justify-center gap-4 text-xs text-neutral-500">
        <div className="flex items-center gap-1">
          <Mail className="w-3 h-3" />
          <span>Email</span>
        </div>
        <div className="w-1 h-1 bg-neutral-600 rounded-full"></div>
        <div className="flex items-center gap-1">
          <Phone className="w-3 h-3" />
          <span>Téléphone</span>
        </div>
      </div>
      <p className="text-xs text-neutral-500">
        En vous connectant, vous acceptez nos{' '}
        <Link to="/terms" className="text-amber-400 hover:text-amber-300 hover:underline transition-colors">
          conditions d'utilisation
        </Link>
      </p>
    </div>
  );
};

export default LoginTrustIndicators;
