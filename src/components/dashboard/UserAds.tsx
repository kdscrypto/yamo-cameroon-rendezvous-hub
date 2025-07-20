import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, Edit, Trash2, Plus, Clock, Check, X, AlertCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import AdPreviewModal from './AdPreviewModal';
// import { toast } from 'sonner'; // Temporairement désactivé

interface Ad {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  price?: number;
  images?: string[];
  status: string;
  moderation_status: string;
  created_at: string;
  moderated_at?: string;
  moderation_notes?: string;
  user_id: string;
}

const UserAds = () => {
  const { user } = useAuth();
  const [selectedAd, setSelectedAd] = useState<Ad | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const { data: ads, isLoading, refetch } = useQuery({
    queryKey: ['user-ads', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      console.log('Fetching ads for user:', user.id);
      
      const { data, error } = await supabase
        .from('ads')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching user ads:', error);
        console.error('Toast: Erreur lors du chargement des annonces');
        return [];
      }
      
      console.log('Fetched ads:', data);
      return data as Ad[];
    },
    enabled: !!user
  });

  // Set up real-time subscription for user's ads
  useEffect(() => {
    if (!user) return;

    console.log('Setting up real-time subscription for user ads');

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
          console.log('Toast: Vos annonces ont été mises à jour');
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
        return 'bg-gray-300 text-gray-800';
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
          <Badge className="bg-gray-100 text-gray-800">
            <X className="w-3 h-3 mr-1" />
            Rejetée
          </Badge>
        );
      default:
        return null;
    }
  };

  const handleViewAd = (ad: Ad) => {
    console.log('Opening preview for ad:', ad.id);
    setSelectedAd(ad);
    setIsPreviewOpen(true);
  };

  const handleEditAd = (ad: Ad) => {
    console.log('Edit ad:', ad.id);
    console.log('Toast: Fonctionnalité de modification en cours de développement');
    // TODO: Implement edit functionality
  };

  const handleDeleteAd = async (adId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette annonce ?')) return;
    
    console.log('Deleting ad:', adId);
    
    try {
      const { error } = await supabase
        .from('ads')
        .delete()
        .eq('id', adId);
      
      if (error) {
        console.error('Error deleting ad:', error);
        console.error('Toast: Erreur lors de la suppression de l\'annonce');
      } else {
        console.log('Toast: Annonce supprimée avec succès');
        refetch();
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      console.error('Toast: Erreur inattendue lors de la suppression');
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
        <Button 
          asChild 
          className="bg-yellow-600 hover:bg-yellow-700 text-white border-yellow-500 font-semibold shadow-lg transform hover:scale-105 transition-all duration-200 px-6 py-3"
        >
          <Link to="/create-ad">
            <Plus className="w-5 h-5 mr-2" />
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
            <div className="text-2xl font-bold text-white">{pendingAds.length}</div>
            <p className="text-xs text-muted-foreground">En attente de validation</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Actives</CardTitle>
            <Check className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{approvedAds.filter(ad => ad.status === 'active').length}</div>
            <p className="text-xs text-muted-foreground">Publiées et visibles</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejetées</CardTitle>
            <AlertCircle className="h-4 w-4 text-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{rejectedAds.length}</div>
            <p className="text-xs text-muted-foreground">Nécessitent attention</p>
          </CardContent>
        </Card>
      </div>

      {!ads || ads.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground mb-6 text-lg">Vous n'avez pas encore d'annonces.</p>
            <Button 
              asChild
              size="lg"
              className="bg-yellow-600 hover:bg-yellow-700 text-white border-yellow-500 font-semibold shadow-lg transform hover:scale-105 transition-all duration-200 px-8 py-4 text-lg"
            >
              <Link to="/create-ad">
                <Plus className="w-6 h-6 mr-3" />
                Créer votre première annonce
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Rejected ads - Show first for user attention */}
          {rejectedAds.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4 text-foreground flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Annonces rejetées ({rejectedAds.length})
              </h3>
              <div className="space-y-4">
                {rejectedAds.map((ad) => (
                  <Card key={ad.id} className="border-muted">
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
                        <div className="mb-4 p-3 bg-muted border border-muted rounded-lg">
                          <p className="text-sm font-medium text-foreground mb-1">Raison du rejet :</p>
                          <p className="text-sm text-muted-foreground">{ad.moderation_notes}</p>
                        </div>
                      )}

                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleViewAd(ad)}>
                          <Eye className="w-4 h-4 mr-2" />
                          Voir
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleEditAd(ad)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Modifier
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleDeleteAd(ad.id)}
                          className="text-foreground hover:text-muted-foreground"
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
                        <Button variant="outline" size="sm" onClick={() => handleViewAd(ad)}>
                          <Eye className="w-4 h-4 mr-2" />
                          Voir
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleDeleteAd(ad.id)}
                          className="text-foreground hover:text-muted-foreground"
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
                        <Button variant="outline" size="sm" onClick={() => handleViewAd(ad)}>
                          <Eye className="w-4 h-4 mr-2" />
                          Voir
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleEditAd(ad)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Modifier
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleDeleteAd(ad.id)}
                          className="text-foreground hover:text-muted-foreground"
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

      {/* Ad Preview Modal */}
      <AdPreviewModal 
        ad={selectedAd}
        isOpen={isPreviewOpen}
        onClose={() => {
          setIsPreviewOpen(false);
          setSelectedAd(null);
        }}
      />
    </div>
  );
};

export default UserAds;
