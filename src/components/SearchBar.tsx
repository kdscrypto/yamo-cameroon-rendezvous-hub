
import SearchIcon from './SearchBar/SearchIcon';
import ClearButton from './SearchBar/ClearButton';
import SearchInput from './SearchBar/SearchInput';

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
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch();
  };

  const handleClear = () => {
    onChange('');
  };

  return (
    <form onSubmit={handleSubmit} className={`relative ${className}`}>
      <SearchIcon />
      <SearchInput 
        value={value}
        onChange={onChange}
        onSearch={onSearch}
        placeholder={placeholder}
      />
      {value && <ClearButton onClear={handleClear} />}
    </form>
  );
};

export default SearchBar;
