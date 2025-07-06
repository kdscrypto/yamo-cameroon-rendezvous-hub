
import { Button } from '@/components/ui/button';

interface AdvancedToggleProps {
  showAdvanced: boolean;
  onToggle: () => void;
}

const AdvancedToggle = ({ showAdvanced, onToggle }: AdvancedToggleProps) => {
  return (
    <div className="flex items-center justify-between pt-4 border-t border-neutral-600">
      <Button
        variant="ghost"
        size="sm"
        onClick={onToggle}
        className="text-sm text-white hover:bg-neutral-700"
      >
        Filtres avancés {showAdvanced ? '▲' : '▼'}
      </Button>
    </div>
  );
};

export default AdvancedToggle;
