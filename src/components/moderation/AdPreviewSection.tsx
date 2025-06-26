
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { User } from 'lucide-react';

interface AdPreviewSectionProps {
  ad: any;
}

const AdPreviewSection = ({ ad }: AdPreviewSectionProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
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
    <div className="space-y-4">
      <div className="flex justify-between items-start">
        <h3 className="text-lg font-semibold">{ad.title}</h3>
        <Badge className={getStatusColor(ad.moderation_status)}>
          {ad.moderation_status === 'pending' ? 'En attente' :
           ad.moderation_status === 'approved' ? 'Approuvée' : 'Rejetée'}
        </Badge>
      </div>

      <div className="text-sm text-muted-foreground">
        <p>{getCategoryDisplay(ad.category)} • {getLocationDisplay(ad.location)}</p>
        <p>Créée le {new Date(ad.created_at).toLocaleDateString('fr-FR')}</p>
        {ad.price && <p className="text-lg font-semibold text-primary mt-2">{ad.price} FCFA</p>}
      </div>

      <div className="space-y-2">
        <Label>Description</Label>
        <div className="p-3 bg-muted rounded-md max-h-32 overflow-y-auto">
          <p className="text-sm whitespace-pre-wrap">{ad.description}</p>
        </div>
      </div>

      {ad.images && ad.images.length > 0 ? (
        <div className="space-y-2">
          <Label>Images ({ad.images.length})</Label>
          <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
            {ad.images.map((imageUrl: string, index: number) => (
              <div key={index} className="aspect-square bg-muted rounded-lg overflow-hidden">
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
          <Label>Images</Label>
          <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
            <div className="text-center">
              <User className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Aucune image</p>
            </div>
          </div>
        </div>
      )}

      {ad.moderation_notes && (
        <div className="space-y-2">
          <Label>Notes de modération précédentes</Label>
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-sm">{ad.moderation_notes}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdPreviewSection;
