import { useEffect, useRef, useCallback } from 'react';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
// @ts-ignore - SockJS types
import SockJS from 'sockjs-client';
// @ts-ignore - STOMP types
import { Client, IMessage } from '@stomp/stompjs';

export interface NotificationWSMessage {
  id: number;
  title?: string;
  message?: string;
  category?: string;
  notificationType?: string;
  timestamp?: string;
  data?: unknown;
}

interface UseNotificationsWebSocketProps {
  userId: number | null;
  onMessage: (message: NotificationWSMessage) => void;
  enabled?: boolean;
}

// Cache para la última conexión activa por userId
const activeConnections = new Map<number, Client>();

// Helper para obtener el token del storage
const getTokenFromStorage = async (): Promise<string | null> => {
  try {
    if (Platform.OS === 'web') {
      return localStorage.getItem('accessToken');
    } else {
      return await SecureStore.getItemAsync('accessToken');
    }
  } catch (error) {
    console.error('[WebSocket] Error getting token:', error);
    return null;
  }
};

/**
 * Hook para manejar la conexión WebSocket de notificaciones
 * Basado en la implementación del frontend web
 */
export const useNotificationsWebSocket = ({
  userId,
  onMessage,
  enabled = true
}: UseNotificationsWebSocketProps) => {
  const stompClientRef = useRef<Client | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Usar ref para el callback para evitar reconexiones innecesarias
  const onMessageRef = useRef(onMessage);
  
  // Actualizar el ref cuando cambie el callback
  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  const connect = useCallback(async () => {
    console.log('[WebSocket] 🔌 Connect called with:', { userId, enabled });
    
    if (!userId || !enabled) {
      console.log('[WebSocket] ⚠️ Skipping connection - userId or enabled is false');
      return;
    }

    // Verificar si ya existe una conexión activa para este usuario
    const existingConnection = activeConnections.get(userId);
    if (existingConnection?.active) {
      console.log('[WebSocket] ✅ Reusing existing active connection for user:', userId);
      stompClientRef.current = existingConnection;
      return;
    }

    // Prevenir múltiples conexiones simultáneas
    if (stompClientRef.current?.active) {
      console.log('[WebSocket] ⚠️ Connection already active, skipping');
      return;
    }

    // Limpiar conexión anterior si existe
    if (stompClientRef.current) {
      console.log('[WebSocket] 🧹 Cleaning up previous connection');
      try {
        stompClientRef.current.deactivate();
        activeConnections.delete(userId);
      } catch (e) {
        console.error('[WebSocket] Error cleaning previous connection:', e);
      }
      stompClientRef.current = null;
    }

    try {
      // Obtener el token para los headers
      const token = await getTokenFromStorage();
      console.log('[WebSocket] 🔑 Token available:', !!token);

      // Obtener la URL base del API
      const apiBase = process.env.EXPO_PUBLIC_API_BASE || '';
      let wsUrl = apiBase.replace('/api', '/ws');
      
      // Mantener http/https para SockJS (no usar ws/wss)
      if (wsUrl.startsWith('http://')) {
        wsUrl = wsUrl.replace('http://', 'http://');
      } else if (wsUrl.startsWith('https://')) {
        wsUrl = wsUrl.replace('https://', 'https://');
      }

      console.log('[WebSocket] 🌐 API Base:', apiBase);
      console.log('[WebSocket] 🔗 WS URL:', wsUrl);
      console.log('[WebSocket] 👤 User ID:', userId);

      // Crear cliente STOMP con SockJS
      const client = new Client({
        webSocketFactory: () => new SockJS(wsUrl),
        connectHeaders: token ? {
          Authorization: `Bearer ${token}`
        } : {},
        debug: (str: string) => {
          console.log('[STOMP] 📡', str);
        },
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
      });

      // Manejar conexión exitosa
      client.onConnect = () => {
        console.log('[WebSocket] ✅ Connected successfully');
        console.log('[WebSocket] 📬 Subscribing to user channel:', `/user/queue/notifications`);
        console.log('[WebSocket] 📢 Subscribing to broadcast channel:', `/topic/notifications`);

        // Suscribirse a notificaciones del usuario específico
        const userSub = client.subscribe(`/user/queue/notifications`, (message: IMessage) => {
          console.log('[WebSocket] 📨 Received user notification:', message.body);
          try {
            const payload = JSON.parse(message.body) as NotificationWSMessage;
            console.log('[WebSocket] 📦 Parsed payload:', payload);
            // Usar el ref para evitar dependencias
            onMessageRef.current(payload);
          } catch (error) {
            console.error('[WebSocket] ❌ Error parsing notification:', error);
          }
        });
        console.log('[WebSocket] ✅ User subscription created:', userSub.id);

        // Suscribirse a notificaciones broadcast
        const broadcastSub = client.subscribe('/topic/notifications', (message: IMessage) => {
          console.log('[WebSocket] 📣 Received broadcast notification:', message.body);
          try {
            const payload = JSON.parse(message.body) as NotificationWSMessage;
            console.log('[WebSocket] 📦 Parsed payload:', payload);
            // Usar el ref para evitar dependencias
            onMessageRef.current(payload);
          } catch (error) {
            console.error('[WebSocket] ❌ Error parsing broadcast:', error);
          }
        });
        console.log('[WebSocket] ✅ Broadcast subscription created:', broadcastSub.id);
      };

      // Manejar errores
      client.onStompError = (frame: any) => {
        console.error('[WebSocket] ❌ STOMP error:', frame);
        console.error('[WebSocket] ❌ Error headers:', frame.headers);
        console.error('[WebSocket] ❌ Error body:', frame.body);
      };

      client.onWebSocketError = (event: any) => {
        console.error('[WebSocket] ❌ WebSocket error:', event);
      };

      client.onWebSocketClose = (event: any) => {
        console.warn('[WebSocket] ⚠️ Connection closed:', event);
        console.warn('[WebSocket] ⚠️ Close code:', event?.code);
        console.warn('[WebSocket] ⚠️ Close reason:', event?.reason);
      };

      // Activar cliente
      console.log('[WebSocket] 🚀 Activating client...');
      client.activate();
      stompClientRef.current = client;
      
      // Guardar en el cache de conexiones activas
      if (userId) {
        activeConnections.set(userId, client);
        console.log('[WebSocket] 💾 Connection cached for user:', userId);
      }

    } catch (error) {
      console.error('[WebSocket] Connection error:', error);
      
      // Reintentar conexión después de 5 segundos
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      reconnectTimeoutRef.current = setTimeout(() => {
        console.log('[WebSocket] Retrying connection...');
        connect();
      }, 5000);
    }
  }, [userId, enabled]); // Removido onMessage de las dependencias

  const disconnect = useCallback(() => {
    console.log('[WebSocket] 🔌 Disconnect called');
    
    // Cancelar timeout de reconexión
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
      console.log('[WebSocket] ✅ Reconnect timeout cleared');
    }
    
    // NO desconectar si la conexión está compartida y activa
    // Solo limpiar la referencia local
    if (stompClientRef.current && userId && activeConnections.get(userId) === stompClientRef.current) {
      console.log('[WebSocket] ℹ️ Keeping shared connection active for user:', userId);
      stompClientRef.current = null;
      return;
    }
    
    // Desconectar cliente si no está compartido
    if (stompClientRef.current) {
      try {
        console.log('[WebSocket] 🛑 Deactivating STOMP client...');
        stompClientRef.current.deactivate();
        if (userId) {
          activeConnections.delete(userId);
        }
        console.log('[WebSocket] ✅ STOMP client deactivated');
      } catch (error) {
        console.error('[WebSocket] ❌ Error disconnecting:', error);
      }
      stompClientRef.current = null;
    }
  }, [userId]);

  useEffect(() => {
    // Llamar a connect (que ahora es async)
    connect();

    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    isConnected: stompClientRef.current?.connected || false,
    reconnect: connect,
    disconnect
  };
};
