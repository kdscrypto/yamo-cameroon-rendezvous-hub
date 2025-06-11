
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Image, Star } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const CreateAd = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    location: '',
    price: '',
    phone: '',
    email: '',
    isVip: false
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement ad creation logic
    console.log('Creating ad:', formData);
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

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
                            <SelectItem value="douala">Douala</SelectItem>
                            <SelectItem value="yaounde">Yaoundé</SelectItem>
                            <SelectItem value="bafoussam">Bafoussam</SelectItem>
                            <SelectItem value="bamenda">Bamenda</SelectItem>
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
                      <Label htmlFor="email">Email (optionnel)</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="votre@email.com"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Photos</CardTitle>
                    <CardDescription>
                      Ajoutez des photos pour rendre votre annonce plus attractive
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                      <Image className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground mb-4">
                        Glissez vos photos ici ou cliquez pour sélectionner
                      </p>
                      <Button variant="outline">
                        Choisir des photos
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Button type="submit" size="lg" className="w-full">
                  Publier l'annonce
                </Button>
              </form>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Star className="w-5 h-5 text-primary mr-2" />
                    Option VIP
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Mettez votre annonce en avant pour plus de visibilité
                  </p>
                  <ul className="text-sm space-y-2 mb-4">
                    <li>✅ Affichage prioritaire</li>
                    <li>✅ Badge VIP visible</li>
                    <li>✅ Plus de contacts</li>
                  </ul>
                  <Button className="w-full" variant="outline">
                    Passer en VIP - 5,000 FCFA
                  </Button>
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
