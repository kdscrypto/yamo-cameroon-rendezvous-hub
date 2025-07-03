import { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AdPreview from '@/components/AdPreview';
import AdForm from '@/components/CreateAd/AdForm';
import CreateAdSidebar from '@/components/CreateAd/CreateAdSidebar';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

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
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Redirect to login if user is not authenticated
  useEffect(() => {
    if (!loading && !user) {
      toast({
        title: "Connexion requise",
        description: "Vous devez être connecté pour créer une annonce.",
        variant: "destructive",
      });
      navigate('/login');
    }
  }, [user, loading, navigate, toast]);

  const createAdMutation = useMutation({
    mutationFn: async (formDataParam: any) => {
      if (!user) throw new Error('User not authenticated');

      console.log('Creating ad with VIP option:', formData.vipOption);

      // Upload images first if any
      let imageUrls: string[] = [];
      if (formData.photos.length > 0) {
        const uploadPromises = formData.photos.map(async (photo, index) => {
          const fileExt = photo.name.split('.').pop();
          const fileName = `${user.id}/${Date.now()}_${index}.${fileExt}`;
          
          const { data, error } = await supabase.storage
            .from('ad-images')
            .upload(fileName, photo);
          
          if (error) throw error;
          
          const { data: { publicUrl } } = supabase.storage
            .from('ad-images')
            .getPublicUrl(fileName);
          
          return publicUrl;
        });
        
        imageUrls = await Promise.all(uploadPromises);
      }

      // Determine expiration for VIP ads
      let expiresAt = null;
      if (formData.vipOption === '24h') {
        expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      } else if (formData.vipOption === '7days') {
        expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      }

      // Create the ad with contact information
      const newAdData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        location: formData.location,
        price: formData.price ? parseFloat(formData.price) : null,
        phone: formData.phone,
        whatsapp: formData.whatsapp || null,
        images: imageUrls,
        expires_at: expiresAt,
        user_id: user.id,
        moderation_status: 'pending',
        status: 'inactive'
      };

      console.log('Inserting ad with data:', newAdData);

      const { data, error } = await supabase
        .from('ads')
        .insert(newAdData)
        .select()
        .single();

      if (error) {
        console.error('Error creating ad:', error);
        throw error;
      }

      console.log('Ad created successfully:', data);
      return data;
    },
    onSuccess: (data) => {
      console.log('Ad creation success:', data);
      toast({
        title: "Annonce créée avec succès",
        description: "Votre annonce a été soumise pour modération. Elle sera visible dès qu'elle sera approuvée par notre équipe.",
      });
      navigate('/dashboard');
    },
    onError: (error) => {
      console.error('Error creating ad:', error);
      toast({
        title: "Erreur",
        description: "Impossible de créer l'annonce. Veuillez réessayer.",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({
        title: "Connexion requise",
        description: "Vous devez être connecté pour créer une annonce.",
        variant: "destructive",
      });
      navigate('/login');
      return;
    }
    console.log('Submitting ad with form data:', formData);
    createAdMutation.mutate(formData);
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

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Chargement...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Don't render the form if user is not authenticated
  if (!user) {
    return null;
  }

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
                className="flex items-center gap-2 hover:bg-muted hover:text-foreground"
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
                Votre annonce sera soumise pour modération et sera visible après approbation par notre équipe.
              </p>
              {formData.vipOption !== 'standard' && (
                <p className="text-sm text-blue-600 font-medium">
                  Annonce VIP : Votre annonce bénéficiera d'une mise en avant prioritaire une fois approuvée.
                </p>
              )}
              <div className="flex gap-4 justify-center">
                <Button 
                  variant="outline" 
                  onClick={() => setShowPreview(false)}
                  className="hover:bg-muted hover:text-foreground"
                >
                  Modifier l'annonce
                </Button>
                <Button 
                  className="gradient-gold text-black hover:opacity-90"
                  onClick={handleSubmit}
                  disabled={createAdMutation.isPending}
                >
                  {createAdMutation.isPending ? 'Publication...' : `Publier l'annonce - ${getVipPrice()}`}
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
