
import React, { useState, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Star } from 'lucide-react';

interface OptimizedAdCardProps {
  id: string;
  title: string;
  description: string;
  price?: string;
  location: string;
  category: string;
  imageUrl?: string;
  isVip?: boolean;
  onClick?: () => void;
}

// Composant image avec lazy loading
const LazyImage = React.memo(({ src, alt, className }: { 
  src?: string; 
  alt: string; 
  className?: string; 
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
  }, []);

  const handleError = useCallback(() => {
    setHasError(true);
    setIsLoaded(true);
  }, []);

  if (!src || hasError) {
    return (
      <div className={`bg-muted flex items-center justify-center ${className}`}>
        <span className="text-muted-foreground text-sm">Pas d'image</span>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {!isLoaded && (
        <div className="absolute inset-0 bg-muted animate-pulse" />
      )}
      <img
        src={src}
        alt={alt}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        onLoad={handleLoad}
        onError={handleError}
        loading="lazy"
      />
    </div>
  );
});

LazyImage.displayName = 'LazyImage';

const OptimizedAdCard = React.memo(({
  id,
  title,
  description,
  price,
  location,
  category,
  imageUrl,
  isVip = false,
  onClick
}: OptimizedAdCardProps) => {
  const handleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    console.log('Card clicked for ad:', id);
    if (onClick) {
      onClick();
    } else {
      console.log('No onClick handler provided for ad:', id);
    }
  }, [onClick, id]);

  const truncatedDescription = React.useMemo(() => {
    return description.length > 80 ? `${description.substring(0, 80)}...` : description;
  }, [description]);

  return (
    <Card 
      className="group cursor-pointer hover:shadow-lg transition-all duration-200 border-border bg-card hover:scale-105"
      onClick={handleClick}
    >
      <div className="relative aspect-square overflow-hidden rounded-t-lg">
        <LazyImage
          src={imageUrl}
          alt={title}
          className="aspect-square group-hover:scale-105 transition-transform duration-200"
        />
        
        {isVip && (
          <div className="absolute top-2 right-2">
            <Badge className="gradient-gold text-black font-semibold flex items-center gap-1">
              <Star className="w-3 h-3" />
              VIP
            </Badge>
          </div>
        )}
      </div>
      
      <CardContent className="p-3">
        <div className="space-y-2">
          <h3 className="font-semibold text-sm line-clamp-2 text-foreground group-hover:text-primary transition-colors">
            {title}
          </h3>
          
          <p className="text-xs text-muted-foreground line-clamp-2">
            {truncatedDescription}
          </p>
          
          <div className="flex items-center justify-between">
            {price && (
              <span className="font-bold text-sm text-primary">
                {price}
              </span>
            )}
            
            <div className="flex items-center text-xs text-muted-foreground">
              <MapPin className="w-3 h-3 mr-1" />
              <span className="truncate max-w-20">
                {location}
              </span>
            </div>
          </div>
          
          <Badge variant="secondary" className="text-xs">
            {category}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
});

OptimizedAdCard.displayName = 'OptimizedAdCard';

export default OptimizedAdCard;
