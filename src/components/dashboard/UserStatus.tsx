
import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';

interface UserStatusProps {
  userId: string;
  showText?: boolean;
}

const UserStatus = ({ userId, showText = false }: UserStatusProps) => {
  const [status, setStatus] = useState<'online' | 'away' | 'offline'>('offline');

  useEffect(() => {
    if (!userId) return;

    const channel = supabase.channel(`user-${userId}-presence`);

    // Track user presence
    const trackPresence = async () => {
      await channel.track({
        user_id: userId,
        online_at: new Date().toISOString(),
        status: 'online'
      });
    };

    // Listen for presence changes
    channel
      .on('presence', { event: 'sync' }, () => {
        const presenceState = channel.presenceState();
        const userPresence = presenceState[`user-${userId}`];
        
        if (userPresence && userPresence.length > 0) {
          const latestPresence = userPresence[0];
          const presenceStatus = latestPresence?.status || 'online';
          setStatus(presenceStatus);
        } else {
          setStatus('offline');
        }
      })
      .on('presence', { event: 'join' }, ({ newPresences }) => {
        const userJoined = newPresences.find((presence: any) => presence.user_id === userId);
        if (userJoined) {
          setStatus('online');
        }
      })
      .on('presence', { event: 'leave' }, ({ leftPresences }) => {
        const userLeft = leftPresences.find((presence: any) => presence.user_id === userId);
        if (userLeft) {
          setStatus('offline');
        }
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await trackPresence();
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

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
