
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useModerationRealtime = () => {
  useEffect(() => {
    console.log('Setting up real-time subscription for moderation dashboard');
    
    let channel: any = null;
    
    try {
      channel = supabase
        .channel('moderation-ads-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'ads'
          },
          (payload) => {
            console.log('Moderation real-time update:', payload);
          }
        )
        .subscribe();
    } catch (error) {
      console.error('Failed to setup real-time subscription:', error);
    }

    return () => {
      if (channel) {
        try {
          supabase.removeChannel(channel);
        } catch (error) {
          console.error('Failed to remove channel:', error);
        }
      }
    };
  }, []);
};
