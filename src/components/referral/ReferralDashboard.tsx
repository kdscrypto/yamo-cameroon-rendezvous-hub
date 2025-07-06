
import { useReferralData } from './hooks/useReferralData';
import ReferralCodeSection from './ReferralCodeSection';
import ReferralStats from './ReferralStats';
import ReferralHowItWorks from './ReferralHowItWorks';
import ReferralLoadingState from './ReferralLoadingState';

const ReferralDashboard = () => {
  const { referralCode, stats, loading } = useReferralData();

  if (loading) {
    return <ReferralLoadingState />;
  }

  return (
    <div className="space-y-6">
      <ReferralCodeSection referralCode={referralCode} />
      <ReferralStats stats={stats} />
      <ReferralHowItWorks />
    </div>
  );
};

export default ReferralDashboard;
