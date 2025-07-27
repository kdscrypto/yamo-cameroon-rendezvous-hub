// Security middleware for request interception and threat detection
import { securityEnforcer } from './securityEnforcement';
import { rateLimiter } from './rateLimiting';
import { securityMonitor } from './productionMonitoring';
import { supabase } from '@/integrations/supabase/client';

export interface SecurityContext {
  userId?: string;
  sessionId?: string;
  userAgent: string;
  ip?: string;
  timestamp: number;
}

export interface RequestMetadata {
  url: string;
  method: string;
  headers?: Record<string, string>;
  body?: any;
  userAgent?: string;
  referer?: string;
}

export class SecurityMiddleware {
  private static instance: SecurityMiddleware;

  static getInstance(): SecurityMiddleware {
    if (!SecurityMiddleware.instance) {
      SecurityMiddleware.instance = new SecurityMiddleware();
    }
    return SecurityMiddleware.instance;
  }

  // Intercept and analyze HTTP requests
  async interceptRequest(
    request: RequestMetadata,
    context: SecurityContext
  ): Promise<{ allowed: boolean; reason?: string; threats?: any[] }> {
    try {
      // Step 1: Rate limiting check
      const endpoint = this.extractEndpoint(request.url);
      const identifier = context.userId || context.ip || 'anonymous';
      
      if (!rateLimiter.isAllowed(endpoint, identifier)) {
        securityMonitor.logSecurityEvent({
          type: 'rate_limit_exceeded',
          severity: 'medium',
          data: {
            endpoint,
            identifier: identifier.substring(0, 8) + '...',
            userAgent: context.userAgent,
            timestamp: context.timestamp
          }
        });

        return {
          allowed: false,
          reason: 'Rate limit exceeded. Please wait before making more requests.'
        };
      }

      // Step 2: Security threat analysis
      const threats = securityEnforcer.analyzeRequest({
        url: request.url,
        method: request.method,
        headers: request.headers,
        body: request.body,
        userAgent: request.userAgent || context.userAgent,
        ip: context.ip
      });

      // Step 3: Handle detected threats
      if (threats.length > 0) {
        const highSeverityThreats = threats.filter(t => 
          t.severity === 'high' || t.severity === 'critical'
        );

        if (highSeverityThreats.length > 0) {
          // Log the security event
          securityMonitor.logSecurityEvent({
            type: threats[0].type as any,
            severity: threats[0].severity as any,
            data: {
              threats,
              request: {
                url: request.url,
                method: request.method,
                userAgent: context.userAgent
              },
              context: {
                userId: context.userId,
                sessionId: context.sessionId?.substring(0, 8) + '...',
                timestamp: context.timestamp
              }
            }
          });

          // Handle critical threats with IP blocking
          const criticalThreats = threats.filter(t => t.severity === 'critical');
          if (criticalThreats.length > 0 && context.ip) {
            securityEnforcer.handleThreats(threats, {
              ip: context.ip,
              userId: context.userId
            });

            return {
              allowed: false,
              reason: 'Request blocked due to security policy violation.',
              threats: criticalThreats
            };
          }

          // Log but allow medium/low severity threats with warning
          return {
            allowed: true,
            threats: highSeverityThreats
          };
        }
      }

      // Step 4: Log successful requests for analytics
      if (context.userId) {
        this.logUserActivity(context.userId, request.url, request.method);
      }

      return { allowed: true };

    } catch (error) {
      console.error('Security middleware error:', error);
      
      // Log the error but allow the request to proceed
      securityMonitor.logSecurityEvent({
        type: 'general_error',
        severity: 'medium',
        data: {
          error: error instanceof Error ? error.message : 'Unknown error',
          request: request.url,
          context
        }
      });

      return { allowed: true };
    }
  }

  // Monitor authentication events
  async interceptAuthEvent(
    event: 'signin' | 'signup' | 'signout' | 'password_reset',
    data: {
      email?: string;
      userId?: string;
      success: boolean;
      error?: string;
      metadata?: any;
    },
    context: SecurityContext
  ): Promise<void> {
    try {
      // Check for suspicious authentication patterns
      const authEndpoint = `/auth/${event}`;
      const identifier = data.email || data.userId || context.ip || 'anonymous';

      // Rate limiting for auth events (stricter limits)
      if (!rateLimiter.isAllowed(authEndpoint, identifier)) {
        securityMonitor.logSecurityEvent({
          type: 'brute_force',
          severity: 'high',
          data: {
            event,
            identifier: identifier.substring(0, 8) + '...',
            context
          }
        });

        // Log to Supabase security events table
        if (data.userId || data.email) {
          await this.logSecurityEventToDatabase({
            event_type: 'brute_force_auth',
            severity: 'high',
            source: 'auth_middleware',
            description: `Potential brute force attack detected on ${event}`,
            metadata: {
              event,
              identifier: identifier.substring(0, 8) + '...',
              userAgent: context.userAgent,
              timestamp: context.timestamp
            },
            ip_address: context.ip,
            user_agent: context.userAgent,
            url: authEndpoint
          });
        }
        return;
      }

      // Log authentication events
      const severity = data.success ? 'low' : 'medium';
      const eventType = data.success ? 'login' : 'login_failed';

      securityMonitor.logSecurityEvent({
        type: eventType as any,
        severity,
        data: {
          event,
          success: data.success,
          error: data.error,
          metadata: data.metadata,
          context
        }
      });

      // Log failed authentication attempts to database
      if (!data.success && (data.userId || data.email)) {
        await this.logSecurityEventToDatabase({
          event_type: 'failed_authentication',
          severity: 'medium',
          source: 'auth_middleware',
          description: `Failed ${event} attempt`,
          metadata: {
            event,
            error: data.error,
            userAgent: context.userAgent,
            timestamp: context.timestamp
          },
          ip_address: context.ip,
          user_agent: context.userAgent,
          url: authEndpoint
        });
      }

    } catch (error) {
      console.error('Auth event interception error:', error);
    }
  }

  // Monitor user activity for anomaly detection
  private async logUserActivity(
    userId: string,
    url: string,
    method: string
  ): Promise<void> {
    try {
      // Update user presence
      await supabase
        .from('user_presence')
        .upsert({
          user_id: userId,
          status: 'online',
          current_page: url,
          last_seen: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          metadata: {
            last_action: method,
            timestamp: Date.now()
          }
        });

    } catch (error) {
      console.error('User activity logging error:', error);
    }
  }

  // Log security events to database
  private async logSecurityEventToDatabase(eventData: {
    event_type: string;
    severity: string;
    source: string;
    description?: string;
    metadata?: any;
    ip_address?: string;
    user_agent?: string;
    url?: string;
  }): Promise<void> {
    try {
      await supabase
        .from('security_events')
        .insert({
          event_type: eventData.event_type,
          severity: eventData.severity,
          source: eventData.source,
          description: eventData.description,
          metadata: eventData.metadata || {},
          ip_address: eventData.ip_address,
          user_agent: eventData.user_agent,
          url: eventData.url
        });

    } catch (error) {
      console.error('Database security logging error:', error);
    }
  }

  // Extract endpoint for rate limiting
  private extractEndpoint(url: string): string {
    try {
      const urlObj = new URL(url, window.location.origin);
      const pathname = urlObj.pathname;
      
      // Normalize common patterns
      if (pathname.startsWith('/api/')) {
        return pathname.split('/').slice(0, 3).join('/'); // /api/endpoint
      }
      
      if (pathname.startsWith('/auth/')) {
        return pathname.split('/').slice(0, 3).join('/'); // /auth/signin
      }
      
      // For other paths, use the base path
      return pathname.split('/').slice(0, 2).join('/') || '/';
      
    } catch (error) {
      return '/';
    }
  }

  // Get current security metrics
  getSecurityMetrics(): {
    blockedRequests: number;
    threatsDetected: number;
    rateLimitViolations: number;
    lastUpdate: number;
  } {
    const securityStats = securityMonitor.getSecurityStats();
    const securityMetrics = securityEnforcer.getSecurityMetrics();
    const rateLimitStats = rateLimiter.getStats();

    return {
      blockedRequests: securityMetrics.blockedIPs.length,
      threatsDetected: securityStats.totalEvents,
      rateLimitViolations: rateLimitStats.activeEntries,
      lastUpdate: Date.now()
    };
  }
}

// Export singleton instance
export const securityMiddleware = SecurityMiddleware.getInstance();

// Helper function to create security context
export const createSecurityContext = (
  userId?: string,
  sessionId?: string,
  additionalData?: Partial<SecurityContext>
): SecurityContext => ({
  userId,
  sessionId,
  userAgent: navigator.userAgent,
  timestamp: Date.now(),
  ...additionalData
});

// Helper function for request interception
export const interceptSecureRequest = async (
  request: RequestMetadata,
  context?: Partial<SecurityContext>
): Promise<{ allowed: boolean; reason?: string; threats?: any[] }> => {
  const fullContext = createSecurityContext(
    context?.userId,
    context?.sessionId,
    context
  );
  
  return securityMiddleware.interceptRequest(request, fullContext);
};