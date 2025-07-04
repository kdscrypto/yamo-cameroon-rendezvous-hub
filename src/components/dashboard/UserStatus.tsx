
import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface UserStatusProps {
  userId: string;
  showText?: boolean;
}

const UserStatus = ({ userId, showText = false }: UserStatusProps) => {
  const [status, setStatus] = useState<'online' | 'away' | 'offline'>('offline');
  const { user: currentUser } = useAuth();

  useEffect(() => {
    if (!userId) return;

    let presenceChannel: any;

    const setupPresence = async () => {
      presenceChannel = supabase.channel(`presence-${userId}`, {
        config: {
          presence: {
            key: userId,
          },
        },
      });

      presenceChannel
        .on('presence', { event: 'sync' }, () => {
          const presenceState = presenceChannel.presenceState();
          const userPresences = presenceState[userId];
          
          if (userPresences && userPresences.length > 0) {
            setStatus('online');
          } else {
            setStatus('offline');
          }
        })
        .on('presence', { event: 'join' }, ({ key, newPresences }: any) => {
          if (key === userId) {
            setStatus('online');
          }
        })
        .on('presence', { event: 'leave' }, ({ key, leftPresences }: any) => {
          if (key === userId) {
            setStatus('offline');
          }
        })
        .subscribe(async (status) => {
          if (status === 'SUBSCRIBED') {
            // Si c'est l'utilisateur connecté, on track sa présence
            if (currentUser && currentUser.id === userId) {
              await presenceChannel.track({
                user_id: userId,
                online_at: new Date().toISOString(),
                status: 'online'
              });
            }
          }
        });
    };

    setupPresence();

    return () => {
      if (presenceChannel) {
        supabase.removeChannel(presenceChannel);
      }
    };
  }, [userId, currentUser]);

  // Track current user's presence globally
  useEffect(() => {
    if (!currentUser) return;

    const globalPresenceChannel = supabase.channel('global-presence');
    
    globalPresenceChannel
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await globalPresenceChannel.track({
            user_id: currentUser.id,
            online_at: new Date().toISOString(),
            status: 'online'
          });
        }
      });

    // Heartbeat to maintain presence
    const heartbeat = setInterval(async () => {
      await globalPresenceChannel.track({
        user_id: currentUser.id,
        online_at: new Date().toISOString(),
        status: 'online'
      });
    }, 30000); // Every 30 seconds

    return () => {
      clearInterval(heartbeat);
      supabase.removeChannel(globalPresenceChannel);
    };
  }, [currentUser]);

  const getStatusColor = () => {
    switch (status) {
      case 'online':
        return 'bg-green-500';
      case 'away':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-400';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'online':
        return 'En ligne';
      case 'away':
        return 'Absent';
      default:
        return 'Hors ligne';
    }
  };

  return (
    <div className="flex items-center gap-2">
      <div className={`w-3 h-3 rounded-full ${getStatusColor()}`} />
      {showText && (
        <Badge variant="outline" className="text-xs">
          {getStatusText()}
        </Badge>
      )}
    </div>
  );
};

export default UserStatus;
