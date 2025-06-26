
import { Clock, Check, X, AlertTriangle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface ModerationHeaderProps {
  userRole: 'moderator' | 'admin';
  stats: {
    pending: number;
    approved: number;
    rejected: number;
  } | undefined;
}

const ModerationHeader = ({ userRole, stats }: ModerationHeaderProps) => {
  return (
    <>
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Modération des annonces</h2>
          <p className="text-muted-foreground">
            Rôle: {userRole === 'admin' ? 'Administrateur' : 'Modérateur'}
          </p>
        </div>
        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-yellow-500" />
            <span>{stats?.pending || 0} en attente</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-green-500" />
            <span>{stats?.approved || 0} approuvées</span>
          </div>
          <div className="flex items-center gap-2">
            <X className="w-4 h-4 text-red-500" />
            <span>{stats?.rejected || 0} rejetées</span>
          </div>
        </div>
      </div>

      {stats?.pending && stats.pending > 10 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-yellow-800">
              <AlertTriangle className="w-5 h-5" />
              <p className="font-medium">
                Attention: {stats.pending} annonces en attente de modération
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
};

export default ModerationHeader;
