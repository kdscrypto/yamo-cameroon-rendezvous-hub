
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { SearchFilters as SearchFiltersType } from '@/hooks/useSearch';
import { useState } from 'react';
import FilterHeader from './SearchFilters/FilterHeader';
import BasicFilters from './SearchFilters/BasicFilters';
import AdvancedToggle from './SearchFilters/AdvancedToggle';
import AdvancedFilters from './SearchFilters/AdvancedFilters';

interface SearchFiltersProps {
  filters: SearchFiltersType;
  onFiltersChange: (filters: Partial<SearchFiltersType>) => void;
  onReset: () => void;
}

const SearchFilters = ({ filters, onFiltersChange, onReset }: SearchFiltersProps) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const hasActiveFilters = filters.category !== 'all' || 
                          filters.location !== 'all' || 
                          filters.sortBy !== 'recent' ||
                          filters.isVip ||
                          filters.minPrice !== undefined ||
                          filters.maxPrice !== undefined;

  return (
    <Card className="mb-6 bg-neutral-800/50 border-neutral-600">
      <CardHeader className="pb-4">
        <FilterHeader hasActiveFilters={hasActiveFilters} onReset={onReset} />
      </CardHeader>
      <CardContent className="space-y-4">
        <BasicFilters filters={filters} onFiltersChange={onFiltersChange} />
        
        <AdvancedToggle 
          showAdvanced={showAdvanced} 
          onToggle={() => setShowAdvanced(!showAdvanced)} 
        />

        {showAdvanced && (
          <AdvancedFilters filters={filters} onFiltersChange={onFiltersChange} />
        )}
      </CardContent>
    </Card>
  );
};

export default SearchFilters;
