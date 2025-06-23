
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
        <CardTitle>Contact</CardTitle>
        <CardDescription>
          Comment les clients peuvent vous contacter
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="phone">Numéro de téléphone *</Label>
          <Input
            id="phone"
            type="tel"
            placeholder="Ex: +237 6XX XXX XXX"
            value={formData.phone}
            onChange={(e) => onInputChange('phone', e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="whatsapp">WhatsApp</Label>
          <Input
            id="whatsapp"
            type="tel"
            placeholder="Ex: +237 6XX XXX XXX"
            value={formData.whatsapp}
            onChange={(e) => onInputChange('whatsapp', e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Les clients pourront vous contacter directement via WhatsApp
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ContactSection;
