
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Star, User } from 'lucide-react';

interface AdImageGalleryProps {
  images: string[] | null;
  title: string;
  isVip: boolean;
}

const AdImageGallery = ({ images, title, isVip }: AdImageGalleryProps) => {
  return (
    <div className="space-y-4">
      <div className="aspect-video bg-muted relative overflow-hidden rounded-lg">
        {images && images.length > 0 ? (
          <img 
            src={images[0]} 
            alt={title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted/20 to-muted/40">
            <User className="w-16 h-16 text-muted-foreground opacity-50" />
          </div>
        )}
        
        {isVip && (
          <div className="absolute top-4 right-4">
            <Badge className="bg-gradient-to-r from-orange-500 to-yellow-500 text-black font-bold shadow-lg flex items-center gap-1">
              <Star className="w-4 h-4 fill-current" />
              VIP
            </Badge>
          </div>
        )}
      </div>
      
      {images && images.length > 1 && (
        <div className="grid grid-cols-4 gap-2">
          {images.slice(1, 5).map((image, index) => (
            <div key={index} className="aspect-square bg-muted rounded overflow-hidden">
              <img 
                src={image} 
                alt={`${title} - Image ${index + 2}`}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdImageGallery;
