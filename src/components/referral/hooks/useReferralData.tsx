
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface ReferralStats {
  total_points: number;
  level_1_points: number;
  level_2_points: number;
  total_referrals_level_1: number;
  total_referrals_level_2: number;
}

export const useReferralData = () => {
  const { user } = useAuth();
  const [referralCode, setReferralCode] = useState<string>('');
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchReferralData();
    }
  }, [user]);

  // Système de mise à jour en temps réel pour les points
  useEffect(() => {
    if (!user) return;

    // Écouter les changements sur la table referral_points
    const pointsChannel = supabase
      .channel('referral-points-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'referral_points',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Points de parrainage mis à jour:', payload);
          if (payload.new) {
            setStats(payload.new as ReferralStats);
          }
        }
      )
      .subscribe();

    // Écouter les changements sur les relations de parrainage
    const relationshipsChannel = supabase
      .channel('referral-relationships-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'referral_relationships',
          filter: `referrer_user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Nouveau parrainage détecté:', payload);
          // Recharger les données pour avoir les stats à jour
          fetchReferralData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(pointsChannel);
      supabase.removeChannel(relationshipsChannel);
    };
  }, [user]);

  const fetchReferralData = async () => {
    if (!user) return;

    try {
      console.log('Fetching referral data for user:', user.id);
      
      // D'abord, essayer de récupérer le code depuis la table referral_codes
      const { data: codeData, error: codeError } = await supabase
        .from('referral_codes')
        .select('code')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .maybeSingle();

      if (codeError) {
        console.error('Erreur lors de la récupération du code de parrainage:', codeError);
      }

      // Si on n'a pas trouvé de code dans referral_codes, essayer depuis profiles
      if (!codeData?.code) {
        console.log('Code non trouvé dans referral_codes, essai depuis profiles...');
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('referral_code')
          .eq('id', user.id)
          .maybeSingle();

        if (profileError) {
          console.error('Erreur lors de la récupération du profil:', profileError);
        } else if (profileData?.referral_code) {
          console.log('Code trouvé dans profiles:', profileData.referral_code);
          setReferralCode(profileData.referral_code);
        } else {
          console.log('Aucun code trouvé, initialisation du système de parrainage...');
          // Si aucun code n'existe, initialiser le système de parrainage
          await initializeReferralSystem();
        }
      } else {
        console.log('Code trouvé dans referral_codes:', codeData.code);
        setReferralCode(codeData.code);
      }

      // Récupérer les statistiques de parrainage
      const { data: statsData, error: statsError } = await supabase
        .from('referral_points')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (statsError) {
        console.error('Erreur lors de la récupération des statistiques:', statsError);
      } else if (statsData) {
        setStats(statsData);
      } else {
        // Initialiser les stats si elles n'existent pas
        setStats({
          total_points: 0,
          level_1_points: 0,
          level_2_points: 0,
          total_referrals_level_1: 0,
          total_referrals_level_2: 0
        });
      }
    } catch (error) {
      console.error('Erreur inattendue:', error);
    } finally {
      setLoading(false);
    }
  };

  const initializeReferralSystem = async () => {
    if (!user) return;

    try {
      console.log('Initialisation du système de parrainage...');
      const { error } = await supabase.rpc('initialize_referral_system', {
        _user_id: user.id
      });

      if (error) {
        console.error('Erreur lors de l\'initialisation:', error);
      } else {
        console.log('Système de parrainage initialisé, rechargement des données...');
        // Recharger les données après initialisation
        setTimeout(() => fetchReferralData(), 1000);
      }
    } catch (error) {
      console.error('Erreur lors de l\'initialisation du système de parrainage:', error);
    }
  };

  return {
    referralCode,
    stats,
    loading,
    refetch: fetchReferralData
  };
};
