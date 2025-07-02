
import React, { forwardRef } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input-enhanced';
import { ButtonAccessible } from '@/components/ui/button-accessible';

interface SearchInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFocus: () => void;
  onBlur: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  onClear: () => void;
  placeholder: string;
  loading: boolean;
  isFocused: boolean;
  showSuggestions: boolean;
  selectedSuggestionIndex: number;
}

const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(({
  value,
  onChange,
  onFocus,
  onBlur,
  onKeyDown,
  onClear,
  placeholder,
  loading,
  isFocused,
  showSuggestions,
  selectedSuggestionIndex
}, ref) => {
  return (
    <div className={`relative transition-all duration-200 ${isFocused ? 'ring-2 ring-primary ring-opacity-50' : ''} rounded-md`}>
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
      
      <Input
        ref={ref}
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onFocus={onFocus}
        onBlur={onBlur}
        onKeyDown={onKeyDown}
        className="pl-10 pr-20 bg-background border-border focus:ring-2 focus:ring-primary focus:border-transparent"
        aria-expanded={showSuggestions}
        aria-haspopup="listbox"
        aria-autocomplete="list"
        aria-activedescendant={selectedSuggestionIndex >= 0 ? `suggestion-${selectedSuggestionIndex}` : undefined}
      />
      
      <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
        {loading && (
          <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
        )}
        
        {value && (
          <ButtonAccessible
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={onClear}
            className="h-6 w-6 p-0 hover:bg-muted hover:text-foreground"
            ariaLabel="Effacer la recherche"
          >
            <X className="w-3 h-3" />
          </ButtonAccessible>
        )}
      </div>
    </div>
  );
});

SearchInput.displayName = 'SearchInput';

export default SearchInput;
