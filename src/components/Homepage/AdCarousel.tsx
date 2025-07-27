
import React from 'react';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import OptimizedAdCard from '@/components/OptimizedAdCard';
import SeeMoreAdsCard from '@/components/SeeMoreAdsCard';
import { useAdNavigation } from '@/hooks/useAdNavigation';
import Autoplay from 'embla-carousel-autoplay';

interface AdCarouselProps {
  ads: any[];
  maxItems?: number;
  seeMoreHref?: string;
  seeMoreText?: string;
}

const AdCarousel = React.memo(({ 
  ads, 
  maxItems = 8, 
  seeMoreHref = "/browse",
  seeMoreText = "Voir plus d'annonces"
}: AdCarouselProps) => {
  const { navigateToAd } = useAdNavigation();
  
  const autoplayPlugin = React.useRef(
    Autoplay({ delay: 3000, stopOnInteraction: true, stopOnMouseEnter: true })
  );
  
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

  const handleAdClick = React.useCallback(async (adId: string, adTitle?: string) => {
    console.log('AdCarousel - Navigating to ad:', { adId, adTitle });
    await navigateToAd(adId, adTitle);
  }, [navigateToAd]);

  if (displayedAds.length === 0) {
    return null;
  }

  return (
    <div className="relative animate-fade-in">
      <Carousel 
        plugins={[autoplayPlugin.current]}
        opts={{
          align: "start",
          loop: true,
          slidesToScroll: 1,
        }}
        className="w-full"
        onMouseEnter={() => autoplayPlugin.current.stop()}
        onMouseLeave={() => autoplayPlugin.current.play()}
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
                  onClick={() => handleAdClick(ad.id, ad.title)}
                />
              </div>
            </CarouselItem>
          ))}
          {/* See More Ads Card */}
          <CarouselItem className="pl-2 md:pl-4 basis-full xs:basis-1/2 sm:basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5 2xl:basis-1/6">
            <div 
              className="animate-slide-up w-full"
              style={{ 
                animationDelay: `${displayedAds.length * 100}ms`,
                animationFillMode: 'both'
              }}
            >
              <SeeMoreAdsCard href={seeMoreHref} text={seeMoreText} />
            </div>
          </CarouselItem>
        </CarouselContent>
        <CarouselPrevious className="hidden sm:flex -left-6 bg-yellow-500 hover:bg-yellow-600 text-black border-yellow-500" />
        <CarouselNext className="hidden sm:flex -right-6 bg-yellow-500 hover:bg-yellow-600 text-black border-yellow-500" />
      </Carousel>
    </div>
  );
});

AdCarousel.displayName = 'AdCarousel';

export default AdCarousel;
