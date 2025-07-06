
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export const useGetUnreadMessagesCount = () => {
  const { user } = useAuth();

  const { data: unreadCount = 0 } = useQuery({
    queryKey: ['unreadMessagesCount', user?.id],
    queryFn: async () => {
      if (!user?.id) return 0;

      const { count, error } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('recipient_id', user.id)
        .eq('is_read', false);

      if (error) {
        console.error('Error fetching unread messages count:', error);
        return 0;
      }

      return count || 0;
    },
    enabled: !!user?.id,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  return { unreadCount };
};
