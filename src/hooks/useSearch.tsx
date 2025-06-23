import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

export interface SearchFilters {
  query: string;
  category: string;
  location: string;
  sortBy: string;
  minPrice?: number;
  maxPrice?: number;
  isVip?: boolean;
}

export interface AdData {
  id: string;
  title: string;
  description: string;
  location: string;
  category: string;
  price?: string;
  isVip?: boolean;
  imageUrl?: string;
}

export const useSearch = (ads: AdData[]) => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [filters, setFilters] = useState<SearchFilters>({
    query: searchParams.get('q') || '',
    category: searchParams.get('category') || 'all',
    location: searchParams.get('location') || 'all',
    sortBy: searchParams.get('sort') || 'recent',
    isVip: searchParams.get('vip') === 'true' || undefined
  });

  // Sync filters with URL params
  useEffect(() => {
    const params = new URLSearchParams();
    
    if (filters.query) params.set('q', filters.query);
    if (filters.category !== 'all') params.set('category', filters.category);
    if (filters.location !== 'all') params.set('location', filters.location);
    if (filters.sortBy !== 'recent') params.set('sort', filters.sortBy);
    if (filters.isVip) params.set('vip', 'true');
    
    setSearchParams(params);
  }, [filters, setSearchParams]);

  // Filter and sort ads
  const filteredAds = useMemo(() => {
    let result = [...ads];

    // Text search
    if (filters.query) {
      const query = filters.query.toLowerCase();
      result = result.filter(ad => 
        ad.title.toLowerCase().includes(query) ||
        ad.description.toLowerCase().includes(query) ||
        ad.location.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (filters.category !== 'all') {
      result = result.filter(ad => 
        ad.category.toLowerCase() === filters.category.toLowerCase()
      );
    }

    // Location filter
    if (filters.location !== 'all') {
      result = result.filter(ad => 
        ad.location.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    // VIP filter
    if (filters.isVip) {
      result = result.filter(ad => ad.isVip);
    }

    // Price filter
    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      result = result.filter(ad => {
        if (!ad.price) return false;
        const price = parseFloat(ad.price.replace(/[^0-9]/g, ''));
        if (filters.minPrice !== undefined && price < filters.minPrice) return false;
        if (filters.maxPrice !== undefined && price > filters.maxPrice) return false;
        return true;
      });
    }

    // Sort
    switch (filters.sortBy) {
      case 'price-low':
        result.sort((a, b) => {
          const priceA = parseFloat(a.price?.replace(/[^0-9]/g, '') || '0');
          const priceB = parseFloat(b.price?.replace(/[^0-9]/g, '') || '0');
          return priceA - priceB;
        });
        break;
      case 'price-high':
        result.sort((a, b) => {
          const priceA = parseFloat(a.price?.replace(/[^0-9]/g, '') || '0');
          const priceB = parseFloat(b.price?.replace(/[^0-9]/g, '') || '0');
          return priceB - priceA;
        });
        break;
      case 'popular':
        result.sort((a, b) => (b.isVip ? 1 : 0) - (a.isVip ? 1 : 0));
        break;
      case 'recent':
      default:
        // Keep original order for recent
        break;
    }

    return result;
  }, [ads, filters]);

  const updateFilters = (newFilters: Partial<SearchFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const resetFilters = () => {
    setFilters({
      query: '',
      category: 'all',
      location: 'all',
      sortBy: 'recent'
    });
  };

  return {
    filters,
    filteredAds,
    updateFilters,
    resetFilters,
    totalResults: filteredAds.length
  };
};
