
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AdsList from './AdsList';
import WaitlistManagement from './WaitlistManagement';

interface ModerationTabsProps {
  pendingAds: any[] | undefined;
  moderatedAds: any[] | undefined;
  pendingLoading: boolean;
  moderatedLoading: boolean;
  onViewAd: (ad: any) => void;
  onQuickApprove: (ad: any) => void;
  onQuickReject: (ad: any) => void;
  isApproving: boolean;
  isRejecting: boolean;
}

const ModerationTabs = ({
  pendingAds,
  moderatedAds,
  pendingLoading,
  moderatedLoading,
  onViewAd,
  onQuickApprove,
  onQuickReject,
  isApproving,
  isRejecting
}: ModerationTabsProps) => {
  return (
    <Tabs defaultValue="pending" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="pending">
          En attente ({pendingAds?.length || 0})
        </TabsTrigger>
        <TabsTrigger value="moderated">
          Modérées
        </TabsTrigger>
        <TabsTrigger value="waitlist">
          Liste d'attente
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="pending" className="mt-6">
        <AdsList
          ads={pendingAds}
          isLoading={pendingLoading}
          showQuickActions={true}
          onViewAd={onViewAd}
          onQuickApprove={onQuickApprove}
          onQuickReject={onQuickReject}
          isApproving={isApproving}
          isRejecting={isRejecting}
          emptyMessage="Aucune annonce en attente de modération."
        />
      </TabsContent>
      
      <TabsContent value="moderated" className="mt-6">
        <AdsList
          ads={moderatedAds}
          isLoading={moderatedLoading}
          onViewAd={onViewAd}
          emptyMessage="Aucune annonce modérée récemment."
        />
      </TabsContent>

      <TabsContent value="waitlist" className="mt-6">
        <WaitlistManagement />
      </TabsContent>
    </Tabs>
  );
};

export default ModerationTabs;
