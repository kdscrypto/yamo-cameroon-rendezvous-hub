import { AnalyticsDashboard } from '@/components/analytics/AnalyticsDashboard';
import { useAuth } from '@/hooks/useAuth';
import { useModerationRights } from '@/hooks/useModerationRights';
import { Navigate } from 'react-router-dom';
import SEO from '@/components/SEO';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield } from 'lucide-react';

const Analytics = () => {
  const { user, loading: authLoading } = useAuth();
  const { hasModerationRights, loading: rightsLoading } = useModerationRights();

  if (authLoading || rightsLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (hasModerationRights === false) {
    return (
      <>
        <SEO 
          title="Analytics Dashboard"
          description="Monitor your website's performance and user behavior with detailed analytics"
        />
        <div className="container mx-auto px-4 py-8">
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              Vous n'avez pas les droits d'accès requis pour consulter cette page. 
              Seuls les modérateurs et administrateurs peuvent accéder aux analyses.
            </AlertDescription>
          </Alert>
        </div>
      </>
    );
  }

  return (
    <>
      <SEO 
        title="Analytics Dashboard"
        description="Monitor your website's performance and user behavior with detailed analytics"
      />
      <div className="container mx-auto px-4 py-8">
        <AnalyticsDashboard />
      </div>
    </>
  );
};

export default Analytics;