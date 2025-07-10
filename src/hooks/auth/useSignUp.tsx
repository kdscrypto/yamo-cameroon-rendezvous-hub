
import { supabase } from '@/integrations/supabase/client';
import { normalizePhoneNumber, isValidPhoneNumber } from '@/utils/phoneUtils';

export const useSignUp = () => {
  const signUp = async (email: string, password: string, fullName?: string, phone?: string, referralCode?: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    // Validation et normalisation du numéro de téléphone si fourni
    let normalizedPhone: string | undefined = undefined;
    if (phone && phone.trim()) {
      if (!isValidPhoneNumber(phone)) {
        return { 
          data: null, 
          error: { message: "Le format du numéro de téléphone n'est pas valide." }
        };
      }
      normalizedPhone = normalizePhoneNumber(phone);
      
      // Vérifier si le numéro de téléphone existe déjà
      const { data: existingProfile, error: checkError } = await supabase
        .from('profiles')
        .select('id')
        .eq('phone', normalizedPhone)
        .maybeSingle();
      
      if (checkError) {
        console.error('Erreur lors de la vérification du téléphone:', checkError);
        return { 
          data: null, 
          error: { message: "Erreur lors de la vérification du numéro de téléphone." }
        };
      }
      
      if (existingProfile) {
        return { 
          data: null, 
          error: { message: "Ce numéro de téléphone est déjà utilisé." }
        };
      }
    }

    // Validation du code de parrainage si fourni
    let normalizedReferralCode: string | undefined = undefined;
    if (referralCode && referralCode.trim()) {
      normalizedReferralCode = referralCode.trim().toUpperCase();
      
      console.log('Validation du code de parrainage lors de l\'inscription:', normalizedReferralCode);
      
      const { data: referralData, error: referralError } = await supabase
        .from('referral_codes')
        .select('code, user_id')
        .eq('code', normalizedReferralCode)
        .eq('is_active', true)
        .maybeSingle();

      if (referralError) {
        console.error('Erreur lors de la vérification du code de parrainage:', referralError);
        return { 
          data: null, 
          error: { message: "Erreur lors de la vérification du code de parrainage." }
        };
      }

      if (!referralData) {
        console.log('Code de parrainage non trouvé:', normalizedReferralCode);
        return { 
          data: null, 
          error: { message: "Code de parrainage invalide." }
        };
      }
      
      console.log('Code de parrainage valide:', referralData);
    }
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
          phone: normalizedPhone,
          referral_code: normalizedReferralCode
        }
      }
    });

    // Si l'inscription réussit et qu'on a un numéro de téléphone, mettre à jour le profil
    if (!error && data.user && normalizedPhone) {
      try {
        // Attendre un peu que le trigger de création de profil se déclenche
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ phone: normalizedPhone })
          .eq('id', data.user.id);
        
        if (profileError) {
          console.error('Erreur lors de la mise à jour du profil avec le téléphone:', profileError);
        } else {
          console.log('Profil mis à jour avec le numéro de téléphone:', normalizedPhone);
        }
      } catch (profileUpdateError) {
        console.error('Erreur inattendue lors de la mise à jour du profil:', profileUpdateError);
      }
    }
    
    return { data, error };
  };

  return { signUp };
};
