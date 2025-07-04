
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

export interface TestResult {
  test: string;
  status: 'success' | 'error' | 'warning';
  message: string;
}

interface TestResultsProps {
  results: TestResult[];
}

const TestResults = ({ results }: TestResultsProps) => {
  const getStatusIcon = (status: 'success' | 'error' | 'warning') => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
    }
  };

  if (results.length === 0) return null;

  return (
    <Card className="bg-neutral-800/50 backdrop-blur-xl border border-neutral-700/50">
      <CardHeader>
        <CardTitle className="text-white text-lg">Résultats des tests</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {results.map((result, index) => (
            <div
              key={index}
              className="flex items-start gap-3 p-3 rounded-lg bg-neutral-700/50 border border-neutral-600/50"
            >
              {getStatusIcon(result.status)}
              <div className="flex-1">
                <div className="font-medium text-white text-sm">
                  {result.test}
                </div>
                <div className="text-neutral-300 text-xs mt-1">
                  {result.message}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default TestResults;
