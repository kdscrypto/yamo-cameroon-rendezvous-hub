
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle, Clock } from 'lucide-react';

interface PasswordResetStatusProps {
  isLoading?: boolean;
  isError?: boolean;
}

export const PasswordResetStatus = ({ isLoading, isError }: PasswordResetStatusProps) => {
  if (isLoading) {
    return (
      <Card className="w-full max-w-md bg-card border-border">
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold mb-2">Vérification en cours...</h3>
            <p className="text-muted-foreground">
              Validation du lien de réinitialisation de votre mot de passe.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card className="w-full max-w-md bg-card border-border">
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <AlertCircle className="h-12 w-12 text-destructive" />
            </div>
            <h3 className="text-lg font-semibold mb-2 text-destructive">Lien invalide</h3>
            <p className="text-muted-foreground mb-4">
              Le lien de réinitialisation est invalide ou a expiré.
            </p>
            <div className="flex items-center justify-center text-sm text-muted-foreground">
              <Clock className="h-4 w-4 mr-1" />
              <span>Redirection automatique dans quelques secondes...</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
};
