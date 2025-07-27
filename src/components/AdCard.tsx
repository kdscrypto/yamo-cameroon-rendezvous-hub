
import { Heart, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useAdNavigation } from '@/hooks/useAdNavigation';

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
  const { trackAdInteraction } = useAnalytics();
  const { navigateToAd } = useAdNavigation();

  const handleCardClick = async () => {
    console.log('AdCard clicked:', { id, title });
    trackAdInteraction(id, 'view');
    await navigateToAd(id, title);
  };

  const handleLikeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    trackAdInteraction(id, 'like');
  };

  return (
    <Card 
      onClick={handleCardClick}
      className="group card-elevated bg-card/98 backdrop-blur-sm border-border/40 hover:border-primary/30 transition-all duration-300 hover:shadow-medium hover:shadow-primary/10 cursor-pointer transform hover:scale-[1.02] active:scale-[0.98] overflow-hidden"
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
          size="sm" 
          variant="ghost" 
          onClick={handleLikeClick}
          className="absolute top-3 right-3 bg-black/60 hover:bg-black/80 text-white p-2 h-auto backdrop-blur-sm border border-white/20 transition-all duration-300 hover:scale-110"
        >
          <Heart className="w-3.5 h-3.5" />
        </Button>

        {/* Overlay gradient for better readability */}
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
