
import AdModerationModal from './AdModerationModal';
import ModerationHeader from './ModerationHeader';
import QuickModerationDialog from './QuickModerationDialog';
import ModerationTabs from './ModerationTabs';
import { useModerationData } from './useModerationData';
import { useModerationHandlers } from './useModerationHandlers';
import { useModerationRealtime } from './useModerationRealtime';
import AnalyticsDashboard from '@/components/analytics/AnalyticsDashboard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ModerationDashboardProps {
  userRole: 'moderator' | 'admin';
}

const ModerationDashboard = ({ userRole }: ModerationDashboardProps) => {
  // Set up real-time subscription
  useModerationRealtime();

  // Fetch moderation data
  const {
    pendingAds,
    moderatedAds,
    moderationStats,
    pendingLoading,
    moderatedLoading
  } = useModerationData();

  // Handle moderation actions
  const {
    selectedAd,
    isModalOpen,
    setIsModalOpen,
    quickModerationAd,
    quickModerationAction,
    isQuickDialogOpen,
    setIsQuickDialogOpen,
    quickApproveMutation,
    quickRejectMutation,
    handleViewAd,
    handleQuickApprove,
    handleQuickReject,
    handleQuickModerationConfirm,
    handleModerationComplete
  } = useModerationHandlers();

  return (
    <div className="space-y-6">
      <ModerationHeader userRole={userRole} stats={moderationStats} />

      <Tabs defaultValue="moderation" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="moderation">Modération</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="moderation" className="space-y-6">
          <ModerationTabs
            pendingAds={pendingAds}
            moderatedAds={moderatedAds}
            pendingLoading={pendingLoading}
            moderatedLoading={moderatedLoading}
            onViewAd={handleViewAd}
            onQuickApprove={handleQuickApprove}
            onQuickReject={handleQuickReject}
            isApproving={quickApproveMutation.isPending}
            isRejecting={quickRejectMutation.isPending}
          />
        </TabsContent>
        
        <TabsContent value="analytics" className="space-y-6">
          <AnalyticsDashboard />
        </TabsContent>
      </Tabs>

      <AdModerationModal
        ad={selectedAd}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onModerationComplete={handleModerationComplete}
      />

      <QuickModerationDialog
        ad={quickModerationAd}
        action={quickModerationAction}
        open={isQuickDialogOpen}
        onOpenChange={setIsQuickDialogOpen}
        onConfirm={handleQuickModerationConfirm}
        isSubmitting={quickApproveMutation.isPending || quickRejectMutation.isPending}
      />
    </div>
  );
};

export default ModerationDashboard;
