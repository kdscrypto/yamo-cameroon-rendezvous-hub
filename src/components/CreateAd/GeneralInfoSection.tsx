
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface GeneralInfoSectionProps {
  formData: {
    title: string;
    description: string;
    category: string;
    location: string;
    price: string;
  };
  onInputChange: (field: string, value: string) => void;
}

const GeneralInfoSection = ({ formData, onInputChange }: GeneralInfoSectionProps) => {
  const cameroonCities = [
    { value: 'douala', label: 'Douala' },
    { value: 'yaounde', label: 'Yaoundé' },
    { value: 'bafoussam', label: 'Bafoussam' },
    { value: 'bamenda', label: 'Bamenda' },
    { value: 'garoua', label: 'Garoua' },
    { value: 'maroua', label: 'Maroua' },
    { value: 'ngaoundere', label: 'Ngaoundéré' },
    { value: 'bertoua', label: 'Bertoua' },
    { value: 'ebolowa', label: 'Ebolowa' },
    { value: 'kribi', label: 'Kribi' },
    { value: 'limbe', label: 'Limbé' },
    { value: 'buea', label: 'Buea' },
    { value: 'edea', label: 'Edéa' },
    { value: 'kumba', label: 'Kumba' },
    { value: 'sangmelima', label: 'Sangmélima' }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Informations générales</CardTitle>
        <CardDescription>
          Décrivez votre annonce de manière claire et attrayante
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Titre de l'annonce *</Label>
          <Input
            id="title"
            placeholder="Ex: Belle femme disponible pour rencontres..."
            value={formData.title}
            onChange={(e) => onInputChange('title', e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description *</Label>
          <Textarea
            id="description"
            placeholder="Décrivez votre service en détail..."
            rows={6}
            value={formData.description}
            onChange={(e) => onInputChange('description', e.target.value)}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="category">Catégorie *</Label>
            <Select value={formData.category} onValueChange={(value) => onInputChange('category', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Choisir une catégorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rencontres">Rencontres</SelectItem>
                <SelectItem value="massages">Massages</SelectItem>
                <SelectItem value="produits">Produits adultes</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Localisation *</Label>
            <Select value={formData.location} onValueChange={(value) => onInputChange('location', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Choisir une ville" />
              </SelectTrigger>
              <SelectContent>
                {cameroonCities.map((city) => (
                  <SelectItem key={city.value} value={city.value}>
                    {city.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="price">Prix (FCFA)</Label>
          <Input
            id="price"
            type="number"
            placeholder="Ex: 25000"
            value={formData.price}
            onChange={(e) => onInputChange('price', e.target.value)}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default GeneralInfoSection;
