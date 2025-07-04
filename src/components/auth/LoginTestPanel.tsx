
import { Mail, Phone } from 'lucide-react';

interface LoginTestPanelProps {
  showTestPanel: boolean;
}

const LoginTestPanel = ({ showTestPanel }: LoginTestPanelProps) => {
  if (!showTestPanel) return null;

  return (
    <div className="mb-6 p-4 border border-neutral-600 rounded-lg bg-neutral-700/30">
      <div className="text-sm text-neutral-200 mb-2 font-medium">
        🧪 Mode Test - Connexion par téléphone
      </div>
      <div className="text-xs text-neutral-400 space-y-1">
        <div>• Formats acceptés: +33123456789, 0123456789, 01 23 45 67 89</div>
        <div>• La validation se fait automatiquement</div>
        <div>• Les erreurs sont affichées en temps réel</div>
      </div>
    </div>
  );
};

export default LoginTestPanel;
