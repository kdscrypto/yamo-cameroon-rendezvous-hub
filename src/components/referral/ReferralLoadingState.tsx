
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Gift, Users, Trophy } from 'lucide-react';

const ReferralLoadingState = () => {
  return (
    <div className="space-y-6">
      {/* Code de parrainage en cours de chargement */}
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
            <div className="h-4 bg-muted animate-pulse rounded w-32" />
            <div className="flex items-center gap-2">
              <div className="flex-1 h-10 bg-muted animate-pulse rounded-md" />
              <div className="w-10 h-10 bg-muted animate-pulse rounded-md" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistiques en cours de chargement */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Points totaux</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="h-8 bg-muted animate-pulse rounded w-16" />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Parrainages directs</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="h-8 bg-muted animate-pulse rounded w-12" />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Parrainages indirects</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="h-8 bg-muted animate-pulse rounded w-12" />
          </CardContent>
        </Card>
      </div>

      {/* Message informatif */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">
            <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p>Initialisation de votre système de parrainage...</p>
            <p className="text-sm mt-2">Cela peut prendre quelques secondes.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReferralLoadingState;
