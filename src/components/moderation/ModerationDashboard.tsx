
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Eye, Check, X, Clock, AlertTriangle } from 'lucide-react';
import { useState, useEffect } from 'react';
import AdModerationModal from './AdModerationModal';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface ModerationDashboardProps {
  userRole: 'moderator' | 'admin';
}

const ModerationDashboard = ({ userRole }: ModerationDashboardProps) => {
  const [selectedAd, setSelectedAd] = useState<any>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();

  // Set up real-time subscription for ads
  useEffect(() => {
    const channel = supabase
      .channel('moderation-ads-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'ads'
        },
        (payload) => {
          console.log('Real-time update:', payload);
          // Invalidate queries to refresh data
          queryClient.invalidateQueries({ queryKey: ['moderation-ads'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const { data: pendingAds, isLoading: pendingLoading } = useQuery({
    queryKey: ['moderation-ads', 'pending'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ads')
        .select('*')
        .eq('moderation_status', 'pending')
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data;
    }
  });

  const { data: moderatedAds, isLoading: moderatedLoading } = useQuery({
    queryKey: ['moderation-ads', 'moderated'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ads')
        .select('*')
        .in('moderation_status', ['approved', 'rejected'])
        .order('moderated_at', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return data;
    }
  });

  const { data: moderationStats } = useQuery({
    queryKey: ['moderation-stats'],
    queryFn: async () => {
      const [pendingCount, approvedCount, rejectedCount] = await Promise.all([
        supabase.from('ads').select('id', { count: 'exact' }).eq('moderation_status', 'pending'),
        supabase.from('ads').select('id', { count: 'exact' }).eq('moderation_status', 'approved'),
        supabase.from('ads').select('id', { count: 'exact' }).eq('moderation_status', 'rejected')
      ]);

      return {
        pending: pendingCount.count || 0,
        approved: approvedCount.count || 0,
        rejected: rejectedCount.count || 0
      };
    }
  });

  const quickApproveMutation = useMutation({
    mutationFn: async (adId: string) => {
      const { error } = await supabase
        .from('ads')
        .update({
          moderation_status: 'approved',
          status: 'active',
          moderated_at: new Date().toISOString(),
          moderated_by: user?.id
        })
        .eq('id', adId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['moderation-ads'] });
      toast({
        title: "Annonce approuvée",
        description: "L'annonce a été approuvée avec succès.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible d'approuver l'annonce.",
        variant: "destructive",
      });
    }
  });

  const quickRejectMutation = useMutation({
    mutationFn: async (adId: string) => {
      const { error } = await supabase
        .from('ads')
        .update({
          moderation_status: 'rejected',
          status: 'inactive',
          moderated_at: new Date().toISOString(),
          moderated_by: user?.id,
          moderation_notes: 'Rejet rapide par le modérateur'
        })
        .eq('id', adId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['moderation-ads'] });
      toast({
        title: "Annonce rejetée",
        description: "L'annonce a été rejetée avec succès.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible de rejeter l'annonce.",
        variant: "destructive",
      });
    }
  });

  const handleViewAd = (ad: any) => {
    setSelectedAd(ad);
    setModalOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', label: 'En attente', icon: Clock },
      approved: { color: 'bg-green-100 text-green-800', label: 'Approuvée', icon: Check },
      rejected: { color: 'bg-red-100 text-red-800', label: 'Rejetée', icon: X }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;
    
    return (
      <Badge className={config.color}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const AdCard = ({ ad, showQuickActions = false }: { ad: any; showQuickActions?: boolean }) => (
    <Card key={ad.id} className="mb-4">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{ad.title}</CardTitle>
            <CardDescription>
              {ad.category} • {ad.location} • {new Date(ad.created_at).toLocaleDateString('fr-FR')}
            </CardDescription>
          </div>
          {getStatusBadge(ad.moderation_status)}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {ad.description}
        </p>
        {ad.price && (
          <p className="text-lg font-semibold text-primary mb-4">
            {ad.price} FCFA
          </p>
        )}
        {ad.moderated_at && (
          <p className="text-xs text-muted-foreground mb-4">
            Modéré le {new Date(ad.moderated_at).toLocaleDateString('fr-FR')}
          </p>
        )}
        {ad.moderation_notes && (
          <p className="text-sm bg-muted p-2 rounded mb-4">
            <strong>Notes:</strong> {ad.moderation_notes}
          </p>
        )}
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => handleViewAd(ad)}>
            <Eye className="w-4 h-4 mr-2" />
            Examiner
          </Button>
          {showQuickActions && (
            <>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => quickApproveMutation.mutate(ad.id)}
                disabled={quickApproveMutation.isPending}
                className="text-green-600 hover:text-green-700"
              >
                <Check className="w-4 h-4 mr-2" />
                Approuver
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => quickRejectMutation.mutate(ad.id)}
                disabled={quickRejectMutation.isPending}
                className="text-red-600 hover:text-red-700"
              >
                <X className="w-4 h-4 mr-2" />
                Rejeter
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
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
            <span>{moderationStats?.pending || 0} en attente</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-green-500" />
            <span>{moderationStats?.approved || 0} approuvées</span>
          </div>
          <div className="flex items-center gap-2">
            <X className="w-4 h-4 text-red-500" />
            <span>{moderationStats?.rejected || 0} rejetées</span>
          </div>
        </div>
      </div>

      {moderationStats?.pending && moderationStats.pending > 10 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-yellow-800">
              <AlertTriangle className="w-5 h-5" />
              <p className="font-medium">
                Attention: {moderationStats.pending} annonces en attente de modération
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="pending">
            En attente ({pendingAds?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="moderated">
            Modérées
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="pending" className="mt-6">
          {pendingLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <div className="h-4 bg-muted rounded animate-pulse" />
                    <div className="h-3 bg-muted rounded animate-pulse w-2/3" />
                  </CardHeader>
                  <CardContent>
                    <div className="h-20 bg-muted rounded animate-pulse" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : !pendingAds || pendingAds.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Aucune annonce en attente de modération.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {pendingAds.map((ad) => (
                <AdCard key={ad.id} ad={ad} showQuickActions={true} />
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="moderated" className="mt-6">
          {moderatedLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <div className="h-4 bg-muted rounded animate-pulse" />
                    <div className="h-3 bg-muted rounded animate-pulse w-2/3" />
                  </CardHeader>
                  <CardContent>
                    <div className="h-20 bg-muted rounded animate-pulse" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : !moderatedAds || moderatedAds.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-muted-foreground">Aucune annonce modérée récemment.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {moderatedAds.map((ad) => (
                <AdCard key={ad.id} ad={ad} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <AdModerationModal
        ad={selectedAd}
        open={modalOpen}
        onOpenChange={setModalOpen}
        onModerationComplete={() => {
          queryClient.invalidateQueries({ queryKey: ['moderation-ads'] });
          setModalOpen(false);
        }}
      />
    </div>
  );
};

export default ModerationDashboard;
