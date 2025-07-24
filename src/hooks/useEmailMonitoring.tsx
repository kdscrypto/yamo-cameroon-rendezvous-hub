import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SuspiciousPattern {
  pattern: string;
  count: number;
  risk_level: 'low' | 'medium' | 'high';
  description: string;
  examples: string[];
}

interface EmailAnalysis {
  patterns: SuspiciousPattern[];
  totalAnalyzed: number;
  timeframe: string;
}

interface DomainCheck {
  domain: string;
  riskLevel: 'low' | 'medium' | 'high';
  issues: string[];
  isDisposable: boolean;
  isTypo: boolean;
}

export const useEmailMonitoring = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const analyzeEmailPatterns = async (timeframe: string = '24h'): Promise<EmailAnalysis | null> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('email-monitoring', {
        body: {
          action: 'analyze-patterns',
          timeframe
        }
      });

      if (error) {
        console.error('Erreur edge function:', error);
        throw error;
      }

      if (!data.success) {
        throw new Error(data.error || 'Erreur inconnue');
      }

      return data.data;
    } catch (error) {
      console.error('Erreur lors de l\'analyse des patterns:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'analyser les patterns email.",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const checkDomainReputation = async (domain: string): Promise<DomainCheck | null> => {
    if (!domain.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez spécifier un domaine à vérifier.",
        variant: "destructive"
      });
      return null;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('email-monitoring', {
        body: {
          action: 'check-domain',
          domain: domain.toLowerCase().trim()
        }
      });

      if (error) {
        console.error('Erreur edge function:', error);
        throw error;
      }

      if (!data.success) {
        throw new Error(data.error || 'Erreur inconnue');
      }

      return data.data;
    } catch (error) {
      console.error('Erreur lors de la vérification du domaine:', error);
      toast({
        title: "Erreur",
        description: "Impossible de vérifier le domaine.",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const performBulkAnalysis = async (): Promise<EmailAnalysis | null> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('email-monitoring', {
        body: {
          action: 'bulk-analysis'
        }
      });

      if (error) {
        console.error('Erreur edge function:', error);
        throw error;
      }

      if (!data.success) {
        throw new Error(data.error || 'Erreur inconnue');
      }

      toast({
        title: "Analyse terminée",
        description: `Analyse complète effectuée sur ${data.data.totalAnalyzed} comptes.`
      });

      return data.data;
    } catch (error) {
      console.error('Erreur lors de l\'analyse en lot:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'effectuer l'analyse en lot.",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    analyzeEmailPatterns,
    checkDomainReputation,
    performBulkAnalysis
  };
};