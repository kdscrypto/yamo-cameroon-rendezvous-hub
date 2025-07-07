
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Copy, Gift, RefreshCw } from 'lucide-react';
import { getBaseUrl } from '@/utils/deploymentConfig';

interface ReferralCodeSectionProps {
  referralCode: string;
  loading?: boolean;
  onRefresh?: () => void;
}

const ReferralCodeSection = ({ referralCode, loading = false, onRefresh }: ReferralCodeSectionProps) => {
  const { toast } = useToast();

  const copyReferralCode = async () => {
    if (!referralCode) {
      toast({
        title: "Erreur",
        description: "Aucun code de parrainage disponible.",
        variant: "destructive"
      });
      return;
    }

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
    if (!referralCode) {
      toast({
        title: "Erreur",
        description: "Aucun code de parrainage disponible.",
        variant: "destructive"
      });
      return;
    }

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

  const referralUrl = referralCode ? `${getBaseUrl()}/register?ref=${referralCode}` : '';

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="w-5 h-5 text-amber-500" />
            Votre code de parrainage
          </CardTitle>
          <CardDescription>
            Chargement de votre code de parrainage...
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="flex-1 h-10 bg-muted animate-pulse rounded-md" />
            <div className="w-10 h-10 bg-muted animate-pulse rounded-md" />
          </div>
          <div className="space-y-2">
            <div className="h-4 bg-muted animate-pulse rounded" />
            <div className="flex items-center gap-2">
              <div className="flex-1 h-10 bg-muted animate-pulse rounded-md" />
              <div className="w-10 h-10 bg-muted animate-pulse rounded-md" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!referralCode) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="w-5 h-5 text-amber-500" />
            Votre code de parrainage
          </CardTitle>
          <CardDescription>
            Votre code de parrainage n'est pas encore disponible.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center py-4">
            <p className="text-muted-foreground mb-4">
              Nous initialisons votre système de parrainage...
            </p>
            {onRefresh && (
              <Button onClick={onRefresh} variant="outline" className="gap-2">
                <RefreshCw className="w-4 h-4" />
                Actualiser
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

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
            placeholder="Chargement..."
          />
          <Button onClick={copyCodeOnly} variant="outline" size="icon" title="Copier le code">
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
              placeholder="Génération du lien..."
            />
            <Button onClick={copyReferralCode} variant="outline" size="icon" title="Copier le lien">
              <Copy className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        {onRefresh && (
          <div className="pt-2">
            <Button onClick={onRefresh} variant="ghost" size="sm" className="gap-2">
              <RefreshCw className="w-3 h-3" />
              Actualiser
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ReferralCodeSection;
