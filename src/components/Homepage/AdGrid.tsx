
import React from 'react';
import { useNavigate } from 'react-router-dom';
import OptimizedAdCard from '@/components/OptimizedAdCard';
import SeeMoreAdsCard from './SeeMoreAdsCard';

interface AdGridProps {
  ads: any[];
  maxItems?: number;
  showSeeMoreCard?: boolean;
}

const AdGrid = React.memo(({ ads, maxItems = 6, showSeeMoreCard = true }: AdGridProps) => {
  const navigate = useNavigate();
  
  const displayedAds = React.useMemo(() => 
    ads.slice(0, showSeeMoreCard ? maxItems - 1 : maxItems), 
    [ads, maxItems, showSeeMoreCard]
  );

  const convertAdToCardProps = React.useCallback((ad: any) => ({
    id: ad.id,
    title: ad.title,
    description: ad.description || '',
    price: ad.price ? `${ad.price.toLocaleString()} FCFA` : undefined,
    location: ad.location || '',
    category: ad.category,
    imageUrl: ad.images && ad.images.length > 0 ? ad.images[0] : undefined,
    isVip: !!ad.expires_at && new Date(ad.expires_at) > new Date()
  }), []);

  const handleAdClick = React.useCallback((adId: string) => {
    console.log('Navigating to ad:', adId);
    navigate(`/ad/${adId}`);
  }, [navigate]);

  return (
    <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-4 md:gap-5 lg:gap-6 animate-fade-in">
      {displayedAds.map((ad, index) => (
        <div 
          key={ad.id}
          className="animate-slide-up w-full"
          style={{ 
            animationDelay: `${index * 100}ms`,
            animationFillMode: 'both'
          }}
        >
          <OptimizedAdCard 
            {...convertAdToCardProps(ad)}
            onClick={() => handleAdClick(ad.id)}
          />
        </div>
      ))}
      
      {showSeeMoreCard && (
        <div 
          className="animate-slide-up w-full"
          style={{ 
            animationDelay: `${displayedAds.length * 100}ms`,
            animationFillMode: 'both'
          }}
        >
          <SeeMoreAdsCard />
        </div>
      )}
    </div>
  );
});

AdGrid.displayName = 'AdGrid';

export default AdGrid;
