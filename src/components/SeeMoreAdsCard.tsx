import React from 'react';
import { Plus, Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Link } from 'react-router-dom';

interface SeeMoreAdsCardProps {
  href?: string;
  text?: string;
}

const SeeMoreAdsCard = React.memo(({ 
  href = "/browse", 
  text = "Voir plus d'annonces" 
}: SeeMoreAdsCardProps) => {
  return (
    <Link to={href} className="block h-full">
      <Card className="h-full min-h-[280px] relative overflow-hidden group cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl border-0">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 via-yellow-500 to-orange-500" />
        
        {/* Content */}
        <div className="relative h-full flex flex-col items-center justify-center p-6 text-center">
          {/* Decorative stars */}
          <div className="absolute top-4 left-4 opacity-30">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div className="absolute top-6 right-6 opacity-20">
            <Sparkles className="w-3 h-3 text-white" />
          </div>
          <div className="absolute bottom-4 left-6 opacity-25">
            <Sparkles className="w-3 h-3 text-white" />
          </div>
          <div className="absolute bottom-8 right-4 opacity-30">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          
          {/* Central plus icon */}
          <div className="bg-white/20 backdrop-blur-sm rounded-full p-6 mb-4 group-hover:bg-white/30 transition-colors duration-300">
            <Plus className="w-12 h-12 text-white" strokeWidth={2.5} />
          </div>
          
          {/* Text */}
          <h3 className="text-white font-bold text-lg mb-2 leading-tight">
            {text}
          </h3>
          <p className="text-white/80 text-sm">
            Découvrez plus d'opportunités
          </p>
        </div>
        
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-300/20 via-yellow-400/20 to-orange-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </Card>
    </Link>
  );
});

SeeMoreAdsCard.displayName = 'SeeMoreAdsCard';

export default SeeMoreAdsCard;