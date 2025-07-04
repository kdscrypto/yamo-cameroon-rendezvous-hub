
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Message } from './types';

interface ConversationPaginationProps {
  conversationId: string;
  messages: Message[];
  onLoadMore: (messages: Message[], direction: 'up' | 'down') => void;
  currentUserId?: string;
}

const MESSAGES_PER_PAGE = 50;

const ConversationPagination = ({ 
  conversationId, 
  messages, 
  onLoadMore,
  currentUserId 
}: ConversationPaginationProps) => {
  const [hasOlderMessages, setHasOlderMessages] = useState(true);
  const [hasNewerMessages, setHasNewerMessages] = useState(false);
  const [isLoadingOlder, setIsLoadingOlder] = useState(false);
  const [isLoadingNewer, setIsLoadingNewer] = useState(false);

  const oldestMessage = messages.length > 0 ? messages[0] : null;
  const newestMessage = messages.length > 0 ? messages[messages.length - 1] : null;

  // Check for older messages
  const checkOlderMessages = async () => {
    if (!oldestMessage) return false;
    
    const { count } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('conversation_id', conversationId)
      .lt('created_at', oldestMessage.created_at);
    
    return (count ?? 0) > 0;
  };

  // Check for newer messages
  const checkNewerMessages = async () => {
    if (!newestMessage) return false;
    
    const { count } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('conversation_id', conversationId)
      .gt('created_at', newestMessage.created_at);
    
    return (count ?? 0) > 0;
  };

  // Load older messages
  const loadOlderMessages = async () => {
    if (!oldestMessage || isLoadingOlder) return;
    
    setIsLoadingOlder(true);
    
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          message_attachments(*)
        `)
        .eq('conversation_id', conversationId)
        .lt('created_at', oldestMessage.created_at)
        .order('created_at', { ascending: true })
        .limit(MESSAGES_PER_PAGE);

      if (error) throw error;

      if (data && data.length > 0) {
        onLoadMore(data as Message[], 'up');
        
        // Check if there are still more older messages
        const hasMore = await checkOlderMessages();
        setHasOlderMessages(hasMore);
      } else {
        setHasOlderMessages(false);
      }
    } catch (error) {
      console.error('Error loading older messages:', error);
    } finally {
      setIsLoadingOlder(false);
    }
  };

  // Load newer messages
  const loadNewerMessages = async () => {
    if (!newestMessage || isLoadingNewer) return;
    
    setIsLoadingNewer(true);
    
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          message_attachments(*)
        `)
        .eq('conversation_id', conversationId)
        .gt('created_at', newestMessage.created_at)
        .order('created_at', { ascending: true })
        .limit(MESSAGES_PER_PAGE);

      if (error) throw error;

      if (data && data.length > 0) {
        onLoadMore(data as Message[], 'down');
        
        // Check if there are still more newer messages
        const hasMore = await checkNewerMessages();
        setHasNewerMessages(hasMore);
      } else {
        setHasNewerMessages(false);
      }
    } catch (error) {
      console.error('Error loading newer messages:', error);
    } finally {
      setIsLoadingNewer(false);
    }
  };

  // Initialize pagination state
  useEffect(() => {
    const initializePagination = async () => {
      if (messages.length === 0) return;
      
      const [hasOlder, hasNewer] = await Promise.all([
        checkOlderMessages(),
        checkNewerMessages()
      ]);
      
      setHasOlderMessages(hasOlder);
      setHasNewerMessages(hasNewer);
    };

    initializePagination();
  }, [conversationId, messages.length]);

  if (!hasOlderMessages && !hasNewerMessages) return null;

  return (
    <div className="flex flex-col items-center gap-2 py-2">
      {hasOlderMessages && (
        <Button
          variant="outline"
          size="sm"
          onClick={loadOlderMessages}
          disabled={isLoadingOlder}
          className="w-full max-w-xs"
        >
          <ChevronUp className="w-4 h-4 mr-2" />
          {isLoadingOlder ? 'Chargement...' : 'Charger les messages précédents'}
        </Button>
      )}
      
      {hasNewerMessages && (
        <Button
          variant="outline"
          size="sm"
          onClick={loadNewerMessages}
          disabled={isLoadingNewer}
          className="w-full max-w-xs"
        >
          <ChevronDown className="w-4 h-4 mr-2" />
          {isLoadingNewer ? 'Chargement...' : 'Charger les messages suivants'}
        </Button>
      )}
    </div>
  );
};

export default ConversationPagination;
