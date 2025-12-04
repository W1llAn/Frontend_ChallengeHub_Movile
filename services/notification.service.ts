import api from "../api/api";
import type { NotificationDTO } from "../types/api/notification.type";

/**
 * GET /api/notifications?userId={userId}
 * Backend returns a List<NotificationResponseDTO>
 */
export const getNotifications = async (
  userId: number
): Promise<NotificationDTO[] | null> => {
  try {
    console.log('[NotificationService] 📥 Fetching notifications for userId:', userId);
    const { data } = await api.get<NotificationDTO[]>(`/notifications`, {
      params: { userId },
    });
    console.log('[NotificationService] 📦 Raw data received:', data);
    console.log('[NotificationService] 📊 Is array?', Array.isArray(data));
    console.log('[NotificationService] 📊 Data length:', data?.length);
    
    if (!Array.isArray(data)) {
      console.warn('[NotificationService] ⚠️ Data is not an array, returning empty array');
      return [];
    }
    
    // Map backend DTO to frontend: compute `read` from `status`
    // Backend uses enum: PENDING (unread), SEEN (viewed), READ (read), CANCELLED
    const normalized = data.map((d: any) => {
      const status = d.status || 'PENDING';
      const read = status === 'READ'; // only READ status means truly "read"
      console.log(`[NotificationService] 🔄 Normalizing notification ${d.id}:`, {
        title: d.title,
        status,
        read,
        createdAt: d.createdAt
      });
      return { 
        ...d, 
        status,
        read,
        title: d.title || 'Notificación'
      } as NotificationDTO;
    });
    console.log('[NotificationService] ✅ Normalized notifications:', normalized.length);
    return normalized;
  } catch (error) {
    console.error("[NotificationService] ❌ Error fetching notifications:", error);
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as any;
      console.error('[NotificationService] Response status:', axiosError.response?.status);
      console.error('[NotificationService] Response data:', axiosError.response?.data);
    }
    return null;
  }
};

/**
 * GET /api/notifications/{userId}/count-unread
 */
export const getUnreadCount = async (userId: number): Promise<number> => {
  try {
    console.log('[NotificationService] 🔢 Fetching unread count for userId:', userId);
    const { data } = await api.get<number>(`/notifications/${userId}/count-unread`);
    console.log('[NotificationService] 🔢 Unread count received:', data);
    const count = Number(data ?? 0);
    console.log('[NotificationService] 🔢 Parsed unread count:', count);
    return count;
  } catch (error) {
    console.error("[NotificationService] ❌ Error fetching unread notification count:", error);
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as any;
      console.error('[NotificationService] Response status:', axiosError.response?.status);
      console.error('[NotificationService] Response data:', axiosError.response?.data);
    }
    return 0;
  }
};

/**
 * PATCH /api/notifications/{id}/read
 */
export const markAsRead = async (id: number): Promise<boolean> => {
  try {
    console.log('[NotificationService] ✓ Marking notification as read:', id);
    await api.patch(`/notifications/${id}/read`);
    console.log('[NotificationService] ✅ Notification marked as read:', id);
    return true;
  } catch (error) {
    console.error("[NotificationService] ❌ Error marking notification as read:", error);
    return false;
  }
};

/**
 * Mark all notifications as read for a user
 * Since backend doesn't have a bulk endpoint, we iterate and mark individually
 */
export const markAllAsRead = async (userId: number): Promise<boolean> => {
  try {
    const notifications = await getNotifications(userId);
    if (!notifications) return false;

    const unreadNotifications = notifications.filter((n) => !n.read);
    if (unreadNotifications.length === 0) return true;

    // Mark all unread notifications in parallel
    const promises = unreadNotifications.map((n) => markAsRead(n.id));
    const results = await Promise.allSettled(promises);

    // Return true if at least one was successful
    return results.some((r) => r.status === "fulfilled" && r.value === true);
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    return false;
  }
};

/**
 * Format time ago for notifications
 */
export const formatTimeAgo = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'Hace un momento';
  if (seconds < 3600) return `Hace ${Math.floor(seconds / 60)} minutos`;
  if (seconds < 86400) return `Hace ${Math.floor(seconds / 3600)} horas`;
  if (seconds < 604800) return `Hace ${Math.floor(seconds / 86400)} días`;
  
  return date.toLocaleDateString('es-ES', { 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Get icon name based on notification type
 */
export const getNotificationIcon = (type?: string): string => {
  switch (type) {
    case 'NEW_CHALLENGE':
      return 'rocket-outline';
    case 'COMMENT':
      return 'chatbubble-outline';
    case 'BADGE_EARNED':
      return 'trophy-outline';
    case 'REACTION':
      return 'heart-outline';
    case 'CHALLENGE_SUBSCRIPTION':
      return 'bookmark-outline';
    case 'CHALLENGE_COMPLETED':
      return 'checkmark-circle-outline';
    case 'DOCUMENT_UPLOADED':
      return 'document-text-outline';
    case 'SUBMISSION_CREATED':
      return 'cloud-upload-outline';
    case 'SUBMISSION_REVIEWED':
      return 'eye-outline';
    case 'REPORT':
      return 'warning-outline';
    case 'MESSAGE':
      return 'mail-outline';
    case 'SYSTEM':
    default:
      return 'notifications-outline';
  }
};

/**
 * Get color based on notification type
 */
export const getNotificationColor = (type?: string): string => {
  switch (type) {
    case 'NEW_CHALLENGE':
      return '#591D87';
    case 'COMMENT':
      return '#3B82F6';
    case 'BADGE_EARNED':
      return '#F59E0B';
    case 'REACTION':
      return '#EF4444';
    case 'CHALLENGE_SUBSCRIPTION':
      return '#10B981';
    case 'CHALLENGE_COMPLETED':
      return '#059669';
    case 'DOCUMENT_UPLOADED':
      return '#8B5CF6';
    case 'SUBMISSION_CREATED':
      return '#6366F1';
    case 'SUBMISSION_REVIEWED':
      return '#EC4899';
    case 'REPORT':
      return '#F97316';
    case 'MESSAGE':
      return '#14B8A6';
    case 'SYSTEM':
    default:
      return '#6B7280';
  }
};
