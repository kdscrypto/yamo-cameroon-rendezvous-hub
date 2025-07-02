
import SearchBarOptimized from '@/components/SearchBarOptimized';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: () => void;
  placeholder?: string;
  className?: string;
}

const SearchBar = ({ 
  value, 
  onChange, 
  onSearch, 
  placeholder = "Rechercher des annonces...",
  className = ""
}: SearchBarProps) => {
  const handleSearch = (query: string) => {
    onSearch();
  };

  return (
    <SearchBarOptimized
      value={value}
      onChange={onChange}
      onSearch={handleSearch}
      placeholder={placeholder}
      className={className}
      debounceMs={300}
    />
  );
};

export default SearchBar;
