import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Sparkles } from 'lucide-react';

interface SeeMoreAdsCardProps {
  onClick?: () => void;
  className?: string;
}

const SeeMoreAdsCard = React.memo(({ onClick, className = '' }: SeeMoreAdsCardProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate('/browse');
    }
  };

  return (
    <Card 
      className={`group relative overflow-hidden transition-all duration-300 hover:shadow-lg cursor-pointer h-full bg-gradient-to-br from-primary/80 via-primary to-primary/90 border-primary/20 hover:scale-105 ${className}`}
      onClick={handleClick}
    >
      <div className="aspect-[5/4] sm:aspect-[4/3] relative">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent" />
        
        {/* Decorative stars */}
        <Sparkles className="absolute top-2 right-2 w-4 h-4 text-primary-foreground/60" />
        <Sparkles className="absolute bottom-3 left-3 w-3 h-3 text-primary-foreground/40" />
        <Sparkles className="absolute top-1/3 left-1/4 w-2 h-2 text-primary-foreground/50" />
        
        {/* Central plus icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary-foreground/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-primary-foreground/30 group-hover:scale-110 transition-transform duration-300">
            <Plus className="w-6 h-6 sm:w-8 sm:h-8 text-primary-foreground" strokeWidth={2.5} />
          </div>
        </div>
      </div>

      <CardContent className="p-2 sm:p-3 space-y-1.5 sm:space-y-2">
        <div className="text-center">
          <h3 className="font-semibold text-xs sm:text-sm leading-tight text-primary-foreground">
            Voir plus d'annonces
          </h3>
          <p className="text-xs text-primary-foreground/80 mt-1">
            Découvrez toutes nos offres
          </p>
        </div>
      </CardContent>
    </Card>
  );
});

SeeMoreAdsCard.displayName = 'SeeMoreAdsCard';

export default SeeMoreAdsCard;