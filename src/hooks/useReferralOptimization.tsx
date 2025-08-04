import { useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/environmentUtils';

interface CacheConfig {
  ttl: number; // Time to live in milliseconds
  key: string;
}

interface ReferralOptimization {
  validateReferralCode: (code: string) => Promise<{ isValid: boolean; referrerName?: string; error?: string }>;
  getCachedStats: (userId: string) => any;
  setCachedStats: (userId: string, stats: any) => void;
  clearCache: () => void;
}

// Cache simple en mémoire pour la session
const cache = new Map();
const cacheTimestamps = new Map();

export const useReferralOptimization = (): ReferralOptimization => {

  const validateReferralCode = useCallback(async (code: string) => {
    if (!code || code.length < 6 || code.length > 12) {
      return { isValid: false, error: 'Code invalide' };
    }

    try {
      // Vérifier d'abord le cache
      const cacheKey = `referral_code_${code}`;
      const cached = getCachedData(cacheKey, 5 * 60 * 1000); // 5 minutes
      if (cached) {
        return cached;
      }

      logger.info('Validation du code de parrainage');
      
      // Requête optimisée avec jointure
      const { data, error } = await supabase
        .from('referral_codes')
        .select(`
          code,
          is_active,
          user_id,
          profiles:user_id (
            full_name
          )
        `)
        .eq('code', code.toUpperCase())
        .eq('is_active', true)
        .maybeSingle();

      if (error) {
        logger.error('Erreur validation code:', error.message);
        return { isValid: false, error: 'Erreur de validation' };
      }

      const result = {
        isValid: !!data,
        referrerName: data?.profiles?.full_name || 'Utilisateur anonyme'
      };

      // Mettre en cache
      setCachedData(cacheKey, result, 5 * 60 * 1000);
      
      return result;
    } catch (error) {
      logger.error('Erreur inattendue validation:', error);
      return { isValid: false, error: 'Erreur système' };
    }
  }, []);

  const getCachedStats = useCallback((userId: string) => {
    return getCachedData(`stats_${userId}`, 2 * 60 * 1000); // 2 minutes
  }, []);

  const setCachedStats = useCallback((userId: string, stats: any) => {
    setCachedData(`stats_${userId}`, stats, 2 * 60 * 1000);
  }, []);

  const clearCache = useCallback(() => {
    cache.clear();
    cacheTimestamps.clear();
  }, []);

  return {
    validateReferralCode,
    getCachedStats,
    setCachedStats,
    clearCache
  };
};

// Utilitaires de cache
function getCachedData(key: string, ttl: number) {
  const data = cache.get(key);
  const timestamp = cacheTimestamps.get(key);
  
  if (data && timestamp && (Date.now() - timestamp) < ttl) {
    return data;
  }
  
  // Nettoyer les données expirées
  cache.delete(key);
  cacheTimestamps.delete(key);
  return null;
}

function setCachedData(key: string, data: any, ttl: number) {
  cache.set(key, data);
  cacheTimestamps.set(key, Date.now());
  
  // Nettoyer automatiquement après TTL
  setTimeout(() => {
    cache.delete(key);
    cacheTimestamps.delete(key);
  }, ttl);
}