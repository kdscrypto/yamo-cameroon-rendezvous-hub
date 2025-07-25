
import React from 'react';
import { MapPin, Star, ImageIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

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

const OptimizedAdCard = React.memo(({ 
  title, 
  description, 
  price, 
  location, 
  category, 
  imageUrl, 
  isVip = false,
  onClick 
}: OptimizedAdCardProps) => {
  return (
    <Card 
      className="group relative overflow-hidden transition-all duration-300 hover:shadow-lg cursor-pointer bg-card border-border/40 h-full"
      onClick={onClick}
    >
      <div className="relative">
        {imageUrl ? (
          <div className="aspect-[5/4] sm:aspect-[4/3] overflow-hidden bg-muted">
            <img 
              src={imageUrl} 
              alt={title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                target.nextElementSibling?.classList.remove('hidden');
              }}
            />
            <div className="hidden aspect-[5/4] sm:aspect-[4/3] bg-muted flex items-center justify-center">
              <ImageIcon className="w-6 h-6 sm:w-8 sm:h-8 text-muted-foreground" />
            </div>
          </div>
        ) : (
          <div className="aspect-[5/4] sm:aspect-[4/3] bg-muted flex items-center justify-center">
            <ImageIcon className="w-6 h-6 sm:w-8 sm:h-8 text-muted-foreground" />
          </div>
        )}
        
        {isVip && (
          <Badge 
            variant="secondary" 
            className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-semibold shadow-lg text-xs"
          >
            VIP
          </Badge>
        )}
      </div>

      <CardContent className="p-2 sm:p-3 space-y-1.5 sm:space-y-2">
        <div className="space-y-0.5 sm:space-y-1">
          <h3 className="font-semibold text-xs sm:text-sm leading-tight line-clamp-2 text-foreground group-hover:text-primary transition-colors">
            {title}
          </h3>
          
          {description && (
            <p className="text-xs text-muted-foreground line-clamp-1 sm:line-clamp-2 leading-relaxed hidden sm:block">
              {description}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center text-xs text-muted-foreground min-w-0 flex-1 mr-2">
            <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
            <span className="truncate">{location}</span>
          </div>
          
          <Badge variant="outline" className="text-xs px-1.5 sm:px-2 py-0.5 border-border/60 flex-shrink-0">
            {category}
          </Badge>
        </div>

        {price && (
          <div className="pt-1 border-t border-border/40">
            <p className="font-bold text-primary text-sm">
              {price}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
});

OptimizedAdCard.displayName = 'OptimizedAdCard';

export default OptimizedAdCard;
