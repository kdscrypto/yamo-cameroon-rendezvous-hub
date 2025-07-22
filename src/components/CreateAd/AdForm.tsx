
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
  isFormValid: boolean;
}

const AdForm = ({ formData, onInputChange, onPreview, onSubmit, getVipPrice, isFormValid }: AdFormProps) => {
  const handlePreviewClick = () => {
    console.log('Preview button clicked, form data:', formData);
    console.log('Form valid:', isFormValid);
    onPreview();
  };

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
          className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white border-yellow-500 font-semibold shadow-lg transform hover:scale-105 transition-all duration-200"
          onClick={handlePreviewClick}
          disabled={!isFormValid}
        >
          <Eye className="w-5 h-5 mr-2" />
          Prévisualiser
        </Button>
      </div>
    </form>
  );
};

export default AdForm;
