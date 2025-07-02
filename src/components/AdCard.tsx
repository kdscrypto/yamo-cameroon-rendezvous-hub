
import { Heart, User } from 'lucide-react';
import { Button } from '@/components/ui/button-enhanced';
import { Card, CardContent } from '@/components/ui/card-enhanced';

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
    <Card 
      variant="interactive" 
      size="sm"
      className="group overflow-hidden"
    >
      {isVip && (
        <div className="gradient-luxe text-black text-xs font-bold px-3 py-1.5 text-center animate-pulse-subtle">
          ⭐ VIP
        </div>
      )}
      
      <div className="aspect-square bg-muted/30 relative overflow-hidden">
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted/20 to-muted/40">
            <User className="w-12 h-12 text-muted-foreground opacity-50" />
          </div>
        )}
        
        <Button 
          size="icon-sm" 
          variant="glass" 
          className="absolute top-3 right-3 p-2 h-auto backdrop-blur-sm border border-white/20 transition-all duration-300 hover:scale-110"
          animation="lift"
        >
          <Heart className="w-3.5 h-3.5" />
        </Button>

        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      <CardContent className="p-4 space-y-3">
        <div className="mb-2">
          <span className="text-xs px-3 py-1.5 bg-primary/15 text-primary rounded-full font-medium border border-primary/20">
            {category}
          </span>
        </div>
        
        <h3 className="font-semibold text-sm mb-2 line-clamp-2 group-hover:text-primary transition-colors duration-300 leading-snug">
          {title}
        </h3>
        
        <p className="text-muted-foreground text-xs mb-3 line-clamp-2 leading-relaxed opacity-80 group-hover:opacity-100 transition-opacity duration-300">
          {description}
        </p>
        
        <div className="flex justify-between items-center pt-2 border-t border-border/20">
          <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors duration-300 font-medium">{location}</span>
          {price && (
            <span className="font-bold text-primary text-sm animate-fade-in">{price}</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AdCard;
