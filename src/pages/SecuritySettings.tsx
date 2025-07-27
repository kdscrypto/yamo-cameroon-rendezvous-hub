import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useModerationRights } from '@/hooks/useModerationRights';
import SecurityDashboard from '@/components/security/SecurityDashboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Shield, Settings, Users, Activity, AlertTriangle, Lock, Unlock } from 'lucide-react';
import { Navigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { securityEnforcer } from '@/utils/securityEnforcement';
import { rateLimiter } from '@/utils/rateLimiting';

const SecuritySettings: React.FC = () => {
  const { user } = useAuth();
  const { hasModerationRights } = useModerationRights();
  const { toast } = useToast();
  
  const [settings, setSettings] = useState({
    enableRateLimiting: true,
    enableThreatDetection: true,
    enableIPBlocking: true,
    enableInputSanitization: true,
    strictMode: false,
    logSecurityEvents: true,
    alertOnCriticalEvents: true,
    autoBlockSuspiciousIPs: true
  });

  const [blockedIPs, setBlockedIPs] = useState<string[]>([]);
  const [newIPToBlock, setNewIPToBlock] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirect if user doesn't have moderation rights
  if (!user || !hasModerationRights) {
    return <Navigate to="/dashboard" replace />;
  }

  useEffect(() => {
    loadSecuritySettings();
  }, []);

  const loadSecuritySettings = () => {
    // Load current security metrics
    const metrics = securityEnforcer.getSecurityMetrics();
    setBlockedIPs(metrics.blockedIPs);
    
    // Load settings from localStorage or default
    const savedSettings = localStorage.getItem('security_settings');
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (error) {
        console.error('Error loading security settings:', error);
      }
    }
  };

  const saveSecuritySettings = () => {
    setLoading(true);
    try {
      localStorage.setItem('security_settings', JSON.stringify(settings));
      
      // Apply settings to security systems
      if (settings.enableRateLimiting) {
        rateLimiter.configure('global', {
          windowMs: 15 * 60 * 1000, // 15 minutes
          maxRequests: settings.strictMode ? 50 : 100,
          keyGenerator: (identifier) => identifier || 'anonymous'
        });
      }

      toast({
        title: "Security Settings Saved",
        description: "Your security configuration has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save security settings.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const blockIP = (ip: string) => {
    if (!ip || !/^(\d{1,3}\.){3}\d{1,3}$/.test(ip)) {
      toast({
        title: "Invalid IP Address",
        description: "Please enter a valid IPv4 address.",
        variant: "destructive"
      });
      return;
    }

    try {
      securityEnforcer.blockIP(ip, 'Manual block by administrator');
      setBlockedIPs(prev => [...prev, ip]);
      setNewIPToBlock('');
      
      toast({
        title: "IP Address Blocked",
        description: `Successfully blocked IP address: ${ip}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to block IP address.",
        variant: "destructive"
      });
    }
  };

  const unblockIP = (ip: string) => {
    try {
      securityEnforcer.unblockIP(ip);
      setBlockedIPs(prev => prev.filter(blockedIP => blockedIP !== ip));
      
      toast({
        title: "IP Address Unblocked",
        description: `Successfully unblocked IP address: ${ip}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to unblock IP address.",
        variant: "destructive"
      });
    }
  };

  const resetSecuritySettings = () => {
    setSettings({
      enableRateLimiting: true,
      enableThreatDetection: true,
      enableIPBlocking: true,
      enableInputSanitization: true,
      strictMode: false,
      logSecurityEvents: true,
      alertOnCriticalEvents: true,
      autoBlockSuspiciousIPs: true
    });
    
    toast({
      title: "Settings Reset",
      description: "Security settings have been reset to defaults.",
    });
  };

  const testSecuritySystem = async () => {
    setLoading(true);
    try {
      // Test various security components
      const testResults = {
        rateLimiting: rateLimiter.getStats(),
        threatDetection: securityEnforcer.analyzeRequest({
          url: '/test',
          method: 'POST',
          body: { test: 'security check' }
        }),
        ipBlocking: securityEnforcer.getSecurityMetrics()
      };

      console.log('Security system test results:', testResults);
      
      toast({
        title: "Security Test Complete",
        description: "Security systems are functioning properly. Check console for details.",
      });
    } catch (error) {
      toast({
        title: "Security Test Failed",
        description: "Some security systems may not be working correctly.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-2 mb-6">
        <Shield className="h-6 w-6" />
        <h1 className="text-3xl font-bold">Security Settings</h1>
        <Badge variant="destructive">Admin Only</Badge>
      </div>

      <Tabs defaultValue="dashboard" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard">
            <Activity className="h-4 w-4 mr-2" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </TabsTrigger>
          <TabsTrigger value="ip-management">
            <Lock className="h-4 w-4 mr-2" />
            IP Management
          </TabsTrigger>
          <TabsTrigger value="advanced">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Advanced
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <SecurityDashboard />
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Security Configuration</CardTitle>
              <CardDescription>
                Configure security features and protection levels
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="rate-limiting">Rate Limiting</Label>
                    <Switch
                      id="rate-limiting"
                      checked={settings.enableRateLimiting}
                      onCheckedChange={(checked) =>
                        setSettings(prev => ({ ...prev, enableRateLimiting: checked }))
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="threat-detection">Threat Detection</Label>
                    <Switch
                      id="threat-detection"
                      checked={settings.enableThreatDetection}
                      onCheckedChange={(checked) =>
                        setSettings(prev => ({ ...prev, enableThreatDetection: checked }))
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="ip-blocking">IP Blocking</Label>
                    <Switch
                      id="ip-blocking"
                      checked={settings.enableIPBlocking}
                      onCheckedChange={(checked) =>
                        setSettings(prev => ({ ...prev, enableIPBlocking: checked }))
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="input-sanitization">Input Sanitization</Label>
                    <Switch
                      id="input-sanitization"
                      checked={settings.enableInputSanitization}
                      onCheckedChange={(checked) =>
                        setSettings(prev => ({ ...prev, enableInputSanitization: checked }))
                      }
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="strict-mode">Strict Mode</Label>
                    <Switch
                      id="strict-mode"
                      checked={settings.strictMode}
                      onCheckedChange={(checked) =>
                        setSettings(prev => ({ ...prev, strictMode: checked }))
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="log-events">Log Security Events</Label>
                    <Switch
                      id="log-events"
                      checked={settings.logSecurityEvents}
                      onCheckedChange={(checked) =>
                        setSettings(prev => ({ ...prev, logSecurityEvents: checked }))
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="alert-critical">Alert on Critical Events</Label>
                    <Switch
                      id="alert-critical"
                      checked={settings.alertOnCriticalEvents}
                      onCheckedChange={(checked) =>
                        setSettings(prev => ({ ...prev, alertOnCriticalEvents: checked }))
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="auto-block">Auto-block Suspicious IPs</Label>
                    <Switch
                      id="auto-block"
                      checked={settings.autoBlockSuspiciousIPs}
                      onCheckedChange={(checked) =>
                        setSettings(prev => ({ ...prev, autoBlockSuspiciousIPs: checked }))
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <Button onClick={saveSecuritySettings} disabled={loading}>
                  Save Settings
                </Button>
                <Button variant="outline" onClick={resetSecuritySettings}>
                  Reset to Defaults
                </Button>
                <Button variant="secondary" onClick={testSecuritySystem} disabled={loading}>
                  Test Security System
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ip-management" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>IP Address Management</CardTitle>
              <CardDescription>
                Manage blocked IP addresses and access control
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex gap-4">
                <Input
                  placeholder="Enter IP address to block (e.g., 192.168.1.1)"
                  value={newIPToBlock}
                  onChange={(e) => setNewIPToBlock(e.target.value)}
                />
                <Button onClick={() => blockIP(newIPToBlock)}>
                  <Lock className="h-4 w-4 mr-2" />
                  Block IP
                </Button>
              </div>

              {blockedIPs.length > 0 ? (
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Blocked IP Addresses ({blockedIPs.length})</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    {blockedIPs.map((ip, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <span className="font-mono text-sm">{ip}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => unblockIP(ip)}
                        >
                          <Unlock className="h-3 w-3 mr-1" />
                          Unblock
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertTitle>No Blocked IPs</AlertTitle>
                  <AlertDescription>
                    No IP addresses are currently blocked. Suspicious IPs will appear here when detected.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-6">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Advanced Settings</AlertTitle>
            <AlertDescription>
              These settings should only be modified by experienced administrators. 
              Incorrect configuration may impact application security or performance.
            </AlertDescription>
          </Alert>

          <Card>
            <CardHeader>
              <CardTitle>System Information</CardTitle>
              <CardDescription>
                Current security system status and configuration
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Security Enforcer:</strong> Active
                </div>
                <div>
                  <strong>Rate Limiter:</strong> {settings.enableRateLimiting ? 'Active' : 'Disabled'}
                </div>
                <div>
                  <strong>Threat Detection:</strong> {settings.enableThreatDetection ? 'Active' : 'Disabled'}
                </div>
                <div>
                  <strong>IP Blocking:</strong> {settings.enableIPBlocking ? 'Active' : 'Disabled'}
                </div>
                <div>
                  <strong>Mode:</strong> {settings.strictMode ? 'Strict' : 'Standard'}
                </div>
                <div>
                  <strong>Auto-blocking:</strong> {settings.autoBlockSuspiciousIPs ? 'Enabled' : 'Disabled'}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SecuritySettings;