
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Clock, CheckCircle } from 'lucide-react';

interface UnifiedPasswordResetFormProps {
  onSubmit: (password: string, confirmPassword: string) => Promise<boolean>;
  onRequestNewLink: () => void;
  isLoading: boolean;
  isValidLink: boolean | null;
  isCheckingLink: boolean;
}

export const UnifiedPasswordResetForm = ({ 
  onSubmit, 
  onRequestNewLink, 
  isLoading, 
  isValidLink, 
  isCheckingLink 
}: UnifiedPasswordResetFormProps) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('UnifiedPasswordResetForm: Form submitted');
    const success = await onSubmit(password, confirmPassword);
    
    if (success) {
      setPassword('');
      setConfirmPassword('');
    }
  };

  // État de vérification du lien
  if (isCheckingLink) {
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

  // Lien invalide
  if (isValidLink === false) {
    return (
      <Card className="w-full max-w-md bg-card border-border">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-destructive/10 rounded-lg flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-destructive" />
            </div>
          </div>
          <CardTitle className="text-2xl text-destructive">Lien invalide</CardTitle>
          <CardDescription className="text-muted-foreground">
            Le lien de réinitialisation est invalide ou a expiré.
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center text-sm text-muted-foreground mb-4">
              <Clock className="h-4 w-4 mr-2" />
              <span>Les liens de réinitialisation expirent après un certain temps</span>
            </div>
            
            <Button 
              onClick={onRequestNewLink}
              className="w-full gradient-gold text-black hover:opacity-90"
            >
              Demander un nouveau lien
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Formulaire de réinitialisation (lien valide)
  return (
    <Card className="w-full max-w-md bg-card border-border">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <div className="w-12 h-12 gradient-gold rounded-lg flex items-center justify-center">
            <span className="text-black font-bold text-xl">Y</span>
          </div>
        </div>
        <CardTitle className="text-2xl text-foreground">Nouveau mot de passe</CardTitle>
        <CardDescription className="text-muted-foreground">
          Choisissez un nouveau mot de passe sécurisé
        </CardDescription>
        <div className="flex items-center justify-center text-sm text-green-600 mt-2">
          <CheckCircle className="h-4 w-4 mr-1" />
          <span>Lien de réinitialisation validé</span>
        </div>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password" className="text-foreground">Nouveau mot de passe</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
              className="bg-background border-border focus:ring-2 focus:ring-primary focus:border-transparent"
              minLength={6}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-foreground">Confirmer le mot de passe</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={isLoading}
              className="bg-background border-border focus:ring-2 focus:ring-primary focus:border-transparent"
              minLength={6}
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full gradient-gold text-black hover:opacity-90"
            disabled={isLoading || !password || !confirmPassword}
          >
            {isLoading ? 'Mise à jour...' : 'Mettre à jour le mot de passe'}
          </Button>

          <div className="text-center pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={onRequestNewLink}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Demander un nouveau lien
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
