import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, Edit, Trash2, Plus, Clock, Check, X, AlertCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Link } from 'react-router-dom';
import { useEffect } from 'react';

const UserAds = () => {
  const { user } = useAuth();

  const { data: ads, isLoading, refetch } = useQuery({
    queryKey: ['user-ads', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('ads')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching user ads:', error);
        return [];
      }
      
      return data;
    },
    enabled: !!user
  });

  // Set up real-time subscription for user's ads
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('user-ads-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'ads',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('User ads updated:', payload);
          refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, refetch]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getModerationStatusBadge = (moderationStatus: string) => {
    switch (moderationStatus) {
      case 'pending':
        return (
          <Badge className="bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3 mr-1" />
            En attente de modération
          </Badge>
        );
      case 'approved':
        return (
          <Badge className="bg-green-100 text-green-800">
            <Check className="w-3 h-3 mr-1" />
            Approuvée
          </Badge>
        );
      case 'rejected':
        return (
          <Badge className="bg-red-100 text-red-800">
            <X className="w-3 h-3 mr-1" />
            Rejetée
          </Badge>
        );
      default:
        return null;
    }
  };

  const handleDeleteAd = async (adId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette annonce ?')) return;
    
    const { error } = await supabase
      .from('ads')
      .delete()
      .eq('id', adId);
    
    if (error) {
      console.error('Error deleting ad:', error);
    } else {
      refetch();
    }
  };

  if (isLoading) {
    return (
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
    );
  }

  // Group ads by moderation status for better organization
  const pendingAds = ads?.filter(ad => ad.moderation_status === 'pending') || [];
  const approvedAds = ads?.filter(ad => ad.moderation_status === 'approved') || [];
  const rejectedAds = ads?.filter(ad => ad.moderation_status === 'rejected') || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Mes annonces</h2>
        <Button asChild>
          <Link to="/create-ad">
            <Plus className="w-4 h-4 mr-2" />
            Nouvelle annonce
          </Link>
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En modération</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingAds.length}</div>
            <p className="text-xs text-muted-foreground">En attente de validation</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Actives</CardTitle>
            <Check className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{approvedAds.filter(ad => ad.status === 'active').length}</div>
            <p className="text-xs text-muted-foreground">Publiées et visibles</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejetées</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rejectedAds.length}</div>
            <p className="text-xs text-muted-foreground">Nécessitent attention</p>
          </CardContent>
        </Card>
      </div>

      {!ads || ads.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground mb-4">Vous n'avez pas encore d'annonces.</p>
            <Button asChild>
              <Link to="/create-ad">Créer votre première annonce</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Rejected ads - Show first for user attention */}
          {rejectedAds.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4 text-red-700 flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Annonces rejetées ({rejectedAds.length})
              </h3>
              <div className="space-y-4">
                {rejectedAds.map((ad) => (
                  <Card key={ad.id} className="border-red-200">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{ad.title}</CardTitle>
                          <CardDescription>
                            {ad.category} • {ad.location} • {new Date(ad.created_at).toLocaleDateString('fr-FR')}
                          </CardDescription>
                        </div>
                        <div className="flex flex-col gap-2">
                          <Badge className={getStatusColor(ad.status)}>
                            {ad.status}
                          </Badge>
                          {getModerationStatusBadge(ad.moderation_status)}
                        </div>
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
                      
                      {ad.moderation_notes && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                          <p className="text-sm font-medium text-red-800 mb-1">Raison du rejet :</p>
                          <p className="text-sm text-red-700">{ad.moderation_notes}</p>
                        </div>
                      )}

                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-2" />
                          Voir
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4 mr-2" />
                          Modifier
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleDeleteAd(ad.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Supprimer
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Pending ads */}
          {pendingAds.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4 text-yellow-700 flex items-center gap-2">
                <Clock className="w-5 h-5" />
                En cours de modération ({pendingAds.length})
              </h3>
              <div className="space-y-4">
                {pendingAds.map((ad) => (
                  <Card key={ad.id} className="border-yellow-200">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{ad.title}</CardTitle>
                          <CardDescription>
                            {ad.category} • {ad.location} • {new Date(ad.created_at).toLocaleDateString('fr-FR')}
                          </CardDescription>
                        </div>
                        <div className="flex flex-col gap-2">
                          <Badge className={getStatusColor(ad.status)}>
                            {ad.status}
                          </Badge>
                          {getModerationStatusBadge(ad.moderation_status)}
                        </div>
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
                      
                      <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-sm text-yellow-800">
                          Votre annonce est en cours de modération. Elle sera visible dès qu'elle sera approuvée par notre équipe.
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-2" />
                          Voir
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleDeleteAd(ad.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Supprimer
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Approved ads */}
          {approvedAds.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4 text-green-700 flex items-center gap-2">
                <Check className="w-5 h-5" />
                Annonces approuvées ({approvedAds.length})
              </h3>
              <div className="space-y-4">
                {approvedAds.map((ad) => (
                  <Card key={ad.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{ad.title}</CardTitle>
                          <CardDescription>
                            {ad.category} • {ad.location} • {new Date(ad.created_at).toLocaleDateString('fr-FR')}
                          </CardDescription>
                        </div>
                        <div className="flex flex-col gap-2">
                          <Badge className={getStatusColor(ad.status)}>
                            {ad.status}
                          </Badge>
                          {getModerationStatusBadge(ad.moderation_status)}
                        </div>
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
                          Approuvé le {new Date(ad.moderated_at).toLocaleDateString('fr-FR')}
                        </p>
                      )}

                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-2" />
                          Voir
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4 mr-2" />
                          Modifier
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleDeleteAd(ad.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Supprimer
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UserAds;
