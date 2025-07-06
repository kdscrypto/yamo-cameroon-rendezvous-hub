
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ClearButtonProps {
  onClear: () => void;
}

const ClearButton = ({ onClear }: ClearButtonProps) => {
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={onClear}
      className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-neutral-700 text-white hover:text-neutral-200"
    >
      <X className="w-3 h-3" />
    </Button>
  );
};

export default ClearButton;
