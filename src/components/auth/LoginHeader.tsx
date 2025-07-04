
import { Mail, Phone } from 'lucide-react';

const LoginHeader = () => {
  return (
    <div className="text-center mb-8">
      <div className="flex justify-center mb-6">
        <div className="w-16 h-16 bg-gradient-to-br from-amber-600 via-orange-600 to-red-700 rounded-2xl flex items-center justify-center shadow-2xl border border-amber-500/20">
          <span className="text-white font-bold text-2xl drop-shadow-lg">Y</span>
        </div>
      </div>
      <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-amber-400 via-orange-500 to-red-600 bg-clip-text text-transparent">
        Bienvenue sur Yamo
      </h1>
      <p className="text-neutral-300 text-lg">Connectez-vous pour accéder à votre compte</p>
    </div>
  );
};

export default LoginHeader;
