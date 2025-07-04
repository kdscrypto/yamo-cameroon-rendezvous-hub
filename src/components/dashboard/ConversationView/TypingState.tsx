
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface TypingUser {
  userId: string;
  userName: string;
  timestamp: number;
}

interface TypingStateProps {
  conversationId: string;
  isTyping: boolean;
  onTypingUsersChange?: (users: TypingUser[]) => void;
}

export const useTypingState = ({ conversationId, isTyping }: Omit<TypingStateProps, 'onTypingUsersChange'>) => {
  const { user } = useAuth();
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);

  useEffect(() => {
    if (!user || !conversationId) return;

    const channel = supabase.channel(`typing_${conversationId}`);

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const users: TypingUser[] = [];
        
        Object.keys(state).forEach(userId => {
          if (userId !== user.id && state[userId]?.[0]) {
            const presence = state[userId][0];
            users.push({
              userId,
              userName: (presence as any).userName || 'Utilisateur',
              timestamp: (presence as any).timestamp || Date.now()
            });
          }
        });
        
        setTypingUsers(users);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        if (key !== user.id && newPresences?.[0]) {
          const presence = newPresences[0];
          setTypingUsers(prev => {
            const filtered = prev.filter(u => u.userId !== key);
            return [...filtered, {
              userId: key,
              userName: (presence as any).userName || 'Utilisateur',
              timestamp: (presence as any).timestamp || Date.now()
            }];
          });
        }
      })
      .on('presence', { event: 'leave' }, ({ key }) => {
        if (key !== user.id) {
          setTypingUsers(prev => prev.filter(u => u.userId !== key));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, user]);

  useEffect(() => {
    if (!user || !conversationId) return;

    const channel = supabase.channel(`typing_${conversationId}`);
    
    if (isTyping) {
      channel.track({
        userId: user.id,
        userName: user.email || 'Utilisateur',
        timestamp: Date.now()
      });
    } else {
      channel.untrack();
    }

    return () => {
      channel.untrack();
    };
  }, [isTyping, conversationId, user]);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setTypingUsers(prev => 
        prev.filter(user => now - user.timestamp < 5000)
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return { typingUsers };
};

const TypingIndicator = ({ conversationId, isTyping }: TypingStateProps) => {
  const { typingUsers } = useTypingState({ conversationId, isTyping });

  if (typingUsers.length === 0) return null;

  return (
    <div className="flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground">
      <div className="flex gap-1">
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
      </div>
      <span>
        {typingUsers.length === 1 
          ? `${typingUsers[0].userName} écrit...`
          : `${typingUsers.length} personnes écrivent...`
        }
      </span>
    </div>
  );
};

export default TypingIndicator;
