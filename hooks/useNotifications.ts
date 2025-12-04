import { useState, useEffect, useCallback, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import type { NotificationDTO } from '../types/api/notification.type';
import { 
  getNotifications, 
  getUnreadCount, 
  markAsRead, 
  markAllAsRead,
  formatTimeAgo 
} from '../services/notification.service';
import { useNotificationsWebSocket, type NotificationWSMessage } from './useNotificationsWebSocket';
import { showNotifier } from '../services/notifier';

interface UseNotificationsReturn {
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

export const useNotifications = (userId: number | null): UseNotificationsReturn => {
  const [notifications, setNotifications] = useState<NotificationDTO[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [markingAsRead, setMarkingAsRead] = useState<number | null>(null);
  const [markingAllAsRead, setMarkingAllAsRead] = useState(false);
  const appState = useRef(AppState.currentState);

  const loadNotifications = useCallback(async () => {
    console.log('[useNotifications] 🔄 loadNotifications called with userId:', userId);
    if (!userId) {
      console.log('[useNotifications] ⚠️ No userId, skipping load');
      setLoading(false);
      return;
    }

    try {
      console.log('[useNotifications] 📡 Fetching notifications and count...');
      const [notificationsData, count] = await Promise.all([
        getNotifications(userId),
        getUnreadCount(userId)
      ]);

      console.log('[useNotifications] 📦 Received notificationsData:', notificationsData);
      console.log('[useNotifications] 🔢 Received unread count:', count);

      if (notificationsData) {
        // Add timeAgo to each notification
        const notificationsWithTime = notificationsData.map(n => ({
          ...n,
          timeAgo: formatTimeAgo(n.createdAt)
        }));
        console.log('[useNotifications] ✅ Setting notifications:', notificationsWithTime.length);
        setNotifications(notificationsWithTime);
      } else {
        console.log('[useNotifications] ⚠️ notificationsData is null/undefined');
      }
      console.log('[useNotifications] ✅ Setting unread count:', count);
      setUnreadCount(count);
    } catch (error) {
      console.error('[useNotifications] ❌ Error loading notifications:', error);
    } finally {
      setLoading(false);
      console.log('[useNotifications] ✅ Loading complete');
    }
  }, [userId]);

  // Manejar mensajes de WebSocket
  const handleWebSocketMessage = useCallback(async (message: NotificationWSMessage) => {
    console.log('[useNotifications] 📨 New WebSocket message received:', message);
    
    // Mostrar notificación toast
    if (message.message) {
      console.log('[useNotifications] 🔔 Showing toast notification');
      showNotifier(
        message.message,
        'info',
        message.title
      );
    }

    // Recargar TODO desde el backend para asegurar sincronización
    if (userId) {
      console.log('[useNotifications] 🔄 Reloading all notifications from backend');
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
          console.log('[useNotifications] ✅ Updated notifications:', notificationsWithTime.length);
          setNotifications(notificationsWithTime);
        }
        
        console.log('[useNotifications] ✅ Updated unread count:', count);
        setUnreadCount(count);
      } catch (error) {
        console.error('[useNotifications] ❌ Error reloading after WebSocket message:', error);
      }
    }
  }, [userId]);

  // Conectar WebSocket
  useNotificationsWebSocket({
    userId,
    onMessage: handleWebSocketMessage,
    enabled: !!userId
  });

  const refreshNotifications = useCallback(async () => {
    if (!userId) return;

    setRefreshing(true);
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
        setNotifications(notificationsWithTime);
      }
      setUnreadCount(count);
    } catch (error) {
      console.error('Error refreshing notifications:', error);
    } finally {
      setRefreshing(false);
    }
  }, [userId]);

  const handleMarkAsRead = useCallback(async (id: number) => {
    console.log('[useNotifications] ✓ Marking notification as read:', id);
    setMarkingAsRead(id);
    
    // Actualización optimista del estado ANTES de la llamada al backend
    const notificationToUpdate = notifications.find(n => n.id === id);
    if (notificationToUpdate && !notificationToUpdate.read) {
      console.log('[useNotifications] ⚡ Optimistic update - marking as read immediately');
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, status: 'READ', read: true } : n))
      );
      setUnreadCount(prev => {
        const newCount = Math.max(0, prev - 1);
        console.log('[useNotifications] 📊 Decrementing unread count:', prev, '->', newCount);
        return newCount;
      });
    }
    
    try {
      const success = await markAsRead(id);
      console.log('[useNotifications] ✅ Backend response:', success);
      
      if (!success) {
        // Revertir cambio optimista si falla
        console.log('[useNotifications] ❌ Failed to mark as read, reverting');
        if (notificationToUpdate && !notificationToUpdate.read) {
          setNotifications(prev =>
            prev.map(n => (n.id === id ? { ...n, status: notificationToUpdate.status, read: false } : n))
          );
          setUnreadCount(prev => prev + 1);
        }
      }
    } catch (error) {
      console.error('[useNotifications] ❌ Error marking notification as read:', error);
      // Revertir cambio optimista en caso de error
      if (notificationToUpdate && !notificationToUpdate.read) {
        setNotifications(prev =>
          prev.map(n => (n.id === id ? { ...n, status: notificationToUpdate.status, read: false } : n))
        );
        setUnreadCount(prev => prev + 1);
      }
    } finally {
      setMarkingAsRead(null);
    }
  }, [notifications]);

  const handleMarkAllAsRead = useCallback(async () => {
    if (!userId) return;

    console.log('[useNotifications] ✓✓ Marking all notifications as read');
    setMarkingAllAsRead(true);
    
    // Guardar estado anterior para revertir si falla
    const previousNotifications = notifications;
    const previousUnreadCount = unreadCount;
    
    // Actualización optimista
    console.log('[useNotifications] ⚡ Optimistic update - marking all as read');
    setNotifications(prev =>
      prev.map(n => ({ ...n, status: 'READ' as const, read: true }))
    );
    setUnreadCount(0);
    
    try {
      const success = await markAllAsRead(userId);
      console.log('[useNotifications] ✅ Backend response:', success);
      
      if (!success) {
        console.log('[useNotifications] ❌ Failed to mark all as read, reverting');
        setNotifications(previousNotifications);
        setUnreadCount(previousUnreadCount);
      }
    } catch (error) {
      console.error('[useNotifications] ❌ Error marking all notifications as read:', error);
      // Revertir en caso de error
      setNotifications(previousNotifications);
      setUnreadCount(previousUnreadCount);
    } finally {
      setMarkingAllAsRead(false);
    }
  }, [userId, notifications, unreadCount]);

  // Cargar notificaciones al montar y cuando cambia userId
  useEffect(() => {
    console.log('[useNotifications] 🔄 Effect triggered - loading notifications');
    loadNotifications();
  }, [loadNotifications]);

  // Recargar notificaciones periódicamente para mantener sincronizado
  useEffect(() => {
    if (!userId) return;
    
    console.log('[useNotifications] ⏰ Setting up periodic refresh (every 60s)');
    // Recargar cada 60 segundos para mantener sincronizado (reducido de 30s)
    const intervalId = setInterval(() => {
      console.log('[useNotifications] 🔄 Periodic refresh triggered');
      getUnreadCount(userId).then(count => {
        console.log('[useNotifications] 📊 Updated unread count from periodic check:', count);
        setUnreadCount(count);
      }).catch(err => {
        console.error('[useNotifications] ❌ Error in periodic refresh:', err);
      });
    }, 60000); // Cambiado de 30000 a 60000

    return () => {
      console.log('[useNotifications] 🛑 Cleaning up periodic refresh');
      clearInterval(intervalId);
    };
  }, [userId]);

  // Recargar cuando la app vuelve al foreground
  useEffect(() => {
    if (!userId) return;

    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      console.log('[useNotifications] 📱 AppState changed:', appState.current, '->', nextAppState);
      
      // Si la app vuelve de background a foreground, recargar
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        console.log('[useNotifications] 🔄 App came to foreground - reloading notifications');
        getUnreadCount(userId).then(count => {
          console.log('[useNotifications] 📊 Updated unread count after foreground:', count);
          setUnreadCount(count);
        });
      }

      appState.current = nextAppState;
    });

    return () => {
      console.log('[useNotifications] 🛑 Cleaning up AppState listener');
      subscription.remove();
    };
  }, [userId]);

  return {
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
};
