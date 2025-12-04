import React, { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import type { NotificationDTO } from '../types/api/notification.type';
import { 
  getNotifications, 
  getUnreadCount, 
  markAsRead, 
  markAllAsRead,
  formatTimeAgo 
} from '../services/notification.service';
import { useNotificationsWebSocket, type NotificationWSMessage } from '../hooks/useNotificationsWebSocket';
import { showNotifier } from '../services/notifier';
import { useAuth } from './AuthContext';

interface NotificationsContextValue {
  notifications: NotificationDTO[];
  unreadCount: number;
  loading: boolean;
  refreshing: boolean;
  markingAsRead: number | null;
  markingAllAsRead: boolean;
  loadNotifications: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
  handleMarkAsRead: (id: number) => Promise<void>;
  handleMarkAllAsRead: () => Promise<void>;
}

const NotificationsContext = createContext<NotificationsContextValue | undefined>(undefined);

interface NotificationsProviderProps {
  children: ReactNode;
}

export const NotificationsProvider: React.FC<NotificationsProviderProps> = ({ children }) => {
  const { completeUser } = useAuth();
  const userId = completeUser?.id || null;

  const [notifications, setNotifications] = useState<NotificationDTO[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [markingAsRead, setMarkingAsRead] = useState<number | null>(null);
  const [markingAllAsRead, setMarkingAllAsRead] = useState(false);
  const appState = useRef(AppState.currentState);
  const periodicRefreshInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  console.log('[NotificationsContext] 🔄 Provider rendered with userId:', userId);

  const loadNotifications = useCallback(async () => {
    console.log('[NotificationsContext] 🔄 loadNotifications called with userId:', userId);
    if (!userId) {
      console.log('[NotificationsContext] ⚠️ No userId, skipping load');
      setLoading(false);
      return;
    }

    try {
      console.log('[NotificationsContext] 📡 Fetching notifications and count...');
      const [notificationsData, count] = await Promise.all([
        getNotifications(userId),
        getUnreadCount(userId)
      ]);

      console.log('[NotificationsContext] 📦 Received notificationsData:', notificationsData);
      console.log('[NotificationsContext] 🔢 Received unread count:', count);

      if (notificationsData) {
        const notificationsWithTime = notificationsData.map(n => ({
          ...n,
          timeAgo: formatTimeAgo(n.createdAt)
        }));
        console.log('[NotificationsContext] ✅ Setting notifications:', notificationsWithTime.length);
        setNotifications(notificationsWithTime);
      } else {
        console.log('[NotificationsContext] ⚠️ notificationsData is null/undefined');
      }
      console.log('[NotificationsContext] ✅ Setting unread count:', count);
      setUnreadCount(count);
    } catch (error) {
      console.error('[NotificationsContext] ❌ Error loading notifications:', error);
    } finally {
      setLoading(false);
      console.log('[NotificationsContext] ✅ Loading complete');
    }
  }, [userId]);

  const refreshNotifications = useCallback(async () => {
    console.log('[NotificationsContext] 🔄 refreshNotifications called');
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  }, [loadNotifications]);

  const handleMarkAsRead = useCallback(async (id: number) => {
    console.log('[NotificationsContext] 👁️ Marking notification as read:', id);
    if (!userId) {
      console.log('[NotificationsContext] ⚠️ No userId, cannot mark as read');
      return;
    }

    setMarkingAsRead(id);

    // Optimistic update
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
    console.log('[NotificationsContext] ⚡ Optimistic update applied');

    try {
      await markAsRead(id);
      console.log('[NotificationsContext] ✅ Successfully marked as read');
      
      // Actualizar el contador real desde el backend
      const count = await getUnreadCount(userId);
      setUnreadCount(count);
      console.log('[NotificationsContext] 🔢 Updated unread count from backend:', count);
    } catch (error) {
      console.error('[NotificationsContext] ❌ Error marking as read:', error);
      // Revertir optimistic update
      await loadNotifications();
    } finally {
      setMarkingAsRead(null);
    }
  }, [userId, loadNotifications]);

  const handleMarkAllAsRead = useCallback(async () => {
    console.log('[NotificationsContext] 👁️ Marking all notifications as read');
    if (!userId) {
      console.log('[NotificationsContext] ⚠️ No userId, cannot mark all as read');
      return;
    }

    setMarkingAllAsRead(true);

    // Optimistic update
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
    console.log('[NotificationsContext] ⚡ Optimistic update applied for all');

    try {
      await markAllAsRead(userId);
      console.log('[NotificationsContext] ✅ Successfully marked all as read');
      await loadNotifications();
    } catch (error) {
      console.error('[NotificationsContext] ❌ Error marking all as read:', error);
      await loadNotifications();
    } finally {
      setMarkingAllAsRead(false);
    }
  }, [userId, loadNotifications]);

  // Manejar mensajes de WebSocket
  const handleWebSocketMessage = useCallback(async (message: NotificationWSMessage) => {
    console.log('[NotificationsContext] 📨 New WebSocket message received:', message);
    
    if (message.message) {
      console.log('[NotificationsContext] 🔔 Showing toast notification');
      showNotifier(
        message.message,
        'info',
        message.title
      );
    }

    if (userId) {
      console.log('[NotificationsContext] 🔄 Reloading all notifications from backend');
      try {
        const [notificationsData, count] = await Promise.all([
          getNotifications(userId),
          getUnreadCount(userId)
        ]);

        if (notificationsData) {
          const notificationsWithTime = notificationsData.map(n => ({
            ...n,
            timeAgo: formatTimeAgo(n.createdAt)
          }));
          console.log('[NotificationsContext] ✅ WebSocket update - Setting notifications:', notificationsWithTime.length);
          setNotifications(notificationsWithTime);
        }
        console.log('[NotificationsContext] ✅ WebSocket update - Setting unread count:', count);
        setUnreadCount(count);
      } catch (error) {
        console.error('[NotificationsContext] ❌ Error reloading after WebSocket message:', error);
      }
    }
  }, [userId]);

  // WebSocket connection
  useNotificationsWebSocket({
    userId,
    onMessage: handleWebSocketMessage,
    enabled: !!userId
  });

  // Cargar notificaciones iniciales
  useEffect(() => {
    console.log('[NotificationsContext] 🚀 Initial load effect triggered');
    if (userId) {
      loadNotifications();
    }
  }, [userId, loadNotifications]);

  // AppState listener para sincronizar cuando la app vuelve al foreground
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      console.log('[NotificationsContext] 📱 AppState changed:', { from: appState.current, to: nextAppState });
      
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        console.log('[NotificationsContext] 🔄 App came to foreground, refreshing notifications');
        if (userId) {
          loadNotifications();
        }
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [userId, loadNotifications]);

  // Refresh periódico cada 60 segundos
  useEffect(() => {
    if (!userId) {
      console.log('[NotificationsContext] ⚠️ No userId, skipping periodic refresh');
      return;
    }

    console.log('[NotificationsContext] ⏰ Setting up periodic refresh (60s)');
    periodicRefreshInterval.current = setInterval(() => {
      console.log('[NotificationsContext] ⏰ Periodic refresh triggered');
      loadNotifications();
    }, 60000);

    return () => {
      if (periodicRefreshInterval.current) {
        console.log('[NotificationsContext] 🧹 Cleaning up periodic refresh');
        clearInterval(periodicRefreshInterval.current);
        periodicRefreshInterval.current = null;
      }
    };
  }, [userId, loadNotifications]);

  const value: NotificationsContextValue = {
    notifications,
    unreadCount,
    loading,
    refreshing,
    markingAsRead,
    markingAllAsRead,
    loadNotifications,
    refreshNotifications,
    handleMarkAsRead,
    handleMarkAllAsRead
  };

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
};

export const useNotificationsContext = (): NotificationsContextValue => {
  const context = useContext(NotificationsContext);
  if (context === undefined) {
    throw new Error('useNotificationsContext must be used within a NotificationsProvider');
  }
  return context;
};
