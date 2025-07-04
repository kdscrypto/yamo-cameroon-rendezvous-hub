
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Phone } from 'lucide-react';
import TestConfigForm from './PhoneLoginTest/TestConfigForm';
import TestResults from './PhoneLoginTest/TestResults';
import { usePhoneLoginTests } from './PhoneLoginTest/usePhoneLoginTests';

const PhoneLoginTest = () => {
  const {
    testResults,
    isRunning,
    testPhone,
    testEmail,
    testPassword,
    setTestPhone,
    setTestEmail,
    setTestPassword,
    runTests,
    clearResults
  } = usePhoneLoginTests();

  return (
    <div className="space-y-6">
      <Card className="bg-neutral-800/50 backdrop-blur-xl border border-neutral-700/50">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Phone className="w-5 h-5 text-amber-500" />
            Test de l'authentification par téléphone
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <TestConfigForm
            testPhone={testPhone}
            testEmail={testEmail}
            testPassword={testPassword}
            isRunning={isRunning}
            onPhoneChange={setTestPhone}
            onEmailChange={setTestEmail}
            onPasswordChange={setTestPassword}
            onRunTests={runTests}
            onClearResults={clearResults}
          />
        </CardContent>
      </Card>

      <TestResults results={testResults} />
    </div>
  );
};

export default PhoneLoginTest;
