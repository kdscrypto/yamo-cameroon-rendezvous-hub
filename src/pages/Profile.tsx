
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const Profile = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <p>Chargement...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const getUserDisplayName = () => {
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name;
    }
    return user?.email?.split('@')[0] || 'Utilisateur';
  };

  const getUserInitials = () => {
    const name = getUserDisplayName();
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <div className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Mon profil</CardTitle>
              <CardDescription>
                Gérez vos informations personnelles
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <div className="flex items-center space-x-4 mb-6">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={user.user_metadata?.avatar_url} />
                  <AvatarFallback className="text-lg">{getUserInitials()}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-semibold">{getUserDisplayName()}</h3>
                  <p className="text-muted-foreground">{user.email}</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Nom complet</label>
                  <p className="text-sm text-muted-foreground">
                    {user.user_metadata?.full_name || 'Non renseigné'}
                  </p>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Membre depuis</label>
                  <p className="text-sm text-muted-foreground">
                    {new Date(user.created_at).toLocaleDateString('fr-FR')}
                  </p>
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

export default Profile;
