import { useAuth } from '@/hooks/useAuth';
import { useModerationRights } from '@/hooks/useModerationRights';
import { Navigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { AdvancedAnalyticsDashboard } from '@/components/analytics/AdvancedAnalyticsDashboard';
import SEO from '@/components/SEO';

const Analytics = () => {
  const { user, loading } = useAuth();
  const { hasModerationRights } = useModerationRights();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Redirect non-authenticated users to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Redirect non-moderators to dashboard (you can adjust this restriction)
  if (!hasModerationRights) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="Analytique Avancée - Yamo"
        description="Tableau de bord analytique complet avec métriques de performance, intelligence business et surveillance de scalabilité"
      />
      <Header />
      <main className="container mx-auto px-4 py-8">
        <AdvancedAnalyticsDashboard />
      </main>
      <Footer />
    </div>
  );
};

export default Analytics;