
import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Search, FileText, Calendar } from 'lucide-react';
import SearchFilters, { SearchFilters as SearchFiltersType } from './SearchFilters';

interface SearchResult {
  id: string;
  content: string;
  sender_id: string;
  recipient_id: string;
  created_at: string;
  conversation_id: string;
  subject?: string;
  is_read: boolean;
  message_attachments?: Array<{
    id: string;
    file_name: string;
    file_type: string;
  }>;
  sender_profile?: {
    full_name: string | null;
    email: string | null;
  } | null;
}

interface AdvancedMessageSearchProps {
  onMessageSelect?: (conversationId: string) => void;
}

const AdvancedMessageSearch = ({ onMessageSelect }: AdvancedMessageSearchProps) => {
  const { user } = useAuth();
  const [filters, setFilters] = useState<SearchFiltersType>({ query: '' });
  const [isSearchActive, setIsSearchActive] = useState(false);

  const { data: searchResults, isLoading, error } = useQuery({
    queryKey: ['advanced-message-search', filters, user?.id],
    queryFn: async () => {
      if (!user || !filters.query.trim()) return [];

      const trimmedQuery = filters.query.trim().substring(0, 100);
      if (trimmedQuery.length < 2) return [];

      let query = supabase
        .from('messages')
        .select(`
          id,
          content,
          sender_id,
          recipient_id,
          created_at,
          conversation_id,
          subject,
          is_read,
          message_attachments(id, file_name, file_type),
          sender_profile:profiles!messages_sender_id_fkey(full_name, email)
        `)
        .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .textSearch('content', trimmedQuery)
        .order('created_at', { ascending: false })
        .limit(50);

      if (filters.dateFrom) {
        query = query.gte('created_at', filters.dateFrom.toISOString());
      }
      if (filters.dateTo) {
        const dateTo = new Date(filters.dateTo);
        dateTo.setHours(23, 59, 59, 999);
        query = query.lte('created_at', dateTo.toISOString());
      }

      const { data, error } = await query;

      if (error) {
        console.error('Advanced search error:', error);
        throw error;
      }

      let results = data as unknown as SearchResult[];

      if (filters.hasAttachments !== undefined) {
        results = results.filter(msg => 
          filters.hasAttachments 
            ? (msg.message_attachments && msg.message_attachments.length > 0)
            : (!msg.message_attachments || msg.message_attachments.length === 0)
        );
      }

      if (filters.isUnread !== undefined) {
        results = results.filter(msg => {
          const isRecipient = msg.recipient_id === user.id;
          if (!isRecipient) return true;
          return filters.isUnread ? !msg.is_read : msg.is_read;
        });
      }

      return results;
    },
    enabled: !!user && !!filters.query.trim() && isSearchActive && filters.query.trim().length >= 2
  });

  const handleFiltersChange = useCallback((newFilters: SearchFiltersType) => {
    setFilters(newFilters);
    setIsSearchActive(!!newFilters.query.trim() && newFilters.query.trim().length >= 2);
  }, []);

  const handleReset = useCallback(() => {
    setIsSearchActive(false);
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSenderName = (message: SearchResult) => {
    if (message.sender_id === user?.id) return 'Vous';
    return message.sender_profile?.full_name || 
           message.sender_profile?.email || 
           'Utilisateur inconnu';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Search className="w-5 h-5" />
        <h2 className="text-xl font-semibold">Recherche avancée</h2>
      </div>

      <SearchFilters 
        onFiltersChange={handleFiltersChange}
        onReset={handleReset}
      />

      {isLoading && (
        <div className="text-center py-8">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Recherche en cours...</p>
        </div>
      )}

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-600">Erreur lors de la recherche. Veuillez réessayer.</p>
          </CardContent>
        </Card>
      )}

      {isSearchActive && !isLoading && searchResults && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {searchResults.length} résultat{searchResults.length > 1 ? 's' : ''} trouvé{searchResults.length > 1 ? 's' : ''}
            </p>
          </div>

          {searchResults.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Aucun message trouvé pour cette recherche.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {searchResults.map((message) => (
                <Card 
                  key={message.id} 
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => onMessageSelect?.(message.conversation_id)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                          <MessageSquare className="w-4 h-4" />
                          {message.subject || 'Sans sujet'}
                          {message.message_attachments && message.message_attachments.length > 0 && (
                            <Badge variant="secondary" className="text-xs">
                              <FileText className="w-3 h-3 mr-1" />
                              {message.message_attachments.length}
                            </Badge>
                          )}
                        </CardTitle>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                          <span>De: {getSenderName(message)}</span>
                          <span>•</span>
                          <Calendar className="w-3 h-3" />
                          <span>{formatDate(message.created_at)}</span>
                        </div>
                      </div>
                      {message.recipient_id === user?.id && !message.is_read && (
                        <Badge variant="default" className="text-xs">Nouveau</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {message.content}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {!isSearchActive && (
        <Card>
          <CardContent className="text-center py-12">
            <Search className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              Utilisez la barre de recherche ci-dessus pour trouver des messages.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Minimum 2 caractères requis.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdvancedMessageSearch;
