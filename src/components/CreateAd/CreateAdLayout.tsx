
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AdForm from '@/components/CreateAd/AdForm';
import CreateAdSidebar from '@/components/CreateAd/CreateAdSidebar';
import { FormData } from '@/hooks/useCreateAdForm';

interface CreateAdLayoutProps {
  formData: FormData;
  onInputChange: (field: string, value: string | boolean | File[]) => void;
  onPreview: () => void;
  onSubmit: (e: React.FormEvent) => void;
  getVipPrice: () => string;
}

const CreateAdLayout = ({ 
  formData, 
  onInputChange, 
  onPreview, 
  onSubmit, 
  getVipPrice 
}: CreateAdLayoutProps) => {
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
                onInputChange={onInputChange}
                onPreview={onPreview}
                onSubmit={onSubmit}
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

export default CreateAdLayout;
