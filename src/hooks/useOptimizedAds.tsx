
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { performanceCache, CacheKeys } from '@/utils/performanceCache';
import { queryPerformanceMonitor } from '@/utils/queryOptimization';

export interface AdData {
  id: string;
  title: string;
  description: string | null;
  category: string;
  location: string | null;
  price: number | null;
  images: string[] | null;
  created_at: string;
  updated_at: string;
  expires_at: string | null;
  status: string;
  moderation_status: string;
  user_id: string;
}

const ITEMS_PER_PAGE = 12;

// Cache optimisé pour les annonces approuvées avec monitoring
export const useOptimizedApprovedAds = () => {
  return useQuery({
    queryKey: ['approved-ads-optimized'],
    queryFn: async (): Promise<AdData[]> => {
      const startTime = performance.now();
      
      // Vérifier le cache local d'abord
      const cachedData = performanceCache.get<AdData[]>(CacheKeys.ADS_APPROVED);
      if (cachedData) {
        queryPerformanceMonitor.trackQuery(['approved-ads-optimized'], 0, true);
        return cachedData;
      }

      console.log('Fetching optimized approved ads...');
      
      const { data, error } = await supabase
        .from('ads')
        .select('*')
        .eq('moderation_status', 'approved')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(50); // Limiter pour la performance

      const duration = performance.now() - startTime;
      queryPerformanceMonitor.trackQuery(['approved-ads-optimized'], duration, !error);

      if (error) {
        console.error('Error fetching optimized approved ads:', error);
        throw error;
      }

      const result = data || [];
      
      // Mettre en cache le résultat
      performanceCache.set(CacheKeys.ADS_APPROVED, result, 10 * 60 * 1000);

      console.log('Optimized approved ads fetched:', result.length);
      return result;
    },
    staleTime: 10 * 60 * 1000, // Cache pendant 10 minutes
    gcTime: 30 * 60 * 1000, // Garde en mémoire 30 minutes
    refetchOnWindowFocus: false, // Ne pas refetch au focus
  });
};

// Pagination infinie pour les annonces
export const useInfiniteApprovedAds = (category?: string, location?: string) => {
  return useInfiniteQuery({
    queryKey: ['infinite-ads', category, location],
    queryFn: async ({ pageParam = 0 }): Promise<{ data: AdData[]; nextPage?: number }> => {
      console.log('Fetching infinite ads page:', pageParam);
      
      let query = supabase
        .from('ads')
        .select('*')
        .eq('moderation_status', 'approved')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .range(pageParam * ITEMS_PER_PAGE, (pageParam + 1) * ITEMS_PER_PAGE - 1);

      if (category && category !== 'all') {
        query = query.eq('category', category);
      }

      if (location && location !== 'all') {
        query = query.ilike('location', `%${location}%`);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching infinite ads:', error);
        throw error;
      }

      const hasNextPage = data && data.length === ITEMS_PER_PAGE;
      
      return {
        data: data || [],
        nextPage: hasNextPage ? pageParam + 1 : undefined
      };
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextPage,
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });
};

// Hook optimisé pour les annonces par catégorie avec cache et monitoring
export const useOptimizedAdsByCategory = (category?: string) => {
  return useQuery({
    queryKey: ['ads-by-category-optimized', category],
    queryFn: async (): Promise<AdData[]> => {
      if (!category) return [];
      
      const startTime = performance.now();
      const cacheKey = CacheKeys.ADS_BY_CATEGORY(category);
      
      // Vérifier le cache local
      const cachedData = performanceCache.get<AdData[]>(cacheKey);
      if (cachedData) {
        queryPerformanceMonitor.trackQuery(['ads-by-category-optimized', category], 0, true);
        return cachedData;
      }

      console.log('Fetching optimized ads by category:', category);
      
      let query = supabase
        .from('ads')
        .select('*')
        .eq('moderation_status', 'approved')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(20);

      if (category !== 'all') {
        query = query.eq('category', category);
      }

      const { data, error } = await query;
      
      const duration = performance.now() - startTime;
      queryPerformanceMonitor.trackQuery(['ads-by-category-optimized', category], duration, !error);

      if (error) {
        console.error('Error fetching optimized ads by category:', error);
        throw error;
      }

      const result = data || [];
      
      // Mettre en cache le résultat
      performanceCache.set(cacheKey, result, 15 * 60 * 1000);

      console.log('Ads by category fetched:', result.length, 'for category:', category);
      return result;
    },
    enabled: !!category,
    staleTime: 15 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
};
