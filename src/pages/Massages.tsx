import React, { useState, useMemo } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SearchResults from '@/components/SearchResults';
import { useApprovedAds } from '@/hooks/useApprovedAds';
import SEO from '@/components/SEO';

const Massages = () => {
  const { data: ads = [], isLoading, error } = useApprovedAds();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredAds = useMemo(() => {
    return ads.filter(ad => 
      ad.category === 'massages' &&
      (searchQuery === '' || 
       ad.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
       ad.description?.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [ads, searchQuery]);

  const seoConfig = {
    title: 'Massages relaxants et thérapeutiques au Cameroun - Yamo',
    description: 'Trouvez des professionnels du massage au Cameroun. Massages relaxants, thérapeutiques et bien-être. Annonces vérifiées sur Yamo.',
    keywords: 'massage Cameroun, massage relaxant, massage thérapeutique, bien-être, spa Douala, spa Yaoundé',
    url: 'https://yamo.lovable.app/massages',
    type: 'website'
  };

  return (
    <>
      <SEO {...seoConfig} />
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        
        <main className="flex-1 container mx-auto px-4 py-8">
          {/* Breadcrumbs */}
          <nav className="mb-6" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-2 text-sm text-muted-foreground">
              <li><a href="/" className="hover:text-foreground">Accueil</a></li>
              <li>•</li>
              <li className="text-foreground">Massages</li>
            </ol>
          </nav>

          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-4">
              Massages et Bien-être au Cameroun
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Découvrez des professionnels du massage et du bien-être au Cameroun. 
              Massages relaxants, thérapeutiques et soins de qualité.
            </p>
          </div>

          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <input
                type="text"
                placeholder="Rechercher des massages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {/* Results */}
          <SearchResults 
            results={filteredAds} 
            query={searchQuery}
            totalResults={filteredAds.length}
            loading={isLoading} 
          />
        </main>

        <Footer />
      </div>
    </>
  );
};

export default Massages;