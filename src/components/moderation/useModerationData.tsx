
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useModerationData = () => {
  const { data: pendingAds, isLoading: pendingLoading } = useQuery({
    queryKey: ['moderation-ads', 'pending'],
    queryFn: async () => {
      console.log('Fetching pending ads for moderation');
      
      const { data, error } = await supabase
        .from('ads')
        .select('*')
        .eq('moderation_status', 'pending')
        .order('created_at', { ascending: true });
      
      if (error) {
        console.error('Error fetching pending ads:', error);
        throw error;
      }
      
      console.log('Fetched pending ads:', data);
      return data;
    }
  });

  const { data: moderatedAds, isLoading: moderatedLoading } = useQuery({
    queryKey: ['moderation-ads', 'moderated'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ads')
        .select('*')
        .in('moderation_status', ['approved', 'rejected'])
        .order('moderated_at', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return data;
    }
  });

  const { data: moderationStats } = useQuery({
    queryKey: ['moderation-stats'],
    queryFn: async () => {
      const [pendingCount, approvedCount, rejectedCount] = await Promise.all([
        supabase.from('ads').select('id', { count: 'exact' }).eq('moderation_status', 'pending'),
        supabase.from('ads').select('id', { count: 'exact' }).eq('moderation_status', 'approved'),
        supabase.from('ads').select('id', { count: 'exact' }).eq('moderation_status', 'rejected')
      ]);

      return {
        pending: pendingCount.count || 0,
        approved: approvedCount.count || 0,
        rejected: rejectedCount.count || 0
      };
    }
  });

  return {
    pendingAds,
    moderatedAds,
    moderationStats,
    pendingLoading,
    moderatedLoading
  };
};
