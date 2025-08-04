
import { useReferralData } from './hooks/useReferralData';
import ReferralCodeSection from './ReferralCodeSection';
import ReferralStats from './ReferralStats';
import ReferralHowItWorks from './ReferralHowItWorks';
import ReferralLoadingState from './ReferralLoadingState';
import { ReferralErrorBoundary } from './ReferralErrorBoundary';
import { ReferralPerformanceMonitor } from './ReferralPerformanceMonitor';
import { ReferralAnalytics } from './ReferralAnalytics';

const ReferralDashboard = () => {
  const { referralCode, stats, loading, refetch } = useReferralData();

  if (loading) {
    return <ReferralLoadingState />;
  }

  return (
    <ReferralErrorBoundary>
      <ReferralPerformanceMonitor />
      <div className="space-y-6">
        <ReferralCodeSection 
          referralCode={referralCode} 
          loading={loading}
          onRefresh={refetch}
        />
        <ReferralStats stats={stats} />
        <ReferralAnalytics className="mt-6" />
        <ReferralHowItWorks />
      </div>
    </ReferralErrorBoundary>
  );
};

export default ReferralDashboard;
