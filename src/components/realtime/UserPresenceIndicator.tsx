// Indicateur de présence utilisateur
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useUserPresence, useUserPresenceStatus } from '@/hooks/useUserPresence';
import { UserPresence } from '@/utils/realtimeManager';

interface UserPresenceIndicatorProps {
  userId?: string;
  size?: 'sm' | 'md' | 'lg';
  showUsername?: boolean;
  showLastSeen?: boolean;
  className?: string;
}

// Indicateur de statut simple
export const StatusIndicator: React.FC<{
  status: UserPresence['status'];
  size?: 'sm' | 'md' | 'lg';
}> = ({ status, size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4'
  };

  const statusColors = {
    online: 'bg-green-500',
    away: 'bg-yellow-500',
    offline: 'bg-gray-400'
  };

  return (
    <div className={`rounded-full ${sizeClasses[size]} ${statusColors[status]} ring-2 ring-background`} />
  );
};

// Indicateur pour un utilisateur spécifique
const UserPresenceIndicator: React.FC<UserPresenceIndicatorProps> = ({
  userId,
  size = 'md',
  showUsername = false,
  showLastSeen = false,
  className = ''
}) => {
  const { isOnline, status, lastSeen } = useUserPresenceStatus(userId || '');

  if (!userId) return null;

  const formatLastSeen = (lastSeenStr?: string) => {
    if (!lastSeenStr) return 'Jamais vu';
    
    const lastSeenDate = new Date(lastSeenStr);
    const now = new Date();
    const diff = now.getTime() - lastSeenDate.getTime();
    
    if (diff < 60000) return 'À l\'instant';
    if (diff < 3600000) return `Il y a ${Math.floor(diff / 60000)}m`;
    if (diff < 86400000) return `Il y a ${Math.floor(diff / 3600000)}h`;
    if (diff < 604800000) return `Il y a ${Math.floor(diff / 86400000)}j`;
    return lastSeenDate.toLocaleDateString();
  };

  const statusText = {
    online: 'En ligne',
    away: 'Absent',
    offline: 'Hors ligne'
  };

  const content = (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="relative">
        <StatusIndicator status={status} size={size} />
      </div>
      
      {showUsername && (
        <span className="text-sm font-medium">
          {userId}
        </span>
      )}
      
      {showLastSeen && status === 'offline' && (
        <span className="text-xs text-muted-foreground">
          {formatLastSeen(lastSeen)}
        </span>
      )}
    </div>
  );

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {content}
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-center">
            <p className="font-medium">{statusText[status]}</p>
            {status === 'offline' && lastSeen && (
              <p className="text-xs opacity-75">{formatLastSeen(lastSeen)}</p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

// Indicateur avec avatar
export const UserPresenceAvatar: React.FC<{
  userId: string;
  username?: string;
  avatarUrl?: string;
  size?: 'sm' | 'md' | 'lg';
}> = ({ userId, username, avatarUrl, size = 'md' }) => {
  const { status } = useUserPresenceStatus(userId);

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  };

  const statusSizes = {
    sm: 'sm',
    md: 'md',
    lg: 'lg'
  } as const;

  return (
    <div className="relative">
      <Avatar className={sizeClasses[size]}>
        <AvatarImage src={avatarUrl} alt={username || userId} />
        <AvatarFallback>
          {(username || userId).substring(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      
      <div className="absolute -bottom-0.5 -right-0.5">
        <StatusIndicator status={status} size={statusSizes[size]} />
      </div>
    </div>
  );
};

// Liste des utilisateurs en ligne
export const OnlineUsersList: React.FC<{
  showCount?: boolean;
  maxDisplayed?: number;
  size?: 'sm' | 'md' | 'lg';
}> = ({ showCount = true, maxDisplayed = 5, size = 'md' }) => {
  const { onlineUsers, onlineCount } = useUserPresence();
  const onlineOnly = onlineUsers.filter(user => user.status === 'online');
  const displayedUsers = onlineOnly.slice(0, maxDisplayed);
  const remainingCount = Math.max(0, onlineCount - maxDisplayed);

  if (onlineCount === 0) {
    return (
      <div className="text-sm text-muted-foreground">
        Aucun utilisateur en ligne
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex -space-x-2">
        {displayedUsers.map((user) => (
          <UserPresenceAvatar
            key={user.userId}
            userId={user.userId}
            username={user.username}
            size={size}
          />
        ))}
      </div>
      
      {remainingCount > 0 && (
        <Badge variant="secondary" className="text-xs">
          +{remainingCount}
        </Badge>
      )}
      
      {showCount && (
        <span className="text-sm text-muted-foreground">
          {onlineCount} en ligne
        </span>
      )}
    </div>
  );
};

// Statistiques de présence
export const PresenceStats: React.FC = () => {
  const { getPresenceStats } = useUserPresence();
  const stats = getPresenceStats();

  return (
    <div className="flex items-center gap-4 text-sm">
      <div className="flex items-center gap-1">
        <StatusIndicator status="online" size="sm" />
        <span className="text-green-600 font-medium">{stats.online}</span>
        <span className="text-muted-foreground">en ligne</span>
      </div>
      
      <div className="flex items-center gap-1">
        <StatusIndicator status="away" size="sm" />
        <span className="text-yellow-600 font-medium">{stats.away}</span>
        <span className="text-muted-foreground">absent</span>
      </div>
      
      <div className="text-muted-foreground">
        Total: {stats.total}
      </div>
    </div>
  );
};

export default UserPresenceIndicator;