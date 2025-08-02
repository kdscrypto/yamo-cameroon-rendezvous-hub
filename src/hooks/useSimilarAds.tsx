import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AdData } from '@/hooks/useOptimizedAds';

export interface SimilarAdsFilters {
  currentAdId: string;
  category: string;
  location: string;
}

export const useSimilarAds = (filters: SimilarAdsFilters) => {
  return useQuery({
    queryKey: ['similar-ads', filters.currentAdId, filters.category, filters.location],
    queryFn: async (): Promise<AdData[]> => {
      console.log('Fetching similar ads for:', filters);
      
      let query = supabase
        .from('ads')
        .select('*')
        .eq('moderation_status', 'approved')
        .eq('status', 'active')
        .eq('category', filters.category)
        .neq('id', filters.currentAdId) // Exclude current ad
        .limit(5); // Limit to 5 results

      // Add location filter if provided
      if (filters.location) {
        query = query.eq('location', filters.location);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching similar ads:', error);
        throw error;
      }

      console.log('Similar ads fetched:', data?.length || 0);
      return data || [];
    },
    enabled: !!(filters.currentAdId && filters.category),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
};