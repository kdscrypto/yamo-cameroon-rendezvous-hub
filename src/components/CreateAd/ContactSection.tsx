
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface ContactSectionProps {
  formData: {
    phone: string;
    whatsapp: string;
  };
  onInputChange: (field: string, value: string) => void;
}

const ContactSection = ({ formData, onInputChange }: ContactSectionProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-yellow-400">Contact</CardTitle>
        <CardDescription className="text-white">
          Ces informations seront visibles uniquement aux utilisateurs connectés
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="phone" className="text-white">Numéro de téléphone *</Label>
          <Input
            id="phone"
            type="tel"
            placeholder="Ex: +237 6XX XXX XXX"
            value={formData.phone}
            onChange={(e) => onInputChange('phone', e.target.value)}
            required
            className="text-white placeholder:text-gray-400"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="whatsapp" className="text-white">WhatsApp</Label>
          <Input
            id="whatsapp"
            type="tel"
            placeholder="Ex: +237 6XX XXX XXX (optionnel)"
            value={formData.whatsapp}
            onChange={(e) => onInputChange('whatsapp', e.target.value)}
            className="text-white placeholder:text-gray-400"
          />
          <p className="text-xs text-white">
            Si différent du numéro de téléphone principal
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ContactSection;
