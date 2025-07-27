import React, { useState, useMemo } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SearchResults from '@/components/SearchResults';
import Breadcrumbs from '@/components/SEO/Breadcrumbs';
import DynamicSEO from '@/components/SEO/DynamicSEO';
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

  const breadcrumbItems = [
    { name: 'Accueil', url: '/' },
    { name: 'Massages', url: '/massages' }
  ];

  const categoryData = {
    title: 'Massages et Bien-être au Cameroun',
    description: seoConfig.description,
    url: seoConfig.url,
    itemCount: filteredAds.length,
    items: filteredAds.slice(0, 10),
    breadcrumbs: breadcrumbItems.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": `https://yamo.lovable.app${item.url}`
    }))
  };

  return (
    <>
      <SEO {...seoConfig} />
      <DynamicSEO pageType="category" data={categoryData} />
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        
        <main className="flex-1 container mx-auto px-4 py-8">
          <Breadcrumbs items={breadcrumbItems} />

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