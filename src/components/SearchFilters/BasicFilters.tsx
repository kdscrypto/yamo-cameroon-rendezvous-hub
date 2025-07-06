
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { SearchFilters } from '@/hooks/useSearch';

interface BasicFiltersProps {
  filters: SearchFilters;
  onFiltersChange: (filters: Partial<SearchFilters>) => void;
}

const BasicFilters = ({ filters, onFiltersChange }: BasicFiltersProps) => {
  const categories = [
    { value: 'all', label: 'Toutes les catégories' },
    { value: 'rencontres', label: 'Rencontres' },
    { value: 'massages', label: 'Massages' },
    { value: 'produits', label: 'Produits adultes' }
  ];

  const locations = [
    { value: 'all', label: 'Toutes les villes' },
    { value: 'douala', label: 'Douala' },
    { value: 'yaounde', label: 'Yaoundé' },
    { value: 'bafoussam', label: 'Bafoussam' },
    { value: 'bamenda', label: 'Bamenda' }
  ];

  const sortOptions = [
    { value: 'recent', label: 'Plus récent' },
    { value: 'price-low', label: 'Prix croissant' },
    { value: 'price-high', label: 'Prix décroissant' },
    { value: 'popular', label: 'Popularité' }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="space-y-2">
        <Label htmlFor="category" className="text-white">Catégorie</Label>
        <Select value={filters.category} onValueChange={(value) => onFiltersChange({ category: value })}>
          <SelectTrigger id="category" className="bg-neutral-700 border-neutral-600 text-white">
            <SelectValue placeholder="Sélectionner une catégorie" />
          </SelectTrigger>
          <SelectContent className="bg-neutral-700 border-neutral-600">
            {categories.map((category) => (
              <SelectItem key={category.value} value={category.value} className="text-white hover:bg-neutral-600">
                {category.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="location" className="text-white">Localisation</Label>
        <Select value={filters.location} onValueChange={(value) => onFiltersChange({ location: value })}>
          <SelectTrigger id="location" className="bg-neutral-700 border-neutral-600 text-white">
            <SelectValue placeholder="Sélectionner une ville" />
          </SelectTrigger>
          <SelectContent className="bg-neutral-700 border-neutral-600">
            {locations.map((location) => (
              <SelectItem key={location.value} value={location.value} className="text-white hover:bg-neutral-600">
                {location.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="sort" className="text-white">Trier par</Label>
        <Select value={filters.sortBy} onValueChange={(value) => onFiltersChange({ sortBy: value })}>
          <SelectTrigger id="sort" className="bg-neutral-700 border-neutral-600 text-white">
            <SelectValue placeholder="Trier par" />
          </SelectTrigger>
          <SelectContent className="bg-neutral-700 border-neutral-600">
            {sortOptions.map((option) => (
              <SelectItem key={option.value} value={option.value} className="text-white hover:bg-neutral-600">
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default BasicFilters;
