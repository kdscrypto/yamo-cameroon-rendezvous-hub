
import React, { useState, useCallback, useMemo } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input-enhanced';
import { ButtonAccessible } from '@/components/ui/button-accessible';
import { useDebounceCallback } from '@/hooks/use-performance';
import { useAccessibility, useKeyboardNavigation } from '@/hooks/use-accessibility';

interface SearchBarOptimizedProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: (query: string) => void;
  placeholder?: string;
  className?: string;
  suggestions?: string[];
  loading?: boolean;
  debounceMs?: number;
}

const SearchBarOptimized = React.memo(({ 
  value, 
  onChange, 
  onSearch, 
  placeholder = "Rechercher des annonces...",
  className = "",
  suggestions = [],
  loading = false,
  debounceMs = 300
}: SearchBarOptimizedProps) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);

  const { ref: searchRef, accessibilityProps } = useAccessibility({
    role: 'search',
    ariaLabel: 'Barre de recherche',
    ariaDescribedBy: 'search-instructions',
  });

  // Debounced search pour optimiser les performances
  const debouncedSearch = useDebounceCallback((query: string) => {
    onSearch(query);
  }, debounceMs);

  // Filtrer les suggestions de manière optimisée
  const filteredSuggestions = useMemo(() => {
    if (!value.trim() || !suggestions.length) return [];
    
    return suggestions
      .filter(suggestion => 
        suggestion.toLowerCase().includes(value.toLowerCase())
      )
      .slice(0, 5); // Limiter à 5 suggestions
  }, [value, suggestions]);

  const { handleKeyDown: handleSuggestionKeyDown } = useKeyboardNavigation(
    filteredSuggestions,
    (suggestion) => {
      onChange(suggestion);
      setShowSuggestions(false);
      debouncedSearch(suggestion);
    }
  );

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (selectedSuggestionIndex >= 0 && filteredSuggestions[selectedSuggestionIndex]) {
      onChange(filteredSuggestions[selectedSuggestionIndex]);
    }
    onSearch(value);
    setShowSuggestions(false);
  }, [value, onSearch, selectedSuggestionIndex, filteredSuggestions, onChange]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    setSelectedSuggestionIndex(-1);
    
    if (newValue.trim()) {
      debouncedSearch(newValue);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  }, [onChange, debouncedSearch]);

  const handleClear = useCallback(() => {
    onChange('');
    setShowSuggestions(false);
    setSelectedSuggestionIndex(-1);
  }, [onChange]);

  const handleFocus = useCallback(() => {
    setIsFocused(true);
    if (value.trim() && filteredSuggestions.length > 0) {
      setShowSuggestions(true);
    }
  }, [value, filteredSuggestions.length]);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    // Délai pour permettre la sélection des suggestions
    setTimeout(() => setShowSuggestions(false), 200);
  }, []);

  const handleSuggestionClick = useCallback((suggestion: string) => {
    onChange(suggestion);
    setShowSuggestions(false);
    debouncedSearch(suggestion);
  }, [onChange, debouncedSearch]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setShowSuggestions(false);
      setSelectedSuggestionIndex(-1);
      return;
    }

    if (!showSuggestions || filteredSuggestions.length === 0) {
      if (e.key === 'Enter') {
        handleSubmit(e as any);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedSuggestionIndex(prev => 
          prev < filteredSuggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedSuggestionIndex(prev => 
          prev > 0 ? prev - 1 : filteredSuggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedSuggestionIndex >= 0) {
          handleSuggestionClick(filteredSuggestions[selectedSuggestionIndex]);
        } else {
          handleSubmit(e as any);
        }
        break;
    }
  }, [showSuggestions, filteredSuggestions, selectedSuggestionIndex, handleSubmit, handleSuggestionClick]);

  return (
    <div className={`relative ${className}`} ref={searchRef} {...accessibilityProps}>
      <form onSubmit={handleSubmit} className="relative">
        <div className={`relative transition-all duration-200 ${isFocused ? 'ring-2 ring-primary ring-opacity-50' : ''} rounded-md`}>
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          
          <Input
            type="text"
            placeholder={placeholder}
            value={value}
            onChange={handleInputChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
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
                onClick={handleClear}
                className="h-6 w-6 p-0 hover:bg-muted hover:text-foreground"
                ariaLabel="Effacer la recherche"
              >
                <X className="w-3 h-3" />
              </ButtonAccessible>
            )}
          </div>
        </div>

        {/* Instructions cachées pour les lecteurs d'écran */}
        <div id="search-instructions" className="sr-only">
          Tapez pour rechercher. Utilisez les flèches haut/bas pour naviguer dans les suggestions, Entrée pour sélectionner.
        </div>
      </form>

      {/* Suggestions dropdown */}
      {showSuggestions && filteredSuggestions.length > 0 && (
        <div 
          className="absolute top-full left-0 right-0 z-50 mt-1 bg-popover border border-border rounded-md shadow-lg max-h-60 overflow-auto"
          role="listbox"
          aria-label="Suggestions de recherche"
        >
          {filteredSuggestions.map((suggestion, index) => (
            <button
              key={suggestion}
              id={`suggestion-${index}`}
              className={`w-full text-left px-4 py-2 hover:bg-accent hover:text-accent-foreground transition-colors ${
                selectedSuggestionIndex === index ? 'bg-accent text-accent-foreground' : ''
              }`}
              onClick={() => handleSuggestionClick(suggestion)}
              role="option"
              aria-selected={selectedSuggestionIndex === index}
            >
              <Search className="inline w-3 h-3 mr-2 text-muted-foreground" />
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  );
});

SearchBarOptimized.displayName = 'SearchBarOptimized';

export default SearchBarOptimized;
