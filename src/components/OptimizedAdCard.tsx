
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

// Enhanced lazy image component with better loading states
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
      <div className={`bg-muted/50 flex items-center justify-center border border-border/50 ${className}`}>
        <span className="text-muted-foreground text-xs font-medium">Pas d'image</span>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {!isLoaded && (
        <div className="absolute inset-0 bg-muted/50 animate-pulse border border-border/50" />
      )}
      <img
        src={src}
        alt={alt}
        className={`w-full h-full object-cover transition-all duration-300 ${
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
      className="group card-interactive bg-card/95 backdrop-blur-sm border-border/50 hover:border-border transition-all duration-300 hover:shadow-lg hover:shadow-primary/5"
      onClick={handleClick}
    >
      <div className="relative aspect-square overflow-hidden rounded-t-xl">
        <LazyImage
          src={imageUrl}
          alt={title}
          className="aspect-square group-hover:scale-105 transition-transform duration-300 ease-out"
        />
        
        {isVip && (
          <div className="absolute top-3 right-3">
            <Badge className="gradient-gold text-black font-semibold shadow-lg flex items-center gap-1.5 px-3 py-1">
              <Star className="w-3 h-3 fill-current" />
              VIP
            </Badge>
          </div>
        )}
        
        {price && (
          <div className="absolute bottom-3 left-3">
            <div className="bg-background/90 backdrop-blur-sm text-primary font-bold text-sm px-3 py-1.5 rounded-lg shadow-md border border-border/20">
              {price}
            </div>
          </div>
        )}
      </div>
      
      <CardContent className="p-4 space-y-3">
        <div className="space-y-2">
          <h3 className="font-semibold text-sm line-clamp-2 text-foreground group-hover:text-primary transition-colors duration-200 leading-snug">
            {title}
          </h3>
          
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            {truncatedDescription}
          </p>
        </div>
        
        <div className="flex items-center justify-between pt-1">          
          <div className="flex items-center text-xs text-muted-foreground">
            <MapPin className="w-3 h-3 mr-1.5 opacity-70" />
            <span className="truncate max-w-20 font-medium">
              {location}
            </span>
          </div>
          
          <Badge variant="secondary" className="text-xs font-medium bg-secondary/80 hover:bg-secondary border-border/30">
            {category}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
});

OptimizedAdCard.displayName = 'OptimizedAdCard';

export default OptimizedAdCard;
