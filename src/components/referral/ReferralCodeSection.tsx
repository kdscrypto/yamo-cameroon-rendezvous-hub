
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Copy, Gift } from 'lucide-react';
import { getBaseUrl } from '@/utils/deploymentConfig';

interface ReferralCodeSectionProps {
  referralCode: string;
}

const ReferralCodeSection = ({ referralCode }: ReferralCodeSectionProps) => {
  const { toast } = useToast();

  const copyReferralCode = async () => {
    if (!referralCode) return;

    try {
      const referralUrl = `${getBaseUrl()}/register?ref=${referralCode}`;
      await navigator.clipboard.writeText(referralUrl);
      toast({
        title: "Lien copié !",
        description: "Le lien de parrainage a été copié dans le presse-papiers.",
      });
    } catch (error) {
      console.error('Erreur lors de la copie:', error);
      toast({
        title: "Erreur",
        description: "Impossible de copier le lien.",
        variant: "destructive"
      });
    }
  };

  const copyCodeOnly = async () => {
    if (!referralCode) return;

    try {
      await navigator.clipboard.writeText(referralCode);
      toast({
        title: "Code copié !",
        description: "Le code de parrainage a été copié dans le presse-papiers.",
      });
    } catch (error) {
      console.error('Erreur lors de la copie:', error);
      toast({
        title: "Erreur",
        description: "Impossible de copier le code.",
        variant: "destructive"
      });
    }
  };

  const referralUrl = `${getBaseUrl()}/register?ref=${referralCode}`;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gift className="w-5 h-5 text-amber-500" />
          Votre code de parrainage
        </CardTitle>
        <CardDescription>
          Partagez ce code avec vos amis et gagnez des points !
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <Input
            value={referralCode}
            readOnly
            className="font-mono text-lg font-bold text-center bg-muted"
          />
          <Button onClick={copyCodeOnly} variant="outline" size="icon">
            <Copy className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Lien de parrainage :</label>
          <div className="flex items-center gap-2">
            <Input
              value={referralUrl}
              readOnly
              className="text-sm bg-muted"
            />
            <Button onClick={copyReferralCode} variant="outline" size="icon">
              <Copy className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReferralCodeSection;
