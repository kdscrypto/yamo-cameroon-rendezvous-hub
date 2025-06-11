
import { Heart, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface AdCardProps {
  id: string;
  title: string;
  description: string;
  price?: string;
  location: string;
  imageUrl?: string;
  category: string;
  isVip?: boolean;
}

const AdCard = ({ 
  id, 
  title, 
  description, 
  price, 
  location, 
  imageUrl, 
  category, 
  isVip = false 
}: AdCardProps) => {
  return (
    <Card className="group hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 hover:scale-105 overflow-hidden bg-card border-border">
      {isVip && (
        <div className="gradient-gold text-black text-xs font-bold px-2 py-1 text-center">
          ⭐ ANNONCE VIP
        </div>
      )}
      
      <div className="aspect-video bg-muted relative overflow-hidden">
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <User className="w-16 h-16 text-muted-foreground" />
          </div>
        )}
        <Button 
          size="sm" 
          variant="ghost" 
          className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white"
        >
          <Heart className="w-4 h-4" />
        </Button>
      </div>

      <CardContent className="p-4">
        <div className="mb-2">
          <span className="text-xs px-2 py-1 bg-primary/20 text-primary rounded-full">
            {category}
          </span>
        </div>
        
        <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
          {title}
        </h3>
        
        <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
          {description}
        </p>
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">{location}</span>
          {price && (
            <span className="font-bold text-primary">{price}</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AdCard;
