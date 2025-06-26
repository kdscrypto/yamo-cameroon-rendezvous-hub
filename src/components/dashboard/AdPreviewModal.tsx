
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { User, Phone, MessageSquare, MapPin, Calendar, Tag } from 'lucide-react';

interface Ad {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  price?: number;
  images?: string[];
  status: string;
  moderation_status: string;
  created_at: string;
  moderation_notes?: string;
}

interface AdPreviewModalProps {
  ad: Ad | null;
  isOpen: boolean;
  onClose: () => void;
}

const AdPreviewModal = ({ ad, isOpen, onClose }: AdPreviewModalProps) => {
  if (!ad) return null;

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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Tag className="w-5 h-5" />
            Prévisualisation de l'annonce
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Image section */}
          <div className="aspect-video bg-muted relative overflow-hidden rounded-lg">
            {ad.images && ad.images.length > 0 ? (
              <div className="relative w-full h-full">
                <img 
                  src={ad.images[0]} 
                  alt={ad.title}
                  className="w-full h-full object-cover"
                />
                {ad.images.length > 1 && (
                  <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                    +{ad.images.length - 1} photos
                  </div>
                )}
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <User className="w-16 h-16 text-muted-foreground" />
              </div>
            )}
          </div>

          {/* Title and badges */}
          <div>
            <div className="flex flex-wrap gap-2 mb-3">
              <Badge variant="outline" className="text-primary">
                {getCategoryDisplay(ad.category)}
              </Badge>
              <Badge 
                className={
                  ad.moderation_status === 'pending' 
                    ? 'bg-yellow-100 text-yellow-800' 
                    : ad.moderation_status === 'approved'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }
              >
                {ad.moderation_status === 'pending' ? 'En attente' : 
                 ad.moderation_status === 'approved' ? 'Approuvée' : 'Rejetée'}
              </Badge>
            </div>
            
            <h2 className="text-2xl font-bold mb-2">{ad.title}</h2>
            
            <div className="flex items-center gap-4 text-muted-foreground text-sm mb-4">
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {getLocationDisplay(ad.location)}
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {new Date(ad.created_at).toLocaleDateString('fr-FR')}
              </div>
            </div>

            {ad.price && (
              <div className="text-2xl font-bold text-primary mb-4">
                {ad.price} FCFA
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <h3 className="font-semibold mb-2">Description</h3>
            <p className="text-muted-foreground whitespace-pre-wrap">
              {ad.description}
            </p>
          </div>

          {/* Moderation notes if any */}
          {ad.moderation_notes && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h3 className="font-semibold text-yellow-800 mb-2">Notes de modération</h3>
              <p className="text-yellow-700 text-sm">{ad.moderation_notes}</p>
            </div>
          )}

          {/* Contact simulation (preview only) */}
          <div className="border-t pt-4">
            <h3 className="font-semibold mb-3">Actions de contact (prévisualisation)</h3>
            <div className="space-y-2">
              <Button size="sm" className="w-full" disabled>
                <Phone className="w-4 h-4 mr-2" />
                Appeler (prévisualisation)
              </Button>
              
              <Button size="sm" variant="outline" className="w-full" disabled>
                <MessageSquare className="w-4 h-4 mr-2" />
                WhatsApp (prévisualisation)
              </Button>
              
              <Button size="sm" variant="outline" className="w-full" disabled>
                <MessageSquare className="w-4 h-4 mr-2" />
                Message privé (prévisualisation)
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AdPreviewModal;
