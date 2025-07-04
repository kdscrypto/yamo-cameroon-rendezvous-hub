
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

      // Limit search query length to prevent abuse
      const trimmedQuery = searchQuery.trim().substring(0, 100);
      
      // Add minimum search length to prevent too broad searches
      if (trimmedQuery.length < 3) {
        return [];
      }

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
        .textSearch('content', trimmedQuery)
        .order('created_at', { ascending: false })
        .limit(20); // Limit results to prevent performance issues

      if (error) {
        console.error('Search error:', error);
        throw error;
      }

      return data as SearchResult[];
    },
    enabled: !!user && !!searchQuery.trim() && isSearchActive && searchQuery.trim().length >= 3
  });

  const handleSearch = useCallback((query: string) => {
    // Sanitize and limit search query
    const sanitizedQuery = query.trim().substring(0, 100);
    setSearchQuery(sanitizedQuery);
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
    clearSearch,
    minSearchLength: 3
  };
};
