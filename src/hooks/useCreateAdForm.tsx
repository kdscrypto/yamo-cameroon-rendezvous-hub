
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface FormData {
  title: string;
  description: string;
  category: string;
  location: string;
  price: string;
  phone: string;
  whatsapp: string;
  vipOption: string;
  photos: File[];
}

export const useCreateAdForm = () => {
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    category: '',
    location: '',
    price: '',
    phone: '',
    whatsapp: '',
    vipOption: 'standard',
    photos: []
  });

  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const createAdMutation = useMutation({
    mutationFn: async (formDataParam: FormData) => {
      if (!user) throw new Error('User not authenticated');

      console.log('Creating ad with form data:', formDataParam);
      console.log('VIP option:', formDataParam.vipOption);

      // Upload images first if any
      let imageUrls: string[] = [];
      if (formDataParam.photos.length > 0) {
        console.log('Uploading images:', formDataParam.photos.length);
        const uploadPromises = formDataParam.photos.map(async (photo, index) => {
          const fileExt = photo.name.split('.').pop();
          const fileName = `${user.id}/${Date.now()}_${index}.${fileExt}`;
          
          const { data, error } = await supabase.storage
            .from('ad-images')
            .upload(fileName, photo);
          
          if (error) {
            console.error('Image upload error:', error);
            throw error;
          }
          
          const { data: { publicUrl } } = supabase.storage
            .from('ad-images')
            .getPublicUrl(fileName);
          
          console.log('Image uploaded:', publicUrl);
          return publicUrl;
        });
        
        imageUrls = await Promise.all(uploadPromises);
      }

      // Determine expiration for VIP ads
      let expiresAt = null;
      if (formDataParam.vipOption === '24h') {
        expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      } else if (formDataParam.vipOption === '7days') {
        expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      }

      // Create the ad with contact information
      const newAdData = {
        title: formDataParam.title,
        description: formDataParam.description,
        category: formDataParam.category,
        location: formDataParam.location,
        price: formDataParam.price ? parseFloat(formDataParam.price) : null,
        phone: formDataParam.phone,
        whatsapp: formDataParam.whatsapp || null,
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

  const handleInputChange = (field: string, value: string | boolean | File[]) => {
    console.log('Input change:', field, value);
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const getVipPrice = () => {
    switch (formData.vipOption) {
      case '24h': return '500 FCFA';
      case '7days': return '2,500 FCFA';
      default: return 'Gratuit';
    }
  };

  const isFormValid = !!(
    formData.title.trim() && 
    formData.description.trim() && 
    formData.category && 
    formData.location && 
    formData.phone.trim()
  );

  console.log('Form validation:', {
    title: !!formData.title.trim(),
    description: !!formData.description.trim(),
    category: !!formData.category,
    location: !!formData.location,
    phone: !!formData.phone.trim(),
    isValid: isFormValid
  });

  return {
    formData,
    handleInputChange,
    createAdMutation,
    getVipPrice,
    isFormValid
  };
};
