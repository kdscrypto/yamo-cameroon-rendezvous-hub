
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
        <CardTitle className="text-yellow-400">Informations générales</CardTitle>
        <CardDescription className="text-white">
          Décrivez votre annonce de manière claire et attrayante
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title" className="text-white">Titre de l'annonce *</Label>
          <Input
            id="title"
            placeholder="Ex: Belle femme disponible pour rencontres..."
            value={formData.title}
            onChange={(e) => onInputChange('title', e.target.value)}
            required
            className="text-white placeholder:text-gray-400"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description" className="text-white">Description *</Label>
          <Textarea
            id="description"
            placeholder="Décrivez votre service en détail..."
            rows={6}
            value={formData.description}
            onChange={(e) => onInputChange('description', e.target.value)}
            required
            className="text-white placeholder:text-gray-400"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="category" className="text-white">Catégorie *</Label>
            <Select value={formData.category} onValueChange={(value) => onInputChange('category', value)}>
              <SelectTrigger className="text-white">
                <SelectValue placeholder="Choisir une catégorie" className="text-white" />
              </SelectTrigger>
              <SelectContent className="bg-neutral-800 border-neutral-600">
                <SelectItem value="rencontres" className="text-white hover:bg-neutral-700">Rencontres</SelectItem>
                <SelectItem value="massages" className="text-white hover:bg-neutral-700">Massages</SelectItem>
                <SelectItem value="produits" className="text-white hover:bg-neutral-700">Produits adultes</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location" className="text-white">Localisation *</Label>
            <Select value={formData.location} onValueChange={(value) => onInputChange('location', value)}>
              <SelectTrigger className="text-white">
                <SelectValue placeholder="Choisir une ville" className="text-white" />
              </SelectTrigger>
              <SelectContent className="bg-neutral-800 border-neutral-600">
                {cameroonCities.map((city) => (
                  <SelectItem key={city.value} value={city.value} className="text-white hover:bg-neutral-700">
                    {city.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="price" className="text-white">Prix (FCFA)</Label>
          <Input
            id="price"
            type="number"
            placeholder="Ex: 25000"
            value={formData.price}
            onChange={(e) => onInputChange('price', e.target.value)}
            className="text-white placeholder:text-gray-400"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default GeneralInfoSection;
