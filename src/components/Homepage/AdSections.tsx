
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import AdCard from '@/components/AdCard';
import { useApprovedAds, useApprovedAdsByLocation } from '@/hooks/useApprovedAds';
import { useMemo } from 'react';

const AdSections = () => {
  const { data: allAds = [], isLoading } = useApprovedAds();
  const { data: doualaAds = [] } = useApprovedAdsByLocation('douala');
  const { data: yaoundeAds = [] } = useApprovedAdsByLocation('yaounde');

  // Get featured ads (VIP ads that are approved)
  const featuredAds = useMemo(() => {
    return allAds
      .filter(ad => ad.expires_at && new Date(ad.expires_at) > new Date())
      .slice(0, 6);
  }, [allAds]);

  // Get recent ads (non-VIP approved ads)
  const recentAds = useMemo(() => {
    return allAds
      .filter(ad => !ad.expires_at || new Date(ad.expires_at) <= new Date())
      .slice(0, 8);
  }, [allAds]);

  const convertAdToCardProps = (ad: any) => ({
    id: ad.id,
    title: ad.title,
    description: ad.description || '',
    price: ad.price ? `${ad.price.toLocaleString()} FCFA` : undefined,
    location: ad.location || '',
    category: ad.category,
    imageUrl: ad.images && ad.images.length > 0 ? ad.images[0] : undefined,
    isVip: !!ad.expires_at && new Date(ad.expires_at) > new Date()
  });

  if (isLoading) {
    return (
      <div className="py-12 px-4">
        <div className="container mx-auto text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement des annonces approuvées...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Featured Ads Section */}
      {featuredAds.length > 0 && (
        <section className="py-12 px-4 bg-card/30">
          <div className="container mx-auto">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold">⭐ Annonces en vedette</h2>
              <Button variant="outline" asChild>
                <Link to="/browse?featured=true">Voir toutes les annonces premium</Link>
              </Button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {featuredAds.map((ad) => (
                <AdCard key={ad.id} {...convertAdToCardProps(ad)} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Recent Ads Section */}
      {recentAds.length > 0 && (
        <section className="py-12 px-4">
          <div className="container mx-auto">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold">Annonces récentes</h2>
              <Button variant="outline" asChild>
                <Link to="/browse">Voir toutes les annonces</Link>
              </Button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {recentAds.map((ad) => (
                <AdCard key={ad.id} {...convertAdToCardProps(ad)} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Hot à Douala Section */}
      {doualaAds.length > 0 && (
        <section className="py-12 px-4 bg-card/30">
          <div className="container mx-auto">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold">🔥 Hot à Douala</h2>
              <Button variant="outline" asChild>
                <Link to="/browse?location=douala">Voir toutes les annonces Douala</Link>
              </Button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {doualaAds.slice(0, 6).map((ad) => (
                <AdCard key={ad.id} {...convertAdToCardProps(ad)} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Hot à Yaoundé Section */}
      {yaoundeAds.length > 0 && (
        <section className="py-12 px-4">
          <div className="container mx-auto">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold">🔥 Hot à Yaoundé</h2>
              <Button variant="outline" asChild>
                <Link to="/browse?location=yaounde">Voir toutes les annonces Yaoundé</Link>
              </Button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {yaoundeAds.slice(0, 6).map((ad) => (
                <AdCard key={ad.id} {...convertAdToCardProps(ad)} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* No ads message */}
      {allAds.length === 0 && (
        <section className="py-12 px-4">
          <div className="container mx-auto text-center">
            <h2 className="text-2xl font-bold mb-4">Aucune annonce disponible</h2>
            <p className="text-muted-foreground mb-8">
              Il n'y a actuellement aucune annonce approuvée à afficher.
            </p>
            <Button asChild>
              <Link to="/create-ad">Publier une annonce</Link>
            </Button>
          </div>
        </section>
      )}
    </>
  );
};

export default AdSections;
