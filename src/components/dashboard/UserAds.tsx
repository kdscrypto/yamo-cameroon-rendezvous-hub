
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, Edit, Trash2, Plus, Clock, Check, X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Link } from 'react-router-dom';

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
        <div className="space-y-4">
          {ads.map((ad) => (
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
                
                {/* Affichage des informations de modération */}
                {ad.moderation_status === 'rejected' && ad.moderation_notes && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm font-medium text-red-800 mb-1">Raison du rejet :</p>
                    <p className="text-sm text-red-700">{ad.moderation_notes}</p>
                  </div>
                )}
                
                {ad.moderation_status === 'pending' && (
                  <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      Votre annonce est en cours de modération. Elle sera visible dès qu'elle sera approuvée par notre équipe.
                    </p>
                  </div>
                )}

                {ad.moderated_at && ad.moderation_status !== 'pending' && (
                  <p className="text-xs text-muted-foreground mb-4">
                    Modéré le {new Date(ad.moderated_at).toLocaleDateString('fr-FR')}
                  </p>
                )}

                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Eye className="w-4 h-4 mr-2" />
                    Voir
                  </Button>
                  {ad.moderation_status !== 'pending' && (
                    <Button variant="outline" size="sm">
                      <Edit className="w-4 h-4 mr-2" />
                      Modifier
                    </Button>
                  )}
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
      )}
    </div>
  );
};

export default UserAds;
