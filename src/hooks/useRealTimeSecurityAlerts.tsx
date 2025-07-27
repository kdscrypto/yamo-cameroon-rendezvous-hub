import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { securityMiddleware } from '@/utils/securityMiddleware';

interface SecurityEvent {
  id: string;
  event_type: string;
  severity: string;
  source: string;
  description: string;
  metadata: any;
  ip_address?: string;
  user_agent?: string;
  url?: string;
  created_at: string;
}

interface AlertRule {
  id: string;
  name: string;
  type: string;
  severity: string;
  enabled: boolean;
  threshold?: number;
  timeWindow?: number;
  notification_methods: string[];
  conditions: Record<string, any>;
}

interface AlertConfig {
  enableRealTimeAlerts: boolean;
  enableEmailNotifications: boolean;
  enableBrowserNotifications: boolean;
  emailAddress: string;
  alertRules: AlertRule[];
}

export const useRealTimeSecurityAlerts = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [config, setConfig] = useState<AlertConfig | null>(null);
  const [isListening, setIsListening] = useState(false);
  const eventCountRef = useRef<Map<string, { count: number; firstEvent: number }>>(new Map());
  const notificationPermission = useRef<NotificationPermission>('default');

  // Load configuration
  useEffect(() => {
    const loadConfig = () => {
      try {
        const savedConfig = localStorage.getItem('security-alerts-config');
        if (savedConfig) {
          setConfig(JSON.parse(savedConfig));
        }
      } catch (error) {
        console.error('Error loading alerts configuration:', error);
      }
    };

    loadConfig();

    // Check notification permission
    if ('Notification' in window) {
      notificationPermission.current = Notification.permission;
    }
  }, []);

  // Real-time subscription to security events
  useEffect(() => {
    if (!user || !config?.enableRealTimeAlerts) return;

    let subscription: any;

    const startListening = async () => {
      try {
        // Subscribe to security events
        subscription = supabase
          .channel('security_events_realtime')
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'security_events'
            },
            (payload) => {
              handleSecurityEvent(payload.new as SecurityEvent);
            }
          )
          .subscribe();

        // Subscribe to admin audit logs
        supabase
          .channel('admin_audit_realtime')
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'admin_audit_log'
            },
            (payload) => {
              handleAuditEvent(payload.new);
            }
          )
          .subscribe();

        setIsListening(true);
      } catch (error) {
        console.error('Error setting up real-time alerts:', error);
      }
    };

    startListening();

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
      setIsListening(false);
    };
  }, [user, config]);

  const handleSecurityEvent = useCallback((event: SecurityEvent) => {
    if (!config) return;

    // Find matching alert rules
    const matchingRules = config.alertRules.filter(rule => {
      if (!rule.enabled) return false;
      
      // Check event type match
      if (rule.type !== 'security_event' && rule.type !== event.event_type) return false;
      
      // Check severity match
      if (rule.conditions.severity && rule.conditions.severity !== event.severity) return false;
      
      // Check event type conditions
      if (rule.conditions.event_type) {
        if (Array.isArray(rule.conditions.event_type)) {
          if (!rule.conditions.event_type.includes(event.event_type)) return false;
        } else if (rule.conditions.event_type !== event.event_type) {
          return false;
        }
      }
      
      return true;
    });

    matchingRules.forEach(rule => {
      processAlert(rule, event);
    });
  }, [config]);

  const handleAuditEvent = useCallback((auditEvent: any) => {
    if (!config) return;

    // Find matching rules for audit events
    const matchingRules = config.alertRules.filter(rule => {
      if (!rule.enabled) return false;
      
      if (rule.type === 'role_change') {
        return rule.conditions.action?.includes(auditEvent.action);
      }
      
      return false;
    });

    matchingRules.forEach(rule => {
      processAlert(rule, {
        id: auditEvent.id,
        event_type: auditEvent.action,
        severity: 'high',
        source: 'admin_audit',
        description: `Action admin: ${auditEvent.action}`,
        metadata: auditEvent.metadata || {},
        created_at: auditEvent.created_at
      });
    });
  }, [config]);

  const processAlert = useCallback((rule: AlertRule, event: SecurityEvent | any) => {
    const now = Date.now();
    const eventKey = `${rule.id}_${event.event_type}`;
    
    // Handle threshold-based rules
    if (rule.threshold && rule.timeWindow) {
      const eventData = eventCountRef.current.get(eventKey) || { count: 0, firstEvent: now };
      const timeWindowMs = rule.timeWindow * 60 * 1000;
      
      // Reset counter if time window has passed
      if (now - eventData.firstEvent > timeWindowMs) {
        eventData.count = 1;
        eventData.firstEvent = now;
      } else {
        eventData.count++;
      }
      
      eventCountRef.current.set(eventKey, eventData);
      
      // Only trigger alert if threshold is reached
      if (eventData.count < rule.threshold) {
        return;
      }
      
      // Reset counter after triggering
      eventCountRef.current.delete(eventKey);
    }

    // Send notifications based on rule configuration
    rule.notification_methods.forEach(method => {
      switch (method) {
        case 'toast':
          sendToastNotification(rule, event);
          break;
        case 'browser':
          sendBrowserNotification(rule, event);
          break;
        case 'email':
          sendEmailNotification(rule, event);
          break;
      }
    });
  }, []);

  const sendToastNotification = (rule: AlertRule, event: any) => {
    const severity = event.severity || rule.severity;
    
    toast({
      title: `Alerte de sécurité - ${severity.toUpperCase()}`,
      description: event.description || rule.name,
      variant: severity === 'critical' || severity === 'high' ? 'destructive' : 'default',
      duration: severity === 'critical' ? 10000 : 5000,
    });
  };

  const sendBrowserNotification = (rule: AlertRule, event: any) => {
    if (!config?.enableBrowserNotifications) return;
    if (notificationPermission.current !== 'granted') return;

    const severity = event.severity || rule.severity;
    const title = `Alerte de sécurité - ${severity.toUpperCase()}`;
    const body = event.description || rule.name;

    try {
      const notification = new Notification(title, {
        body,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: `security-${event.id}`,
        requireInteraction: severity === 'critical',
        silent: false
      });

      // Auto-close after 5 seconds for non-critical alerts
      if (severity !== 'critical') {
        setTimeout(() => notification.close(), 5000);
      }
    } catch (error) {
      console.error('Error sending browser notification:', error);
    }
  };

  const sendEmailNotification = async (rule: AlertRule, event: any) => {
    if (!config?.enableEmailNotifications || !config.emailAddress) return;

    try {
      // Call edge function to send email
      const { error } = await supabase.functions.invoke('send-security-alert-email', {
        body: {
          to: config.emailAddress,
          rule: rule.name,
          event: {
            type: event.event_type,
            severity: event.severity || rule.severity,
            description: event.description,
            timestamp: event.created_at,
            metadata: event.metadata
          }
        }
      });

      if (error) {
        console.error('Error sending email notification:', error);
      }
    } catch (error) {
      console.error('Error calling email notification function:', error);
    }
  };

  const triggerTestAlert = useCallback(() => {
    if (!config) return;

    const testEvent = {
      id: 'test-' + Date.now(),
      event_type: 'test_alert',
      severity: 'medium',
      source: 'test_system',
      description: 'Ceci est un test du système d\'alertes de sécurité',
      metadata: { test: true },
      created_at: new Date().toISOString()
    };

    // Find any enabled rule to test with
    const testRule = config.alertRules.find(rule => rule.enabled);
    if (testRule) {
      processAlert(testRule, testEvent);
    }
  }, [config, processAlert]);

  const getAlertStats = useCallback(() => {
    const activeRules = config?.alertRules.filter(rule => rule.enabled).length || 0;
    const totalRules = config?.alertRules.length || 0;
    
    return {
      activeRules,
      totalRules,
      isListening,
      hasNotificationPermission: notificationPermission.current === 'granted'
    };
  }, [config, isListening]);

  return {
    isListening,
    config,
    triggerTestAlert,
    getAlertStats,
    notificationPermission: notificationPermission.current
  };
};