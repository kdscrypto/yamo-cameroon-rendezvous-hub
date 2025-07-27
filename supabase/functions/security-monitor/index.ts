import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SecurityEvent {
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  source: string;
  description: string;
  ip_address?: string;
  user_agent?: string;
  url?: string;
  data?: Record<string, any>;
}

interface MonitoringRequest {
  action: 'log_event' | 'get_stats' | 'analyze_threats' | 'block_ip';
  event?: SecurityEvent;
  ip?: string;
  timeframe?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        db: {
          schema: 'public'
        }
      }
    );

    const { action, event, ip, timeframe = '24h' }: MonitoringRequest = await req.json();

    switch (action) {
      case 'log_event':
        if (!event) {
          return new Response(
            JSON.stringify({ success: false, error: 'Event data required' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Enregistrer l'événement de sécurité
        const { error: insertError } = await supabase
          .from('security_events')
          .insert({
            event_type: event.type,
            severity: event.severity,
            source: event.source,
            description: event.description,
            ip_address: event.ip_address,
            user_agent: event.user_agent,
            url: event.url,
            metadata: event.data || {}
          });

        if (insertError) {
          console.error('Error logging security event:', insertError);
          return new Response(
            JSON.stringify({ success: false, error: 'Failed to log event' }),
            { 
              status: 500,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        }

        // Analyser la gravité et prendre des actions automatiques
        if (event.severity === 'critical' || event.severity === 'high') {
          console.log(`High severity event detected: ${event.type} from ${event.source}`);
          
          // Déclencher des alertes supplémentaires si nécessaire
          if (event.ip_address) {
            await trackSuspiciousIP(supabase, event.ip_address, event.type);
          }
        }

        return new Response(
          JSON.stringify({ success: true, eventLogged: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

      case 'get_stats':
        const stats = await getSecurityStats(supabase, timeframe);
        return new Response(
          JSON.stringify({ success: true, data: stats }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

      case 'analyze_threats':
        const threats = await analyzeThreatPatterns(supabase, timeframe);
        return new Response(
          JSON.stringify({ success: true, data: threats }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

      case 'block_ip':
        if (!ip) {
          return new Response(
            JSON.stringify({ success: false, error: 'IP address required' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const blockResult = await blockSuspiciousIP(supabase, ip);
        return new Response(
          JSON.stringify({ success: true, data: blockResult }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

      default:
        return new Response(
          JSON.stringify({ success: false, error: 'Invalid action' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

  } catch (error) {
    console.error('Error in security-monitor function:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Internal server error',
        details: error.message 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
};

// Obtenir les statistiques de sécurité
async function getSecurityStats(supabase: any, timeframe: string) {
  const timeMap = {
    '1h': '1 hour',
    '24h': '1 day',
    '7d': '7 days',
    '30d': '30 days'
  };
  
  const interval = timeMap[timeframe as keyof typeof timeMap] || '1 day';

  // Statistiques générales
  const { data: events, error } = await supabase
    .from('security_events')
    .select('event_type, severity, created_at')
    .gte('created_at', `now() - interval '${interval}'`);

  if (error) {
    console.error('Error fetching security stats:', error);
    throw error;
  }

  // Analyser les données
  const stats = {
    totalEvents: events?.length || 0,
    eventsBySeverity: {
      low: events?.filter(e => e.severity === 'low').length || 0,
      medium: events?.filter(e => e.severity === 'medium').length || 0,
      high: events?.filter(e => e.severity === 'high').length || 0,
      critical: events?.filter(e => e.severity === 'critical').length || 0,
    },
    eventsByType: events?.reduce((acc: Record<string, number>, event) => {
      acc[event.event_type] = (acc[event.event_type] || 0) + 1;
      return acc;
    }, {}) || {},
    timeframe
  };

  return stats;
}

// Analyser les patterns de menaces
async function analyzeThreatPatterns(supabase: any, timeframe: string) {
  const timeMap = {
    '1h': '1 hour',
    '24h': '1 day',
    '7d': '7 days',
    '30d': '30 days'
  };
  
  const interval = timeMap[timeframe as keyof typeof timeMap] || '1 day';

  // Récupérer les événements récents
  const { data: events, error } = await supabase
    .from('security_events')
    .select('*')
    .gte('created_at', `now() - interval '${interval}'`)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error analyzing threats:', error);
    throw error;
  }

  // Analyser les patterns
  const ipCounts = new Map();
  const threatTypes = new Map();
  const suspiciousIPs = [];

  events?.forEach((event: any) => {
    if (event.ip_address) {
      const count = ipCounts.get(event.ip_address) || 0;
      ipCounts.set(event.ip_address, count + 1);
      
      // IP avec plus de 5 événements dans la période
      if (count + 1 > 5) {
        suspiciousIPs.push({
          ip: event.ip_address,
          eventCount: count + 1,
          lastEvent: event.created_at,
          severity: event.severity
        });
      }
    }

    const typeCount = threatTypes.get(event.event_type) || 0;
    threatTypes.set(event.event_type, typeCount + 1);
  });

  return {
    topSuspiciousIPs: suspiciousIPs.slice(0, 10),
    threatTypeDistribution: Object.fromEntries(threatTypes),
    totalUniqueIPs: ipCounts.size,
    averageEventsPerIP: ipCounts.size > 0 ? events?.length / ipCounts.size : 0
  };
}

// Tracker une IP suspecte
async function trackSuspiciousIP(supabase: any, ip: string, eventType: string) {
  // Compter les événements récents de cette IP
  const { data: recentEvents, error } = await supabase
    .from('security_events')
    .select('id')
    .eq('ip_address', ip)
    .gte('created_at', `now() - interval '1 hour'`);

  if (error) {
    console.error('Error tracking suspicious IP:', error);
    return;
  }

  // Si plus de 10 événements en 1 heure, marquer comme très suspect
  if (recentEvents && recentEvents.length > 10) {
    console.log(`IP ${ip} has ${recentEvents.length} events in last hour - high threat`);
    
    // Enregistrer dans une table de surveillance spéciale
    await supabase
      .from('security_events')
      .insert({
        event_type: 'ip_flagged_suspicious',
        severity: 'high',
        source: 'auto_detection',
        description: `IP ${ip} flagged for ${recentEvents.length} events in 1 hour`,
        ip_address: ip,
        metadata: {
          recent_event_count: recentEvents.length,
          trigger_event: eventType,
          auto_flagged: true
        }
      });
  }
}

// Bloquer une IP suspecte
async function blockSuspiciousIP(supabase: any, ip: string) {
  try {
    // Enregistrer le blocage
    const { error } = await supabase
      .from('security_events')
      .insert({
        event_type: 'ip_blocked',
        severity: 'high',
        source: 'manual_action',
        description: `IP ${ip} manually blocked`,
        ip_address: ip,
        metadata: {
          action: 'block',
          timestamp: new Date().toISOString()
        }
      });

    if (error) {
      throw error;
    }

    return {
      blocked: true,
      ip,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error blocking IP:', error);
    throw error;
  }
}

serve(handler);