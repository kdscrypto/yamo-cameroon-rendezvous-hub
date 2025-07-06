import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Copy, Users, Gift, Star, Trophy, User } from 'lucide-react';
import { getBaseUrl } from '@/utils/deploymentConfig';

interface ReferralStats {
  total_points: number;
  level_1_points: number;
  level_2_points: number;
  total_referrals_level_1: number;
  total_referrals_level_2: number;
}

interface ReferralCode {
  code: string;
}

const ReferralDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [referralCode, setReferralCode] = useState<string>('');
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchReferralData();
    }
  }, [user]);

  const fetchReferralData = async () => {
    if (!user) return;

    try {
      // Récupérer le code de parrainage
      const { data: codeData, error: codeError } = await supabase
        .from('referral_codes')
        .select('code')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single();

      if (codeError) {
        console.error('Erreur lors de la récupération du code de parrainage:', codeError);
      } else if (codeData) {
        setReferralCode(codeData.code);
      }

      // Récupérer les statistiques de parrainage
      const { data: statsData, error: statsError } = await supabase
        .from('referral_points')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (statsError) {
        console.error('Erreur lors de la récupération des statistiques:', statsError);
      } else if (statsData) {
        setStats(statsData);
      }
    } catch (error) {
      console.error('Erreur inattendue:', error);
    } finally {
      setLoading(false);
    }
  };

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

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Chargement des données de parrainage...</p>
        </div>
      </div>
    );
  }

  const referralUrl = `${getBaseUrl()}/register?ref=${referralCode}`;

  return (
    <div className="space-y-6">
      {/* Code de parrainage */}
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

      {/* Statistiques */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            Vos statistiques de parrainage
          </CardTitle>
          <CardDescription>
            Suivez vos performances et vos gains
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Points totaux */}
            <div className="text-center p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg border">
              <div className="flex items-center justify-center mb-2">
                <Star className="w-6 h-6 text-amber-500" />
              </div>
              <div className="text-2xl font-bold text-amber-600">
                {stats?.total_points || 0}
              </div>
              <div className="text-sm text-muted-foreground">
                Points totaux
              </div>
            </div>

            {/* Parrainages niveau 1 */}
            <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg border">
              <div className="flex items-center justify-center mb-2">
                <User className="w-6 h-6 text-blue-500" />
              </div>
              <div className="text-2xl font-bold text-blue-600">
                {stats?.total_referrals_level_1 || 0}
              </div>
              <div className="text-sm text-muted-foreground">
                Parrainages directs
              </div>
              <Badge variant="secondary" className="mt-1 text-xs">
                +2 points chacun
              </Badge>
            </div>

            {/* Parrainages niveau 2 */}
            <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border">
              <div className="flex items-center justify-center mb-2">
                <Users className="w-6 h-6 text-green-500" />
              </div>
              <div className="text-2xl font-bold text-green-600">
                {stats?.total_referrals_level_2 || 0}
              </div>
              <div className="text-sm text-muted-foreground">
                Parrainages indirects
              </div>
              <Badge variant="secondary" className="mt-1 text-xs">
                +1 point chacun
              </Badge>
            </div>
          </div>

          {/* Détail des points */}
          <div className="mt-6 pt-4 border-t">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Points niveau 1 :</span>
                <span className="font-medium">{stats?.level_1_points || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Points niveau 2 :</span>
                <span className="font-medium">{stats?.level_2_points || 0}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comment ça marche */}
      <Card>
        <CardHeader>
          <CardTitle>Comment fonctionne le parrainage ?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3">
            <Badge className="bg-blue-100 text-blue-800 flex-shrink-0">1</Badge>
            <div>
              <h4 className="font-medium">Parrainage direct</h4>
              <p className="text-sm text-muted-foreground">
                Quand quelqu'un s'inscrit avec votre code, vous gagnez <strong>2 points</strong>
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Badge className="bg-green-100 text-green-800 flex-shrink-0">2</Badge>
            <div>
              <h4 className="font-medium">Parrainage indirect</h4>
              <p className="text-sm text-muted-foreground">
                Quand vos filleuls parrainent à leur tour, vous gagnez <strong>1 point</strong> supplémentaire
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Badge className="bg-amber-100 text-amber-800 flex-shrink-0">🎁</Badge>
            <div>
              <h4 className="font-medium">Récompenses</h4>
              <p className="text-sm text-muted-foreground">
                Plus vous parrainez, plus vous débloquez d'avantages exclusifs !
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReferralDashboard;
