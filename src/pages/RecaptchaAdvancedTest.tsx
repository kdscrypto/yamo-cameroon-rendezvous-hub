import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import EnhancedReCAPTCHA from '@/components/auth/EnhancedReCAPTCHA';
import { Shield, TestTube, Eye, Zap, CheckCircle, AlertTriangle } from 'lucide-react';

const RecaptchaAdvancedTest = () => {
  const [testResults, setTestResults] = useState<any[]>([]);
  const [isTestMode, setIsTestMode] = useState(false);
  const [currentTestResult, setCurrentTestResult] = useState<any>(null);

  const handleVerificationChange = (isVerified: boolean, token: string | null) => {
    const timestamp = new Date().toLocaleTimeString();
    const testResult = {
      timestamp,
      isVerified,
      token: token ? `${token.substring(0, 20)}...` : null,
      type: isTestMode ? 'debug' : 'normal'
    };
    
    setTestResults(prev => [testResult, ...prev.slice(0, 9)]);
  };

  const handleValidationChange = (validationData: any) => {
    setCurrentTestResult(validationData);
  };

  const clearResults = () => {
    setTestResults([]);
    setCurrentTestResult(null);
  };

  const getStatusBadge = (isVerified: boolean, type: string) => {
    if (isVerified) {
      return <Badge variant="default" className="bg-green-600">✓ Vérifié</Badge>;
    } else {
      return <Badge variant="destructive">✗ Échec</Badge>;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <div className="flex-1 container-spacing section-spacing">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-3">
              <TestTube className="w-8 h-8 text-amber-500" />
              <h1 className="text-4xl font-bold gradient-text">
                Test Avancé reCAPTCHA
              </h1>
            </div>
            <p className="text-neutral-400 text-lg max-w-2xl mx-auto">
              Interface de test pour valider le comportement du système reCAPTCHA amélioré, 
              détecter les faux positifs et analyser les résultats de validation.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Test Panel */}
            <Card className="bg-neutral-800/50 backdrop-blur-xl border border-neutral-700/50">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Shield className="w-5 h-5 text-amber-500" />
                  Panneau de Test
                </CardTitle>
                <CardDescription>
                  Test du composant reCAPTCHA avec mode debug
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-4">
                  <Button
                    onClick={() => setIsTestMode(!isTestMode)}
                    variant={isTestMode ? "default" : "outline"}
                    className="flex items-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    Mode Debug: {isTestMode ? 'ON' : 'OFF'}
                  </Button>
                  
                  <Button
                    onClick={clearResults}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Zap className="w-4 h-4" />
                    Reset
                  </Button>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="text-white font-medium">Test reCAPTCHA:</h4>
                  <EnhancedReCAPTCHA
                    onVerificationChange={handleVerificationChange}
                    onValidationChange={handleValidationChange}
                    debug={isTestMode}
                  />
                </div>

                {currentTestResult && isTestMode && (
                  <div className="bg-neutral-900/50 border border-neutral-600 rounded-lg p-4">
                    <h5 className="text-white font-medium mb-3">Dernière Validation:</h5>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-neutral-400">Succès:</span>
                        <span className={currentTestResult.success ? "text-green-400" : "text-red-400"}>
                          {currentTestResult.success ? "Oui" : "Non"}
                        </span>
                      </div>
                      {currentTestResult.score !== undefined && (
                        <div className="flex justify-between">
                          <span className="text-neutral-400">Score:</span>
                          <span className="text-amber-400">{currentTestResult.score}</span>
                        </div>
                      )}
                      {currentTestResult.action && (
                        <div className="flex justify-between">
                          <span className="text-neutral-400">Action:</span>
                          <span className="text-blue-400">{currentTestResult.action}</span>
                        </div>
                      )}
                      {currentTestResult.errors && currentTestResult.errors.length > 0 && (
                        <div className="space-y-1">
                          <span className="text-neutral-400">Erreurs:</span>
                          {currentTestResult.errors.map((error: string, index: number) => (
                            <div key={index} className="text-red-400 text-xs ml-2">
                              • {error}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Results Panel */}
            <Card className="bg-neutral-800/50 backdrop-blur-xl border border-neutral-700/50">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  Résultats de Test
                </CardTitle>
                <CardDescription>
                  Historique des vérifications CAPTCHA
                </CardDescription>
              </CardHeader>
              <CardContent>
                {testResults.length === 0 ? (
                  <div className="text-center py-8 text-neutral-500">
                    Aucun test effectué. Complétez le CAPTCHA pour voir les résultats.
                  </div>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {testResults.map((result, index) => (
                      <div
                        key={index}
                        className="bg-neutral-900/30 border border-neutral-600 rounded-lg p-3"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-neutral-400">
                            {result.timestamp}
                          </span>
                          <div className="flex items-center gap-2">
                            {getStatusBadge(result.isVerified, result.type)}
                            {result.type === 'debug' && (
                              <Badge variant="outline" className="text-xs">
                                <Eye className="w-3 h-3 mr-1" />
                                Debug
                              </Badge>
                            )}
                          </div>
                        </div>
                        {result.token && (
                          <div className="text-xs text-neutral-500 font-mono">
                            Token: {result.token}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Analysis Panel */}
          <Card className="bg-neutral-800/50 backdrop-blur-xl border border-neutral-700/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-500" />
                Analyse des Comportements
              </CardTitle>
              <CardDescription>
                Indicateurs de détection de faux positifs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-neutral-900/30 border border-neutral-600 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-green-400">
                    {testResults.filter(r => r.isVerified).length}
                  </div>
                  <div className="text-sm text-neutral-400">Vérifications Réussies</div>
                </div>
                
                <div className="bg-neutral-900/30 border border-neutral-600 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-red-400">
                    {testResults.filter(r => !r.isVerified).length}
                  </div>
                  <div className="text-sm text-neutral-400">Échecs de Vérification</div>
                </div>
                
                <div className="bg-neutral-900/30 border border-neutral-600 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-amber-400">
                    {testResults.filter(r => r.type === 'debug').length}
                  </div>
                  <div className="text-sm text-neutral-400">Tests en Mode Debug</div>
                </div>
              </div>
              
              <div className="mt-6 space-y-3">
                <h4 className="text-white font-medium">Recommandations:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-3">
                    <div className="text-blue-400 font-medium mb-1">✓ Validation Serveur</div>
                    <div className="text-neutral-300">
                      Tous les tokens sont vérifiés côté serveur via l'Edge Function
                    </div>
                  </div>
                  
                  <div className="bg-green-900/20 border border-green-700/50 rounded-lg p-3">
                    <div className="text-green-400 font-medium mb-1">✓ Logs Détaillés</div>
                    <div className="text-neutral-300">
                      Surveillance complète avec scores et timestamps
                    </div>
                  </div>
                  
                  <div className="bg-purple-900/20 border border-purple-700/50 rounded-lg p-3">
                    <div className="text-purple-400 font-medium mb-1">✓ Mode Debug</div>
                    <div className="text-neutral-300">
                      Interface de test pour détecter les comportements anormaux
                    </div>
                  </div>
                  
                  <div className="bg-amber-900/20 border border-amber-700/50 rounded-lg p-3">
                    <div className="text-amber-400 font-medium mb-1">✓ Validation Stricte</div>
                    <div className="text-neutral-300">
                      Vérification des scores et délais d'expiration
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default RecaptchaAdvancedTest;