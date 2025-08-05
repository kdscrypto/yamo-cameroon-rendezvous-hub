import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { MapPin, Calendar, Heart, Share2, MessageCircle, Phone, Mail, User, Star } from 'lucide-react';

interface AdFullPreviewProps {
  ad: any;
}

const AdFullPreview = ({ ad }: AdFullPreviewProps) => {
  const getCategoryDisplay = (category: string) => {
    const categories: { [key: string]: string } = {
      'rencontres': 'Rencontres',
      'massages': 'Massages', 
      'produits': 'Produits adultes'
    };
    return categories[category] || category;
  };

  const getLocationDisplay = (location: string) => {
    const locations: { [key: string]: string } = {
      'douala': 'Douala',
      'yaounde': 'Yaoundé',
      'bafoussam': 'Bafoussam',
      'bamenda': 'Bamenda',
      'garoua': 'Garoua',
      'maroua': 'Maroua',
      'ngaoundere': 'Ngaoundéré',
      'bertoua': 'Bertoua',
      'ebolowa': 'Ebolowa',
      'kribi': 'Kribi',
      'limbe': 'Limbé',
      'buea': 'Buea',
      'edea': 'Edéa',
      'kumba': 'Kumba',
      'sangmelima': 'Sangmélima'
    };
    return locations[location] || location;
  };

  // Check if the ad is VIP (has expires_at and it's in the future)
  const isVip = ad.expires_at && new Date(ad.expires_at) > new Date();

  return (
    <div className="space-y-6 bg-background border border-border rounded-lg p-6">
      <div className="text-center mb-4">
        <h2 className="text-hierarchy-tertiary mb-2">
          Aperçu de l'annonce (telle qu'elle apparaîtra aux visiteurs)
        </h2>
        <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      </div>

      {/* Header with VIP badge */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-hierarchy-secondary">{ad.title}</h1>
            {isVip && (
              <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0">
                <Star className="w-3 h-3 mr-1" />
                VIP
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-4 text-sm text-hierarchy-body">
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {getLocationDisplay(ad.location)}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {new Date(ad.created_at).toLocaleDateString('fr-FR')}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="text-hierarchy-body border-border">
            <Heart className="w-4 h-4 mr-1" />
            Sauvegarder
          </Button>
          <Button variant="outline" size="sm" className="text-hierarchy-body border-border">
            <Share2 className="w-4 h-4 mr-1" />
            Partager
          </Button>
        </div>
      </div>

      {/* Category and Price */}
      <div className="flex items-center justify-between">
        <Badge variant="secondary" className="bg-secondary text-secondary-foreground">
          {getCategoryDisplay(ad.category)}
        </Badge>
        {ad.price && (
          <div className="text-hierarchy-secondary">
            {ad.price} FCFA
          </div>
        )}
      </div>

      {/* Images */}
      {ad.images && ad.images.length > 0 ? (
        <div className="space-y-4">
          <h3 className="text-hierarchy-tertiary">Photos</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {ad.images.map((imageUrl: string, index: number) => (
              <div key={index} className="aspect-square bg-muted rounded-lg overflow-hidden border border-border">
                <img 
                  src={imageUrl} 
                  alt={`Image ${index + 1}`}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <User className="w-16 h-16 text-muted-foreground mx-auto mb-2" />
          <p className="text-hierarchy-tertiary">Aucune image disponible</p>
        </div>
      )}

      {/* Description */}
      <div className="space-y-3">
        <h3 className="text-hierarchy-tertiary">Description</h3>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <p className="text-hierarchy-body whitespace-pre-wrap leading-relaxed">
              {ad.description}
            </p>
          </CardContent>
        </Card>
      </div>

      <Separator className="bg-border" />

      {/* Contact Information */}
      <div className="space-y-4">
        <h3 className="text-hierarchy-tertiary flex items-center gap-2">
          <MessageCircle className="w-5 h-5" />
          Informations de contact
        </h3>
        
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-hierarchy-tertiary">Contacter l'annonceur</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Phone contact */}
            {ad.phone && (
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg border border-border">
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium text-hierarchy-body">Téléphone</p>
                    <p className="text-sm text-hierarchy-caption">Appel direct</p>
                  </div>
                </div>
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                  {ad.phone}
                </Button>
              </div>
            )}

            {/* Email contact */}
            {ad.email && (
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg border border-border">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium text-hierarchy-body">Email</p>
                    <p className="text-sm text-hierarchy-caption">Message sécurisé</p>
                  </div>
                </div>
                <Button variant="outline" className="text-hierarchy-body border-border">
                  Envoyer un message
                </Button>
              </div>
            )}

            {/* WhatsApp contact */}
            {ad.whatsapp && (
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg border border-border">
                <div className="flex items-center gap-3">
                  <MessageCircle className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="font-medium text-hierarchy-body">WhatsApp</p>
                    <p className="text-sm text-hierarchy-caption">Chat instantané</p>
                  </div>
                </div>
                <Button className="bg-green-600 text-white hover:bg-green-700">
                  {ad.whatsapp}
                </Button>
              </div>
            )}

            {/* Fallback if no contact info */}
            {!ad.phone && !ad.email && !ad.whatsapp && (
              <div className="text-center py-4">
                <p className="text-hierarchy-tertiary">
                  Aucune information de contact disponible
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Safety notice */}
      <Card className="bg-muted/50 border-border">
        <CardContent className="p-4">
          <p className="text-sm text-hierarchy-caption text-center text-enhanced-contrast">
            🛡️ Pour votre sécurité, ne partagez jamais d'informations personnelles avant d'avoir vérifié l'identité de votre interlocuteur.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdFullPreview;