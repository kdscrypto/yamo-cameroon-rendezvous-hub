
import { Button } from '@/components/ui/button';
import { CardTitle } from '@/components/ui/card';
import { Filter, X } from 'lucide-react';

interface FilterHeaderProps {
  hasActiveFilters: boolean;
  onReset: () => void;
}

const FilterHeader = ({ hasActiveFilters, onReset }: FilterHeaderProps) => {
  return (
    <div className="flex items-center justify-between">
      <CardTitle className="text-lg flex items-center gap-2 text-white">
        <Filter className="w-5 h-5 text-primary" />
        Filtres de recherche
      </CardTitle>
      {hasActiveFilters && (
        <Button variant="outline" size="sm" onClick={onReset} className="border-neutral-600 text-white hover:bg-neutral-700">
          <X className="w-4 h-4 mr-2" />
          Réinitialiser
        </Button>
      )}
    </div>
  );
};

export default FilterHeader;
