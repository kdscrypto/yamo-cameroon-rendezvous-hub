import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { securityMonitor } from '@/utils/productionMonitoring';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  errorId?: string;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to security monitor
    const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    securityMonitor.logSecurityEvent({
      type: 'application_error',
      severity: 'high',
      data: {
        error: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        errorId,
        url: window.location.href,
        userAgent: navigator.userAgent
      }
    });

    this.setState({
      error,
      errorInfo,
      errorId
    });

    console.error('Application Error Boundary caught an error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
          <Card className="max-w-lg w-full">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-3 rounded-full bg-destructive/10">
                <AlertTriangle className="h-8 w-8 text-destructive" />
              </div>
              <CardTitle className="text-xl">Une erreur inattendue s'est produite</CardTitle>
              <CardDescription>
                Nous nous excusons pour ce désagrément. L'erreur a été automatiquement signalée à notre équipe.
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="text-sm bg-muted p-3 rounded-md">
                  <details>
                    <summary className="cursor-pointer font-medium">Détails de l'erreur (dev)</summary>
                    <div className="mt-2 text-xs">
                      <p><strong>Message:</strong> {this.state.error.message}</p>
                      {this.state.errorId && (
                        <p><strong>ID:</strong> {this.state.errorId}</p>
                      )}
                      {this.state.error.stack && (
                        <pre className="mt-2 whitespace-pre-wrap break-all">
                          {this.state.error.stack}
                        </pre>
                      )}
                    </div>
                  </details>
                </div>
              )}
              
              <div className="text-sm text-muted-foreground text-center">
                {this.state.errorId && (
                  <p>ID de l'erreur: <code className="text-xs">{this.state.errorId}</code></p>
                )}
                <p>Si le problème persiste, contactez notre support avec cet ID.</p>
              </div>
            </CardContent>

            <CardFooter className="flex gap-3">
              <Button 
                onClick={this.handleReload} 
                className="flex-1"
                variant="default"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Recharger la page
              </Button>
              <Button 
                onClick={this.handleHome} 
                variant="outline"
                className="flex-1"
              >
                <Home className="w-4 h-4 mr-2" />
                Page d'accueil
              </Button>
            </CardFooter>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;