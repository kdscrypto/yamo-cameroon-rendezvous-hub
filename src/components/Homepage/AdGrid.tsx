
import React from 'react';
import OptimizedAdCard from '@/components/OptimizedAdCard';

interface AdGridProps {
  ads: any[];
  maxItems?: number;
}

const AdGrid = React.memo(({ ads, maxItems = 6 }: AdGridProps) => {
  const displayedAds = React.useMemo(() => 
    ads.slice(0, maxItems), 
    [ads, maxItems]
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
    console.log('Ad clicked:', adId);
    // For now, just log - in the future this could navigate to ad detail page
    // navigate(`/ad/${adId}`);
  }, []);

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 md:gap-6 animate-fade-in">
      {displayedAds.map((ad, index) => (
        <div 
          key={ad.id}
          className="animate-slide-up"
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
    </div>
  );
});

AdGrid.displayName = 'AdGrid';

export default AdGrid;
