
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface TestConfigFormProps {
  testPhone: string;
  testEmail: string;
  testPassword: string;
  isRunning: boolean;
  onPhoneChange: (phone: string) => void;
  onEmailChange: (email: string) => void;
  onPasswordChange: (password: string) => void;
  onRunTests: () => void;
  onClearResults: () => void;
}

const TestConfigForm = ({
  testPhone,
  testEmail,
  testPassword,
  isRunning,
  onPhoneChange,
  onEmailChange,
  onPasswordChange,
  onRunTests,
  onClearResults
}: TestConfigFormProps) => {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="testPhone" className="text-neutral-200 text-sm">
            Numéro de test
          </Label>
          <Input
            id="testPhone"
            value={testPhone}
            onChange={(e) => onPhoneChange(e.target.value)}
            className="bg-neutral-700 border-neutral-600 text-white"
            placeholder="+33123456789"
          />
        </div>
        <div>
          <Label htmlFor="testEmail" className="text-neutral-200 text-sm">
            Email de test
          </Label>
          <Input
            id="testEmail"
            value={testEmail}
            onChange={(e) => onEmailChange(e.target.value)}
            className="bg-neutral-700 border-neutral-600 text-white"
            placeholder="test@example.com"
          />
        </div>
        <div>
          <Label htmlFor="testPassword" className="text-neutral-200 text-sm">
            Mot de passe de test
          </Label>
          <Input
            id="testPassword"
            type="password"
            value={testPassword}
            onChange={(e) => onPasswordChange(e.target.value)}
            className="bg-neutral-700 border-neutral-600 text-white"
            placeholder="testpassword123"
          />
        </div>
      </div>
      
      <div className="flex gap-2">
        <Button
          onClick={onRunTests}
          disabled={isRunning}
          className="bg-amber-600 hover:bg-amber-700 text-white"
        >
          {isRunning ? 'Tests en cours...' : 'Lancer les tests'}
        </Button>
        <Button
          onClick={onClearResults}
          variant="outline"
          className="border-neutral-600 text-neutral-200 hover:bg-neutral-700"
        >
          Effacer
        </Button>
      </div>
    </>
  );
};

export default TestConfigForm;
