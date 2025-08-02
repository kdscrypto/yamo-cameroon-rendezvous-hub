import React, { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';

interface StarRatingProps {
  adId: string;
  averageRating: number;
  ratingCount: number;
  onRatingUpdate?: (averageRating: number, ratingCount: number) => void;
  className?: string;
}

const StarRating: React.FC<StarRatingProps> = ({
  adId,
  averageRating,
  ratingCount,
  onRatingUpdate,
  className = ''
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [hoveredStar, setHoveredStar] = useState<number>(0);
  const [userRating, setUserRating] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch user's existing rating
  useEffect(() => {
    const fetchUserRating = async () => {
      if (!user || !adId) return;

      try {
        // Appel GET pour récupérer la note de l'utilisateur
        const response = await fetch(`https://lusovklxvtzhluekhwvu.supabase.co/functions/v1/rate-ad/${adId}/rating`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
            'Content-Type': 'application/json',
          }
        });

        if (response.ok) {
          const data = await response.json();
          if (data?.userRating) {
            setUserRating(data.userRating);
          }
        }
      } catch (error) {
        console.error('Error fetching user rating:', error);
      }
    };

    fetchUserRating();
  }, [user, adId]);

  const handleStarClick = async (rating: number) => {
    if (!user) {
      toast({
        title: "Connexion requise",
        description: "Vous devez être connecté pour noter cette annonce.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Appel POST pour enregistrer la note
      const response = await fetch(`https://lusovklxvtzhluekhwvu.supabase.co/functions/v1/rate-ad/${adId}/rating`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rating })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de l\'enregistrement');
      }

      if (data?.success) {
        setUserRating(rating);
        
        // Update parent component with new stats
        if (onRatingUpdate && data.data) {
          onRatingUpdate(data.data.averageRating, data.data.ratingCount);
        }

        toast({
          title: "Note enregistrée",
          description: data.message || "Votre note a été enregistrée avec succès.",
        });
      } else {
        throw new Error(data?.error || 'Erreur lors de l\'enregistrement de la note');
      }
    } catch (error) {
      console.error('Error rating ad:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'enregistrer votre note. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStarHover = (star: number) => {
    if (user && !isLoading) {
      setHoveredStar(star);
    }
  };

  const handleMouseLeave = () => {
    setHoveredStar(0);
  };

  const renderStars = () => {
    const stars = [];
    
    for (let i = 1; i <= 5; i++) {
      const isFilled = i <= (hoveredStar || userRating || Math.floor(averageRating));
      const isHalfFilled = !hoveredStar && !userRating && 
        i === Math.ceil(averageRating) && 
        averageRating % 1 >= 0.5;
      
      stars.push(
        <button
          key={i}
          type="button"
          className={`relative transition-all duration-200 ${
            user && !isLoading 
              ? 'cursor-pointer hover:scale-110' 
              : 'cursor-default'
          } ${isLoading ? 'opacity-50' : ''}`}
          onClick={() => handleStarClick(i)}
          onMouseEnter={() => handleStarHover(i)}
          disabled={!user || isLoading}
          aria-label={`Noter ${i} étoile${i > 1 ? 's' : ''}`}
        >
          <Star
            className={`w-5 h-5 transition-colors duration-200 ${
              isFilled
                ? 'fill-yellow-400 text-yellow-400'
                : isHalfFilled
                ? 'fill-yellow-200 text-yellow-400'
                : 'fill-transparent text-gray-300 hover:text-yellow-400'
            }`}
          />
          {isHalfFilled && (
            <Star
              className="absolute top-0 left-0 w-5 h-5 fill-yellow-400 text-yellow-400"
              style={{
                clipPath: 'inset(0 50% 0 0)'
              }}
            />
          )}
        </button>
      );
    }
    
    return stars;
  };

  return (
    <div className={`flex flex-col space-y-2 ${className}`}>
      <div 
        className="flex items-center space-x-1"
        onMouseLeave={handleMouseLeave}
      >
        {renderStars()}
      </div>
      
      <div className="flex items-center space-x-4 text-sm">
        <div className="flex items-center space-x-1">
          <span className="text-yellow-400 font-semibold">
            {averageRating > 0 ? averageRating.toFixed(1) : '0.0'}
          </span>
          <span className="text-white">
            ({ratingCount} avis)
          </span>
        </div>
        
        {user && userRating > 0 && (
          <div className="text-yellow-400 text-xs">
            Votre note: {userRating} ⭐
          </div>
        )}
        
        {!user && (
          <div className="text-gray-400 text-xs">
            Connectez-vous pour noter
          </div>
        )}
      </div>
      
      {hoveredStar > 0 && user && !isLoading && (
        <div className="text-xs text-gray-400">
          Noter {hoveredStar} étoile{hoveredStar > 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
};

export default StarRating;