import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bell, Settings, Mail, MessageSquare, AlertTriangle, CheckCircle, Volume2, VolumeX } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface AlertRule {
  id: string;
  name: string;
  type: 'security_event' | 'rate_limit' | 'failed_auth' | 'role_change';
  severity: 'low' | 'medium' | 'high' | 'critical';
  enabled: boolean;
  threshold?: number;
  timeWindow?: number; // in minutes
  notification_methods: ('toast' | 'email' | 'browser')[];
  conditions: Record<string, any>;
}

interface AlertConfig {
  enableRealTimeAlerts: boolean;
  enableEmailNotifications: boolean;
  enableBrowserNotifications: boolean;
  emailAddress: string;
  alertRules: AlertRule[];
}

export const SecurityAlertsSystem = () => {
  const { toast } = useToast();
  const [config, setConfig] = useState<AlertConfig>({
    enableRealTimeAlerts: true,
    enableEmailNotifications: false,
    enableBrowserNotifications: true,
    emailAddress: '',
    alertRules: []
  });
  const [loading, setLoading] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);

  useEffect(() => {
    // Check browser notification permission
    if ('Notification' in window) {
      setPermissionGranted(Notification.permission === 'granted');
    }
    
    // Load saved configuration
    loadConfiguration();
    
    // Initialize default alert rules
    initializeDefaultRules();
  }, []);

  const loadConfiguration = async () => {
    try {
      const savedConfig = localStorage.getItem('security-alerts-config');
      if (savedConfig) {
        setConfig(JSON.parse(savedConfig));
      }
    } catch (error) {
      console.error('Error loading alerts configuration:', error);
    }
  };

  const saveConfiguration = async (newConfig: AlertConfig) => {
    try {
      localStorage.setItem('security-alerts-config', JSON.stringify(newConfig));
      setConfig(newConfig);
      
      toast({
        title: "Configuration sauvegardée",
        description: "Les paramètres d'alertes ont été mis à jour.",
      });
    } catch (error) {
      console.error('Error saving configuration:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder la configuration.",
        variant: "destructive"
      });
    }
  };

  const initializeDefaultRules = () => {
    const defaultRules: AlertRule[] = [
      {
        id: 'critical-security-events',
        name: 'Événements de sécurité critiques',
        type: 'security_event',
        severity: 'critical',
        enabled: true,
        notification_methods: ['toast', 'browser', 'email'],
        conditions: { severity: 'critical' }
      },
      {
        id: 'multiple-failed-auth',
        name: 'Tentatives d\'authentification multiples échouées',
        type: 'failed_auth',
        severity: 'high',
        enabled: true,
        threshold: 5,
        timeWindow: 10,
        notification_methods: ['toast', 'browser'],
        conditions: { event_type: 'failed_authentication' }
      },
      {
        id: 'rate-limit-exceeded',
        name: 'Limite de taux dépassée',
        type: 'rate_limit',
        severity: 'medium',
        enabled: true,
        threshold: 3,
        timeWindow: 5,
        notification_methods: ['toast'],
        conditions: { event_type: 'rate_limit_exceeded' }
      },
      {
        id: 'role-modifications',
        name: 'Modifications de rôles utilisateur',
        type: 'role_change',
        severity: 'high',
        enabled: true,
        notification_methods: ['toast', 'email'],
        conditions: { action: ['add_role', 'remove_role'] }
      }
    ];

    setConfig(prev => ({
      ...prev,
      alertRules: prev.alertRules.length === 0 ? defaultRules : prev.alertRules
    }));
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setPermissionGranted(permission === 'granted');
      
      if (permission === 'granted') {
        toast({
          title: "Notifications autorisées",
          description: "Vous recevrez maintenant des notifications de sécurité.",
        });
      }
    }
  };

  const sendTestNotification = () => {
    if (config.enableBrowserNotifications && permissionGranted) {
      new Notification('Test de sécurité', {
        body: 'Ceci est une notification de test du système de sécurité.',
        icon: '/favicon.ico',
        badge: '/favicon.ico'
      });
    }
    
    if (config.enableRealTimeAlerts) {
      toast({
        title: "Test d'alerte",
        description: "Ceci est un test du système d'alertes en temps réel.",
      });
    }
  };

  const toggleRule = (ruleId: string, enabled: boolean) => {
    const updatedRules = config.alertRules.map(rule =>
      rule.id === ruleId ? { ...rule, enabled } : rule
    );
    
    saveConfiguration({
      ...config,
      alertRules: updatedRules
    });
  };

  const updateRuleThreshold = (ruleId: string, threshold: number) => {
    const updatedRules = config.alertRules.map(rule =>
      rule.id === ruleId ? { ...rule, threshold } : rule
    );
    
    saveConfiguration({
      ...config,
      alertRules: updatedRules
    });
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-destructive';
      case 'high': return 'text-orange-500';
      case 'medium': return 'text-yellow-500';
      case 'low': return 'text-green-500';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <div className="space-y-6">
      {/* Main Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bell className="h-5 w-5" />
            <span>Configuration des alertes</span>
          </CardTitle>
          <CardDescription>
            Configurez les notifications et alertes de sécurité en temps réel
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Global Settings */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Alertes en temps réel</Label>
                <p className="text-sm text-muted-foreground">
                  Afficher les alertes dans l'interface
                </p>
              </div>
              <Switch
                checked={config.enableRealTimeAlerts}
                onCheckedChange={(checked) => 
                  saveConfiguration({
                    ...config,
                    enableRealTimeAlerts: checked
                  })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="flex items-center space-x-2">
                  <span>Notifications navigateur</span>
                  {permissionGranted ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                  )}
                </Label>
                <p className="text-sm text-muted-foreground">
                  Notifications push du navigateur
                </p>
              </div>
              <div className="flex items-center space-x-2">
                {!permissionGranted && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={requestNotificationPermission}
                  >
                    Autoriser
                  </Button>
                )}
                <Switch
                  checked={config.enableBrowserNotifications && permissionGranted}
                  onCheckedChange={(checked) => 
                    saveConfiguration({
                      ...config,
                      enableBrowserNotifications: checked
                    })
                  }
                  disabled={!permissionGranted}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Notifications email</Label>
                <p className="text-sm text-muted-foreground">
                  Envoyer des emails pour les événements critiques
                </p>
              </div>
              <Switch
                checked={config.enableEmailNotifications}
                onCheckedChange={(checked) => 
                  saveConfiguration({
                    ...config,
                    enableEmailNotifications: checked
                  })
                }
              />
            </div>

            {config.enableEmailNotifications && (
              <div className="space-y-2">
                <Label htmlFor="email">Adresse email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@example.com"
                  value={config.emailAddress}
                  onChange={(e) => 
                    setConfig(prev => ({
                      ...prev,
                      emailAddress: e.target.value
                    }))
                  }
                  onBlur={() => saveConfiguration(config)}
                />
              </div>
            )}
          </div>

          {/* Test Notifications */}
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={sendTestNotification}
              className="flex items-center space-x-2"
            >
              <Volume2 className="h-4 w-4" />
              <span>Tester les notifications</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Alert Rules */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Règles d'alertes</span>
          </CardTitle>
          <CardDescription>
            Configurez les conditions qui déclenchent les alertes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {config.alertRules.map((rule) => (
              <div key={rule.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium">{rule.name}</h4>
                      <Badge 
                        variant={rule.severity === 'critical' ? 'destructive' : 'secondary'}
                        className={getSeverityColor(rule.severity)}
                      >
                        {rule.severity}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Type: {rule.type} | Méthodes: {rule.notification_methods.join(', ')}
                    </p>
                  </div>
                  <Switch
                    checked={rule.enabled}
                    onCheckedChange={(checked) => toggleRule(rule.id, checked)}
                  />
                </div>

                {rule.threshold && (
                  <div className="flex items-center space-x-4">
                    <Label className="text-sm">Seuil:</Label>
                    <Input
                      type="number"
                      value={rule.threshold}
                      onChange={(e) => updateRuleThreshold(rule.id, parseInt(e.target.value))}
                      className="w-20"
                      min="1"
                    />
                    {rule.timeWindow && (
                      <span className="text-sm text-muted-foreground">
                        événements en {rule.timeWindow} minutes
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};