
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import GeneralInfoSection from './GeneralInfoSection';
import ContactSection from './ContactSection';
import PhotosSection from './PhotosSection';
import AdTypeSection from './AdTypeSection';

interface AdFormProps {
  formData: {
    title: string;
    description: string;
    category: string;
    location: string;
    price: string;
    phone: string;
    whatsapp: string;
    vipOption: string;
    photos: File[];
  };
  onInputChange: (field: string, value: string | boolean | File[]) => void;
  onPreview: () => void;
  onSubmit: (e: React.FormEvent) => void;
  getVipPrice: () => string;
}

const AdForm = ({ formData, onInputChange, onPreview, onSubmit, getVipPrice }: AdFormProps) => {
  const isFormValid = formData.title && formData.description && formData.category && formData.location && formData.phone;

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <GeneralInfoSection formData={formData} onInputChange={onInputChange} />
      <ContactSection formData={formData} onInputChange={onInputChange} />
      <PhotosSection formData={formData} onInputChange={onInputChange} />
      <AdTypeSection formData={formData} onInputChange={onInputChange} />

      <div className="flex gap-4">
        <Button 
          type="button" 
          variant="outline" 
          size="lg" 
          className="flex-1 hover:bg-muted hover:text-foreground"
          onClick={onPreview}
          disabled={!isFormValid}
        >
          <Eye className="w-4 h-4 mr-2" />
          Prévisualiser
        </Button>
      </div>
    </form>
  );
};

export default AdForm;
