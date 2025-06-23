
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, Phone, MessageSquare, Star } from 'lucide-react';

interface AdPreviewProps {
  formData: {
    title: string;
    description: string;
    category: string;
    location: string;
    price: string;
    phone: string;
    whatsapp: string;
    vipOption: string;
    photos: File[];
  };
  onWhatsAppClick: (number: string) => void;
}

const AdPreview = ({ formData, onWhatsAppClick }: AdPreviewProps) => {
  const isVip = formData.vipOption !== 'standard';
  
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
    <Card className="group hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 overflow-hidden bg-card border-border max-w-sm mx-auto">
      {isVip && (
        <div className="gradient-gold text-black text-xs font-bold px-2 py-1 text-center">
          ⭐ ANNONCE VIP
        </div>
      )}
      
      <div className="aspect-video bg-muted relative overflow-hidden">
        {formData.photos.length > 0 ? (
          <div className="relative w-full h-full">
            <img 
              src={URL.createObjectURL(formData.photos[0])} 
              alt={formData.title}
              className="w-full h-full object-cover"
            />
            {formData.photos.length > 1 && (
              <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                +{formData.photos.length - 1} photos
              </div>
            )}
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <User className="w-16 h-16 text-muted-foreground" />
          </div>
        )}
      </div>

      <CardContent className="p-4">
        <div className="mb-2">
          <span className="text-xs px-2 py-1 bg-primary/20 text-primary rounded-full">
            {getCategoryDisplay(formData.category)}
          </span>
        </div>
        
        <h3 className="font-semibold text-lg mb-2 line-clamp-2">
          {formData.title}
        </h3>
        
        <p className="text-muted-foreground text-sm mb-3 line-clamp-3">
          {formData.description}
        </p>
        
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm text-muted-foreground">
            {getLocationDisplay(formData.location)}
          </span>
          {formData.price && (
            <span className="font-bold text-primary">{formData.price} FCFA</span>
          )}
        </div>

        {/* Contact buttons */}
        <div className="space-y-2">
          <Button 
            size="sm" 
            className="w-full"
            onClick={() => window.open(`tel:${formData.phone}`, '_self')}
          >
            <Phone className="w-4 h-4 mr-2" />
            Appeler
          </Button>
          
          {formData.whatsapp && (
            <Button 
              size="sm" 
              variant="outline" 
              className="w-full border-green-500 text-green-600 hover:bg-green-50"
              onClick={() => onWhatsAppClick(formData.whatsapp)}
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              WhatsApp
            </Button>
          )}
          
          <Button 
            size="sm" 
            variant="outline" 
            className="w-full"
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            Message privé
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdPreview;
