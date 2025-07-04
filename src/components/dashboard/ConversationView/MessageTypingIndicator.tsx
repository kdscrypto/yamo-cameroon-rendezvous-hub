
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface MessageTypingIndicatorProps {
  conversationId: string;
  isTyping: boolean;
}

interface TypingUser {
  userId: string;
  userName: string;
  timestamp: number;
}

const MessageTypingIndicator = ({ conversationId, isTyping }: MessageTypingIndicatorProps) => {
  const { user } = useAuth();
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);

  useEffect(() => {
    if (!user || !conversationId) return;

    const channel = supabase.channel(`typing_${conversationId}`);

    // Listen for typing events
    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const users: TypingUser[] = [];
        
        Object.keys(state).forEach(userId => {
          if (userId !== user.id) {
            const presence = state[userId][0];
            users.push({
              userId,
              userName: presence.userName || 'Utilisateur',
              timestamp: presence.timestamp
            });
          }
        });
        
        setTypingUsers(users);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        if (key !== user.id) {
          const presence = newPresences[0];
          setTypingUsers(prev => {
            const filtered = prev.filter(u => u.userId !== key);
            return [...filtered, {
              userId: key,
              userName: presence.userName || 'Utilisateur',
              timestamp: presence.timestamp
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

  // Broadcast typing state
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

  // Auto-cleanup old typing indicators
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setTypingUsers(prev => 
        prev.filter(user => now - user.timestamp < 5000) // Remove after 5 seconds
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

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

export default MessageTypingIndicator;
