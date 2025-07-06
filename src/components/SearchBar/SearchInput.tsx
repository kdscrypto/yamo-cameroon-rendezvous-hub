
import { useState } from 'react';
import { Input } from '@/components/ui/input';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: () => void;
  placeholder?: string;
}

const SearchInput = ({ value, onChange, onSearch, placeholder = "Rechercher des annonces..." }: SearchInputProps) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSearch();
    }
  };

  return (
    <div className={`relative transition-all duration-200 ${isFocused ? 'ring-2 ring-primary ring-opacity-50' : ''} rounded-md`}>
      <Input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onKeyDown={handleKeyDown}
        className="pl-10 pr-10 bg-neutral-800/50 border-neutral-600 text-white placeholder:text-neutral-300 focus:ring-2 focus:ring-primary focus:border-transparent"
      />
    </div>
  );
};

export default SearchInput;
