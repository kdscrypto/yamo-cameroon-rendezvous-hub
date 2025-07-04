
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useModerationRealtime = () => {
  useEffect(() => {
    console.log('Setting up real-time subscription for moderation dashboard');
    
    const channel = supabase
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

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
};
