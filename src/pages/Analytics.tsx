import { AnalyticsDashboard } from '@/components/analytics/AnalyticsDashboard';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import SEO from '@/components/SEO';

const Analytics = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
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