
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Image, Star, Upload, X, Eye } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AdPreview from '@/components/AdPreview';

const CreateAd = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    location: '',
    price: '',
    phone: '',
    whatsapp: '',
    vipOption: 'standard', // 'standard', '24h', '7days'
    photos: [] as File[]
  });

  const [showPreview, setShowPreview] = useState(false);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowPreview(true);
  };

  const handleInputChange = (field: string, value: string | boolean | File[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newPhotos = [...formData.photos, ...files].slice(0, 6); // Limite à 6 photos
    handleInputChange('photos', newPhotos);
  };

  const removePhoto = (index: number) => {
    const newPhotos = formData.photos.filter((_, i) => i !== index);
    handleInputChange('photos', newPhotos);
  };

  const openWhatsApp = (number: string) => {
    const cleanNumber = number.replace(/\D/g, '');
    const message = encodeURIComponent(`Bonjour, je suis intéressé(e) par votre annonce "${formData.title}"`);
    window.open(`https://wa.me/${cleanNumber}?text=${message}`, '_blank');
  };

  const getVipPrice = () => {
    switch (formData.vipOption) {
      case '24h': return '500 FCFA';
      case '7days': return '2,500 FCFA';
      default: return 'Gratuit';
    }
  };

  if (showPreview) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <div className="flex-1 px-4 py-8">
          <div className="container mx-auto max-w-4xl">
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-3xl font-bold">Prévisualisation de votre annonce</h1>
              <Button 
                variant="outline" 
                onClick={() => setShowPreview(false)}
                className="flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Retour au formulaire
              </Button>
            </div>
            
            <AdPreview 
              formData={formData} 
              onWhatsAppClick={openWhatsApp}
            />
            
            <div className="mt-8 text-center space-y-4">
              <p className="text-muted-foreground">
                Voici comment votre annonce apparaîtra après validation par notre équipe de modération.
              </p>
              <div className="flex gap-4 justify-center">
                <Button 
                  variant="outline" 
                  onClick={() => setShowPreview(false)}
                >
                  Modifier l'annonce
                </Button>
                <Button className="gradient-gold text-black">
                  Publier l'annonce - {getVipPrice()}
                </Button>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <div className="flex-1 px-4 py-8">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-4">Publier une annonce</h1>
            <p className="text-muted-foreground">
              Créez votre annonce en quelques minutes
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Form */}
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit} className="space-y-6">
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
                        onChange={(e) => handleInputChange('title', e.target.value)}
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
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="category">Catégorie *</Label>
                        <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
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
                        <Select value={formData.location} onValueChange={(value) => handleInputChange('location', value)}>
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
                        onChange={(e) => handleInputChange('price', e.target.value)}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Contact</CardTitle>
                    <CardDescription>
                      Comment les clients peuvent vous contacter
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Numéro de téléphone *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="Ex: +237 6XX XXX XXX"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="whatsapp">WhatsApp</Label>
                      <Input
                        id="whatsapp"
                        type="tel"
                        placeholder="Ex: +237 6XX XXX XXX"
                        value={formData.whatsapp}
                        onChange={(e) => handleInputChange('whatsapp', e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground">
                        Les clients pourront vous contacter directement via WhatsApp
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Photos</CardTitle>
                    <CardDescription>
                      Ajoutez jusqu'à 6 photos pour rendre votre annonce plus attractive
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Photo upload area */}
                      <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                        <Image className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground mb-4">
                          Glissez vos photos ici ou cliquez pour sélectionner
                        </p>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handlePhotoUpload}
                          className="hidden"
                          id="photo-upload"
                        />
                        <Button 
                          type="button" 
                          variant="outline"
                          onClick={() => document.getElementById('photo-upload')?.click()}
                          disabled={formData.photos.length >= 6}
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          Choisir des photos ({formData.photos.length}/6)
                        </Button>
                      </div>

                      {/* Photo preview grid */}
                      {formData.photos.length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {formData.photos.map((photo, index) => (
                            <div key={index} className="relative group">
                              <img
                                src={URL.createObjectURL(photo)}
                                alt={`Photo ${index + 1}`}
                                className="w-full h-24 object-cover rounded-lg"
                              />
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => removePhoto(index)}
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Type d'annonce</CardTitle>
                    <CardDescription>
                      Choisissez le type de visibilité pour votre annonce
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <RadioGroup 
                      value={formData.vipOption} 
                      onValueChange={(value) => handleInputChange('vipOption', value)}
                      className="space-y-4"
                    >
                      <div className="flex items-center space-x-2 p-4 border rounded-lg">
                        <RadioGroupItem value="standard" id="standard" />
                        <div className="flex-1">
                          <Label htmlFor="standard" className="font-medium">
                            Annonce Standard - Gratuit
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            Annonce classique visible dans les résultats
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 p-4 border rounded-lg border-primary/50 bg-primary/5">
                        <RadioGroupItem value="24h" id="24h" />
                        <div className="flex-1">
                          <Label htmlFor="24h" className="font-medium flex items-center gap-2">
                            <Star className="w-4 h-4 text-primary" />
                            Annonce VIP 24h - 500 FCFA
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            Mise en avant pendant 24h, badge VIP, affichage prioritaire
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 p-4 border rounded-lg border-primary/50 bg-primary/5">
                        <RadioGroupItem value="7days" id="7days" />
                        <div className="flex-1">
                          <Label htmlFor="7days" className="font-medium flex items-center gap-2">
                            <Star className="w-4 h-4 text-primary" />
                            Annonce VIP 7 jours - 2,500 FCFA
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            Mise en avant pendant 7 jours, badge VIP, affichage prioritaire
                          </p>
                        </div>
                      </div>
                    </RadioGroup>
                  </CardContent>
                </Card>

                <div className="flex gap-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="lg" 
                    className="flex-1"
                    onClick={() => setShowPreview(true)}
                    disabled={!formData.title || !formData.description || !formData.category || !formData.location || !formData.phone}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Prévisualiser
                  </Button>
                  <Button type="submit" size="lg" className="flex-1 gradient-gold text-black">
                    Publier - {getVipPrice()}
                  </Button>
                </div>
              </form>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Star className="w-5 h-5 text-primary mr-2" />
                    Avantages VIP
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <h4 className="font-medium text-primary mb-2">VIP 24h - 500 FCFA</h4>
                      <ul className="text-sm space-y-1">
                        <li>✅ Affichage prioritaire 24h</li>
                        <li>✅ Badge VIP visible</li>
                        <li>✅ 3x plus de vues</li>
                      </ul>
                    </div>
                    
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <h4 className="font-medium text-primary mb-2">VIP 7 jours - 2,500 FCFA</h4>
                      <ul className="text-sm space-y-1">
                        <li>✅ Affichage prioritaire 7 jours</li>
                        <li>✅ Badge VIP visible</li>
                        <li>✅ 5x plus de vues</li>
                        <li>✅ Support prioritaire</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Conseils pour une bonne annonce</CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-2">
                  <p>• Utilisez un titre accrocheur</p>
                  <p>• Décrivez précisément vos services</p>
                  <p>• Ajoutez des photos de qualité</p>
                  <p>• Indiquez vos tarifs clairement</p>
                  <p>• Ajoutez votre WhatsApp pour plus de contacts</p>
                  <p>• Respectez les règles de la plateforme</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default CreateAd;
