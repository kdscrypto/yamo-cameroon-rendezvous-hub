
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { User } from 'lucide-react';

interface AdPreviewSectionProps {
  ad: any;
}

const AdPreviewSection = ({ ad }: AdPreviewSectionProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 border border-green-200 dark:border-green-800';
      case 'rejected': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 border border-red-200 dark:border-red-800';
      default: return 'bg-muted text-foreground border border-border';
    }
  };

  const getCategoryDisplay = (category: string) => {
    const categories: { [key: string]: string } = {
      'rencontres': 'Rencontres',
      'massages': 'Massages',
      'produits': 'Produits adultes'
    };
    return categories[category] || category;
  };

  const getLocationDisplay = (location: string) => {
    const locations: { [key: string]: string } = {
      'douala': 'Douala',
      'yaounde': 'Yaoundé',
      'bafoussam': 'Bafoussam',
      'bamenda': 'Bamenda',
      'garoua': 'Garoua',
      'maroua': 'Maroua',
      'ngaoundere': 'Ngaoundéré',
      'bertoua': 'Bertoua',
      'ebolowa': 'Ebolowa',
      'kribi': 'Kribi',
      'limbe': 'Limbé',
      'buea': 'Buea',
      'edea': 'Edéa',
      'kumba': 'Kumba',
      'sangmelima': 'Sangmélima'
    };
    return locations[location] || location;
  };

  return (
    <div className="space-y-4 bg-card border border-border rounded-lg p-4">
      <div className="flex justify-between items-start">
        <h3 className="text-hierarchy-secondary">{ad.title}</h3>
        <Badge className={getStatusColor(ad.moderation_status)}>
          {ad.moderation_status === 'pending' ? 'En attente' :
           ad.moderation_status === 'approved' ? 'Approuvée' : 'Rejetée'}
        </Badge>
      </div>

      <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-md">
        <p className="text-white font-medium">{getCategoryDisplay(ad.category)} • {getLocationDisplay(ad.location)}</p>
        <p className="text-white">Créée le {new Date(ad.created_at).toLocaleDateString('fr-FR')}</p>
        {ad.price && <p className="text-hierarchy-tertiary text-lg font-semibold mt-2">{ad.price} FCFA</p>}
      </div>

      <div className="space-y-2">
        <Label className="text-white font-medium">Description</Label>
        <div className="p-3 bg-muted/50 border border-border rounded-md max-h-32 overflow-y-auto">
          <p className="text-sm text-white whitespace-pre-wrap">{ad.description}</p>
        </div>
      </div>

      {ad.images && ad.images.length > 0 ? (
        <div className="space-y-2">
          <Label className="text-white font-medium">Images ({ad.images.length})</Label>
          <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto border border-border rounded-md p-2 bg-muted/30">
            {ad.images.map((imageUrl: string, index: number) => (
              <div key={index} className="aspect-square bg-muted border border-border rounded-lg overflow-hidden">
                <img 
                  src={imageUrl} 
                  alt={`Image ${index + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <Label className="text-white font-medium">Images</Label>
          <div className="aspect-video bg-muted/30 border border-border rounded-lg flex items-center justify-center">
            <div className="text-center">
              <User className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-white">Aucune image</p>
            </div>
          </div>
        </div>
      )}

      {ad.moderation_notes && (
        <div className="space-y-2">
          <Label className="text-red-400 text-lg font-semibold">Notes de modération précédentes</Label>
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
            <p className="text-sm text-red-300 text-enhanced-contrast font-medium">{ad.moderation_notes}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdPreviewSection;
