
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { SearchFilters } from '@/hooks/useSearch';

interface AdvancedFiltersProps {
  filters: SearchFilters;
  onFiltersChange: (filters: Partial<SearchFilters>) => void;
}

const AdvancedFilters = ({ filters, onFiltersChange }: AdvancedFiltersProps) => {
  return (
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
  );
};

export default AdvancedFilters;
