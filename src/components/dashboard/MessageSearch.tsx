
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface MessageSearchProps {
  onSearch: (query: string) => void;
  onClear: () => void;
  placeholder?: string;
}

const MessageSearch = ({ onSearch, onClear, placeholder = "Rechercher dans les messages..." }: MessageSearchProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      setIsSearching(true);
      onSearch(searchQuery.trim());
    }
  };

  const handleClear = () => {
    setSearchQuery('');
    setIsSearching(false);
    onClear();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex gap-2">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            className="flex-1"
          />
          <Button 
            onClick={handleSearch}
            disabled={!searchQuery.trim()}
            size="sm"
          >
            <Search className="w-4 h-4" />
          </Button>
          {isSearching && (
            <Button 
              onClick={handleClear}
              variant="outline"
              size="sm"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
        {isSearching && (
          <div className="mt-2 text-sm text-muted-foreground">
            Recherche pour: "{searchQuery}"
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MessageSearch;
