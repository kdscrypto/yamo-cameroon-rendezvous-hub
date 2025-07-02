
import React from 'react';
import { Search } from 'lucide-react';

interface SearchSuggestionsProps {
  suggestions: string[];
  selectedIndex: number;
  onSuggestionClick: (suggestion: string) => void;
  show: boolean;
}

const SearchSuggestions = React.memo(({
  suggestions,
  selectedIndex,
  onSuggestionClick,
  show
}: SearchSuggestionsProps) => {
  if (!show || suggestions.length === 0) {
    return null;
  }

  return (
    <div 
      className="absolute top-full left-0 right-0 z-50 mt-1 bg-popover border border-border rounded-md shadow-lg max-h-60 overflow-auto"
      role="listbox"
      aria-label="Suggestions de recherche"
    >
      {suggestions.map((suggestion, index) => (
        <button
          key={suggestion}
          id={`suggestion-${index}`}
          className={`w-full text-left px-4 py-2 hover:bg-accent hover:text-accent-foreground transition-colors ${
            selectedIndex === index ? 'bg-accent text-accent-foreground' : ''
          }`}
          onClick={() => onSuggestionClick(suggestion)}
          role="option"
          aria-selected={selectedIndex === index}
        >
          <Search className="inline w-3 h-3 mr-2 text-muted-foreground" />
          {suggestion}
        </button>
      ))}
    </div>
  );
});

SearchSuggestions.displayName = 'SearchSuggestions';

export default SearchSuggestions;
