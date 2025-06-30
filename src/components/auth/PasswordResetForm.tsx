
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface PasswordResetFormProps {
  onSubmit: (password: string, confirmPassword: string) => Promise<boolean>;
  isLoading: boolean;
}

export const PasswordResetForm = ({ onSubmit, isLoading }: PasswordResetFormProps) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Call the onSubmit function which handles all the logic
    const success = await onSubmit(password, confirmPassword);
    
    // Clear form only if successful
    if (success) {
      setPassword('');
      setConfirmPassword('');
    }
  };

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
        </form>
      </CardContent>
    </Card>
  );
};
