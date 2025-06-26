
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, Check, X, Clock } from 'lucide-react';

interface AdCardProps {
  ad: any;
  showQuickActions?: boolean;
  onViewAd: (ad: any) => void;
  onQuickApprove?: (ad: any) => void;
  onQuickReject?: (ad: any) => void;
  isApproving?: boolean;
  isRejecting?: boolean;
}

const AdCard = ({ 
  ad, 
  showQuickActions = false, 
  onViewAd, 
  onQuickApprove, 
  onQuickReject,
  isApproving = false,
  isRejecting = false
}: AdCardProps) => {
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', label: 'En attente', icon: Clock },
      approved: { color: 'bg-green-100 text-green-800', label: 'Approuvée', icon: Check },
      rejected: { color: 'bg-red-100 text-red-800', label: 'Rejetée', icon: X }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;
    
    return (
      <Badge className={config.color}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  return (
    <Card className="mb-4">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{ad.title}</CardTitle>
            <CardDescription>
              {ad.category} • {ad.location} • {new Date(ad.created_at).toLocaleDateString('fr-FR')}
            </CardDescription>
          </div>
          {getStatusBadge(ad.moderation_status)}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {ad.description}
        </p>
        {ad.price && (
          <p className="text-lg font-semibold text-primary mb-4">
            {ad.price} FCFA
          </p>
        )}
        {ad.moderated_at && (
          <p className="text-xs text-muted-foreground mb-4">
            Modéré le {new Date(ad.moderated_at).toLocaleDateString('fr-FR')}
          </p>
        )}
        {ad.moderation_notes && (
          <p className="text-sm bg-muted p-2 rounded mb-4">
            <strong>Notes:</strong> {ad.moderation_notes}
          </p>
        )}
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => onViewAd(ad)}>
            <Eye className="w-4 h-4 mr-2" />
            Examiner
          </Button>
          {showQuickActions && onQuickApprove && onQuickReject && (
            <>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => onQuickApprove(ad)}
                disabled={isApproving}
                className="text-green-600 hover:text-green-700"
              >
                <Check className="w-4 h-4 mr-2" />
                {isApproving ? 'En cours...' : 'Approuver'}
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => onQuickReject(ad)}
                disabled={isRejecting}
                className="text-red-600 hover:text-red-700"
              >
                <X className="w-4 h-4 mr-2" />
                {isRejecting ? 'En cours...' : 'Rejeter'}
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AdCard;
