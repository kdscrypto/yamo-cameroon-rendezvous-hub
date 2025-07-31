
import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Star, User, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AdImageGalleryProps {
  images: string[] | null;
  title: string;
  isVip: boolean;
}

const AdImageGallery = ({ images, title, isVip }: AdImageGalleryProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const hasImages = images && images.length > 0;
  const hasMultipleImages = images && images.length > 1;
  
  const nextImage = () => {
    if (images && currentImageIndex < images.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
    }
  };
  
  const prevImage = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
    }
  };
  
  const goToImage = (index: number) => {
    setCurrentImageIndex(index);
  };

  return (
    <div className="space-y-4">
      <div className="aspect-video bg-muted relative overflow-hidden rounded-lg group">
        {hasImages ? (
          <>
            <img 
              src={images[currentImageIndex]} 
              alt={`${title} - Image ${currentImageIndex + 1}`}
              className="w-full h-full object-cover transition-opacity duration-300"
            />
            
            {/* Navigation buttons for multiple images */}
            {hasMultipleImages && (
              <>
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute left-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-background/80 backdrop-blur-sm border-primary/20 hover:border-primary hover:bg-primary/10"
                  onClick={prevImage}
                  disabled={currentImageIndex === 0}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-background/80 backdrop-blur-sm border-primary/20 hover:border-primary hover:bg-primary/10"
                  onClick={nextImage}
                  disabled={currentImageIndex === images.length - 1}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
                
                {/* Image counter */}
                <div className="absolute bottom-4 right-4 bg-background/80 backdrop-blur-sm px-3 py-1 rounded-full text-sm text-foreground border border-primary/20">
                  {currentImageIndex + 1} / {images.length}
                </div>
              </>
            )}
          </>
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
      
      {/* Thumbnail navigation */}
      {hasMultipleImages && (
        <div className="grid grid-cols-5 gap-2">
          {images.slice(0, 5).map((image, index) => (
            <button
              key={index}
              onClick={() => goToImage(index)}
              className={`aspect-square bg-muted rounded overflow-hidden border-2 transition-all duration-200 ${
                currentImageIndex === index 
                  ? 'border-primary shadow-lg scale-105' 
                  : 'border-transparent hover:border-primary/50'
              }`}
            >
              <img 
                src={image} 
                alt={`${title} - Miniature ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
          
          {/* Show "+X more" if there are more than 5 images */}
          {images.length > 5 && (
            <div className="aspect-square bg-muted/50 rounded border-2 border-dashed border-muted-foreground/30 flex items-center justify-center">
              <span className="text-xs text-muted-foreground font-medium">
                +{images.length - 5}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdImageGallery;
