
import React from 'react';
import { MapPin, Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

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
      className="overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary/20 bg-card border-border"
      onClick={onClick}
    >
      {/* Image Section */}
      <div className="relative aspect-square overflow-hidden">
        {imageUrl ? (
          <img 
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-neutral-800 to-neutral-900 flex items-center justify-center">
            <span className="text-6xl opacity-20">📷</span>
          </div>
        )}
        
        {/* VIP Badge */}
        {isVip && (
          <div className="absolute top-2 left-2 bg-yellow-500 text-black px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
            <Star className="w-3 h-3 fill-current" />
            VIP
          </div>
        )}
        
        {/* Price Badge */}
        {price && (
          <div className="absolute top-2 right-2 bg-black/70 text-yellow-400 px-2 py-1 rounded text-xs font-semibold">
            {price}
          </div>
        )}
      </div>

      {/* Content Section */}
      <CardContent className="p-3 space-y-2">
        {/* Title - En jaune */}
        <h3 className="font-semibold text-sm leading-tight line-clamp-2 text-yellow-400 hover:text-yellow-300 transition-colors">
          {title}
        </h3>
        
        {/* Description - En blanc */}
        <p className="text-xs text-white opacity-80 line-clamp-2 leading-relaxed">
          {description}
        </p>
        
        {/* Location and Category */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1 text-yellow-500">
            <MapPin className="w-3 h-3" />
            <span className="capitalize">{location}</span>
          </div>
          <span className="text-yellow-400 bg-yellow-500/10 px-2 py-1 rounded text-xs font-medium capitalize">
            {category}
          </span>
        </div>
      </CardContent>
    </Card>
  );
});

OptimizedAdCard.displayName = 'OptimizedAdCard';

export default OptimizedAdCard;
