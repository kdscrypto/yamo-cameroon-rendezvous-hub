

import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ModerationDashboard from '@/components/moderation/ModerationDashboard';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const Moderation = () => {
  const { user, loading } = useAuth();

  console.log('Moderation page - User:', user);
  console.log('Moderation page - Loading:', loading);

  // Check if user has moderator or admin role
  const { data: userRole, isLoading: roleLoading, error: roleError } = useQuery({
    queryKey: ['user-role', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      console.log('Checking role for user:', user.id);
      
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .in('role', ['moderator', 'admin'])
        .single();
      
      console.log('Role query result:', { data, error });
      
      if (error) {
        console.log('No moderation role found for user:', error);
        return null;
      }
      
      return data?.role as 'moderator' | 'admin';
    },
    enabled: !!user
  });

  console.log('User role:', userRole);
  console.log('Role loading:', roleLoading);
  console.log('Role error:', roleError);

  if (loading || roleLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Chargement...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!user) {
    console.log('User not authenticated, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  if (!userRole) {
    console.log('User does not have moderation role, showing access denied');
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Accès refusé</h2>
            <p className="text-muted-foreground mb-4">
              Vous n'avez pas les permissions nécessaires pour accéder à cette page.
            </p>
            <p className="text-sm text-muted-foreground">
              Seuls les modérateurs et administrateurs peuvent accéder à cette section.
            </p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  console.log('User has moderation access, rendering dashboard');

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <div className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <ModerationDashboard userRole={userRole} />
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Moderation;

