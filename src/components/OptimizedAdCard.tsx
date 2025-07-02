
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

// Enhanced lazy image component with improved loading states
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
      <div className={`bg-muted/30 flex items-center justify-center border border-border/30 ${className}`}>
        <span className="text-muted-foreground text-xs font-medium">Pas d'image</span>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {!isLoaded && (
        <div className="absolute inset-0 bg-gradient-to-r from-muted/20 via-muted/40 to-muted/20 animate-modern-shimmer" />
      )}
      <img
        src={src}
        alt={alt}
        className={`w-full h-full object-cover transition-all duration-500 ease-out ${
          isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
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
      className="group card-elevated bg-card/98 backdrop-blur-sm border-border/40 hover:border-primary/30 transition-all duration-300 hover:shadow-medium hover:shadow-primary/10 cursor-pointer transform hover:scale-[1.02] active:scale-[0.98]"
      onClick={handleClick}
    >
      <div className="relative aspect-square overflow-hidden rounded-t-lg">
        <LazyImage
          src={imageUrl}
          alt={title}
          className="aspect-square group-hover:scale-110 transition-transform duration-500 ease-out"
        />
        
        {isVip && (
          <div className="absolute top-3 right-3 z-10">
            <Badge className="gradient-luxe text-black font-bold shadow-strong flex items-center gap-1.5 px-3 py-1.5 animate-pulse-subtle">
              <Star className="w-3.5 h-3.5 fill-current" />
              VIP
            </Badge>
          </div>
        )}
        
        {price && (
          <div className="absolute bottom-3 left-3 z-10">
            <div className="bg-background/95 backdrop-blur-md text-primary font-bold text-sm px-3 py-2 rounded-lg shadow-medium border border-border/30 animate-fade-in">
              {price}
            </div>
          </div>
        )}

        {/* Overlay gradient for better readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
      
      <CardContent className="p-4 space-y-3">
        <div className="space-y-2.5">
          <h3 className="font-semibold text-sm line-clamp-2 text-foreground group-hover:text-primary transition-colors duration-300 leading-snug">
            {title}
          </h3>
          
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed opacity-80 group-hover:opacity-100 transition-opacity duration-300">
            {truncatedDescription}
          </p>
        </div>
        
        <div className="flex items-center justify-between pt-2 border-t border-border/20">          
          <div className="flex items-center text-xs text-muted-foreground group-hover:text-foreground transition-colors duration-300">
            <MapPin className="w-3.5 h-3.5 mr-1.5 opacity-60 group-hover:opacity-100 transition-opacity duration-300" />
            <span className="truncate max-w-20 font-medium">
              {location}
            </span>
          </div>
          
          <Badge variant="secondary" className="text-xs font-medium bg-secondary/70 hover:bg-secondary/90 border-border/40 group-hover:border-primary/30 transition-all duration-300">
            {category}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
});

OptimizedAdCard.displayName = 'OptimizedAdCard';

export default OptimizedAdCard;
