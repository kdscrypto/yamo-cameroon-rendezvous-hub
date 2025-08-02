
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Calendar } from 'lucide-react';
import StarRating from '@/components/StarRating';

interface AdInfoSectionProps {
  title: string;
  category: string;
  location: string;
  createdAt: string;
  price: number | null;
  description: string | null;
  isVip: boolean;
  adId: string;
  averageRating: number;
  ratingCount: number;
  onRatingUpdate?: (averageRating: number, ratingCount: number) => void;
}

const AdInfoSection = ({ 
  title, 
  category, 
  location, 
  createdAt, 
  price, 
  description, 
  isVip,
  adId,
  averageRating,
  ratingCount,
  onRatingUpdate
}: AdInfoSectionProps) => {
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

  return (
    <div className="space-y-6">
      <div>
        <div className="flex flex-wrap gap-2 mb-4">
          <Badge variant="outline" className="text-yellow-400 border-yellow-400/30 bg-yellow-400/10">
            {getCategoryDisplay(category)}
          </Badge>
          {isVip && (
            <Badge className="bg-gradient-to-r from-orange-500 to-yellow-500 text-black font-bold">
              Annonce VIP
            </Badge>
          )}
        </div>
        
        <h1 className="text-3xl font-bold mb-4 text-yellow-400">{title}</h1>
        
        {/* Système de notation par étoiles */}
        <div className="mb-6">
          <StarRating
            adId={adId}
            averageRating={averageRating}
            ratingCount={ratingCount}
            onRatingUpdate={onRatingUpdate}
            className="mb-4"
          />
        </div>
        
        <div className="flex items-center gap-4 text-yellow-500 mb-4">
          <div className="flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            {getLocationDisplay(location)}
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            {new Date(createdAt).toLocaleDateString('fr-FR')}
          </div>
        </div>

        {price && (
          <div className="text-3xl font-bold text-yellow-400 mb-6">
            {price.toLocaleString()} FCFA
          </div>
        )}
      </div>

      <Card className="bg-card/50 border-border/50">
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-4 text-yellow-400">Description</h2>
          <p className="text-white whitespace-pre-wrap leading-relaxed">
            {description || 'Aucune description disponible.'}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdInfoSection;
