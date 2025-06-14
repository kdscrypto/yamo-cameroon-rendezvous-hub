
import { Link } from 'react-router-dom';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface AgreementCheckboxesProps {
  isAdult: boolean;
  acceptTerms: boolean;
  onIsAdultChange: (checked: boolean) => void;
  onAcceptTermsChange: (checked: boolean) => void;
  disabled?: boolean;
}

const AgreementCheckboxes = ({
  isAdult,
  acceptTerms,
  onIsAdultChange,
  onAcceptTermsChange,
  disabled = false
}: AgreementCheckboxesProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Checkbox 
          id="isAdult"
          checked={isAdult}
          onCheckedChange={onIsAdultChange}
          disabled={disabled}
        />
        <Label htmlFor="isAdult" className="text-sm">
          Je certifie avoir plus de 18 ans
        </Label>
      </div>
      
      <div className="flex items-center space-x-2">
        <Checkbox 
          id="acceptTerms"
          checked={acceptTerms}
          onCheckedChange={onAcceptTermsChange}
          disabled={disabled}
        />
        <Label htmlFor="acceptTerms" className="text-sm">
          J'accepte les{' '}
          <Link to="/terms" className="text-primary hover:underline">
            conditions d'utilisation
          </Link>
        </Label>
      </div>
    </div>
  );
};

export default AgreementCheckboxes;
