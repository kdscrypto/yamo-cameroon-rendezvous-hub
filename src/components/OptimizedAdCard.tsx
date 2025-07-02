import React, { useState, useCallback } from 'react';
import { CardOptimized, CardContent } from '@/components/ui/card-optimized';
import { Badge } from '@/components/ui/badge';
import { MapPin, Star, Eye } from 'lucide-react';
import { ButtonAccessible } from '@/components/ui/button-accessible';

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
      <div className={`bg-gradient-to-br from-muted/20 to-muted/40 flex items-center justify-center border border-border/30 ${className}`}>
        <div className="text-center space-y-2">
          <Eye className="w-8 h-8 text-muted-foreground/50 mx-auto" />
          <span className="text-muted-foreground text-xs font-medium">Pas d'image</span>
        </div>
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

  const truncatedTitle = React.useMemo(() => {
    return title.length > 50 ? `${title.substring(0, 50)}...` : title;
  }, [title]);

  const truncatedDescription = React.useMemo(() => {
    return description.length > 60 ? `${description.substring(0, 60)}...` : description;
  }, [description]);

  return (
    <CardOptimized 
      variant="interactive"
      size="sm"
      lazyLoad={true}
      interactive={true}
      onInteraction={handleClick}
      ariaLabel={`Annonce: ${truncatedTitle} - ${price || 'Prix non spécifié'} - ${location}`}
      className="group overflow-hidden h-full flex flex-col"
    >
      <div className="relative aspect-square overflow-hidden rounded-t-lg flex-shrink-0">
        <LazyImage
          src={imageUrl}
          alt={truncatedTitle}
          className="aspect-square group-hover:scale-110 transition-transform duration-500 ease-out"
        />
        
        {isVip && (
          <div className="absolute top-2 right-2 z-10">
            <Badge className="gradient-luxe text-black font-bold shadow-strong flex items-center gap-1 px-2 py-1 text-xs animate-pulse-subtle">
              <Star className="w-3 h-3 fill-current" />
              VIP
            </Badge>
          </div>
        )}
        
        {price && (
          <div className="absolute bottom-2 left-2 z-10">
            <div className="bg-background/95 backdrop-blur-md text-primary font-bold text-xs sm:text-sm px-2 py-1.5 rounded-lg shadow-medium border border-border/30 animate-fade-in">
              {price}
            </div>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
      
      <CardContent className="p-3 sm:p-4 space-y-2.5 flex-grow flex flex-col">
        <div className="space-y-2 flex-grow">
          <h3 className="font-semibold text-sm sm:text-base line-clamp-2 text-foreground group-hover:text-primary transition-colors duration-300 leading-tight">
            {truncatedTitle}
          </h3>
          
          <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 leading-relaxed opacity-80 group-hover:opacity-100 transition-opacity duration-300">
            {truncatedDescription}
          </p>
        </div>
        
        <div className="flex items-center justify-between pt-2 border-t border-border/20 mt-auto">          
          <div className="flex items-center text-xs text-muted-foreground group-hover:text-foreground transition-colors duration-300 min-w-0 flex-1">
            <MapPin className="w-3 h-3 mr-1 opacity-60 group-hover:opacity-100 transition-opacity duration-300 flex-shrink-0" />
            <span className="truncate font-medium">
              {location}
            </span>
          </div>
          
          <Badge variant="secondary" className="text-xs font-medium bg-secondary/70 hover:bg-secondary/90 border-border/40 group-hover:border-primary/30 transition-all duration-300 ml-2">
            {category}
          </Badge>
        </div>
      </CardContent>
    </CardOptimized>
  );
});

OptimizedAdCard.displayName = 'OptimizedAdCard';

export default OptimizedAdCard;
