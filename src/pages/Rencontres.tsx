import React, { useState, useMemo } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SearchResults from '@/components/SearchResults';
import Breadcrumbs from '@/components/SEO/Breadcrumbs';
import DynamicSEO from '@/components/SEO/DynamicSEO';
import AdvancedSEO from '@/components/SEO/AdvancedSEO';
import { useApprovedAds } from '@/hooks/useApprovedAds';
import SEO from '@/components/SEO';

const Rencontres = () => {
  const { data: ads = [], isLoading, error } = useApprovedAds();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredAds = useMemo(() => {
    return ads.filter(ad => 
      ad.category === 'rencontres' &&
      (searchQuery === '' || 
       ad.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
       ad.description?.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [ads, searchQuery]);

  const seoConfig = {
    title: 'Rencontres et Escorts au Cameroun - Yamo',
    description: 'Découvrez des annonces de rencontres discrètes et d\'escorts professionnelles au Cameroun. Sécurité et discrétion garanties sur Yamo.',
    keywords: 'rencontres Cameroun, escort Douala, escort Yaoundé, rencontres discrètes, annonces adultes',
    url: 'https://yamo.lovable.app/rencontres',
    type: 'website'
  };

  const breadcrumbItems = [
    { name: 'Accueil', url: '/' },
    { name: 'Rencontres', url: '/rencontres' }
  ];

  const categoryData = {
    title: 'Rencontres et Escorts au Cameroun',
    description: seoConfig.description,
    url: seoConfig.url,
    itemCount: filteredAds.length,
    items: filteredAds.slice(0, 10), // First 10 for structured data
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
      <AdvancedSEO pageType="category" data={categoryData} />
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        
        <main className="flex-1 container mx-auto px-4 py-8">
          <Breadcrumbs items={breadcrumbItems} />

          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-4">
              Rencontres et Escorts au Cameroun
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Découvrez des annonces de rencontres discrètes et d'escorts professionnelles 
              au Cameroun. Toutes nos annonces sont vérifiées pour votre sécurité.
            </p>
          </div>

          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <input
                type="text"
                placeholder="Rechercher des annonces..."
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

export default Rencontres;