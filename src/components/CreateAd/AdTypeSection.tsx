
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Star } from 'lucide-react';

interface AdTypeSectionProps {
  formData: {
    vipOption: string;
  };
  onInputChange: (field: string, value: string) => void;
}

const AdTypeSection = ({ formData, onInputChange }: AdTypeSectionProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-yellow-400">Type d'annonce</CardTitle>
        <CardDescription className="text-white">
          Choisissez le type de visibilité pour votre annonce
        </CardDescription>
      </CardHeader>
      <CardContent>
        <RadioGroup 
          value={formData.vipOption} 
          onValueChange={(value) => onInputChange('vipOption', value)}
          className="space-y-4"
        >
          <div className="flex items-center space-x-2 p-4 border rounded-lg">
            <RadioGroupItem value="standard" id="standard" />
            <div className="flex-1">
              <Label htmlFor="standard" className="font-medium text-white">
                Annonce Standard - Gratuit
              </Label>
              <p className="text-sm text-white">
                Annonce classique visible dans les résultats
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 p-4 border rounded-lg border-primary/50 bg-primary/5">
            <RadioGroupItem value="24h" id="24h" />
            <div className="flex-1">
              <Label htmlFor="24h" className="font-medium flex items-center gap-2 text-white">
                <Star className="w-4 h-4 text-primary" />
                Annonce VIP 24h - 500 FCFA
              </Label>
              <p className="text-sm text-white">
                Mise en avant pendant 24h, badge VIP, affichage prioritaire
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 p-4 border rounded-lg border-primary/50 bg-primary/5">
            <RadioGroupItem value="7days" id="7days" />
            <div className="flex-1">
              <Label htmlFor="7days" className="font-medium flex items-center gap-2 text-white">
                <Star className="w-4 h-4 text-primary" />
                Annonce VIP 7 jours - 2,500 FCFA
              </Label>
              <p className="text-sm text-white">
                Mise en avant pendant 7 jours, badge VIP, affichage prioritaire
              </p>
            </div>
          </div>
        </RadioGroup>
      </CardContent>
    </Card>
  );
};

export default AdTypeSection;
