
import React, { useRef } from 'react';
import { useAccessibility } from '@/hooks/use-accessibility';
import { useSearchLogic } from '@/hooks/useSearchLogic';
import SearchInput from '@/components/SearchInput';
import SearchSuggestions from '@/components/SearchSuggestions';

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
  const searchRef = useRef<HTMLDivElement>(null);
  const { accessibilityProps } = useAccessibility({
    role: 'search',
    ariaLabel: 'Barre de recherche',
    ariaDescribedBy: 'search-instructions',
  });

  const {
    isFocused,
    showSuggestions,
    selectedSuggestionIndex,
    filteredSuggestions,
    handleSubmit,
    handleInputChange,
    handleClear,
    handleFocus,
    handleBlur,
    handleSuggestionClick,
    handleKeyDown
  } = useSearchLogic({
    value,
    onChange,
    onSearch,
    suggestions,
    debounceMs
  });

  return (
    <div className={`relative ${className}`} ref={searchRef} {...accessibilityProps}>
      <form onSubmit={handleSubmit} className="relative">
        <SearchInput
          value={value}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          onClear={handleClear}
          placeholder={placeholder}
          loading={loading}
          isFocused={isFocused}
          showSuggestions={showSuggestions}
          selectedSuggestionIndex={selectedSuggestionIndex}
        />

        {/* Instructions cachées pour les lecteurs d'écran */}
        <div id="search-instructions" className="sr-only">
          Tapez pour rechercher. Utilisez les flèches haut/bas pour naviguer dans les suggestions, Entrée pour sélectionner.
        </div>
      </form>

      <SearchSuggestions
        suggestions={filteredSuggestions}
        selectedIndex={selectedSuggestionIndex}
        onSuggestionClick={handleSuggestionClick}
        show={showSuggestions}
      />
    </div>
  );
});

SearchBarOptimized.displayName = 'SearchBarOptimized';

export default SearchBarOptimized;
