
import { useState, useCallback, useMemo } from 'react';
import { useDebounceCallback } from '@/hooks/use-performance';
import { useKeyboardNavigation } from '@/hooks/use-accessibility';

interface UseSearchLogicProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: (query: string) => void;
  suggestions: string[];
  debounceMs: number;
}

export const useSearchLogic = ({
  value,
  onChange,
  onSearch,
  suggestions,
  debounceMs
}: UseSearchLogicProps) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);

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

  return {
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
  };
};
