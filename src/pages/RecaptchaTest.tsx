import Header from '@/components/Header';
import Footer from '@/components/Footer';
import RecaptchaTest from '@/components/debug/RecaptchaTest';

const RecaptchaTestPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <div className="flex-1 flex items-center justify-center container-spacing section-spacing">
        <div className="w-full max-w-2xl space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white mb-2">
              Test du Système reCAPTCHA
            </h1>
            <p className="text-neutral-400">
              Vérification complète du système de sécurité reCAPTCHA
            </p>
          </div>
          
          <RecaptchaTest />
          
          <div className="bg-neutral-800/30 rounded-lg p-4 border border-neutral-700/50">
            <h2 className="text-lg font-semibold text-white mb-3">
              ✅ Vérifications de Production
            </h2>
            <div className="space-y-2 text-sm text-neutral-300">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                reCAPTCHA intégré dans le formulaire de connexion
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                reCAPTCHA intégré dans le formulaire d'inscription
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Edge Function verify-captcha déployée
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Clé secrète RECAPTCHA_SECRET_KEY configurée
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Clé de site de production configurée
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                CORS configuré pour les requêtes web
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Thème sombre adapté à l'interface
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Gestion d'erreurs implémentée
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default RecaptchaTestPage;