import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface EmailAnalysisRequest {
  action: 'analyze-patterns' | 'check-domain' | 'bulk-analysis';
  domain?: string;
  timeframe?: string; // '24h', '7d', '30d'
}

interface SuspiciousPattern {
  pattern: string;
  count: number;
  risk_level: 'low' | 'medium' | 'high';
  description: string;
  examples: string[];
}

// Domaines jetables étendus pour surveillance continue
const DISPOSABLE_DOMAINS = [
  '10minutemail.com', 'guerrillamail.com', 'mailinator.com', 'tempmail.org',
  'temp-mail.org', 'throwaway.email', 'yopmail.com', 'maildrop.cc',
  'sharklasers.com', 'guerrillamailblock.com', 'pokemail.net', 'spam4.me',
  'bccto.me', 'chacuo.net', 'dispostable.com', 'fake-mail.ml',
  'getairmail.com', 'getnada.com', 'inboxkitten.com', 'mail-temporaire.fr',
  'mohmal.com', 'rootfest.net', 'spambox.us', 'tempmailaddress.com',
  'trashmail.com', 'wegwerfmail.de', 'emailondeck.com', 'mintemail.com'
];

const analyzeEmailPatterns = async (supabase: any, timeframe: string = '24h') => {
  console.log(`Analyzing email patterns for the last ${timeframe}`);
  
  const timeMap = {
    '24h': '1 day',
    '7d': '7 days',
    '30d': '30 days'
  };
  
  const interval = timeMap[timeframe as keyof typeof timeMap] || '24h';
  
  // Analyser les patterns suspects dans les emails récents
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('email, created_at')
    .gte('created_at', `now() - interval '${interval}'`)
    .not('email', 'is', null);

  if (error) {
    console.error('Erreur lors de la récupération des profils:', error);
    return { patterns: [], totalAnalyzed: 0 };
  }

  const suspiciousPatterns: SuspiciousPattern[] = [];
  const emailAnalysis = {
    longNumericSequences: [] as string[],
    disposableDomains: [] as string[],
    commonTypos: [] as string[],
    repeatedChars: [] as string[],
    botPatterns: [] as string[]
  };

  profiles?.forEach((profile: any) => {
    const email = profile.email.toLowerCase();
    const localPart = email.split('@')[0];
    const domain = email.split('@')[1];

    // Détecter les séquences numériques longues
    if (/\d{8,}/.test(localPart)) {
      emailAnalysis.longNumericSequences.push(email);
    }

    // Détecter les domaines jetables
    if (DISPOSABLE_DOMAINS.includes(domain)) {
      emailAnalysis.disposableDomains.push(email);
    }

    // Détecter les typos courants
    const commonTypos = ['gmai.com', 'gmailcom', 'outlok.com', 'hotmailcom', 'yahooo.com'];
    if (commonTypos.includes(domain)) {
      emailAnalysis.commonTypos.push(email);
    }

    // Détecter les caractères répétés
    if (/(.)\1{5,}/.test(localPart)) {
      emailAnalysis.repeatedChars.push(email);
    }

    // Détecter les patterns de bot
    if (/^[a-z]{1,3}\d{6,}$|^[a-z]+\d+[a-z]+\d+$/.test(localPart)) {
      emailAnalysis.botPatterns.push(email);
    }
  });

  // Créer les patterns suspects
  if (emailAnalysis.longNumericSequences.length > 0) {
    suspiciousPatterns.push({
      pattern: 'long_numeric_sequences',
      count: emailAnalysis.longNumericSequences.length,
      risk_level: 'high',
      description: 'Emails avec des séquences numériques longues (8+ chiffres)',
      examples: emailAnalysis.longNumericSequences.slice(0, 5)
    });
  }

  if (emailAnalysis.disposableDomains.length > 0) {
    suspiciousPatterns.push({
      pattern: 'disposable_domains',
      count: emailAnalysis.disposableDomains.length,
      risk_level: 'high',
      description: 'Emails provenant de domaines jetables',
      examples: emailAnalysis.disposableDomains.slice(0, 5)
    });
  }

  if (emailAnalysis.commonTypos.length > 0) {
    suspiciousPatterns.push({
      pattern: 'domain_typos',
      count: emailAnalysis.commonTypos.length,
      risk_level: 'medium',
      description: 'Emails avec des typos de domaines courants',
      examples: emailAnalysis.commonTypos.slice(0, 5)
    });
  }

  if (emailAnalysis.botPatterns.length > 0) {
    suspiciousPatterns.push({
      pattern: 'bot_patterns',
      count: emailAnalysis.botPatterns.length,
      risk_level: 'high',
      description: 'Emails avec des patterns automatisés suspects',
      examples: emailAnalysis.botPatterns.slice(0, 5)
    });
  }

  return {
    patterns: suspiciousPatterns,
    totalAnalyzed: profiles?.length || 0,
    timeframe
  };
};

const checkDomainReputation = async (domain: string) => {
  console.log(`Vérification du domaine: ${domain}`);
  
  const isDisposable = DISPOSABLE_DOMAINS.includes(domain);
  const commonTypos = ['gmai.com', 'gmailcom', 'outlok.com', 'hotmailcom', 'yahooo.com'];
  const isTypo = commonTypos.includes(domain);
  
  let riskLevel: 'low' | 'medium' | 'high' = 'low';
  const issues: string[] = [];
  
  if (isDisposable) {
    riskLevel = 'high';
    issues.push('Domaine email jetable/temporaire');
  }
  
  if (isTypo) {
    riskLevel = 'medium';
    issues.push('Possible typo d\'un domaine populaire');
  }
  
  // Vérifier la structure du domaine
  if (domain.length < 4) {
    riskLevel = 'high';
    issues.push('Domaine trop court');
  }
  
  if (!domain.includes('.')) {
    riskLevel = 'high';
    issues.push('Format de domaine invalide');
  }
  
  return {
    domain,
    riskLevel,
    issues,
    isDisposable,
    isTypo
  };
};

const serve_handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { action, domain, timeframe }: EmailAnalysisRequest = await req.json();

    switch (action) {
      case 'analyze-patterns':
        const analysis = await analyzeEmailPatterns(supabase, timeframe);
        return new Response(
          JSON.stringify({
            success: true,
            data: analysis
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

      case 'check-domain':
        if (!domain) {
          return new Response(
            JSON.stringify({ success: false, error: 'Domaine requis' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        const domainCheck = await checkDomainReputation(domain);
        return new Response(
          JSON.stringify({
            success: true,
            data: domainCheck
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

      case 'bulk-analysis':
        const bulkAnalysis = await analyzeEmailPatterns(supabase, '30d');
        return new Response(
          JSON.stringify({
            success: true,
            data: bulkAnalysis
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

      default:
        return new Response(
          JSON.stringify({ success: false, error: 'Action non supportée' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

  } catch (error) {
    console.error('Erreur dans email-monitoring:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Erreur interne du serveur',
        details: error.message 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
};

serve(serve_handler);