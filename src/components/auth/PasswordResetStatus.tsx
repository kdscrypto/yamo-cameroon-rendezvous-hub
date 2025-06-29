
import { Card, CardContent } from '@/components/ui/card';

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
            <p className="text-muted-foreground">Vérification du lien de réinitialisation...</p>
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
            <p className="text-muted-foreground mb-4">
              Le lien de réinitialisation est invalide ou a expiré.
            </p>
            <p className="text-sm text-muted-foreground">
              Vous allez être redirigé vers la page de demande de réinitialisation...
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
};
