export type NotificationStatus = 'PENDING' | 'SEEN' | 'READ' | 'CANCELLED';

export type NotificationType = 
  | 'NEW_CHALLENGE'
  | 'COMMENT'
  | 'BADGE_EARNED'
  | 'REACTION'
  | 'CHALLENGE_SUBSCRIPTION'
  | 'CHALLENGE_COMPLETED'
  | 'DOCUMENT_UPLOADED'
  | 'SUBMISSION_CREATED'
  | 'SUBMISSION_REVIEWED'
  | 'REPORT'
  | 'SYSTEM'
  | 'MESSAGE';

export interface NotificationDTO {
  id: number;
  userId?: number;
  title?: string;
  message: string;
  createdAt: string; // ISO date
  status: NotificationStatus;
  type?: NotificationType;
  priority?: string;
  data?: number | Record<string, unknown> | null;
  isUnread?: boolean;
  timeAgo?: string;
  read: boolean; // derived: true when status === 'READ'
}

export interface CreateNotificationDTO {
  userId?: number;
  type: string;
  title?: string;
  message: string;
  priority?: string;
  data?: number | Record<string, unknown> | null;
}

export interface NotificationResponseDTO extends NotificationDTO {}
