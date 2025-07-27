// Composant de notifications en temps réel
import React, { useState } from 'react';
import { Bell, X, Check, CheckCheck, MessageCircle, Shield, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { useRealTimeNotifications } from '@/hooks/useRealTimeNotifications';
import { NotificationData } from '@/utils/realtimeManager';

const LiveNotifications = () => {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll
  } = useRealTimeNotifications();

  const [isOpen, setIsOpen] = useState(false);

  // Icône selon le type de notification
  const getNotificationIcon = (type: NotificationData['type']) => {
    switch (type) {
      case 'message':
        return <MessageCircle className="h-4 w-4 text-blue-500" />;
      case 'ad_approved':
        return <Check className="h-4 w-4 text-green-500" />;
      case 'ad_rejected':
        return <X className="h-4 w-4 text-red-500" />;
      case 'security_alert':
        return <Shield className="h-4 w-4 text-red-600" />;
      case 'system':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  // Couleur de fond selon le type
  const getNotificationBgColor = (type: NotificationData['type'], isRead: boolean) => {
    if (isRead) return 'bg-muted/30';
    
    switch (type) {
      case 'message':
        return 'bg-blue-50 dark:bg-blue-950/20';
      case 'ad_approved':
        return 'bg-green-50 dark:bg-green-950/20';
      case 'ad_rejected':
        return 'bg-red-50 dark:bg-red-950/20';
      case 'security_alert':
        return 'bg-red-100 dark:bg-red-950/30';
      case 'system':
        return 'bg-orange-50 dark:bg-orange-950/20';
      default:
        return 'bg-muted/50';
    }
  };

  // Formater le timestamp
  const formatTimestamp = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    
    if (diff < 60000) return 'À l\'instant';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`;
    return new Date(timestamp).toLocaleDateString();
  };

  const handleNotificationClick = (notification: NotificationData) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }

    // Navigation selon le type
    switch (notification.type) {
      case 'message':
        window.location.href = '/dashboard';
        break;
      case 'ad_approved':
      case 'ad_rejected':
        if (notification.data?.id) {
          window.location.href = `/ad/${notification.data.id}`;
        }
        break;
      default:
        break;
    }
    
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="relative">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      
      <PopoverContent className="w-80 p-0" align="end">
        <Card className="border-0 shadow-none">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Notifications</CardTitle>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={markAllAsRead}
                    className="text-xs"
                  >
                    <CheckCheck className="h-3 w-3 mr-1" />
                    Tout lu
                  </Button>
                )}
                {notifications.length > 0 && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={clearAll}
                    className="text-xs text-destructive"
                  >
                    Effacer
                  </Button>
                )}
              </div>
            </div>
            {unreadCount > 0 && (
              <CardDescription>
                {unreadCount} notification{unreadCount > 1 ? 's' : ''} non lue{unreadCount > 1 ? 's' : ''}
              </CardDescription>
            )}
          </CardHeader>
          
          <Separator />
          
          <CardContent className="p-0">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground">
                <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Aucune notification</p>
              </div>
            ) : (
              <ScrollArea className="h-80">
                <div className="p-2">
                  {notifications.map((notification, index) => (
                    <div key={notification.id}>
                      <div
                        className={`p-3 rounded-lg cursor-pointer transition-colors hover:bg-muted/50 ${
                          getNotificationBgColor(notification.type, notification.read)
                        }`}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 mt-0.5">
                            {getNotificationIcon(notification.type)}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <p className={`text-sm font-medium ${
                                notification.read ? 'text-muted-foreground' : 'text-foreground'
                              }`}>
                                {notification.title}
                              </p>
                              <div className="flex items-center gap-1">
                                <span className="text-xs text-muted-foreground">
                                  {formatTimestamp(notification.timestamp)}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0 hover:bg-destructive/20"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    removeNotification(notification.id);
                                  }}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                            
                            <p className={`text-xs ${
                              notification.read ? 'text-muted-foreground' : 'text-foreground/80'
                            }`}>
                              {notification.body}
                            </p>
                            
                            {!notification.read && (
                              <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {index < notifications.length - 1 && (
                        <Separator className="my-1" />
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
};

export default LiveNotifications;