
import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface SearchResult {
  id: string;
  content: string;
  sender_id: string;
  recipient_id: string;
  created_at: string;
  conversation_id: string;
  subject?: string;
}

export const useMessageSearch = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchActive, setIsSearchActive] = useState(false);

  const { data: searchResults, isLoading, error } = useQuery({
    queryKey: ['message-search', searchQuery, user?.id],
    queryFn: async () => {
      if (!user || !searchQuery.trim()) return [];

      const { data, error } = await supabase
        .from('messages')
        .select(`
          id,
          content,
          sender_id,
          recipient_id,
          created_at,
          conversation_id,
          subject
        `)
        .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .textSearch('content', searchQuery.trim())
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Search error:', error);
        throw error;
      }

      return data as SearchResult[];
    },
    enabled: !!user && !!searchQuery.trim() && isSearchActive
  });

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setIsSearchActive(true);
  }, []);

  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setIsSearchActive(false);
  }, []);

  return {
    searchQuery,
    searchResults: searchResults || [],
    isLoading,
    error,
    isSearchActive,
    handleSearch,
    clearSearch
  };
};
