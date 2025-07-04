
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface TypingIndicatorProps {
  conversationId: string;
}

const TypingIndicator = ({ conversationId }: TypingIndicatorProps) => {
  const { user } = useAuth();
  const [typingUsers, setTypingUsers] = useState<string[]>([]);

  useEffect(() => {
    if (!user || !conversationId) return;

    const channel = supabase.channel(`typing-${conversationId}`);

    channel
      .on('presence', { event: 'sync' }, () => {
        const presenceState = channel.presenceState();
        const currentlyTyping = Object.values(presenceState)
          .flat()
          .filter((presence: any) => presence.user_id !== user.id && presence.typing)
          .map((presence: any) => presence.user_id);
        
        setTypingUsers(currentlyTyping);
      })
      .on('presence', { event: 'join' }, ({ newPresences }) => {
        const typingUser = newPresences.find((p: any) => p.user_id !== user.id && p.typing);
        if (typingUser) {
          setTypingUsers(prev => [...new Set([...prev, typingUser.user_id])]);
        }
      })
      .on('presence', { event: 'leave' }, ({ leftPresences }) => {
        const stoppedTypingUsers = leftPresences.map((p: any) => p.user_id);
        setTypingUsers(prev => prev.filter(userId => !stoppedTypingUsers.includes(userId)));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, user]);

  const startTyping = () => {
    if (!user) return;
    
    const channel = supabase.channel(`typing-${conversationId}`);
    channel.track({
      user_id: user.id,
      typing: true,
      timestamp: new Date().toISOString()
    });
  };

  const stopTyping = () => {
    if (!user) return;
    
    const channel = supabase.channel(`typing-${conversationId}`);
    channel.track({
      user_id: user.id,
      typing: false,
      timestamp: new Date().toISOString()
    });
  };

  if (typingUsers.length === 0) return null;

  return (
    <div className="px-4 py-2 text-sm text-muted-foreground italic">
      <div className="flex items-center gap-2">
        <div className="flex gap-1">
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
        <span>
          {typingUsers.length === 1 
            ? 'Un utilisateur est en train d\'écrire...'
            : `${typingUsers.length} utilisateurs sont en train d'écrire...`
          }
        </span>
      </div>
    </div>
  );
};

export { TypingIndicator };
export const useTypingIndicator = (conversationId: string) => {
  const { user } = useAuth();

  const startTyping = () => {
    if (!user) return;
    
    const channel = supabase.channel(`typing-${conversationId}`);
    channel.track({
      user_id: user.id,
      typing: true,
      timestamp: new Date().toISOString()
    });
  };

  const stopTyping = () => {
    if (!user) return;
    
    const channel = supabase.channel(`typing-${conversationId}`);
    channel.track({
      user_id: user.id,
      typing: false,
      timestamp: new Date().toISOString()
    });
  };

  return { startTyping, stopTyping };
};
