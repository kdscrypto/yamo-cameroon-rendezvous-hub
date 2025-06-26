
import { Card, CardContent } from '@/components/ui/card';
import { Clock } from 'lucide-react';
import AdCard from './AdCard';

interface AdsListProps {
  ads: any[] | undefined;
  isLoading: boolean;
  showQuickActions?: boolean;
  onViewAd: (ad: any) => void;
  onQuickApprove?: (ad: any) => void;
  onQuickReject?: (ad: any) => void;
  isApproving?: boolean;
  isRejecting?: boolean;
  emptyMessage: string;
  emptyIcon?: React.ReactNode;
}

const AdsList = ({ 
  ads, 
  isLoading, 
  showQuickActions = false, 
  onViewAd, 
  onQuickApprove, 
  onQuickReject,
  isApproving = false,
  isRejecting = false,
  emptyMessage,
  emptyIcon
}: AdsListProps) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <div className="h-4 bg-muted rounded animate-pulse mb-2" />
              <div className="h-3 bg-muted rounded animate-pulse w-2/3 mb-4" />
              <div className="h-20 bg-muted rounded animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!ads || ads.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          {emptyIcon || <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />}
          <p className="text-muted-foreground">{emptyMessage}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {ads.map((ad) => (
        <AdCard 
          key={ad.id} 
          ad={ad} 
          showQuickActions={showQuickActions}
          onViewAd={onViewAd}
          onQuickApprove={onQuickApprove}
          onQuickReject={onQuickReject}
          isApproving={isApproving}
          isRejecting={isRejecting}
        />
      ))}
    </div>
  );
};

export default AdsList;
