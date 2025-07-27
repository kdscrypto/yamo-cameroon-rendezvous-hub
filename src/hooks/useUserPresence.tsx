// Hook pour la présence utilisateur en temps réel
import React, { useState, useEffect, useCallback } from 'react';
import { realtimeManager, UserPresence } from '@/utils/realtimeManager';
import { useAuth } from '@/hooks/useAuth';

export const useUserPresence = () => {
  const { user } = useAuth();
  const [onlineUsers, setOnlineUsers] = useState<UserPresence[]>([]);
  const [currentUserStatus, setCurrentUserStatus] = useState<UserPresence['status']>('offline');
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialiser la présence quand l'utilisateur se connecte
  useEffect(() => {
    if (!user) return;

    const initializePresence = async () => {
      await realtimeManager.initialize(user.id, user.email || user.id);
      setCurrentUserStatus('online');
      setIsInitialized(true);
    };

    initializePresence();

    // Nettoyer quand l'utilisateur se déconnecte
    return () => {
      realtimeManager.cleanup();
      setCurrentUserStatus('offline');
      setIsInitialized(false);
    };
  }, [user]);

  // Écouter les changements de présence
  useEffect(() => {
    if (!isInitialized) return;

    const unsubscribe = realtimeManager.onPresenceChange((users) => {
      setOnlineUsers(users);
    });

    return () => {
      unsubscribe();
    };
  }, [isInitialized]);

  // Mettre à jour le statut de l'utilisateur
  const updateStatus = useCallback(async (status: UserPresence['status']) => {
    if (!user || !isInitialized) return;

    await realtimeManager.updatePresence({ 
      status,
      lastSeen: new Date().toISOString()
    });
    setCurrentUserStatus(status);
  }, [user, isInitialized]);

  // Mettre à jour la page actuelle
  const updateCurrentPage = useCallback(async (page: string) => {
    if (!user || !isInitialized) return;

    await realtimeManager.updatePresence({ 
      currentPage: page,
      lastSeen: new Date().toISOString()
    });
  }, [user, isInitialized]);

  // Détecter les changements de visibilité de la page
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        updateStatus('online');
      } else {
        updateStatus('away');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [updateStatus]);

  // Détecter les changements de route
  useEffect(() => {
    const currentPath = window.location.pathname;
    updateCurrentPage(currentPath);

    // Écouter les changements d'URL
    const handlePopState = () => {
      updateCurrentPage(window.location.pathname);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [updateCurrentPage]);

  // Détecter l'inactivité
  useEffect(() => {
    let inactivityTimer: NodeJS.Timeout;

    const resetInactivityTimer = () => {
      clearTimeout(inactivityTimer);
      
      if (currentUserStatus === 'away') {
        updateStatus('online');
      }

      // Marquer comme "away" après 5 minutes d'inactivité
      inactivityTimer = setTimeout(() => {
        updateStatus('away');
      }, 5 * 60 * 1000);
    };

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    
    events.forEach(event => {
      document.addEventListener(event, resetInactivityTimer, true);
    });

    resetInactivityTimer();

    return () => {
      clearTimeout(inactivityTimer);
      events.forEach(event => {
        document.removeEventListener(event, resetInactivityTimer, true);
      });
    };
  }, [currentUserStatus, updateStatus]);

  // Obtenir les utilisateurs par statut
  const getUsersByStatus = useCallback((status: UserPresence['status']) => {
    return onlineUsers.filter(user => user.status === status);
  }, [onlineUsers]);

  // Obtenir les utilisateurs sur une page spécifique
  const getUsersOnPage = useCallback((page: string) => {
    return onlineUsers.filter(user => user.currentPage === page);
  }, [onlineUsers]);

  // Vérifier si un utilisateur spécifique est en ligne
  const isUserOnline = useCallback((userId: string) => {
    return onlineUsers.some(user => 
      user.userId === userId && 
      (user.status === 'online' || user.status === 'away')
    );
  }, [onlineUsers]);

  // Obtenir le statut d'un utilisateur spécifique
  const getUserStatus = useCallback((userId: string): UserPresence | null => {
    return onlineUsers.find(user => user.userId === userId) || null;
  }, [onlineUsers]);

  // Statistiques de présence
  const getPresenceStats = useCallback(() => {
    const online = getUsersByStatus('online').length;
    const away = getUsersByStatus('away').length;
    const total = onlineUsers.length;

    return {
      online,
      away,
      total,
      onlinePercentage: total > 0 ? (online / total) * 100 : 0
    };
  }, [onlineUsers, getUsersByStatus]);

  return {
    onlineUsers,
    currentUserStatus,
    isInitialized,
    updateStatus,
    updateCurrentPage,
    getUsersByStatus,
    getUsersOnPage,
    isUserOnline,
    getUserStatus,
    getPresenceStats,
    // Statistiques rapides
    onlineCount: getUsersByStatus('online').length,
    awayCount: getUsersByStatus('away').length,
    totalCount: onlineUsers.length
  };
};

// Hook spécialisé pour afficher la présence sur une page spécifique
export const usePagePresence = (pageName: string) => {
  const { getUsersOnPage, updateCurrentPage } = useUserPresence();
  const usersOnPage = getUsersOnPage(pageName);

  useEffect(() => {
    updateCurrentPage(pageName);
  }, [pageName, updateCurrentPage]);

  return {
    usersOnPage,
    userCount: usersOnPage.length
  };
};

// Hook pour surveiller la présence d'un utilisateur spécifique
export const useUserPresenceStatus = (userId: string) => {
  const { isUserOnline, getUserStatus } = useUserPresence();
  
  const isOnline = isUserOnline(userId);
  const userStatus = getUserStatus(userId);

  return {
    isOnline,
    status: userStatus?.status || 'offline',
    lastSeen: userStatus?.lastSeen,
    currentPage: userStatus?.currentPage
  };
};

export default useUserPresence;