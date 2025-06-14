
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useEffect } from 'react';

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    acceptTerms: false,
    isAdult: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const { signUp, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Redirect if user is already logged in
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Erreur",
        description: "Les mots de passe ne correspondent pas.",
        variant: "destructive"
      });
      return;
    }

    if (!formData.acceptTerms || !formData.isAdult) {
      toast({
        title: "Erreur",
        description: "Vous devez accepter les conditions et certifier avoir plus de 18 ans.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await signUp(formData.email, formData.password, formData.fullName);

      if (error) {
        if (error.message.includes('already registered')) {
          toast({
            title: "Compte existant",
            description: "Cette adresse email est déjà utilisée. Essayez de vous connecter.",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Erreur d'inscription",
            description: error.message,
            variant: "destructive"
          });
        }
      } else {
        toast({
          title: "Inscription réussie",
          description: "Vérifiez votre email pour confirmer votre compte."
        });
        navigate('/login');
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur inattendue s'est produite.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 gradient-gold rounded-lg flex items-center justify-center">
                <span className="text-black font-bold text-xl">Y</span>
              </div>
            </div>
            <CardTitle className="text-2xl">Inscription</CardTitle>
            <CardDescription>
              Créez votre compte Yamo
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Nom complet</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Votre nom complet"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="votre@email.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="isAdult"
                    checked={formData.isAdult}
                    onCheckedChange={(checked) => handleInputChange('isAdult', checked)}
                    disabled={isLoading}
                  />
                  <Label htmlFor="isAdult" className="text-sm">
                    Je certifie avoir plus de 18 ans
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="acceptTerms"
                    checked={formData.acceptTerms}
                    onCheckedChange={(checked) => handleInputChange('acceptTerms', checked)}
                    disabled={isLoading}
                  />
                  <Label htmlFor="acceptTerms" className="text-sm">
                    J'accepte les{' '}
                    <Link to="/terms" className="text-primary hover:underline">
                      conditions d'utilisation
                    </Link>
                  </Label>
                </div>
              </div>
              
              <Button 
                type="submit" 
                className="w-full"
                disabled={!formData.acceptTerms || !formData.isAdult || isLoading}
              >
                {isLoading ? 'Inscription...' : "S'inscrire"}
              </Button>
            </form>
            
            <div className="mt-6 text-center">
              <div className="text-sm text-muted-foreground">
                Déjà un compte ?{' '}
                <Link to="/login" className="text-primary hover:underline">
                  Se connecter
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Footer />
    </div>
  );
};

export default Register;
