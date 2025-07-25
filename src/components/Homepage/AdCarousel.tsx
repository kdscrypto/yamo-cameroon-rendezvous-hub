
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import OptimizedAdCard from '@/components/OptimizedAdCard';
import SeeMoreAdsCard from './SeeMoreAdsCard';
import Autoplay from 'embla-carousel-autoplay';

interface AdCarouselProps {
  ads: any[];
  maxItems?: number;
  showSeeMoreCard?: boolean;
  autoplay?: boolean;
  autoplayDelay?: number;
}

const AdCarousel = React.memo(({ 
  ads, 
  maxItems = 8, 
  showSeeMoreCard = true, 
  autoplay = true, 
  autoplayDelay = 4000 
}: AdCarouselProps) => {
  const navigate = useNavigate();
  
  const autoplayPlugin = React.useRef(
    Autoplay({ delay: autoplayDelay, stopOnInteraction: true, stopOnMouseEnter: true })
  );
  
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

  if (displayedAds.length === 0) {
    return null;
  }

  return (
    <div className="relative animate-fade-in">
      <Carousel 
        plugins={autoplay ? [autoplayPlugin.current] : []}
        opts={{
          align: "start",
          loop: true,
          slidesToScroll: 1,
        }}
        className="w-full"
        onMouseEnter={autoplay ? () => autoplayPlugin.current.stop() : undefined}
        onMouseLeave={autoplay ? () => autoplayPlugin.current.play() : undefined}
      >
        <CarouselContent className="-ml-2 md:-ml-4">
          {displayedAds.map((ad, index) => (
            <CarouselItem 
              key={ad.id}
              className="pl-2 md:pl-4 basis-full xs:basis-1/2 sm:basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5 2xl:basis-1/6"
            >
              <div 
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
            </CarouselItem>
          ))}
          
          {showSeeMoreCard && (
            <CarouselItem className="pl-2 md:pl-4 basis-full xs:basis-1/2 sm:basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5 2xl:basis-1/6">
              <div 
                className="animate-slide-up w-full"
                style={{ 
                  animationDelay: `${displayedAds.length * 100}ms`,
                  animationFillMode: 'both'
                }}
              >
                <SeeMoreAdsCard />
              </div>
            </CarouselItem>
          )}
        </CarouselContent>
        <CarouselPrevious className="hidden sm:flex -left-6 bg-yellow-500 hover:bg-yellow-600 text-black border-yellow-500" />
        <CarouselNext className="hidden sm:flex -right-6 bg-yellow-500 hover:bg-yellow-600 text-black border-yellow-500" />
      </Carousel>
    </div>
  );
});

AdCarousel.displayName = 'AdCarousel';

export default AdCarousel;
