
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AdPreview from '@/components/AdPreview';
import AdForm from '@/components/CreateAd/AdForm';
import CreateAdSidebar from '@/components/CreateAd/CreateAdSidebar';

const CreateAd = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    location: '',
    price: '',
    phone: '',
    whatsapp: '',
    vipOption: 'standard',
    photos: [] as File[]
  });

  const [showPreview, setShowPreview] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowPreview(true);
  };

  const handleInputChange = (field: string, value: string | boolean | File[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
            <div className="lg:col-span-2">
              <AdForm
                formData={formData}
                onInputChange={handleInputChange}
                onPreview={() => setShowPreview(true)}
                onSubmit={handleSubmit}
                getVipPrice={getVipPrice}
              />
            </div>

            <CreateAdSidebar />
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default CreateAd;
