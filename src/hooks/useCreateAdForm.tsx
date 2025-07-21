
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

  const handleInputChange = (field: string, value: string | boolean | File[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const getVipPrice = () => {
    switch (formData.vipOption) {
      case '24h': return '500 FCFA';
      case '7days': return '2,500 FCFA';
      default: return 'Gratuit';
    }
  };

  const isFormValid = formData.title && formData.description && formData.category && formData.location && formData.phone;

  return {
    formData,
    handleInputChange,
    createAdMutation,
    getVipPrice,
    isFormValid
  };
};
