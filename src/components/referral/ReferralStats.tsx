
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, User, Users, Trophy } from 'lucide-react';

interface ReferralStatsProps {
  stats: {
    total_points: number;
    level_1_points: number;
    level_2_points: number;
    total_referrals_level_1: number;
    total_referrals_level_2: number;
  } | null;
}

const ReferralStats = ({ stats }: ReferralStatsProps) => {
  return (
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
  );
};

export default ReferralStats;
