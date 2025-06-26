
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

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

export const useApprovedAds = () => {
  return useQuery({
    queryKey: ['approved-ads'],
    queryFn: async (): Promise<AdData[]> => {
      console.log('Fetching approved ads...');
      
      const { data, error } = await supabase
        .from('ads')
        .select('*')
        .eq('moderation_status', 'approved')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching approved ads:', error);
        throw error;
      }

      console.log('Approved ads fetched:', data?.length || 0);
      return data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useApprovedAdsByCategory = (category?: string) => {
  return useQuery({
    queryKey: ['approved-ads', 'category', category],
    queryFn: async (): Promise<AdData[]> => {
      console.log('Fetching approved ads by category:', category);
      
      let query = supabase
        .from('ads')
        .select('*')
        .eq('moderation_status', 'approved')
        .eq('status', 'active');

      if (category && category !== 'all') {
        query = query.eq('category', category);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching approved ads by category:', error);
        throw error;
      }

      console.log('Approved ads by category fetched:', data?.length || 0);
      return data || [];
    },
    enabled: !!category,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useApprovedAdsByLocation = (location?: string) => {
  return useQuery({
    queryKey: ['approved-ads', 'location', location],
    queryFn: async (): Promise<AdData[]> => {
      console.log('Fetching approved ads by location:', location);
      
      let query = supabase
        .from('ads')
        .select('*')
        .eq('moderation_status', 'approved')
        .eq('status', 'active');

      if (location && location !== 'all') {
        query = query.ilike('location', `%${location}%`);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching approved ads by location:', error);
        throw error;
      }

      console.log('Approved ads by location fetched:', data?.length || 0);
      return data || [];
    },
    enabled: !!location,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
