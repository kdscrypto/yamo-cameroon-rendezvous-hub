
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Search, Filter, CalendarIcon, X } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface WaitlistFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: 'all' | 'notified' | 'pending';
  onStatusFilterChange: (value: 'all' | 'notified' | 'pending') => void;
  dateFilter: { start?: Date; end?: Date };
  onDateFilterChange: (dateFilter: { start?: Date; end?: Date }) => void;
}

const WaitlistFilters = ({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  dateFilter,
  onDateFilterChange
}: WaitlistFiltersProps) => {
  const [showDatePicker, setShowDatePicker] = useState(false);

  const clearFilters = () => {
    onSearchChange('');
    onStatusFilterChange('all');
    onDateFilterChange({});
  };

  const hasActiveFilters = searchTerm || statusFilter !== 'all' || dateFilter.start || dateFilter.end;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Rechercher par email ou nom..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={statusFilter} onValueChange={onStatusFilterChange}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="pending">En attente</SelectItem>
            <SelectItem value="notified">Notifiés</SelectItem>
          </SelectContent>
        </Select>

        <Popover open={showDatePicker} onOpenChange={setShowDatePicker}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full sm:w-[240px]">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateFilter.start ? (
                dateFilter.end ? (
                  <>
                    {format(dateFilter.start, 'dd MMM', { locale: fr })} - {format(dateFilter.end, 'dd MMM', { locale: fr })}
                  </>
                ) : (
                  format(dateFilter.start, 'dd MMM yyyy', { locale: fr })
                )
              ) : (
                'Filtrer par date'
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={dateFilter.start}
              selected={{
                from: dateFilter.start,
                to: dateFilter.end,
              }}
              onSelect={(range) => {
                onDateFilterChange({
                  start: range?.from,
                  end: range?.to,
                });
                if (range?.from && range?.to) {
                  setShowDatePicker(false);
                }
              }}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>

        {hasActiveFilters && (
          <Button onClick={clearFilters} variant="ghost" size="sm">
            <X className="h-4 w-4 mr-2" />
            Effacer
          </Button>
        )}
      </div>

      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {searchTerm && (
            <Badge variant="secondary">
              Recherche: {searchTerm}
              <X 
                className="h-3 w-3 ml-1 cursor-pointer" 
                onClick={() => onSearchChange('')}
              />
            </Badge>
          )}
          {statusFilter !== 'all' && (
            <Badge variant="secondary">
              Statut: {statusFilter === 'notified' ? 'Notifiés' : 'En attente'}
              <X 
                className="h-3 w-3 ml-1 cursor-pointer" 
                onClick={() => onStatusFilterChange('all')}
              />
            </Badge>
          )}
          {(dateFilter.start || dateFilter.end) && (
            <Badge variant="secondary">
              Période: {dateFilter.start && format(dateFilter.start, 'dd/MM', { locale: fr })}
              {dateFilter.start && dateFilter.end && ' - '}
              {dateFilter.end && format(dateFilter.end, 'dd/MM', { locale: fr })}
              <X 
                className="h-3 w-3 ml-1 cursor-pointer" 
                onClick={() => onDateFilterChange({})}
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};

export default WaitlistFilters;
