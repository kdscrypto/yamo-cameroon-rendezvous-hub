
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SearchFilters as SearchFiltersType } from '@/hooks/useSearch';
import { Filter, X } from 'lucide-react';
import { useState } from 'react';

interface SearchFiltersProps {
  filters: SearchFiltersType;
  onFiltersChange: (filters: Partial<SearchFiltersType>) => void;
  onReset: () => void;
}

const SearchFilters = ({ filters, onFiltersChange, onReset }: SearchFiltersProps) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

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

  const hasActiveFilters = filters.category !== 'all' || 
                          filters.location !== 'all' || 
                          filters.sortBy !== 'recent' ||
                          filters.isVip ||
                          filters.minPrice !== undefined ||
                          filters.maxPrice !== undefined;

  return (
    <Card className="mb-6 bg-neutral-800/50 border-neutral-600">
      <CardHeader className="pb-4">
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
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Basic Filters */}
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

        {/* Advanced Filters Toggle */}
        <div className="flex items-center justify-between pt-4 border-t border-neutral-600">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-sm text-white hover:bg-neutral-700"
          >
            Filtres avancés {showAdvanced ? '▲' : '▼'}
          </Button>
        </div>

        {/* Advanced Filters */}
        {showAdvanced && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-neutral-600">
            <div className="space-y-2">
              <Label htmlFor="minPrice" className="text-white">Prix minimum (FCFA)</Label>
              <Input
                id="minPrice"
                type="number"
                placeholder="0"
                value={filters.minPrice || ''}
                onChange={(e) => onFiltersChange({ 
                  minPrice: e.target.value ? Number(e.target.value) : undefined 
                })}
                className="bg-neutral-700 border-neutral-600 text-white placeholder:text-neutral-400"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxPrice" className="text-white">Prix maximum (FCFA)</Label>
              <Input
                id="maxPrice"
                type="number"
                placeholder="100000"
                value={filters.maxPrice || ''}
                onChange={(e) => onFiltersChange({ 
                  maxPrice: e.target.value ? Number(e.target.value) : undefined 
                })}
                className="bg-neutral-700 border-neutral-600 text-white placeholder:text-neutral-400"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="vip" className="text-white">Annonces VIP uniquement</Label>
              <div className="flex items-center space-x-2">
                <Switch
                  id="vip"
                  checked={filters.isVip || false}
                  onCheckedChange={(checked) => onFiltersChange({ isVip: checked || undefined })}
                />
                <Label htmlFor="vip" className="text-sm text-neutral-300">
                  Afficher seulement les annonces premium
                </Label>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SearchFilters;
