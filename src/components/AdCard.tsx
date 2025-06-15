
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
    <Card className="group hover:shadow-xl hover:shadow-primary/20 transition-all duration-300 hover:scale-105 overflow-hidden bg-white border-gray-200 border-2">
      {isVip && (
        <div className="gradient-stripe text-white text-sm font-semibold px-3 py-2 text-center">
          ⭐ ANNONCE VIP
        </div>
      )}
      
      <div className="aspect-video bg-stripe-gray-100 relative overflow-hidden">
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
          className="absolute top-3 right-3 bg-white/90 hover:bg-white text-foreground border border-gray-200 rounded-lg"
        >
          <Heart className="w-4 h-4" />
        </Button>
      </div>

      <CardContent className="p-6">
        <div className="mb-3">
          <span className="text-sm px-3 py-1.5 bg-primary/10 text-primary rounded-full font-medium">
            {category}
          </span>
        </div>
        
        <h3 className="font-bold text-lg mb-3 line-clamp-2 group-hover:text-primary transition-colors text-foreground leading-tight">
          {title}
        </h3>
        
        <p className="text-muted-foreground text-sm mb-4 line-clamp-2 leading-relaxed">
          {description}
        </p>
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground font-medium">{location}</span>
          {price && (
            <span className="font-bold text-primary text-lg">{price}</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AdCard;
