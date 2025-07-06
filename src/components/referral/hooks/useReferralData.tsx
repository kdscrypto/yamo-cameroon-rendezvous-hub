
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

  const fetchReferralData = async () => {
    if (!user) return;

    try {
      // Récupérer le code de parrainage
      const { data: codeData, error: codeError } = await supabase
        .from('referral_codes')
        .select('code')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single();

      if (codeError) {
        console.error('Erreur lors de la récupération du code de parrainage:', codeError);
      } else if (codeData) {
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
      }
    } catch (error) {
      console.error('Erreur inattendue:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    referralCode,
    stats,
    loading,
    refetch: fetchReferralData
  };
};
