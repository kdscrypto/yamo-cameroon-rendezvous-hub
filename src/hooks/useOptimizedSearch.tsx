
import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AdData } from './useOptimizedAds';

// Hook de debouncing pour éviter trop de requêtes
export const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Hook de recherche optimisé
export const useOptimizedSearch = (query: string, filters: {
  category?: string;
  location?: string;
  minPrice?: number;
  maxPrice?: number;
}) => {
  const debouncedQuery = useDebounce(query, 300); // 300ms de délai
  
  return useQuery({
    queryKey: ['search-optimized', debouncedQuery, filters],
    queryFn: async (): Promise<AdData[]> => {
      if (!debouncedQuery.trim() && !filters.category && !filters.location) {
        return [];
      }

      console.log('Performing optimized search:', debouncedQuery, filters);

      let queryBuilder = supabase
        .from('ads')
        .select('*')
        .eq('moderation_status', 'approved')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(50);

      // Recherche textuelle
      if (debouncedQuery.trim()) {
        queryBuilder = queryBuilder.or(
          `title.ilike.%${debouncedQuery}%,description.ilike.%${debouncedQuery}%`
        );
      }

      // Filtres
      if (filters.category && filters.category !== 'all') {
        queryBuilder = queryBuilder.eq('category', filters.category);
      }

      if (filters.location && filters.location !== 'all') {
        queryBuilder = queryBuilder.ilike('location', `%${filters.location}%`);
      }

      if (filters.minPrice !== undefined) {
        queryBuilder = queryBuilder.gte('price', filters.minPrice);
      }

      if (filters.maxPrice !== undefined) {
        queryBuilder = queryBuilder.lte('price', filters.maxPrice);
      }

      const { data, error } = await queryBuilder;

      if (error) {
        console.error('Error in optimized search:', error);
        throw error;
      }

      return data || [];
    },
    enabled: !!(debouncedQuery.trim() || filters.category || filters.location),
    staleTime: 2 * 60 * 1000, // Cache court pour la recherche
    gcTime: 5 * 60 * 1000,
  });
};
