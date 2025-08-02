import React from 'react';
import { AdData } from '@/hooks/useOptimizedAds';
import { useAdNavigation } from '@/hooks/useAdNavigation';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, MapPin, Euro } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface SimilarAdsProps {
  ads: AdData[];
  isLoading?: boolean;
}

const SimilarAds: React.FC<SimilarAdsProps> = ({ ads, isLoading }) => {
  const { navigateToAd } = useAdNavigation();

  const getCategoryDisplay = (category: string) => {
    const categories: { [key: string]: string } = {
      'rencontres': 'Rencontres',
      'massages': 'Massages',
      'produits': 'Produits adultes'
    };
    return categories[category] || category;
  };

  const getLocationDisplay = (location: string) => {
    const locations: { [key: string]: string } = {
      'douala': 'Douala',
      'yaounde': 'Yaoundé',
      'bafoussam': 'Bafoussam',
      'bamenda': 'Bamenda',
      'garoua': 'Garoua',
      'maroua': 'Maroua',
      'ngaoundere': 'Ngaoundéré',
      'bertoua': 'Bertoua',
      'ebolowa': 'Ebolowa',
      'kribi': 'Kribi',
      'limbe': 'Limbé',
      'buea': 'Buea',
      'edea': 'Edéa',
      'kumba': 'Kumba',
      'sangmelima': 'Sangmélima'
    };
    return locations[location] || location;
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Annonces similaires</h2>
        <div className="flex space-x-4 overflow-x-auto pb-4">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="flex-shrink-0 w-72">
              <Card className="animate-pulse">
                <CardContent className="p-4">
                  <div className="h-40 bg-muted rounded-lg mb-4"></div>
                  <div className="h-4 bg-muted rounded mb-2"></div>
                  <div className="h-3 bg-muted rounded mb-2 w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!ads || ads.length === 0) {
    return null;
  }

  const handleAdClick = (adId: string, adTitle: string) => {
    navigateToAd(adId, adTitle);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-yellow-400">Annonces similaires</h2>
      
      <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide">
        {ads.map((ad) => {
          const isVip = ad.expires_at && new Date(ad.expires_at) > new Date();
          const mainImage = ad.images && ad.images.length > 0 ? ad.images[0] : null;
          
          return (
            <div key={ad.id} className="flex-shrink-0 w-72">
              <Card 
                className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-[1.02] border-2 border-border/60 hover:border-primary/30 bg-card"
                onClick={() => handleAdClick(ad.id, ad.title)}
              >
                <CardContent className="p-0">
                  {/* Image section */}
                  <div className="relative">
                    {mainImage ? (
                      <img
                        src={mainImage}
                        alt={ad.title}
                        className="w-full h-40 object-cover rounded-t-lg"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-40 bg-muted rounded-t-lg flex items-center justify-center">
                        <span className="text-muted-foreground text-sm">Aucune image</span>
                      </div>
                    )}
                    
                    {/* VIP Badge */}
                    {isVip && (
                      <Badge className="absolute top-2 left-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold shadow-lg">
                        VIP
                      </Badge>
                    )}
                    
                    {/* Price Badge */}
                    {ad.price && (
                      <Badge className="absolute top-2 right-2 bg-primary text-primary-foreground shadow-lg">
                        <Euro className="w-3 h-3 mr-1" />
                        {ad.price.toLocaleString()}
                      </Badge>
                    )}
                  </div>
                  
                  {/* Content section */}
                  <div className="p-4 space-y-3">
                    {/* Category */}
                    <Badge variant="secondary" className="text-xs">
                      {getCategoryDisplay(ad.category)}
                    </Badge>
                    
                    {/* Title */}
                    <h3 className="font-semibold text-sm line-clamp-2 text-yellow-400 leading-tight">
                      {ad.title}
                    </h3>
                    
                    {/* Description */}
                    {ad.description && (
                      <p className="text-xs text-white line-clamp-2 leading-relaxed">
                        {ad.description}
                      </p>
                    )}
                    
                    {/* Location and Date */}
                    <div className="flex flex-col space-y-1 text-xs text-white">
                      {ad.location && (
                        <div className="flex items-center">
                          <MapPin className="w-3 h-3 mr-1 text-yellow-400" />
                          <span>{getLocationDisplay(ad.location)}</span>
                        </div>
                      )}
                      <div className="flex items-center">
                        <Clock className="w-3 h-3 mr-1 text-yellow-400" />
                        <span>
                          {format(new Date(ad.created_at), 'dd MMM yyyy', { locale: fr })}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SimilarAds;