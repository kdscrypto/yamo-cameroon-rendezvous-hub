
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PreviewPage from '@/components/CreateAd/PreviewPage';
import CreateAdLayout from '@/components/CreateAd/CreateAdLayout';
import { useCreateAdForm } from '@/hooks/useCreateAdForm';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

const CreateAd = () => {
  const [showPreview, setShowPreview] = useState(false);
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const {
    formData,
    handleInputChange,
    createAdMutation,
    getVipPrice,
    isFormValid
  } = useCreateAdForm();

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

  const openWhatsApp = (number: string) => {
    const cleanNumber = number.replace(/\D/g, '');
    const message = encodeURIComponent(`Bonjour, je suis intéressé(e) par votre annonce "${formData.title}"`);
    window.open(`https://wa.me/${cleanNumber}?text=${message}`, '_blank');
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
      <PreviewPage
        formData={formData}
        onBack={() => setShowPreview(false)}
        onSubmit={handleSubmit}
        getVipPrice={getVipPrice}
        isSubmitting={createAdMutation.isPending}
        onWhatsAppClick={openWhatsApp}
      />
    );
  }

  return (
    <CreateAdLayout
      formData={formData}
      onInputChange={handleInputChange}
      onPreview={() => setShowPreview(true)}
      onSubmit={handleSubmit}
      getVipPrice={getVipPrice}
    />
  );
};

export default CreateAd;
