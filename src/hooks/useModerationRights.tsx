import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export const useModerationRights = () => {
  const { user } = useAuth();
  const [hasModerationRights, setHasModerationRights] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkModerationRights = async () => {
      if (!user) {
        setHasModerationRights(false);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase.rpc('user_has_moderation_rights', {
          _user_id: user.id
        });

        if (error) {
          console.error('Error checking moderation rights:', error);
          setHasModerationRights(false);
        } else {
          setHasModerationRights(data);
        }
      } catch (error) {
        console.error('Error checking moderation rights:', error);
        setHasModerationRights(false);
      } finally {
        setLoading(false);
      }
    };

    checkModerationRights();
  }, [user]);

  return { hasModerationRights, loading };
};