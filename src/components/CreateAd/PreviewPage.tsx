
import React from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AdPreview from '@/components/AdPreview';
import { FormData } from '@/hooks/useCreateAdForm';

interface PreviewPageProps {
  formData: FormData;
  onBack: () => void;
  onSubmit: (e: React.FormEvent) => void;
  getVipPrice: () => string;
  isSubmitting: boolean;
  onWhatsAppClick: (number: string) => void;
}

const PreviewPage = ({ 
  formData, 
  onBack, 
  onSubmit, 
  getVipPrice, 
  isSubmitting,
  onWhatsAppClick 
}: PreviewPageProps) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(e);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <div className="flex-1 px-4 py-8">
        <div className="container mx-auto max-w-4xl">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold">Prévisualisation de votre annonce</h1>
            <Button 
              variant="outline" 
              onClick={onBack}
              className="flex items-center gap-2 hover:bg-muted hover:text-foreground"
            >
              <X className="w-4 h-4" />
              Retour au formulaire
            </Button>
          </div>
          
          <AdPreview 
            formData={formData} 
            onWhatsAppClick={onWhatsAppClick}
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
                onClick={onBack}
                className="hover:bg-muted hover:text-foreground"
              >
                Modifier l'annonce
              </Button>
              <Button 
                className="gradient-gold text-black hover:opacity-90"
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Publication...' : `Publier l'annonce - ${getVipPrice()}`}
              </Button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PreviewPage;
